import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import {
  deleteAssessmentDraft,
  kindLabel,
  listAssessmentDefinitions,
} from '../../api/services/assessmentCatalog';
import type { AssessmentDefinition } from '../../api/types';
import { isAdminUser } from '../../utils/sessionUser';

export function ConfigureHomePage() {
  const [definitions, setDefinitions] = useState<AssessmentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    return listAssessmentDefinitions()
      .then(setDefinitions)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = 'SpekSense — Configure';
    void load();
  }, [load]);

  async function handleDelete(d: AssessmentDefinition) {
    setDeletingId(d.id);
    setActionError(null);
    try {
      await deleteAssessmentDraft(d.id);
      setConfirmingId(null);
      await load();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : `Could not delete "${d.title.trim() || 'this draft'}".`,
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (!isAdminUser()) return <Navigate to="/assessments" replace />;

  const drafts = definitions.filter((d) => d.publishStatus === 'draft');
  const published = definitions.filter((d) => d.publishStatus === 'published');

  return (
    <div className="dashboard-page configure-page">
      <AppHeader />
      <main className="dash-main configure-main">
        <header className="configure-hero">
          <div>
            <h1 className="configure-title">Configure assessments</h1>
            <p className="configure-sub">Create surveys, behavioral scenarios, and 360 feedback for your organization.</p>
          </div>
          <Link to="/configure/new" className="dash-btn-pill dash-pill--yellow">
            Create assessment
          </Link>
        </header>

        {loading ? <p className="configure-muted">Loading catalog…</p> : null}
        {actionError ? (
          <p className="flow-error" role="alert">
            {actionError}
          </p>
        ) : null}

        {!loading && drafts.length > 0 ? (
          <section className="configure-section" aria-labelledby="configure-drafts">
            <h2 id="configure-drafts" className="configure-section-title">
              Drafts
            </h2>
            <ul className="configure-card-list">
              {drafts.map((d) => {
                const title = d.title.trim() || 'Untitled assessment';
                const confirming = confirmingId === d.id;
                return (
                  <li key={d.id} className="configure-card-wrap">
                    <Link to={`/configure/${d.id}`} className="configure-card">
                      <span className="configure-badge configure-badge--draft">Draft</span>
                      <h3>{title}</h3>
                      <p>{d.subtitle || 'No subtitle'}</p>
                      <span className="configure-card-meta">{kindLabel(d.kind)}</span>
                    </Link>
                    <div className="configure-card-delete-overlay">
                      {confirming ? (
                        <>
                          <button
                            type="button"
                            className="configure-card-delete-btn"
                            disabled={deletingId === d.id}
                            onClick={() => void handleDelete(d)}
                          >
                            {deletingId === d.id ? 'Deleting…' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            className="configure-card-delete-btn configure-card-delete-btn--ghost"
                            onClick={() => setConfirmingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="configure-card-delete-btn"
                          aria-label={`Delete draft ${title}`}
                          onClick={() => {
                            setActionError(null);
                            setConfirmingId(d.id);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="configure-section" aria-labelledby="configure-published">
          <h2 id="configure-published" className="configure-section-title">
            Published
          </h2>
          <ul className="configure-card-list">
            {published.map((d) => (
              <li key={d.id}>
                <article className="configure-card configure-card--static">
                  <span className="configure-badge configure-badge--published">Published</span>
                  <h3>{d.title}</h3>
                  <p>{d.subtitle}</p>
                  <span className="configure-card-meta">{kindLabel(d.kind)}</span>
                  <div className="configure-card-actions">
                    <Link to={`/configure/${d.id}/assign`} className="dash-btn-pill dash-btn-pill--light">
                      Manage
                    </Link>
                    {(d.assignmentCount ?? 0) === 0 ? (
                      confirmingId === d.id ? (
                        <>
                          <button
                            type="button"
                            className="configure-card-delete-btn"
                            disabled={deletingId === d.id}
                            onClick={() => void handleDelete(d)}
                          >
                            {deletingId === d.id ? 'Deleting…' : 'Confirm delete'}
                          </button>
                          <button
                            type="button"
                            className="configure-card-delete-btn configure-card-delete-btn--ghost"
                            onClick={() => setConfirmingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="configure-card-delete-btn"
                          aria-label={`Delete ${d.title || 'assessment'}`}
                          onClick={() => {
                            setActionError(null);
                            setConfirmingId(d.id);
                          }}
                        >
                          Delete
                        </button>
                      )
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
