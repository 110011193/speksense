/**
 * Redirect old dashboard.html#/path and *.html bookmarks to clean URLs.
 */
export function redirectLegacyUrls(): void {
  if (typeof window === 'undefined') return;

  const { pathname, hash, search } = window.location;

  if (hash.startsWith('#/')) {
    const target = hash.slice(1) + search;
    window.location.replace(target);
    return;
  }

  const htmlToClean: Record<string, string> = {
    '/dashboard.html': '/dashboard',
    '/people.html': '/people',
    '/calendar.html': '/calendar',
    '/signup.html': '/signup',
    '/index.html': '/',
  };

  const clean = htmlToClean[pathname];
  if (clean) {
    window.location.replace(clean + search + (hash && hash !== '#' ? hash : ''));
  }
}
