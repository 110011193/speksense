import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { EmptyState, ErrorNote } from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { HrAdminHome } from '../components/HrAdminHome';
import { HrAnalyticsCharts } from '../components/HrAnalyticsCharts';
import type { HrAdminDashboard } from '../data/hrAdminDashboard';
import { getHrGreetingPrefix, getHrHeaderDateLine } from '../data/hrAdminDashboard';
import type { OrgSurveyAnalytics } from '../data/orgSurveyAnalytics';
import {
  getDashboard,
  getDashboardAnalytics,
  type AnalyticsData,
  type DashboardData,
} from '../api/services/platform';
import { ApiError } from '../api/types';
import { getDisplayName, isAdminUser, isManager } from '../utils/sessionUser';

export function DashboardPage() {
  const name = getDisplayName();
  const hrAdmin = isAdminUser();
  const manager = isManager();
  const canView = hrAdmin || manager;

  const [hrHome, setHrHome] = useState<DashboardData | null>(null);
  const [org, setOrg] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'SpekSense — Dashboard';
  }, []);

  useEffect(() => {
    if (!canView) return;

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([getDashboard(), getDashboardAnalytics()])
      .then(([dashboard, analytics]) => {
        if (!active) return;
        setHrHome(dashboard);
        setOrg(analytics);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : 'Could not load the dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canView]);

  if (!canView) {
    return <Navigate to="/assessments" replace />;
  }

  return (
    <div className="dashboard-page dashboard-page--insights">
      <AppHeader />
      <main className="dash-main">
        <section className="dash-hero dash-hero--hr-admin" aria-label="HR overview">
          <div className="dash-hero-left">
            <h1 className="dash-greeting">
              {getHrGreetingPrefix()}, <span>{name}</span>
              {manager ? <span className="role-pill role-pill--manager dash-role-tag">Department view</span> : null}
            </h1>
            <p className="dash-hr-admin-date">
              {manager
                ? getHrHeaderDateLine().replace('HR Admin View', 'Manager · Department view')
                : getHrHeaderDateLine()}
            </p>
          </div>
        </section>

        {loading ? (
          <div className="dash-skeleton-grid" aria-busy="true" aria-label="Loading dashboard">
            <SkeletonCard count={4} lines={2} />
          </div>
        ) : error ? (
          <ErrorNote message={error} />
        ) : hrHome && org ? (
          <>
            <HrAdminHome data={hrHome as unknown as HrAdminDashboard} readOnly={manager} />
            <HrAnalyticsCharts org={org as unknown as OrgSurveyAnalytics} />
          </>
        ) : (
          <article className="card glass">
            <EmptyState
              icon="📊"
              title="No dashboard data yet"
              message="Create and assign an assessment to start seeing organisation insights here."
              actionLabel="Configure an assessment"
              actionTo="/configure"
            />
          </article>
        )}
      </main>
    </div>
  );
}
