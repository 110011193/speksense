import { handleMockRequest } from './mock/handlers';
import { ApiError } from './types';
import { getAccessToken, getRefreshToken, setSession, clearSession } from './authSession';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

// Real backend by default; set VITE_USE_REAL_API=false to fall back to the in-memory mock.
const USE_REAL_API = (import.meta.env.VITE_USE_REAL_API ?? 'true') !== 'false';

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // De-dupe concurrent refreshes so a burst of 401s triggers a single refresh.
  refreshInFlight ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      setSession(await res.json());
      return true;
    } catch {
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function doFetch(method: HttpMethod, path: string, body?: unknown): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiRequest<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!USE_REAL_API) {
    try {
      return handleMockRequest(method as 'GET' | 'POST' | 'PATCH', normalizedPath.slice(1), body) as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(e instanceof Error ? e.message : 'Request failed', 500);
    }
  }

  let res = await doFetch(method, normalizedPath, body);

  // Transparently refresh once on 401, then retry.
  if (res.status === 401 && getRefreshToken()) {
    if (await tryRefresh()) {
      res = await doFetch(method, normalizedPath, body);
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/') window.location.assign('/');
    }
    const text = await res.text();
    throw new ApiError(text || res.statusText, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
