import { Link } from 'react-router-dom';
import type { HrAdminDashboard } from '../data/hrAdminDashboard';

type Props = {
  data: HrAdminDashboard;
};

export function HrAdminHome({ data }: Props) {
  return (
    <>
      <section className="dash-hr-kpi-row" aria-label="Summary">
        {data.summaryKpis.map((kpi) => (
          <article key={kpi.id} className="card glass dash-hr-kpi-card">
            <span className="dash-hr-kpi-label">{kpi.label}</span>
            <span className="dash-hr-kpi-value">{kpi.value}</span>
            <span
              className={`dash-hr-kpi-sub dash-hr-kpi-sub--${kpi.subtextVariant ?? 'neutral'}`}
            >
              {kpi.subtext}
            </span>
          </article>
        ))}
      </section>

      <div className="dash-hr-home-grid">
        <article className="card glass dash-hr-home-card">
          <header className="card-head card-head--split">
            <h2 className="card-title">Active assessments</h2>
            <Link to="/assessments" className="dash-hr-section-link">
              View all →
            </Link>
          </header>
          <ul className="dash-hr-assessment-list">
            {data.activeAssessments.map((item) => (
              <li key={item.id} className="dash-hr-assessment-item">
                <div className="dash-hr-assessment-body">
                  <strong>{item.title}</strong>
                </div>
                <span className={`dash-hr-status-chip dash-hr-status-chip--${item.status}`}>
                  {item.statusLabel}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card glass dash-hr-home-card">
          <header className="card-head card-head--split">
            <h2 className="card-title">Participation progress</h2>
            <Link to="/assessments" className="dash-hr-section-link">
              Analytics →
            </Link>
          </header>
          <ul className="dash-program-bars dash-hr-participation-bars">
            {data.participation.map((row) => (
              <li key={row.id} className="dash-program-bar-row">
                <span className="dash-program-bar-label">{row.title}</span>
                <div className="dash-program-bar-track" aria-hidden="true">
                  <span
                    className="dash-program-bar-fill"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="dash-program-bar-pct">{row.percent}%</span>
              </li>
            ))}
          </ul>
          <p className="dash-hr-participation-footer">
            Org-wide avg: <strong>{data.orgWideAvg}</strong>
          </p>
        </article>

        <article className="card glass dash-hr-home-card dash-hr-home-card--wide">
          <header className="card-head card-head--split">
            <h2 className="card-title">Recent activity</h2>
            <a href="#" className="dash-hr-section-link">
              View log
            </a>
          </header>
          <ul className="dash-hr-activity">
            {data.recentActivity.map((item) => (
              <li key={item.id} className="dash-hr-activity-item">
                <div className="dash-hr-activity-body">
                  <strong>{item.label}</strong>
                </div>
                <time className="dash-hr-activity-time">{item.timeLabel}</time>
              </li>
            ))}
          </ul>
        </article>

        <div className="dash-hr-home-side">
          <article className="card glass dash-hr-home-card">
            <header className="card-head card-head--split">
              <h2 className="card-title">Upcoming deadlines</h2>
              <a href="/calendar" className="dash-hr-section-link">
                Calendar →
              </a>
            </header>
            <ul className="dash-hr-deadline-ss-list">
              {data.upcomingDeadlines.map((item) => (
                <li key={item.id} className="dash-hr-deadline-ss-item">
                  <span className="dash-hr-deadline-date">{item.dateShort}</span>
                  <div className="dash-hr-deadline-ss-body">
                    <strong>{item.title}</strong>
                    <span>{item.meta}</span>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="card glass dash-hr-home-card">
            <header className="card-head">
              <h2 className="card-title">Quick actions</h2>
            </header>
            <div className="dash-hr-quick-actions">
              {data.quickActions.map((action) => (
                <button key={action.id} type="button" className="dash-btn-pill dash-btn-pill--light">
                  {action.label}
                </button>
              ))}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
