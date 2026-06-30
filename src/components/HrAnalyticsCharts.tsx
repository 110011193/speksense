import type { OrgSurveyAnalytics, SurveyMixSlice } from '../data/orgSurveyAnalytics';

type Props = {
  org: OrgSurveyAnalytics;
};

function donutGradient(slices: SurveyMixSlice[]): string {
  let cursor = 0;
  const colors: Record<SurveyMixSlice['variant'], string> = {
    yellow: 'var(--dash-yellow)',
    dark: 'var(--dash-charcoal)',
    light: 'rgba(0, 0, 0, 0.14)',
  };
  const parts = slices.map((slice) => {
    const start = cursor;
    cursor += slice.percent;
    return `${colors[slice.variant]} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${parts.join(', ')})`;
}

function sparklinePath(values: number[], width: number, height: number, pad = 8): string {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (width - pad * 2) / (values.length - 1);

  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function HrAnalyticsCharts({ org }: Props) {
  const monthlyMax = Math.max(...org.monthlyResponses.map((m) => m.responses), 1);
  const donutStyle = { background: donutGradient(org.surveyTypeMix) };

  const sparkW = 320;
  const sparkH = 120;
  const linePath = sparklinePath(org.completionSparkline, sparkW, sparkH);
  const last = org.completionSparkline[org.completionSparkline.length - 1] ?? 0;

  return (
    <section className="dash-hr-charts" aria-label="Analytics charts">
      <h2 className="dash-hr-charts-heading">Analytics charts</h2>
      <div className="dash-insights-grid dash-insights-grid--charts">
        <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
          <header className="card-head">
            <h3 className="card-title">Monthly responses</h3>
          </header>
          <p className="progress-sub">Submitted surveys by month</p>
          <div className="dash-chart-monthly" role="img" aria-label="Monthly response bar chart">
            {org.monthlyResponses.map((month) => (
              <div key={month.id} className="dash-chart-monthly-col">
                <div
                  className="dash-chart-monthly-bar"
                  style={{ ['--h' as string]: `${(month.responses / monthlyMax) * 100}%` }}
                />
                <span className="dash-chart-monthly-value">{month.responses}</span>
                <span className="dash-chart-monthly-label">{month.label}</span>
              </div>
            ))}
          </div>
          <p className="dash-chart-footnote">{org.chartInsights.monthly}</p>
        </article>

        <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
          <header className="card-head">
            <h3 className="card-title">Survey type mix</h3>
          </header>
          <div className="dash-chart-donut-wrap">
            <div className="dash-chart-donut" style={donutStyle} aria-hidden="true">
              <div className="dash-chart-donut-hole">
                <span className="dash-chart-donut-center">100%</span>
                <span className="dash-chart-donut-sub">assigned</span>
              </div>
            </div>
            <ul className="dash-chart-donut-legend">
              {org.surveyTypeMix.map((slice) => (
                <li key={slice.id}>
                  <span className={`dash-insights-legend-dot dash-insights-legend-dot--${slice.variant}`} />
                  {slice.label} · {slice.percent}%
                </li>
              ))}
            </ul>
          </div>
          <p className="dash-chart-footnote">{org.chartInsights.mix}</p>
        </article>

        <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
          <header className="card-head">
            <h3 className="card-title">eNPS breakdown</h3>
          </header>
          <p className="progress-sub">Latest culture pulse cohort</p>
          <div className="dash-chart-enps-bar" aria-hidden="true">
            {org.enpsBreakdown.map((seg) => (
              <span
                key={seg.id}
                className={`dash-chart-enps-seg dash-chart-enps-seg--${seg.variant}`}
                style={{ width: `${seg.percent}%` }}
              >
                {seg.percent}%
              </span>
            ))}
          </div>
          <ul className="dash-chart-enps-legend">
            {org.enpsBreakdown.map((seg) => (
              <li key={seg.id}>
                <span className={`dash-chart-enps-dot dash-chart-enps-dot--${seg.variant}`} />
                {seg.label}
              </li>
            ))}
          </ul>
          <p className="dash-chart-footnote">{org.chartInsights.enps}</p>
        </article>

        <div className="dash-insights-row dash-insights-row--triple">
          <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
            <header className="card-head">
              <h3 className="card-title">Submissions by weekday</h3>
            </header>
            <p className="progress-sub">When people complete surveys</p>
            <div className="progress-chart dash-chart-weekday" aria-hidden="true">
              {org.weekdaySubmissionVolume.map((day) => (
                <div key={day.label} className="progress-bar-wrap">
                  <span className="progress-dow">{day.label}</span>
                  <div
                    className="progress-bar progress-bar--yellow"
                    style={{ ['--h' as string]: `${day.heightPercent}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="dash-chart-footnote">{org.chartInsights.weekday}</p>
          </article>

          <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
            <header className="card-head">
              <h3 className="card-title">Time to respond</h3>
            </header>
            <p className="progress-sub">Days from invite to submission</p>
            <ul className="dash-chart-time-list" aria-label="Response time distribution">
              {org.responseTimeDistribution.map((bucket) => (
                <li key={bucket.id} className="dash-chart-time-row">
                  <span className="dash-chart-time-label">{bucket.label}</span>
                  <div className="dash-program-bar-track dash-chart-time-track">
                    <span
                      className="dash-program-bar-fill"
                      style={{ width: `${bucket.percent}%` }}
                    />
                  </div>
                  <span className="dash-program-bar-pct">{bucket.percent}%</span>
                </li>
              ))}
            </ul>
            <p className="dash-chart-footnote">{org.chartInsights.responseTime}</p>
          </article>

          <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
            <header className="card-head">
              <h3 className="card-title">Participation funnel</h3>
            </header>
            <p className="progress-sub">This quarter · all live programs</p>
            <ul className="dash-chart-funnel-list" aria-label="Participation funnel">
              {org.participationFunnel.map((stage, index) => (
                <li key={stage.id} className="dash-chart-funnel-row">
                  <div className="dash-chart-funnel-meta">
                    <span className="dash-chart-funnel-label">{stage.label}</span>
                    <span className="dash-chart-funnel-count">{stage.count}</span>
                  </div>
                  <div
                    className="dash-chart-funnel-bar"
                    style={{ width: `${Math.max(stage.percent, 12)}%` }}
                    aria-hidden="true"
                  >
                    <span className="dash-chart-funnel-pct">{stage.percent}%</span>
                  </div>
                  {index < org.participationFunnel.length - 1 && (
                    <span className="dash-chart-funnel-chevron" aria-hidden="true">
                      ↓
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="dash-chart-footnote">{org.chartInsights.funnel}</p>
          </article>
        </div>

        <div className="dash-insights-row dash-insights-row--charts-wide">
          <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
          <header className="card-head card-head--split">
            <h3 className="card-title">Department completion mix</h3>
            <span className="dash-chart-stacked-key">
              <span>Done</span>
              <span>In progress</span>
              <span>Not started</span>
            </span>
          </header>
          <ul className="dash-chart-stacked-list">
            {org.departmentStacked.map((dept) => {
              const total = dept.completed + dept.inProgress + dept.notStarted;
              const pct = (n: number) => (total ? (n / total) * 100 : 0);
              return (
                <li key={dept.id} className="dash-chart-stacked-row">
                  <span className="dash-chart-stacked-name">{dept.name}</span>
                  <div className="dash-chart-stacked-bar" aria-hidden="true">
                    <span
                      className="dash-chart-stacked-seg dash-chart-stacked-seg--done"
                      style={{ width: `${pct(dept.completed)}%` }}
                    />
                    <span
                      className="dash-chart-stacked-seg dash-chart-stacked-seg--progress"
                      style={{ width: `${pct(dept.inProgress)}%` }}
                    />
                    <span
                      className="dash-chart-stacked-seg dash-chart-stacked-seg--pending"
                      style={{ width: `${pct(dept.notStarted)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="dash-chart-footnote">{org.chartInsights.stacked}</p>
          </article>

          <article className="card glass dash-insights-card dash-chart-card dash-chart-card--fill">
          <header className="card-head card-head--split">
            <h3 className="card-title">Org completion rate trend</h3>
            <span className="onboard-pct">{last}% now</span>
          </header>
          <p className="progress-sub">Rolling 8-week completion %</p>
          <div className="dash-chart-sparkline-wrap">
            <svg
              className="dash-chart-sparkline"
              viewBox={`0 0 ${sparkW} ${sparkH}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 215, 71, 0.45)" />
                  <stop offset="100%" stopColor="rgba(255, 215, 71, 0)" />
                </linearGradient>
              </defs>
              <path
                className="dash-chart-sparkline-area"
                d={`${linePath} L ${sparkW - 8} ${sparkH - 8} L 8 ${sparkH - 8} Z`}
                fill="url(#sparkFill)"
              />
              <path className="dash-chart-sparkline-line" d={linePath} fill="none" />
            </svg>
            <div className="dash-chart-sparkline-labels">
              {org.completionSparkline.map((_, i) => (
                <span key={i}>W{i + 1}</span>
              ))}
            </div>
          </div>
          <p className="dash-chart-footnote">{org.chartInsights.sparkline}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
