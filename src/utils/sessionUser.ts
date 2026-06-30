const DISPLAY_NAME_KEY = 'speksense_display_name';
const EMAIL_KEY = 'speksense_user_email';
const ADMIN_KEY = 'speksense_is_admin';

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

export function getDisplayName(): string {
  if (!hasSessionStorage()) return 'there';
  return sessionStorage.getItem(DISPLAY_NAME_KEY)?.trim() || 'there';
}

export function getUserEmail(): string | null {
  if (!hasSessionStorage()) return null;
  const email = sessionStorage.getItem(EMAIL_KEY)?.trim();
  return email || null;
}

export function isAdminUser(): boolean {
  if (!hasSessionStorage()) return false;
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}

export function deriveIsAdminFromEmail(email: string): boolean {
  const localPart = email.split('@')[0]?.trim().toLowerCase() ?? '';
  return localPart === 'admin' || localPart === 'hr';
}

export function persistLoginSession(email: string, displayName: string): void {
  if (!hasSessionStorage()) return;
  sessionStorage.setItem(DISPLAY_NAME_KEY, displayName);
  sessionStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
  sessionStorage.setItem(ADMIN_KEY, deriveIsAdminFromEmail(email) ? 'true' : 'false');
}

export function updateDisplayName(name: string): void {
  if (!hasSessionStorage()) return;
  const trimmed = name.trim();
  if (trimmed) sessionStorage.setItem(DISPLAY_NAME_KEY, trimmed);
}

export function getUserRoleLabel(): string {
  return isAdminUser() ? 'HR Admin' : 'Participant';
}

export function hasLoggedInSession(): boolean {
  return Boolean(getUserEmail());
}

export function clearLoginSession(): void {
  if (!hasSessionStorage()) return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith('speksense_')) keysToRemove.push(key);
  }
  for (const key of keysToRemove) {
    sessionStorage.removeItem(key);
  }
}

export function signOutUser(): void {
  // Best-effort: revoke the refresh token server-side before clearing the local session
  // (keepalive lets the request finish across the navigation). Read it BEFORE clearing.
  try {
    const refreshToken = hasSessionStorage()
      ? sessionStorage.getItem('speksense_refresh_token')
      : null;
    if (refreshToken) {
      void fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* ignore — logout must always proceed locally */
  }
  clearLoginSession();
  window.location.assign('/');
}
