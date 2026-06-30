import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { EmptyState, ErrorNote } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';
import {
  getProfile,
  patchProfile,
  uploadAvatar,
  listMyAssignments,
  listMyReports,
  getDashboard,
  type ProfileData,
  type ParticipantAssignment,
  type UserReport,
  type DashboardData,
} from '../api/services/platform';
import { signOutUser } from '../utils/sessionUser';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

const AVATAR_DIM = 256;

/** Read a chosen image, square cover-crop + downscale to 256px, and return a small JPEG payload.
 *  Resizing client-side keeps the upload (and the in-DB bytes) tiny regardless of the source photo. */
async function fileToAvatarPayload(file: File): Promise<{ contentType: string; base64: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('That file is not a valid image.'));
    i.src = dataUrl;
  });
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_DIM;
  canvas.height = AVATAR_DIM;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image processing is not supported here.');
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_DIM, AVATAR_DIM);
  const out = canvas.toDataURL('image/jpeg', 0.85);
  return { contentType: 'image/jpeg', base64: out.split(',')[1] ?? '' };
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [assignments, setAssignments] = useState<ParticipantAssignment[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [org, setOrg] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState(false);
  const [name, setName] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setAvatarError('Please choose a PNG, JPEG, or WebP image.');
      return;
    }
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const { contentType, base64 } = await fileToAvatarPayload(file);
      const updated = await uploadAvatar(contentType, base64);
      setProfile(updated);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Could not upload your picture.');
    } finally {
      setAvatarBusy(false);
    }
  }

  useEffect(() => {
    document.title = 'SpekSense — Profile';
    let active = true;
    (async () => {
      try {
        const p = await getProfile();
        if (!active) return;
        setProfile(p);
        setName(p.displayName);
        if (p.isAdmin) {
          const d = await getDashboard().catch(() => null);
          if (!active) return;
          setOrg(d);
          // Scoped failure flag — a dashboard hiccup must not blank the profile.
          setActivityError(d === null);
        } else {
          const [a, r] = await Promise.all([
            listMyAssignments().catch(() => null),
            listMyReports().catch(() => null),
          ]);
          if (!active) return;
          setAssignments(a ?? []);
          setReports(r ?? []);
          // Distinguish a failed fetch from genuinely-empty so we don't tell a
          // participant they're "all caught up" when the API actually errored.
          setActivityError(a === null || r === null);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load your profile.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Auto-clear the transient "Saved" confirmation (parity with Settings).
  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(0), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  async function saveName() {
    const trimmed = name.trim();
    if (!profile || !trimmed || trimmed === profile.displayName) {
      // Nothing meaningful changed — restore the canonical value and clear any stale error.
      if (profile && trimmed !== profile.displayName) setName(profile.displayName);
      setNameError(null);
      return;
    }
    setNameError(null);
    try {
      const updated = await patchProfile(trimmed);
      setProfile(updated);
      setName(updated.displayName);
      setSavedAt(Date.now());
    } catch (e) {
      // Scoped to the field so a failed save doesn't blank the whole profile page.
      setNameError(e instanceof Error ? e.message : 'Could not update your name.');
      setName(profile.displayName);
    }
  }

  const counts = {
    assigned: assignments.filter((a) => a.status === 'assigned').length,
    inProgress: assignments.filter((a) => a.status === 'in_progress').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
  };
  const todo = assignments.filter((a) => a.status !== 'completed');

  return (
    <div className="dashboard-page profile-page">
      <AppHeader />
      <main className="dash-main profile-main">
        <header className="profile-hero">
          <h1 className="profile-title">Your profile</h1>
          <p className="profile-sub">Your account and assessment activity.</p>
        </header>

        {loading ? (
          <div
            className="profile-grid"
            role="status"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="sr-only">Loading your profile…</span>
            <SkeletonCard count={2} lines={3} />
          </div>
        ) : error ? (
          <ErrorNote message={error} />
        ) : profile ? (
          <div className="profile-grid">
            <article className="card glass profile-identity">
              <div className="profile-cover" aria-hidden="true" />
              <div className="profile-avatar-wrap">
                {profile.profilePictureUrl ? (
                  <img
                    className="profile-avatar profile-avatar--img"
                    src={profile.profilePictureUrl}
                    alt=""
                  />
                ) : (
                  <div className="profile-avatar" aria-hidden="true">
                    {initials(profile.displayName || profile.email)}
                  </div>
                )}
                <button
                  type="button"
                  className="profile-avatar-edit"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarBusy}
                  aria-label={profile.profilePictureUrl ? 'Change profile picture' : 'Upload profile picture'}
                >
                  {avatarBusy ? '…' : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={onAvatarChange}
                />
              </div>
              {avatarError && (
                <p className="profile-avatar-error" role="alert">{avatarError}</p>
              )}
              <div className="profile-identity-body">
                <span className="profile-field-label-row">
                  <label className="profile-field-label" htmlFor="profile-name">Display name</label>
                  <span className="settings-saved" role="status" aria-live="polite">{savedAt ? 'Saved' : ''}</span>
                </span>
                <input
                  id="profile-name"
                  className="profile-name-input"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  autoComplete="name"
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? 'profile-name-error' : undefined}
                />
                {nameError && (
                  <p id="profile-name-error" className="profile-field-error" role="alert">
                    {nameError}
                  </p>
                )}
                <span className={`profile-role-pill${profile.isAdmin ? ' profile-role-pill--admin' : ''}`}>
                  {profile.isAdmin ? 'HR Admin' : 'Participant'}
                </span>
                <dl className="profile-meta">
                  <div><dt>Email</dt><dd>{profile.email}</dd></div>
                  {profile.organization ? <div><dt>Organization</dt><dd>{profile.organization}</dd></div> : null}
                </dl>
                <p className="profile-account-note">
                  Manage your password and notification preferences in{' '}
                  <Link to="/settings" className="profile-inline-link">Settings</Link>.
                </p>
                <div className="profile-quick-links">
                  <Link to="/settings" className="dash-btn-pill dash-btn-pill--light">Settings</Link>
                  <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={() => setLogoutOpen(true)}>Sign out</button>
                </div>
              </div>
            </article>

            {profile.isAdmin ? (
              <div className="profile-admin-col">
                <article className="card glass profile-panel">
                  <h2 className="profile-panel-title">Organisation at a glance</h2>
                  <p className="profile-panel-sub">A snapshot of your organisation's assessment activity.</p>
                  {activityError && (
                    <p className="profile-activity-note" role="status">
                      We couldn't load your organisation snapshot right now. Please refresh.
                    </p>
                  )}
                  {org && org.summaryKpis.length > 0 ? (
                    <div className="profile-stat-row">
                      {org.summaryKpis.slice(0, 4).map((kpi) => (
                        <div key={kpi.id} className="profile-stat">
                          <span className="profile-stat-value">{kpi.value}</span>
                          <span className="profile-stat-label">{kpi.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : !activityError ? (
                    <EmptyState icon="📊" title="No data yet" message="Org metrics appear once assessments are underway." />
                  ) : null}
                  <Link to="/dashboard" className="profile-see-all">Open dashboard →</Link>
                </article>

                <article className="card glass profile-panel">
                  <h2 className="profile-panel-title">Recent activity</h2>
                  {org && org.recentActivity.length > 0 ? (
                    <ul className="profile-activity-list">
                      {org.recentActivity.slice(0, 4).map((item) => (
                        <li key={item.id} className="profile-activity-item">
                          <span className="profile-activity-label">{item.label}</span>
                          <time className="profile-activity-time">{item.timeLabel}</time>
                        </li>
                      ))}
                    </ul>
                  ) : !activityError ? (
                    <EmptyState icon="🕊️" title="All quiet" message="No recent organisation activity to show." />
                  ) : null}
                </article>
              </div>
            ) : (
              <article className="card glass profile-panel">
                <h2 className="profile-panel-title">Your assessments</h2>
                {activityError && (
                  <p className="profile-activity-note" role="status">
                    We couldn't load your latest assessment activity — some items may be missing. Please refresh.
                  </p>
                )}
                <div className="profile-stat-row">
                  <ProfileStat label="Not started" value={counts.assigned} />
                  <ProfileStat label="In progress" value={counts.inProgress} />
                  <ProfileStat label="Completed" value={counts.completed} variant="up" />
                  <ProfileStat label="Reports" value={reports.length} />
                </div>
                {todo.length > 0 ? (
                  <ul className="profile-todo-list">
                    {todo.slice(0, 4).map((a) => {
                      // Mirror AssessmentCard: only link when the assessment is actually
                      // takeable; 360s go to peer selection, everything else to instructions.
                      const isOpen = a.availability == null || a.availability === 'open';
                      const dest =
                        a.kind === 'survey360'
                          ? `/assessments/${a.id}/peers`
                          : `/assessments/${a.id}/instructions`;
                      const badge =
                        a.availability === 'upcoming'
                          ? 'Not open yet'
                          : a.availability === 'closed'
                            ? 'Closed'
                            : a.status === 'in_progress'
                              ? 'In progress'
                              : 'Start';
                      const inner = (
                        <>
                          <span className="profile-todo-title">{a.title}</span>
                          <span className="profile-todo-badge">{badge}</span>
                        </>
                      );
                      return (
                        <li key={a.id}>
                          {isOpen ? (
                            <Link to={dest} className="profile-todo-item">{inner}</Link>
                          ) : (
                            <div className="profile-todo-item profile-todo-item--blocked">{inner}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyState icon="✓" title="You're all caught up" message="No assessments waiting for you right now." />
                )}
                <Link to="/assessments" className="profile-see-all">View all assessments →</Link>
              </article>
            )}

            {!profile.isAdmin && (
              <article className="card glass profile-panel profile-panel--span">
                <h2 className="profile-panel-title">Recent reports</h2>
                <p className="profile-panel-sub">PDF reports from assessments you have completed.</p>
                {reports.length > 0 ? (
                  <ul className="profile-activity-list">
                    {reports.slice(0, 4).map((report) => (
                      <li key={report.id} className="profile-activity-item">
                        <span className="profile-activity-label">{report.title}</span>
                        <time className="profile-activity-time">{report.completedLabel}</time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon="📄" title="No reports yet" message="Complete an assessment to unlock your PDF report." />
                )}
                <Link to="/reports" className="profile-see-all">View all reports →</Link>
              </article>
            )}
          </div>
        ) : null}
      </main>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => signOutUser()}
      />
    </div>
  );
}

function ProfileStat({ label, value, variant }: { label: string; value: number; variant?: 'up' }) {
  return (
    <div className="profile-stat">
      <span className={`profile-stat-value${variant === 'up' ? ' profile-stat-value--up' : ''}`}>{value}</span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}
