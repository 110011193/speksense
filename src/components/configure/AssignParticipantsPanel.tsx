import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAssignments } from '../../api/services/assignmentService';
import {
  bulkImportPeople,
  createPerson,
  listPeople,
  personDisplayName,
} from '../../api/services/peopleDirectory';
import type { OrgPerson } from '../../api/types';
import { downloadUserImportTemplate, parseUserUpload } from './excelImport';

type Props = {
  assessmentId: string;
  published: boolean;
  onAssigned?: () => void;
};

type Tab = 'select' | 'manual' | 'import';

export function AssignParticipantsPanel({ assessmentId, published, onAssigned }: Props) {
  const [tab, setTab] = useState<Tab>('select');
  const [people, setPeople] = useState<OrgPerson[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [manual, setManual] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    department: '',
    site: '',
  });

  const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([]);

  const refreshPeople = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listPeople();
      setPeople(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPeople();
  }, [refreshPeople]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const hay = `${personDisplayName(p)} ${p.email} ${p.jobTitle}`.toLowerCase();
      return hay.includes(q);
    });
  }, [people, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submitAssignment(extraIds: string[] = []) {
    if (!published) {
      setError('Publish this assessment before assigning participants.');
      return;
    }
    const userIds = [...new Set([...selected, ...extraIds])];
    if (userIds.length === 0) {
      setError('Select at least one participant.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await createAssignments({ assessmentId, userIds });
      setMessage(`Assigned ${userIds.length} participant${userIds.length === 1 ? '' : 's'}.`);
      onAssigned?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assignment failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualAdd() {
    setError(null);
    try {
      const person = await createPerson({
        firstName: manual.firstName,
        lastName: manual.lastName,
        email: manual.email,
        jobTitle: manual.jobTitle,
        department: manual.department || undefined,
        site: manual.site || undefined,
      });
      await refreshPeople();
      setSelected((prev) => new Set(prev).add(person.id));
      setManual({ firstName: '', lastName: '', email: '', jobTitle: '', department: '', site: '' });
      setMessage(`Added ${personDisplayName(person)} to the directory and selection.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add user.');
    }
  }

  async function handleFileUpload(file: File) {
    setError(null);
    setImportErrors([]);
    try {
      const rows = await parseUserUpload(file);
      if (rows.length === 0) {
        setError('No data rows found in file.');
        return;
      }
      const result = await bulkImportPeople(rows);
      setImportErrors(result.errors);
      await refreshPeople();
      const newIds = result.created.map((p) => p.id);
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of newIds) next.add(id);
        return next;
      });
      setMessage(
        `Imported ${result.created.length} user${result.created.length === 1 ? '' : 's'}${
          result.errors.length ? ` (${result.errors.length} row errors)` : ''
        }.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    }
  }

  return (
    <div className="configure-assign">
      {!published ? (
        <p className="configure-banner configure-banner--warn" role="status">
          Publish this assessment before assigning participants.
        </p>
      ) : null}

      <div className="configure-tabs" role="tablist" aria-label="Add participants">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'select'}
          className={`configure-tab${tab === 'select' ? ' configure-tab--active' : ''}`}
          onClick={() => setTab('select')}
        >
          Existing users
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'manual'}
          className={`configure-tab${tab === 'manual' ? ' configure-tab--active' : ''}`}
          onClick={() => setTab('manual')}
        >
          Add manually
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'import'}
          className={`configure-tab${tab === 'import' ? ' configure-tab--active' : ''}`}
          onClick={() => setTab('import')}
        >
          Excel import
        </button>
      </div>

      {tab === 'select' ? (
        <div className="configure-assign-panel">
          <label className="configure-search">
            <span className="sr-only">Search people</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
            />
          </label>
          {loading ? (
            <p className="configure-muted">Loading directory…</p>
          ) : (
            <ul className="configure-people-list">
              {filtered.map((p) => (
                <li key={p.id}>
                  <label className="configure-people-row">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                    <span className="configure-people-name">{personDisplayName(p)}</span>
                    <span className="configure-people-meta">{p.email}</span>
                    <span className="configure-people-meta">{p.jobTitle}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === 'manual' ? (
        <div className="configure-assign-panel configure-form-grid">
          <label>
            First name
            <input
              value={manual.firstName}
              onChange={(e) => setManual((m) => ({ ...m, firstName: e.target.value }))}
            />
          </label>
          <label>
            Last name
            <input
              value={manual.lastName}
              onChange={(e) => setManual((m) => ({ ...m, lastName: e.target.value }))}
            />
          </label>
          <label className="configure-span-2">
            Email
            <input
              type="email"
              value={manual.email}
              onChange={(e) => setManual((m) => ({ ...m, email: e.target.value }))}
            />
          </label>
          <label className="configure-span-2">
            Job title
            <input
              value={manual.jobTitle}
              onChange={(e) => setManual((m) => ({ ...m, jobTitle: e.target.value }))}
            />
          </label>
          <label>
            Department
            <input
              value={manual.department}
              onChange={(e) => setManual((m) => ({ ...m, department: e.target.value }))}
            />
          </label>
          <label>
            Site
            <input
              value={manual.site}
              onChange={(e) => setManual((m) => ({ ...m, site: e.target.value }))}
            />
          </label>
          <div className="configure-span-2">
            <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={() => void handleManualAdd()}>
              Add to directory
            </button>
          </div>
        </div>
      ) : null}

      {tab === 'import' ? (
        <div className="configure-assign-panel">
          <p className="configure-muted">
            Download the template, fill in user rows, and upload an .xlsx or .csv file (max 500 rows).
          </p>
          <div className="configure-import-actions">
            <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={downloadUserImportTemplate}>
              Download template
            </button>
            <label className="dash-btn-pill dash-pill--yellow configure-file-label">
              Upload file
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          {importErrors.length > 0 ? (
            <ul className="configure-import-errors">
              {importErrors.map((err) => (
                <li key={`${err.row}-${err.message}`}>
                  Row {err.row}: {err.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="flow-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="configure-banner configure-banner--ok" role="status">
          {message}
        </p>
      ) : null}

      <div className="configure-wizard-actions">
        <button
          type="button"
          className="dash-btn-pill dash-pill--yellow"
          disabled={submitting || !published}
          onClick={() => void submitAssignment()}
        >
          {submitting ? 'Assigning…' : 'Assign selected participants'}
        </button>
      </div>
    </div>
  );
}
