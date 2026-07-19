import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { CohortsPanel } from '../components/CohortsPanel';
import { EmptyState, ErrorNote } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import {
  bulkImportPeople,
  createPerson,
  deletePerson,
  getPeopleStats,
  listPeoplePaged,
  personDisplayName,
  sendActivationLink,
} from '../api/services/peopleDirectory';
import { downloadUserImportTemplate, parseUserUpload } from '../components/configure/excelImport';
import type { OrgPerson, OrgPersonRow, PeopleStats } from '../api/types';
import { isAdminUser, isManager } from '../utils/sessionUser';

const PAGE_SIZES = [25, 50, 100];

export function PeoplePage() {
  const admin = isAdminUser();
  const manager = isManager();
  const canView = admin || manager;
  const [rows, setRows] = useState<OrgPersonRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<PeopleStats | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<'directory' | 'cohorts'>('directory');
  const fileRef = useRef<HTMLInputElement>(null);

  // Debounce the search box; reset to page 1 whenever the term changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Load the current page from the server whenever page / size / search changes.
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await listPeoplePaged({ page, pageSize, search: debouncedQuery });
      setRows(result.items);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load people.');
    } finally {
      setLoading(false);
    }
  }

  // Stats are org-wide and independent of the page; refresh on their own.
  async function loadStats() {
    try {
      setStats(await getPeopleStats());
    } catch {
      /* KPIs are non-critical; leave them blank on failure */
    }
  }

  useEffect(() => {
    document.title = 'SpekSense — People';
  }, []);

  useEffect(() => {
    if (canView) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, page, pageSize, debouncedQuery]);

  useEffect(() => {
    if (canView) void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  // Refresh both the current page and the org-wide stats after a mutation.
  function reload() {
    void load();
    void loadStats();
  }

  if (!canView) return <Navigate to="/assessments" replace />;

  const kpis = {
    total: stats?.total ?? 0,
    active: stats?.active ?? 0,
    invited: stats?.invited ?? 0,
    pct: stats?.activatedPct ?? 0,
  };
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, total);

  async function onImport(file: File) {
    setNotice(null);
    try {
      const parsed = await parseUserUpload(file);
      if (parsed.length === 0) {
        setError('No data rows found in the file.');
        return;
      }
      const result = await bulkImportPeople(parsed);
      setNotice(
        `Imported ${result.created.length} ${result.created.length === 1 ? 'person' : 'people'}` +
          (result.errors.length ? ` · ${result.errors.length} skipped` : '.'),
      );
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    }
  }

  async function onActivation(p: OrgPerson) {
    setNotice(null);
    try {
      const { url } = await sendActivationLink(p.id);
      try {
        await navigator.clipboard.writeText(url);
        setNotice(`Activation link for ${personDisplayName(p)} copied to clipboard.`);
      } catch {
        setNotice(`Activation link for ${personDisplayName(p)}: ${url}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create an activation link.');
    }
  }

  async function onDelete(p: OrgPerson) {
    setNotice(null);
    setError(null);
    if (!window.confirm(`Remove ${personDisplayName(p)} from your organization? This can't be undone.`)) return;
    try {
      await deletePerson(p.id);
      setNotice(`${personDisplayName(p)} was removed.`);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove this person.');
    }
  }

  return (
    <div className="dashboard-page people-page">
      <AppHeader />
      <main className="dash-main people-main">
        <header className="people-hero">
          <div>
            <h1 className="people-title">People</h1>
            <p className="people-sub">
              {manager
                ? 'Your department directory and assessment participation.'
                : 'Your organisation directory and assessment participation.'}
            </p>
          </div>
          <div className="people-hero-actions">
            {admin && view === 'directory' ? (
              <>
                <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={() => downloadUserImportTemplate()}>
                  Template
                </button>
                <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={() => fileRef.current?.click()}>
                  Import
                </button>
                <button type="button" className="dash-btn-pill dash-pill--yellow" onClick={() => setShowAdd((s) => !s)}>
                  Add person
                </button>
              </>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = '';
              }}
            />
          </div>
        </header>

        {admin ? (
          <div className="people-tabs" role="tablist" aria-label="People views">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'directory'}
              className={`people-tab${view === 'directory' ? ' people-tab--active' : ''}`}
              onClick={() => setView('directory')}
            >
              Directory
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'cohorts'}
              className={`people-tab${view === 'cohorts' ? ' people-tab--active' : ''}`}
              onClick={() => setView('cohorts')}
            >
              Cohorts
            </button>
          </div>
        ) : null}

        {admin && view === 'cohorts' ? (
          <CohortsPanel />
        ) : (
        <>
        <section className="people-kpis" aria-label="Directory summary">
          <Kpi label="Total people" value={kpis.total} />
          <Kpi label="Active" value={kpis.active} variant="up" />
          <Kpi label="Invited" value={kpis.invited} />
          <Kpi label="Activated" value={`${kpis.pct}%`} />
        </section>

        {notice ? <p className="people-notice" role="status">{notice}</p> : null}
        {error ? <ErrorNote message={error} /> : null}
        {admin && showAdd ? <AddPersonForm onCreated={() => { setShowAdd(false); reload(); }} onError={setError} /> : null}

        <input
          type="search"
          className="people-search-input"
          placeholder="Search by name, email, role or department…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search people"
        />

        {loading ? (
          <div className="people-skeletons"><SkeletonCard count={4} lines={1} /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon="👥"
            title={debouncedQuery ? 'No matches' : manager ? 'No one in your department yet' : 'No people yet'}
            message={
              debouncedQuery
                ? 'Try a different search.'
                : manager
                  ? 'People assigned to your department will appear here.'
                  : 'Add people or import a spreadsheet to build your directory.'
            }
            actionLabel={admin && !debouncedQuery ? 'Add person' : undefined}
            onAction={admin && !debouncedQuery ? () => setShowAdd(true) : undefined}
          />
        ) : (
          <div className="people-table-wrap" role="region" aria-label="People">
            <table className="people-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="num">Assessments</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Name">
                      <span className="people-name">{personDisplayName(p)}</span>
                      <span className="people-email">{p.email}</span>
                    </td>
                    <td data-label="Role">{p.jobTitle || '—'}</td>
                    <td data-label="Department">{p.department || '—'}</td>
                    <td data-label="Status">
                      <span className={`people-badge people-badge--${p.status}`}>{p.status}</span>
                    </td>
                    <td data-label="Assessments" className="num">{p.assignments}</td>
                    <td className="people-row-action">
                      {admin && p.status === 'invited' ? (
                        <button type="button" className="dash-btn-pill dash-btn-pill--light people-link-btn" onClick={() => onActivation(p)}>
                          Activation link
                        </button>
                      ) : null}
                      {admin && p.assignments === 0 ? (
                        <button
                          type="button"
                          className="dash-btn-pill dash-btn-pill--light people-link-btn people-delete-btn"
                          onClick={() => onDelete(p)}
                          aria-label={`Remove ${personDisplayName(p)}`}
                        >
                          Remove
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && total > 0 ? (
          <nav className="people-pager" aria-label="Pagination">
            <span className="people-pager-range">
              {firstRow}–{lastRow} of {total}
            </span>
            <div className="people-pager-controls">
              <label className="people-pager-size">
                Rows
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="Rows per page"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="dash-btn-pill dash-btn-pill--light"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <span className="people-pager-page">Page {page} of {totalPages}</span>
              <button
                type="button"
                className="dash-btn-pill dash-btn-pill--light"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </nav>
        ) : null}
        </>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value, variant }: { label: string; value: number | string; variant?: 'up' }) {
  return (
    <article className="card glass people-kpi-card">
      <span className="people-kpi-label">{label}</span>
      <span className="people-kpi-value">{value}</span>
      {variant === 'up' ? <span className="people-kpi-sub people-kpi-sub--up">activated</span> : null}
    </article>
  );
}

function AddPersonForm({ onCreated, onError }: { onCreated: () => void; onError: (m: string) => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', jobTitle: '', department: '' });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      onError('First name, last name and email are required.');
      return;
    }
    setBusy(true);
    try {
      await createPerson({
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        jobTitle: form.jobTitle, department: form.department || undefined,
      });
      onCreated();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not add person.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card glass people-add-form" onSubmit={submit}>
      <div className="people-add-grid">
        <label>First name<input value={form.firstName} onChange={set('firstName')} required /></label>
        <label>Last name<input value={form.lastName} onChange={set('lastName')} required /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Job title<input value={form.jobTitle} onChange={set('jobTitle')} /></label>
        <label>Department<input value={form.department} onChange={set('department')} /></label>
      </div>
      <div className="people-add-actions">
        <button type="submit" className="dash-btn-pill dash-pill--yellow" disabled={busy}>
          {busy ? 'Adding…' : 'Add person'}
        </button>
      </div>
    </form>
  );
}
