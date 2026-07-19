import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { EmptyState, ErrorNote } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import {
  changeUserRole,
  inviteUser,
  listUsers,
  reactivateUser,
  suspendUser,
  type AssignableRole,
  type OrgUser,
} from '../api/services/orgUsers';
import { listOrgAudit, auditActionLabel, type OrgAudit } from '../api/services/orgAudit';
import { sendActivationLink } from '../api/services/peopleDirectory';
import { getAuthUser } from '../api/authSession';
import { isAdminUser } from '../utils/sessionUser';

type PendingAction =
  | { userId: string; kind: 'suspend' }
  | { userId: string; kind: 'role'; target: AssignableRole }
  | null;

export function TeamPage() {
  const admin = isAdminUser();
  const me = getAuthUser();
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [view, setView] = useState<'members' | 'activity'>('members');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your team.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'SpekSense — Team';
    if (admin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  if (!admin) return <Navigate to="/assessments" replace />;

  async function run(userId: string, fn: () => Promise<unknown>, ok: string) {
    setBusyId(userId);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setPending(null);
      setNotice(ok);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That action could not be completed.');
    } finally {
      setBusyId(null);
    }
  }

  const admins = users.filter((u) => !u.pending && (u.role === 'admin' || u.role === 'superadmin')).length;
  const active = users.filter((u) => u.status === 'active').length;
  const invited = users.filter((u) => u.status === 'invited').length;

  async function resendInvite(u: OrgUser) {
    setError(null);
    setNotice(null);
    try {
      const { url } = await sendActivationLink(u.id);
      try {
        await navigator.clipboard.writeText(url);
        setNotice(`Activation link for ${label(u)} copied to your clipboard.`);
      } catch {
        setNotice(`Activation link for ${label(u)}: ${url}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create an activation link.');
    }
  }

  return (
    <div className="dashboard-page people-page">
      <AppHeader />
      <main className="dash-main people-main">
        <header className="people-hero">
          <div>
            <h1 className="people-title">Team &amp; access</h1>
            <p className="people-sub">
              Invite teammates, grant admin access, and manage who can sign in to your organization.
            </p>
          </div>
          <div className="people-hero-actions">
            {view === 'members' ? (
              <button
                type="button"
                className="dash-btn-pill dash-pill--yellow"
                onClick={() => setShowInvite((s) => !s)}
              >
                {showInvite ? 'Close' : 'Invite teammate'}
              </button>
            ) : null}
          </div>
        </header>

        <div className="people-tabs" role="tablist" aria-label="Team views">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'members'}
            className={`people-tab${view === 'members' ? ' people-tab--active' : ''}`}
            onClick={() => setView('members')}
          >
            Members
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'activity'}
            className={`people-tab${view === 'activity' ? ' people-tab--active' : ''}`}
            onClick={() => setView('activity')}
          >
            Activity
          </button>
        </div>

        {view === 'activity' ? (
          <OrgActivityPanel />
        ) : (
        <>
        <section className="people-kpis" aria-label="Team summary">
          <Kpi label="Members" value={users.length} />
          <Kpi label="Admins" value={admins} />
          <Kpi label="Active" value={active} />
          <Kpi label="Pending invites" value={invited} />
        </section>

        {notice ? <p className="people-notice" role="status">{notice}</p> : null}
        {error ? <ErrorNote message={error} /> : null}

        {showInvite ? (
          <InviteForm
            onInvited={(msg) => {
              setShowInvite(false);
              setNotice(msg);
              void load();
            }}
            onError={setError}
          />
        ) : null}

        {loading ? (
          <div className="people-skeletons"><SkeletonCard count={4} lines={1} /></div>
        ) : users.length === 0 ? (
          <EmptyState
            icon="🧑‍💼"
            title="No teammates yet"
            message="Invite your first teammate to give them access to SpekSense."
            actionLabel="Invite teammate"
            onAction={() => setShowInvite(true)}
          />
        ) : (
          <div className="people-table-wrap" role="region" aria-label="Team members">
            <table className="people-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last sign-in</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = me?.id === u.id;
                  const isSuper = u.role === 'superadmin';
                  const busy = busyId === u.id;
                  return (
                    <tr key={u.pending ? `p-${u.id}` : u.id}>
                      <td data-label="Name">
                        <span className="people-name">
                          {u.displayName || u.email.split('@')[0]}
                          {isSelf ? <span className="team-you-tag">you</span> : null}
                        </span>
                        <span className="people-email">{u.email}</span>
                      </td>
                      <td data-label="Role">
                        <span className={`role-pill role-pill--${u.role}`}>{roleLabel(u.role)}</span>
                      </td>
                      <td data-label="Status">
                        <span className={`status-pill status-pill--${u.status}`}>
                          {u.pending ? 'invited' : u.status}
                        </span>
                      </td>
                      <td data-label="Last sign-in">{u.pending ? 'Not activated' : formatWhen(u.lastLoginAt)}</td>
                      <td className="people-row-action">
                        {u.pending ? (
                          <button
                            type="button"
                            className="dash-btn-pill dash-btn-pill--light people-link-btn"
                            onClick={() => void resendInvite(u)}
                          >
                            Copy link
                          </button>
                        ) : isSuper ? (
                          <span className="team-locked">Platform account</span>
                        ) : (
                          <RowActions
                            user={u}
                            isSelf={isSelf}
                            busy={busy}
                            pending={pending}
                            setPending={setPending}
                            onChangeRole={(target) =>
                              run(u.id, () => changeUserRole(u.id, target),
                                `${label(u)} is now ${target === 'admin' ? 'an admin' : `a ${target}`}.`)
                            }
                            onSuspend={() =>
                              run(u.id, () => suspendUser(u.id), `${label(u)} has been suspended.`)
                            }
                            onReactivate={() =>
                              run(u.id, () => reactivateUser(u.id), `${label(u)} has been reactivated.`)
                            }
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}

function RowActions({
  user,
  isSelf,
  busy,
  pending,
  setPending,
  onChangeRole,
  onSuspend,
  onReactivate,
}: {
  user: OrgUser;
  isSelf: boolean;
  busy: boolean;
  pending: PendingAction;
  setPending: (p: PendingAction) => void;
  onChangeRole: (target: AssignableRole) => void;
  onSuspend: () => void;
  onReactivate: () => void;
}) {
  const confirmingRole =
    pending?.userId === user.id && pending.kind === 'role' ? pending.target : null;
  const confirmingSuspend = pending?.userId === user.id && pending?.kind === 'suspend';

  if (confirmingRole) {
    return (
      <ConfirmInline
        label={`Remove admin (make ${confirmingRole})?`}
        busy={busy}
        onConfirm={() => onChangeRole(confirmingRole)}
        onCancel={() => setPending(null)}
      />
    );
  }
  if (confirmingSuspend) {
    return (
      <ConfirmInline
        label="Suspend access?"
        busy={busy}
        danger
        onConfirm={onSuspend}
        onCancel={() => setPending(null)}
      />
    );
  }

  const otherRoles = (['participant', 'manager', 'admin'] as AssignableRole[]).filter(
    (r) => r !== user.role,
  );

  return (
    <>
      {user.status === 'disabled' ? (
        <button
          type="button"
          className="dash-btn-pill dash-btn-pill--light people-link-btn"
          disabled={busy}
          onClick={onReactivate}
        >
          Reactivate
        </button>
      ) : (
        <>
          {otherRoles.map((r) => (
            <button
              key={r}
              type="button"
              className="dash-btn-pill dash-btn-pill--light people-link-btn"
              disabled={busy}
              onClick={() =>
                // Losing admin rights is destructive — confirm it; other changes apply directly.
                user.role === 'admin'
                  ? setPending({ userId: user.id, kind: 'role', target: r })
                  : onChangeRole(r)
              }
            >
              Make {r}
            </button>
          ))}
          {!isSelf ? (
            <button
              type="button"
              className="dash-btn-pill dash-btn-pill--light people-link-btn people-delete-btn"
              disabled={busy}
              onClick={() => setPending({ userId: user.id, kind: 'suspend' })}
            >
              Suspend
            </button>
          ) : null}
        </>
      )}
    </>
  );
}

function ConfirmInline({
  label,
  busy,
  danger,
  onConfirm,
  onCancel,
}: {
  label: string;
  busy: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <span className="inline-confirm">
      <span className="inline-confirm__label">{label}</span>
      <button
        type="button"
        className={`dash-btn-pill people-link-btn ${danger ? 'inline-confirm__danger' : 'dash-pill--yellow'}`}
        disabled={busy}
        onClick={onConfirm}
      >
        {busy ? '…' : 'Confirm'}
      </button>
      <button
        type="button"
        className="dash-btn-pill dash-btn-pill--light people-link-btn"
        disabled={busy}
        onClick={onCancel}
      >
        Cancel
      </button>
    </span>
  );
}

function InviteForm({
  onInvited,
  onError,
}: {
  onInvited: (message: string) => void;
  onError: (m: string) => void;
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    role: 'participant' as AssignableRole,
  });
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email) {
      onError('First name and email are required.');
      return;
    }
    setBusy(true);
    try {
      const result = await inviteUser({
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        email: form.email,
        jobTitle: form.jobTitle || undefined,
        role: form.role,
      });
      const url = `${window.location.origin}/signup?token=${encodeURIComponent(result.activationToken)}`;
      try {
        await navigator.clipboard.writeText(url);
        setLink(url);
        onInvited(
          `Invite sent to ${result.email}. Activation link copied to your clipboard.`,
        );
      } catch {
        setLink(url);
        onInvited(`Invite created for ${result.email}. Copy the activation link below.`);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not send the invite.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card glass people-add-form" onSubmit={submit}>
      <div className="people-add-grid">
        <label>First name<input value={form.firstName} onChange={set('firstName')} required /></label>
        <label>Last name<input value={form.lastName} onChange={set('lastName')} /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Job title<input value={form.jobTitle} onChange={set('jobTitle')} /></label>
        <label>
          Role
          <select value={form.role} onChange={set('role')}>
            <option value="participant">Participant</option>
            <option value="manager">Manager (department, read-only)</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
      <div className="people-add-actions">
        <button type="submit" className="dash-btn-pill dash-pill--yellow" disabled={busy}>
          {busy ? 'Sending…' : 'Send invite'}
        </button>
      </div>
      {link ? (
        <p className="activation-callout">
          <span>Activation link</span>
          <code>{link}</code>
        </p>
      ) : null}
    </form>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="card glass people-kpi-card">
      <span className="people-kpi-label">{label}</span>
      <span className="people-kpi-value">{value}</span>
    </article>
  );
}

function roleLabel(role: OrgUser['role']): string {
  if (role === 'superadmin') return 'Platform';
  if (role === 'admin') return 'Admin';
  if (role === 'manager') return 'Manager';
  return 'Participant';
}

function label(u: OrgUser): string {
  return u.displayName || u.email.split('@')[0];
}

function formatWhen(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Org-scoped audit trail: semantic events (invites, role changes, suspensions) + HTTP fallbacks. */
function OrgActivityPanel() {
  const [rows, setRows] = useState<OrgAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRows(await listOrgAudit(150));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load activity.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="people-skeletons"><SkeletonCard count={5} lines={1} /></div>;
  if (error) return <ErrorNote message={error} />;
  if (rows.length === 0) {
    return <EmptyState icon="🗂️" title="No activity yet" message="Team and account events will appear here." />;
  }

  return (
    <div className="people-table-wrap" role="region" aria-label="Organization activity">
      <table className="people-table">
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Actor</th>
            <th scope="col">Event</th>
            <th scope="col" className="num">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td data-label="When">{formatWhenWithTime(a.at)}</td>
              <td data-label="Actor">{a.email || '—'}</td>
              <td data-label="Event">
                {a.summary ? (
                  <>
                    <span className="people-name">{auditActionLabel(a.action) ?? 'Event'}</span>
                    <span className="people-email">{a.summary}</span>
                  </>
                ) : (
                  <>
                    <span className="audit-method">{a.method}</span> {a.path}
                  </>
                )}
              </td>
              <td data-label="Status" className="num">
                {a.statusCode === 0 ? (
                  <span className="status-pill status-pill--active">ok</span>
                ) : (
                  <span className={`status-pill status-pill--${a.statusCode < 400 ? 'active' : 'disabled'}`}>
                    {a.statusCode}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatWhenWithTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
