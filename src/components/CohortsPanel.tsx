import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createCohort,
  deleteCohort,
  getCohort,
  listCohorts,
  uploadCohort,
} from '../api/services/cohorts';
import type { Cohort, CohortDetail } from '../api/types';
import { downloadUserImportTemplate, parseUserUpload } from './configure/excelImport';

/** Manage reusable, org-scoped cohorts: create empty, upload from a file, view members, delete. */
export function CohortsPanel() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CohortDetail | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    return listCohorts()
      .then(setCohorts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load cohorts.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function requireName(): string | null {
    const n = name.trim();
    if (!n) {
      setError('Enter a cohort name first.');
      return null;
    }
    return n;
  }

  async function handleFile(file: File) {
    const n = requireName();
    if (!n) return;
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const rows = await parseUserUpload(file);
      if (rows.length === 0) {
        setError('No people rows found in that file.');
        return;
      }
      const c = await uploadCohort(n, rows);
      setName('');
      setMessage(`Created “${c.name}” with ${c.memberCount} ${c.memberCount === 1 ? 'person' : 'people'}.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cohort upload failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleCreateEmpty() {
    const n = requireName();
    if (!n) return;
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const c = await createCohort(n);
      setName('');
      setMessage(`Created empty cohort “${c.name}”. Upload a file or add people to it.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create cohort.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteCohort(id);
      setConfirmingId(null);
      if (openId === id) {
        setOpenId(null);
        setDetail(null);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete cohort.');
    }
  }

  async function toggleOpen(id: string) {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    try {
      setDetail(await getCohort(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load cohort members.');
    }
  }

  return (
    <section className="cohorts">
      <div className="cohorts-create card glass">
        <h2 className="cohorts-create-title">New cohort</h2>
        <p className="cohorts-create-hint">
          Name a group, then upload an Excel/CSV of people (new people are added to your directory).
          Cohorts are saved and reusable across assessments.
        </p>
        <div className="cohorts-create-row">
          <input
            className="cohorts-name-input"
            type="text"
            placeholder="Cohort name (e.g. Q3 New Hires)"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={downloadUserImportTemplate}>
            Template
          </button>
          <label className={`dash-btn-pill dash-pill--yellow cohorts-upload-btn${busy ? ' is-disabled' : ''}`}>
            {busy ? 'Uploading…' : 'Upload file'}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </label>
          <button type="button" className="dash-btn-pill dash-btn-pill--light" disabled={busy} onClick={() => void handleCreateEmpty()}>
            Create empty
          </button>
        </div>
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
      </div>

      {loading ? (
        <p className="configure-muted">Loading cohorts…</p>
      ) : cohorts.length === 0 ? (
        <p className="configure-muted">No cohorts yet. Create one above to reuse when assigning assessments.</p>
      ) : (
        <ul className="cohorts-list">
          {cohorts.map((c) => (
            <li key={c.id} className="cohorts-item card glass">
              <div className="cohorts-item-head">
                <div>
                  <h3 className="cohorts-item-name">{c.name}</h3>
                  <span className="cohorts-item-meta">
                    {c.memberCount} {c.memberCount === 1 ? 'person' : 'people'}
                  </span>
                </div>
                <div className="cohorts-item-actions">
                  <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={() => void toggleOpen(c.id)}>
                    {openId === c.id ? 'Hide' : 'View'}
                  </button>
                  {confirmingId === c.id ? (
                    <>
                      <button type="button" className="cohorts-danger" onClick={() => void handleDelete(c.id)}>
                        Confirm
                      </button>
                      <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={() => setConfirmingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="button" className="cohorts-danger" onClick={() => setConfirmingId(c.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {openId === c.id ? (
                <div className="cohorts-members">
                  {!detail ? (
                    <p className="configure-muted">Loading members…</p>
                  ) : detail.members.length === 0 ? (
                    <p className="configure-muted">This cohort has no members yet.</p>
                  ) : (
                    <ul className="cohorts-member-list">
                      {detail.members.map((m) => (
                        <li key={m.personId} className="cohorts-member">
                          <span className="cohorts-member-name">
                            {m.firstName} {m.lastName}
                          </span>
                          <span className="cohorts-member-email">{m.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
