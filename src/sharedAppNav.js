/**
 * Keeps People / Calendar header nav in sync with React AppHeader (role-aware).
 */

function isAdminUser() {
  try {
    return sessionStorage.getItem('speksense_is_admin') === 'true';
  } catch {
    return false;
  }
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

function isActive(pathname, href) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === '/assessments') {
    return current === '/assessments' || current.startsWith('/assessments/');
  }
  if (target === '/configure') {
    return current === '/configure' || current.startsWith('/configure/');
  }
  return current === target;
}

/**
 * @param {{ id: string, label: string, href: string }[]} items
 */
function renderNavLinks(container, items) {
  const pathname = window.location.pathname;
  container.replaceChildren();
  for (const item of items) {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = `dash-nav-link${isActive(pathname, item.href) ? ' dash-nav-link--active' : ''}`;
    a.textContent = item.label;
    container.appendChild(a);
  }
}

export function getAppNavItems() {
  const hrAdmin = isAdminUser();
  const items = [];
  if (hrAdmin) {
    items.push({ id: 'dashboard', label: 'Dashboard', href: '/dashboard' });
    items.push({ id: 'people', label: 'People', href: '/people' });
  }
  items.push({ id: 'assessments', label: 'Assessments', href: '/assessments' });
  if (!hrAdmin) {
    items.push({ id: 'reports', label: 'Reports', href: '/reports' });
  }
  items.push({ id: 'calendar', label: 'Calendar', href: '/calendar' });
  if (hrAdmin) {
    items.push({ id: 'configure', label: 'Configure', href: '/configure' });
  }
  return items;
}

export function getAppHomePath() {
  return isAdminUser() ? '/dashboard' : '/assessments';
}

function signOutUser() {
  try {
    const refreshToken = sessionStorage.getItem('speksense_refresh_token');
    if (refreshToken) {
      void fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        keepalive: true,
      }).catch(() => {});
    }
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('speksense_')) keysToRemove.push(key);
    }
    for (const key of keysToRemove) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  window.location.assign('/');
}

/** Call on static MPA pages (people, calendar) after DOM ready. */
export function setupAppNav() {
  const onPeoplePage = normalizePath(window.location.pathname) === '/people';
  if (onPeoplePage && !isAdminUser()) {
    window.location.replace('/assessments');
    return;
  }

  const nav = document.querySelector('.dash-nav-links');
  const brand = document.querySelector('.dash-brand');
  if (!nav) return;

  renderNavLinks(nav, getAppNavItems());

  if (brand) {
    brand.setAttribute('href', getAppHomePath());
  }

  const profileBtn = document.querySelector('.dash-profile-btn');
  if (profileBtn && profileBtn.tagName === 'A') {
    const onProfile = normalizePath(window.location.pathname) === '/profile';
    profileBtn.classList.toggle('dash-profile-btn--active', onProfile);
    if (onProfile) profileBtn.setAttribute('aria-current', 'page');
    else profileBtn.removeAttribute('aria-current');
  }

  const settingsBtn = document.getElementById('app-settings-btn');
  if (settingsBtn) {
    const onSettings = normalizePath(window.location.pathname) === '/settings';
    settingsBtn.classList.toggle('dash-settings-btn--active', onSettings);
    if (onSettings) settingsBtn.setAttribute('aria-current', 'page');
    else settingsBtn.removeAttribute('aria-current');
  }

  setupLogoutConfirmModal();
}

function setupLogoutConfirmModal() {
  const modal = document.getElementById('logout-confirm-modal');
  const logoutBtn = document.getElementById('app-logout-btn');
  if (!modal || !logoutBtn) return;

  const close = () => {
    modal.hidden = true;
  };
  const open = () => {
    modal.hidden = false;
  };

  if (!logoutBtn.dataset.logoutBound) {
    logoutBtn.dataset.logoutBound = 'true';
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }

  if (modal.dataset.bound) return;
  modal.dataset.bound = 'true';

  modal.querySelector('[data-logout-dismiss]')?.addEventListener('click', close);
  modal.querySelector('[data-logout-cancel]')?.addEventListener('click', close);
  modal.querySelector('[data-logout-yes]')?.addEventListener('click', () => {
    close();
    signOutUser();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
}
