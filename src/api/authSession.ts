// Real JWT session: tokens + user, persisted in sessionStorage. Also mirrors the legacy
// keys (display_name / user_email / is_admin) the rest of the app already reads via sessionUser.ts.

const ACCESS = 'speksense_access_token';
const REFRESH = 'speksense_refresh_token';
const USER = 'speksense_user';

export type AuthUser = {
  id: string;
  organizationId: string;
  email: string;
  displayName: string | null;
  role: string; // 'Admin' | 'SuperAdmin' | 'Participant'
};

export type AuthResult = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  user: AuthUser;
};

export function getAccessToken(): string | null {
  return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(ACCESS) : null;
}

export function getRefreshToken(): string | null {
  return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(REFRESH) : null;
}

export function getAuthUser(): AuthUser | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(USER);
  try {
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/** Persist a full login/refresh result (tokens + user) and mirror the legacy session keys. */
export function setSession(result: AuthResult): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(ACCESS, result.accessToken);
  sessionStorage.setItem(REFRESH, result.refreshToken);
  sessionStorage.setItem(USER, JSON.stringify(result.user));

  const u = result.user;
  const isAdmin = u.role === 'Admin' || u.role === 'SuperAdmin';
  sessionStorage.setItem('speksense_display_name', u.displayName || u.email.split('@')[0] || 'there');
  sessionStorage.setItem('speksense_user_email', (u.email || '').trim().toLowerCase());
  sessionStorage.setItem('speksense_is_admin', isAdmin ? 'true' : 'false');
}

/** Update just the token pair after a refresh (user unchanged). */
export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(ACCESS, accessToken);
  sessionStorage.setItem(REFRESH, refreshToken);
}

export function clearSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  const remove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k?.startsWith('speksense_')) remove.push(k);
  }
  remove.forEach((k) => sessionStorage.removeItem(k));
}
