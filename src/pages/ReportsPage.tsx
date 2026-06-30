import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { EmptyState, ErrorNote } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { listMyReports, fetchReportBlob, type UserReport } from '../api/services/platform';
import { isAdminUser } from '../utils/sessionUser';

export function ReportsPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'SpekSense — Reports';
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listMyReports()
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load reports.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePreview(report: UserReport) {
    setActionError(null);
    try {
      const url = await fetchReportBlob(report.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not open report.');
    }
  }

  async function handleDownload(report: UserReport) {
    setActionError(null);
    try {
      const url = await fetchReportBlob(report.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not download report.');
    }
  }

  if (isAdminUser()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="dashboard-page reports-page">
      <AppHeader />
      <main className="dash-main reports-main">
        <header className="reports-hero">
          <h1 className="reports-title">Reports &amp; downloads</h1>
          <p className="reports-sub">PDF reports from assessments you have completed.</p>
        </header>

        {actionError && <ErrorNote message={actionError} />}

        {loading ? (
          <div aria-busy="true">
            <SkeletonCard count={3} lines={2} />
          </div>
        ) : error ? (
          <ErrorNote message={error} />
        ) : reports.length === 0 ? (
          <article className="card glass">
            <EmptyState
              icon="📄"
              title="No reports yet"
              message="Complete an assessment to unlock your PDF report here."
              actionLabel="Go to assessments"
              actionTo="/assessments"
            />
          </article>
        ) : (
          <ul className="reports-list">
            {reports.map((report) => (
              <li key={report.id}>
                <article className="card glass reports-row">
                  <div className="reports-row-body">
                    <h2 className="reports-row-title">{report.title}</h2>
                    <p className="reports-row-meta">
                      Completed {report.completedLabel} · {report.format} · {report.pageCount} pages
                    </p>
                  </div>
                  <div className="reports-actions">
                    <button
                      type="button"
                      className="dash-btn-pill dash-btn-pill--light"
                      onClick={() => handlePreview(report)}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      className="dash-btn-pill dash-pill--yellow"
                      onClick={() => handleDownload(report)}
                    >
                      Download
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
