import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { EmptyState, ErrorNote } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import {
  archiveOrganization,
  createOrganization,
  listOrganizations,
  listPlatformAudit,
  reactivateOrganization,
  suspendOrganization,
  type OrgSummary,
  type PlatformAudit,
} from '../api/services/platformOrgs';
import { auditActionLabel } from '../api/services/orgAudit';
import { isSuperAdmin } from '../utils/sessionUser';

type View = 'orgs' | 'activity';
type Pending = { orgId: string; kind: 'suspend' | 'archive' } | null;

export function PlatformPage() {
  const superAdmin = isSuperAdmin();
  const [view, setView] = useState<View>('orgs');
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setOrgs(await listOrganizations());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load organizations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'SpekSense — Platform';
    if (superAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [superAdmin]);

  if (!superAdmin) return <Navigate to="/dashboard" replace />;

  async function run(orgId: string, fn: () => Promise<unknown>, ok: string) {
    setBusyId(orgId);
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

  const active = orgs.filter((o) => o.status === 'active').length;
  const suspended = orgs.filter((o) => o.status === 'suspended').length;
  const totalSeats = orgs.reduce((n, o) => n + o.userCount, 0);

  return (
    <div className="dashboard-page people-page">
      <AppHeader />
      <main className="dash-main people-main">
        <header className="people-hero">
          <div>
            <h1 className="people-title">Platform</h1>
            <p className="people-sub">Provision and manage client organizations across SpekSense.</p>
          </div>
          <div className="people-hero-actions">
            {view === 'orgs' ? (
              <button
                type="button"
                className="dash-btn-pill dash-pill--yellow"
                onClick={() => setShowCreate((s) => !s)}
              >
                {showCreate ? 'Close' : 'New organization'}
              </button>
            ) : null}
          </div>
        </header>

        <div className="people-tabs" role="tablist" aria-label="Platform views">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'orgs'}
            className={`people-tab${view === 'orgs' ? ' people-tab--active' : ''}`}
            onClick={() => setView('orgs')}
          >
            Organizations
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

        {notice ? <p className="people-notice" role="status">{notice}</p> : null}
        {error ? <ErrorNote message={error} /> : null}

        {view === 'activity' ? (
          <ActivityPanel />
        ) : (
          <>
            <section className="people-kpis" aria-label="Platform summary">
              <Kpi label="Organizations" value={orgs.length} />
              <Kpi label="Active" value={active} />
              <Kpi label="Suspended" value={suspended} />
              <Kpi label="Total seats" value={totalSeats} />
            </section>

            {showCreate ? (
              <CreateOrgForm
                onCreated={(msg) => {
                  setShowCreate(false);
                  setNotice(msg);
                  void load();
                }}
                onError={setError}
              />
            ) : null}

            {loading ? (
              <div className="people-skeletons"><SkeletonCard count={3} lines={2} /></div>
            ) : orgs.length === 0 ? (
              <EmptyState
                icon="🏢"
                title="No organizations yet"
                message="Provision your first client organization to get them started."
                actionLabel="New organization"
                onAction={() => setShowCreate(true)}
              />
            ) : (
              <div className="org-grid">
                {orgs.map((o) => (
                  <OrgCard
                    key={o.id}
                    org={o}
                    busy={busyId === o.id}
                    pending={pending}
                    setPending={setPending}
                    onSuspend={() => run(o.id, () => suspendOrganization(o.id), `${o.name} suspended.`)}
                    onReactivate={() => run(o.id, () => reactivateOrganization(o.id), `${o.name} reactivated.`)}
                    onArchive={() => run(o.id, () => archiveOrganization(o.id), `${o.name} archived.`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function OrgCard({
  org,
  busy,
  pending,
  setPending,
  onSuspend,
  onReactivate,
  onArchive,
}: {
  org: OrgSummary;
  busy: boolean;
  pending: Pending;
  setPending: (p: Pending) => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onArchive: () => void;
}) {
  const confirmingSuspend = pending?.orgId === org.id && pending.kind === 'suspend';
  const confirmingArchive = pending?.orgId === org.id && pending.kind === 'archive';
  const archived = org.status === 'archived';

  return (
    <article className="card glass org-card">
      <div className="org-card__head">
        <div>
          <h3 className="org-card__name">{org.name}</h3>
          <span className="org-card__slug">/{org.slug}</span>
        </div>
        <span className={`status-pill status-pill--${org.status}`}>{org.status}</span>
      </div>

      <div className="org-card__stats">
        <span className="org-stat"><b>{org.userCount}</b> users</span>
        <span className="org-stat"><b>{org.adminCount}</b> admins</span>
        <span className="org-stat"><b>{org.peopleCount}</b> people</span>
      </div>

      <div className="org-card__actions">
        {confirmingSuspend ? (
          <Confirm label="Suspend this org?" busy={busy} danger onConfirm={onSuspend} onCancel={() => setPending(null)} />
        ) : confirmingArchive ? (
          <Confirm label="Archive permanently?" busy={busy} danger onConfirm={onArchive} onCancel={() => setPending(null)} />
        ) : archived ? (
          <span className="team-locked">Archived {formatWhen(org.archivedAt)}</span>
        ) : (
          <>
            {org.status === 'suspended' ? (
              <button
                type="button"
                className="dash-btn-pill dash-btn-pill--light people-link-btn"
                disabled={busy}
                onClick={onReactivate}
              >
                Reactivate
              </button>
            ) : (
              <button
                type="button"
                className="dash-btn-pill dash-btn-pill--light people-link-btn"
                disabled={busy}
                onClick={() => setPending({ orgId: org.id, kind: 'suspend' })}
              >
                Suspend
              </button>
            )}
            <button
              type="button"
              className="dash-btn-pill dash-btn-pill--light people-link-btn people-delete-btn"
              disabled={busy}
              onClick={() => setPending({ orgId: org.id, kind: 'archive' })}
            >
              Archive
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function Confirm({
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

function CreateOrgForm({
  onCreated,
  onError,
}: {
  onCreated: (message: string) => void;
  onError: (m: string) => void;
}) {
  const [form, setForm] = useState({ name: '', slug: '', adminEmail: '', adminFirstName: '', adminLastName: '' });
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.adminEmail || !form.adminFirstName) {
      onError('Organization name, admin first name, and admin email are required.');
      return;
    }
    setBusy(true);
    try {
      const result = await createOrganization({
        name: form.name,
        slug: form.slug || undefined,
        adminEmail: form.adminEmail,
        adminFirstName: form.adminFirstName,
        adminLastName: form.adminLastName || undefined,
      });
      const url = `${window.location.origin}/signup?token=${encodeURIComponent(result.activationToken)}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* clipboard may be blocked — the link is still shown below */
      }
      setLink(url);
      onCreated(`${result.org.name} created. Admin activation link copied to your clipboard.`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not create the organization.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card glass people-add-form" onSubmit={submit}>
      <div className="people-add-grid">
        <label>Organization name<input value={form.name} onChange={set('name')} required /></label>
        <label>Slug (optional)<input value={form.slug} onChange={set('slug')} placeholder="auto from name" /></label>
        <label>Admin first name<input value={form.adminFirstName} onChange={set('adminFirstName')} required /></label>
        <label>Admin last name<input value={form.adminLastName} onChange={set('adminLastName')} /></label>
        <label>Admin email<input type="email" value={form.adminEmail} onChange={set('adminEmail')} required /></label>
      </div>
      <div className="people-add-actions">
        <button type="submit" className="dash-btn-pill dash-pill--yellow" disabled={busy}>
          {busy ? 'Creating…' : 'Create organization'}
        </button>
      </div>
      {link ? (
        <p className="activation-callout">
          <span>Admin activation link</span>
          <code>{link}</code>
        </p>
      ) : null}
    </form>
  );
}

function ActivityPanel() {
  const [rows, setRows] = useState<PlatformAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRows(await listPlatformAudit(150));
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
    return <EmptyState icon="🗂️" title="No activity yet" message="Cross-tenant audit events will appear here." />;
  }

  return (
    <div className="people-table-wrap" role="region" aria-label="Platform activity">
      <table className="people-table">
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Organization</th>
            <th scope="col">Actor</th>
            <th scope="col">Action</th>
            <th scope="col" className="num">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td data-label="When">{formatWhen(a.createdAt, true)}</td>
              <td data-label="Organization">{a.organizationName || '—'}</td>
              <td data-label="Actor">{a.actorEmail || '—'}</td>
              <td data-label="Action">
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

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="card glass people-kpi-card">
      <span className="people-kpi-label">{label}</span>
      <span className="people-kpi-value">{value}</span>
    </article>
  );
}

function formatWhen(iso: string | null, withTime = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
