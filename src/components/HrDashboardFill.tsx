import type { OrgSurveyAnalytics } from '../data/orgSurveyAnalytics';

type Props = {
  org: OrgSurveyAnalytics;
};

export function HrDashboardFill({ org }: Props) {
  return (
    <>
      <section className="dash-hr-fill-row" aria-label="HR focus and benchmarks">
        <article className="card glass dash-hr-fill-card">
          <header className="card-head">
            <h2 className="card-title">Today&apos;s focus</h2>
          </header>
          <ul className="dash-hr-focus-list">
            {org.hrFocusToday.map((item) => (
              <li key={item.id} className="dash-hr-focus-item">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card glass dash-hr-fill-card">
          <header className="card-head">
            <h2 className="card-title">Benchmarks</h2>
          </header>
          <ul className="dash-hr-benchmark-list">
            {org.benchmarks.map((b) => (
              <li key={b.id} className="dash-hr-benchmark-item">
                <span className="dash-hr-benchmark-label">{b.label}</span>
                <span className="dash-hr-benchmark-value">{b.value}</span>
                <span className="dash-hr-benchmark-note">{b.note}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card glass dash-hr-fill-card">
          <header className="card-head">
            <h2 className="card-title">Reminder channels</h2>
          </header>
          <ul className="dash-hr-channel-list">
            {org.reminderChannels.map((ch) => (
              <li key={ch.id} className="dash-hr-channel-row">
                <span className="dash-hr-channel-name">{ch.channel}</span>
                <div className="dash-hr-channel-bars">
                  <div className="dash-hr-channel-bar-wrap">
                    <span className="dash-hr-channel-bar-label">Open {ch.openRate}%</span>
                    <div className="dash-program-bar-track">
                      <span
                        className="dash-program-bar-fill"
                        style={{ width: `${ch.openRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="dash-hr-channel-bar-wrap">
                    <span className="dash-hr-channel-bar-label">+{ch.completionLift}% completion</span>
                    <div className="dash-program-bar-track">
                      <span
                        className="dash-program-bar-fill dash-program-bar-fill--yellow"
                        style={{ width: `${ch.completionLift * 4}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dash-hr-fill-row dash-hr-fill-row--secondary" aria-label="Actions and signals">
        <article className="card glass dash-hr-fill-card">
          <header className="card-head">
            <h2 className="card-title">Recommended actions</h2>
          </header>
          <ul className="dash-hr-actions-grid">
            {org.recommendedActions.map((action) => (
              <li key={action.id} className="dash-hr-action-card">
                <span className="dash-hr-action-tag">{action.tag}</span>
                <strong>{action.title}</strong>
                <span>{action.detail}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card glass dash-hr-fill-card">
          <header className="card-head">
            <h2 className="card-title">Work location</h2>
          </header>
          <ul className="dash-hr-location-list">
            {org.locationParticipation.map((loc) => (
              <li key={loc.id} className="dash-hr-location-row">
                <span>{loc.label}</span>
                <div className="dash-program-bar-track dash-hr-location-track">
                  <span
                    className="dash-program-bar-fill"
                    style={{ width: `${loc.percent}%` }}
                  />
                </div>
                <span className="dash-program-bar-pct">{loc.percent}%</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card glass dash-hr-fill-card">
          <header className="card-head">
            <h2 className="card-title">Voice of employee</h2>
          </header>
          <ul className="dash-hr-verbatim-list">
            {org.verbatimThemes.map((v) => (
              <li key={v.id} className="dash-hr-verbatim-item">
                <div className="dash-hr-verbatim-top">
                  <strong>{v.theme}</strong>
                  <span className="dash-culture-score-pill">{v.mentionCount} mentions</span>
                </div>
                <p className="dash-hr-verbatim-sample">{v.sample}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
