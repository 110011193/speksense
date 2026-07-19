import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { hasLoggedInSession, signOutUser, updateDisplayName } from '../utils/sessionUser';
import type { UserSettings } from '../utils/userSettings';
import {
  changePassword,
  getProfile,
  getSettings,
  patchProfile,
  patchSettings as apiPatchSettings,
  type ProfileData,
} from '../api/services/platform';
import { setSession } from '../api/authSession';
import { ErrorNote } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';

export function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  // Last-write-wins guard so a slow earlier PATCH failure can't revert a newer toggle.
  const settingsSeqRef = useRef(0);

  useEffect(() => {
    document.title = 'SpekSense — Settings';
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Load independently so one failing endpoint doesn't blank the whole page.
    Promise.allSettled([getSettings(), getProfile()])
      .then(([settingsRes, profileRes]) => {
        if (cancelled) return;
        if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value);
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value);
          setDisplayName(profileRes.value.displayName);
        }
        if (settingsRes.status === 'rejected' && profileRes.status === 'rejected') {
          const e = settingsRes.reason;
          setError(e instanceof Error ? e.message : 'Could not load your settings.');
        } else if (settingsRes.status === 'rejected' || profileRes.status === 'rejected') {
          setError('Some settings could not be loaded. The rest are shown below.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-clear the transient "Saved" confirmation.
  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(0), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  if (!hasLoggedInSession()) {
    return <Navigate to="/" replace />;
  }

  const patchSettings = (partial: Partial<UserSettings>) => {
    const keys = Object.keys(partial) as (keyof UserSettings)[];
    // Snapshot the exact prior values of only the keys we're about to change,
    // so a failure restores them precisely (not a derived guess).
    let prior: Partial<UserSettings> = {};
    setSettings((current) => {
      if (!current) return current;
      prior = Object.fromEntries(keys.map((k) => [k, current[k]])) as Partial<UserSettings>;
      return { ...current, ...partial };
    });
    const seq = ++settingsSeqRef.current;
    apiPatchSettings(partial)
      .then((updated) => {
        // Merge ONLY the keys this request owned, so a slow earlier response
        // can't clobber a newer toggle the user just made.
        setSettings((current) => {
          if (!current) return current;
          const merged = { ...current };
          for (const key of keys) merged[key] = updated[key];
          return merged;
        });
        setError((prev) => (prev ? null : prev));
        setSavedAt(Date.now());
      })
      .catch((e) => {
        // Only the latest in-flight request restores, so stale failures don't fight a newer choice.
        if (settingsSeqRef.current === seq) {
          setSettings((current) => (current ? { ...current, ...prior } : current));
        }
        setError(e instanceof Error ? e.message : 'Could not update your settings.');
      });
  };

  const nameDirty = displayName.trim().length > 0 && displayName.trim() !== (profile?.displayName ?? '');

  const saveDisplayName = () => {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed === profile?.displayName || savingName) return;
    setSavingName(true);
    setNameError(null);
    patchProfile(trimmed)
      .then((updated) => {
        setProfile(updated);
        setDisplayName(updated.displayName);
        // Mirror into the cached session name so the dashboard greeting updates without re-login.
        updateDisplayName(updated.displayName);
        setSavedAt(Date.now());
      })
      .catch((e) => {
        setNameError(e instanceof Error ? e.message : 'Could not update your display name.');
      })
      .finally(() => setSavingName(false));
  };

  const handleSignOut = () => {
    signOutUser();
  };

  const hrAdmin = profile?.isAdmin ?? false;

  return (
    <div className="dashboard-page settings-page">
      <AppHeader />
      <main className="dash-main settings-main">
        <header className="settings-hero">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-sub">Account and personal preferences for SpekSense.</p>
        </header>

        {error && <ErrorNote message={error} />}

        {loading && !error ? (
          <div className="settings-loading" role="status" aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading your settings…</span>
            <SkeletonCard count={3} lines={3} />
          </div>
        ) : settings || profile ? (
          <>
            {profile && (
              <article className="card glass settings-card">
                <h2 className="settings-card-title">Account</h2>
                <div className="settings-field">
                  <label className="settings-label" htmlFor="settings-display-name">
                    Display name
                  </label>
                  <div className="settings-name-row">
                    <input
                      id="settings-display-name"
                      type="text"
                      className="settings-input"
                      value={displayName}
                      maxLength={80}
                      onChange={(e) => setDisplayName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && nameDirty) {
                          e.preventDefault();
                          saveDisplayName();
                        }
                      }}
                      autoComplete="name"
                      aria-invalid={nameError ? true : undefined}
                      aria-describedby={nameError ? 'settings-display-name-error' : undefined}
                    />
                    {nameDirty && (
                      <button
                        type="button"
                        className="dash-btn-pill dash-pill--yellow settings-name-save"
                        disabled={savingName}
                        onClick={saveDisplayName}
                      >
                        {savingName ? 'Saving…' : 'Save'}
                      </button>
                    )}
                  </div>
                  {nameError && (
                    <p id="settings-display-name-error" className="settings-field-error" role="alert">
                      {nameError}
                    </p>
                  )}
                </div>
                <div className="settings-field">
                  <span className="settings-label">Email</span>
                  <p className="settings-readonly">{profile.email || '—'}</p>
                </div>
                <div className="settings-field settings-field--inline">
                  <span className="settings-label">Role</span>
                  <span className="settings-role-pill">{profile.role}</span>
                </div>
                {!hrAdmin && (
                  <div className="settings-field">
                    <span className="settings-label">Organization</span>
                    <p className="settings-readonly">{profile.organization || '—'}</p>
                  </div>
                )}
              </article>
            )}

            {profile && <ChangePasswordCard />}

            {settings && (
              <>
                <article className="card glass settings-card">
                  <div className="settings-card-head">
                    <h2 className="settings-card-title">Notifications</h2>
                    <span className="settings-saved" role="status" aria-live="polite">
                      {savedAt ? 'Saved' : ''}
                    </span>
                  </div>
                  <ul className="settings-toggle-list">
                    <li className="settings-toggle-row">
                      <label className="settings-toggle-label" htmlFor="notif-assessment">
                        <span>Assessment reminders</span>
                        <span className="settings-toggle-hint">Due dates and nudges for open surveys</span>
                      </label>
                      <input
                        id="notif-assessment"
                        type="checkbox"
                        className="settings-toggle"
                        checked={settings.assessmentReminders}
                        onChange={(e) => patchSettings({ assessmentReminders: e.target.checked })}
                      />
                    </li>
                    <li className="settings-toggle-row">
                      <label className="settings-toggle-label" htmlFor="notif-report">
                        <span>Report ready</span>
                        <span className="settings-toggle-hint">When a PDF report is available on Reports</span>
                      </label>
                      <input
                        id="notif-report"
                        type="checkbox"
                        className="settings-toggle"
                        checked={settings.reportReady}
                        onChange={(e) => patchSettings({ reportReady: e.target.checked })}
                      />
                    </li>
                    <li className="settings-toggle-row">
                      <label className="settings-toggle-label" htmlFor="notif-calendar">
                        <span>Calendar deadline reminders</span>
                        <span className="settings-toggle-hint">Upcoming assessment and report dates</span>
                      </label>
                      <input
                        id="notif-calendar"
                        type="checkbox"
                        className="settings-toggle"
                        checked={settings.calendarDeadlines}
                        onChange={(e) => patchSettings({ calendarDeadlines: e.target.checked })}
                      />
                    </li>
                  </ul>
                </article>

                <article className="card glass settings-card">
                  <h2 className="settings-card-title">Privacy &amp; data</h2>
                  <p className="settings-copy">
                    Pulse and 360 responses are confidential and used for development and organizational
                    insight. Individual answers are not shared with managers without program rules that say
                    otherwise.
                  </p>
                  <div className="settings-toggle-row settings-toggle-row--stack">
                    <label className="settings-toggle-label" htmlFor="privacy-exports">
                      <span>Include my name on aggregated HR exports</span>
                      <span className="settings-toggle-hint">When enabled, your name may appear in CSV summaries</span>
                    </label>
                    <input
                      id="privacy-exports"
                      type="checkbox"
                      className="settings-toggle"
                      checked={settings.includeNameInHrExports}
                      onChange={(e) => patchSettings({ includeNameInHrExports: e.target.checked })}
                    />
                  </div>
                </article>
              </>
            )}
          </>
        ) : null}

        <article className="card glass settings-card settings-card--session">
          <h2 className="settings-card-title">Session</h2>
          <p className="settings-copy">Sign out on this device. You will need to sign in again to continue.</p>
          <button
            type="button"
            className="dash-btn-pill dash-pill--yellow settings-signout"
            onClick={() => setLogoutOpen(true)}
          >
            Sign out
          </button>
        </article>
      </main>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
}

/** Self-contained password change: verifies the current password server-side, revokes every
 *  other session, and swaps in the fresh token pair so this session stays signed in. */
function ChangePasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 4000);
    return () => clearTimeout(t);
  }, [done]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 10) {
      setError('New password must be at least 10 characters.');
      return;
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    setBusy(true);
    try {
      const result = await changePassword(current, next);
      setSession(result);
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change your password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card glass settings-card">
      <div className="settings-card-head">
        <h2 className="settings-card-title">Password</h2>
        <span className="settings-saved" role="status" aria-live="polite">
          {done ? 'Password changed' : ''}
        </span>
      </div>
      <p className="settings-copy">
        Changing your password signs you out everywhere else. This session stays signed in.
      </p>
      <form onSubmit={submit} className="settings-password-form">
        <div className="settings-field">
          <label className="settings-label" htmlFor="pw-current">Current password</label>
          <input
            id="pw-current"
            type="password"
            className="settings-input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="settings-field">
          <label className="settings-label" htmlFor="pw-new">New password</label>
          <input
            id="pw-new"
            type="password"
            className="settings-input"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
          />
          <span className="settings-toggle-hint">At least 10 characters.</span>
        </div>
        <div className="settings-field">
          <label className="settings-label" htmlFor="pw-confirm">Confirm new password</label>
          <input
            id="pw-confirm"
            type="password"
            className="settings-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
          />
        </div>
        {error && (
          <p className="settings-field-error" role="alert">{error}</p>
        )}
        <button
          type="submit"
          className="dash-btn-pill dash-pill--yellow"
          disabled={busy || !current || !next || !confirm}
        >
          {busy ? 'Changing…' : 'Change password'}
        </button>
      </form>
    </article>
  );
}
