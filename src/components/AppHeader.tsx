import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { isAdminUser, isManager, isSuperAdmin, signOutUser } from '../utils/sessionUser';
import { BrandLogo } from './BrandLogo';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { NotificationsPanel } from './NotificationsPanel';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `dash-nav-link${isActive ? ' dash-nav-link--active' : ''}`;

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const onProfile = location.pathname === '/profile';
  const onSettings = location.pathname === '/settings';
  const hrAdmin = isAdminUser();
  const platformAdmin = isSuperAdmin();
  const manager = isManager();
  // Managers get a read-only Dashboard + People (department-scoped), but none of the admin tools.
  const seesDashboard = hrAdmin || manager;
  const homePath = seesDashboard ? '/dashboard' : '/assessments';
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifBtnRef = useRef<HTMLButtonElement>(null);

  // Close the panel on any route change so a stale-open panel never lingers.
  useEffect(() => {
    setNotifOpen(false);
  }, [location.pathname]);

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <>
    <header className="dash-nav">
      <BrandLogo to={homePath} />
      <nav className="dash-nav-links" aria-label="Main">
          {seesDashboard && (
            <NavLink to="/dashboard" end className={navClass}>
              Dashboard
            </NavLink>
          )}
          {seesDashboard && (
            <NavLink to="/people" className={navClass}>
              People
            </NavLink>
          )}
          <NavLink to="/assessments" className={navClass}>
            Assessments
          </NavLink>
          {!hrAdmin && (
            <NavLink to="/reports" className={navClass}>
              Reports
            </NavLink>
          )}
          <a href="/calendar" className="dash-nav-link">
            Calendar
          </a>
          {hrAdmin && (
            <NavLink to="/configure" className={navClass}>
              Configure
            </NavLink>
          )}
          {hrAdmin && (
            <NavLink to="/team" className={navClass}>
              Team
            </NavLink>
          )}
          {platformAdmin && (
            <NavLink to="/platform" className={navClass}>
              Platform
            </NavLink>
          )}
        </nav>
        <div className="dash-nav-actions">
          <NavLink
            to="/settings"
            className={`dash-btn-pill dash-btn-pill--light dash-settings-btn${onSettings ? ' dash-settings-btn--active' : ''}`}
            aria-current={onSettings ? 'page' : undefined}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Setting
          </NavLink>
          <div className="dash-notif-wrap">
            <button
              ref={notifBtnRef}
              type="button"
              className="dash-icon-btn"
              id="notif-toggle"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              aria-controls="notif-panel"
              onClick={() => setNotifOpen((v) => !v)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="dash-notif-dot" aria-hidden="true" />
            </button>
            <NotificationsPanel
              open={notifOpen}
              anchorRef={notifBtnRef}
              onClose={() => setNotifOpen(false)}
            />
          </div>
          <div className="dash-nav-user-actions">
            <button
              type="button"
              className={`dash-icon-btn dash-profile-btn${onProfile ? ' dash-profile-btn--active' : ''}`}
              aria-label="Profile"
              aria-current={onProfile ? 'page' : undefined}
              onClick={goToProfile}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button
              type="button"
              className="dash-icon-btn dash-logout-btn"
              aria-label="Log out"
              onClick={() => setLogoutModalOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
    </header>
    <LogoutConfirmModal
      open={logoutModalOpen}
      onClose={() => setLogoutModalOpen(false)}
      onConfirm={() => {
        setLogoutModalOpen(false);
        signOutUser();
      }}
    />
    </>
  );
}
