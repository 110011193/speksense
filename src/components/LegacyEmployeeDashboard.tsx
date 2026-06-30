type Props = {
  displayName: string;
};

export function LegacyEmployeeDashboard({ displayName }: Props) {
  return (
    <>
      <section className="dash-hero" aria-label="Overview">
        <div className="dash-hero-left">
          <h1 className="dash-greeting">
            Welcome in, <span>{displayName}</span>
          </h1>
          <div className="dash-stat-pills">
            <div className="dash-pill dash-pill--dark">
              <span className="dash-pill-label">Interviews</span>
              <span className="dash-pill-value">15%</span>
            </div>
            <div className="dash-pill dash-pill--yellow">
              <span className="dash-pill-label">Hired</span>
              <span className="dash-pill-value">15%</span>
            </div>
            <div className="dash-pill dash-pill--hatched">
              <span className="dash-pill-label">Project time</span>
              <span className="dash-pill-value">60%</span>
            </div>
            <div className="dash-pill dash-pill--outline">
              <span className="dash-pill-label">Output</span>
              <span className="dash-pill-value">10%</span>
            </div>
          </div>
        </div>
        <div className="dash-hero-stats">
          <div className="dash-metric">
            <span className="dash-metric-value">78</span>
            <span className="dash-metric-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Employe
            </span>
          </div>
          <div className="dash-metric">
            <span className="dash-metric-value">56</span>
            <span className="dash-metric-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Hirings
            </span>
          </div>
          <div className="dash-metric">
            <span className="dash-metric-value">203</span>
            <span className="dash-metric-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Projects
            </span>
          </div>
        </div>
      </section>

      <div className="dash-grid">
        <article className="card card--profile">
          <img className="card--profile-img" src="/images/dashboard-profile.jpg" alt="" width={272} height={320} />
          <div className="card--profile-overlay">
            <p className="card--profile-name">Lora Piterson</p>
            <p className="card--profile-role">UX Designer</p>
          </div>
          <span className="card--profile-salary">$1,200</span>
        </article>

        <article className="card card--details">
          <details className="dash-acc">
            <summary className="dash-acc-summary">
              Pension contributions
              <svg className="dash-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
          </details>
          <details className="dash-acc" open>
            <summary className="dash-acc-summary">
              Devices
              <svg className="dash-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="dash-device-row">
              <img src="/images/macbook-air.jpg" alt="" width={48} height={36} className="dash-device-img" />
              <div className="dash-device-text">
                <strong>MacBook Air</strong>
                <span>Version M1</span>
              </div>
              <button type="button" className="dash-kebab" aria-label="More options">
                ⋯
              </button>
            </div>
          </details>
          <details className="dash-acc">
            <summary className="dash-acc-summary">
              Compensation Summary
              <svg className="dash-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
          </details>
          <details className="dash-acc">
            <summary className="dash-acc-summary">
              Employee Benefits
              <svg className="dash-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
          </details>
        </article>

        <article className="card card--progress glass">
          <header className="card-head">
            <h2 className="card-title">Progress</h2>
            <svg className="card-ext" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </header>
          <p className="progress-hours">6.1 h</p>
          <p className="progress-sub">Work Time this week</p>
          <div className="progress-chart" aria-hidden="true">
            <div className="progress-bar-wrap">
              <span className="progress-dow">S</span>
              <div className="progress-bar" style={{ ['--h' as string]: '35%' }} />
            </div>
            <div className="progress-bar-wrap">
              <span className="progress-dow">M</span>
              <div className="progress-bar" style={{ ['--h' as string]: '55%' }} />
            </div>
            <div className="progress-bar-wrap">
              <span className="progress-dow">T</span>
              <div className="progress-bar" style={{ ['--h' as string]: '45%' }} />
            </div>
            <div className="progress-bar-wrap">
              <span className="progress-dow">W</span>
              <div className="progress-bar" style={{ ['--h' as string]: '70%' }} />
            </div>
            <div className="progress-bar-wrap">
              <span className="progress-dow">T</span>
              <div className="progress-bar" style={{ ['--h' as string]: '50%' }} />
            </div>
            <div className="progress-bar-wrap progress-bar-wrap--active">
              <span className="progress-dow">F</span>
              <div className="progress-bar progress-bar--yellow" style={{ ['--h' as string]: '85%' }} />
              <span className="progress-tooltip">5h 23m</span>
            </div>
            <div className="progress-bar-wrap">
              <span className="progress-dow">S</span>
              <div className="progress-bar" style={{ ['--h' as string]: '30%' }} />
            </div>
          </div>
        </article>

        <article className="card card--tracker glass">
          <header className="card-head">
            <h2 className="card-title">Time tracker</h2>
            <svg className="card-ext" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </header>
          <div className="tracker-ring-wrap">
            <div className="tracker-ring" aria-hidden="true" />
            <div className="tracker-center">
              <span className="tracker-time">02:35</span>
              <span className="tracker-label">Work Time</span>
            </div>
          </div>
          <div className="tracker-controls">
            <button type="button" className="tracker-btn" aria-label="Play">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button type="button" className="tracker-btn" aria-label="Pause">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            </button>
            <button type="button" className="tracker-clock" aria-label="Clock">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </button>
          </div>
        </article>

        <article className="card card--onboard glass">
          <header className="card-head card-head--split">
            <h2 className="card-title">Onboarding</h2>
            <span className="onboard-pct">18%</span>
          </header>
          <div className="onboard-bar" aria-hidden="true">
            <span className="onboard-seg onboard-seg--yellow" style={{ width: '30%' }}>
              Task
            </span>
            <span className="onboard-seg onboard-seg--dark" style={{ width: '25%' }} />
            <span className="onboard-seg onboard-seg--light" style={{ width: '45%' }} />
          </div>
        </article>

        <article className="card card--calendar glass">
          <header className="cal-header">
            <span className="cal-month-muted">August</span>
            <h2 className="cal-month-active">September 2024</h2>
            <span className="cal-month-muted">October</span>
          </header>
          <div className="cal-days">
            <div className="cal-day">
              <span className="cal-dow">Mon</span>
              <span className="cal-num">22</span>
            </div>
            <div className="cal-day">
              <span className="cal-dow">Tue</span>
              <span className="cal-num">23</span>
            </div>
            <div className="cal-day cal-day--active">
              <span className="cal-dow">Wed</span>
              <span className="cal-num">24</span>
            </div>
            <div className="cal-day">
              <span className="cal-dow">Thu</span>
              <span className="cal-num">25</span>
            </div>
            <div className="cal-day">
              <span className="cal-dow">Fri</span>
              <span className="cal-num">26</span>
            </div>
            <div className="cal-day">
              <span className="cal-dow">Sat</span>
              <span className="cal-num">27</span>
            </div>
          </div>
          <div className="cal-body">
            <div className="cal-times">
              <span>8:00 am</span>
              <span>9:00 am</span>
              <span>10:00 am</span>
              <span>11:00 am</span>
            </div>
            <div className="cal-grid">
              <div className="cal-event cal-event--dark" style={{ ['--row' as string]: 2, ['--span' as string]: 2, ['--col' as string]: 3 }}>
                <span className="cal-event-title">Weekly Team Sync</span>
                <div className="cal-event-avatars">
                  <img src="/images/avatar1.png" alt="" width={22} height={22} />
                  <img src="/images/avatar2.png" alt="" width={22} height={22} />
                  <img src="/images/avatar3.png" alt="" width={22} height={22} />
                </div>
              </div>
              <div className="cal-event cal-event--light" style={{ ['--row' as string]: 3, ['--span' as string]: 2, ['--col' as string]: 4 }}>
                <span className="cal-event-title">Onboarding Session</span>
                <div className="cal-event-avatars">
                  <img src="/images/avatar2.png" alt="" width={22} height={22} />
                  <img src="/images/avatar4.png" alt="" width={22} height={22} />
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="card card--tasks">
          <header className="tasks-head">
            <h2 className="tasks-title">Onboarding Task</h2>
            <span className="tasks-count">2/8</span>
          </header>
          <ul className="tasks-list">
            <li className="tasks-item tasks-item--done">
              <span className="tasks-icon tasks-icon--done" aria-hidden="true" />
              <div className="tasks-text">
                <strong>Interview</strong>
                <span>Sep 20, 9:00 am</span>
              </div>
              <span className="tasks-check tasks-check--on" aria-hidden="true" />
            </li>
            <li className="tasks-item tasks-item--done">
              <span className="tasks-icon tasks-icon--done" aria-hidden="true" />
              <div className="tasks-text">
                <strong>Team Meeting</strong>
                <span>Sep 21, 10:00 am</span>
              </div>
              <span className="tasks-check tasks-check--on" aria-hidden="true" />
            </li>
            <li className="tasks-item">
              <span className="tasks-icon" aria-hidden="true" />
              <div className="tasks-text">
                <strong>Project Update</strong>
                <span>Sep 22, 2:00 pm</span>
              </div>
              <span className="tasks-check" aria-hidden="true" />
            </li>
            <li className="tasks-item">
              <span className="tasks-icon" aria-hidden="true" />
              <div className="tasks-text">
                <strong>Discuss Q3 Goals</strong>
                <span>Sep 24, 11:00 am</span>
              </div>
              <span className="tasks-check" aria-hidden="true" />
            </li>
            <li className="tasks-item">
              <span className="tasks-icon" aria-hidden="true" />
              <div className="tasks-text">
                <strong>HR Policy Review</strong>
                <span>Sep 25, 3:00 pm</span>
              </div>
              <span className="tasks-check" aria-hidden="true" />
            </li>
          </ul>
        </article>
      </div>
    </>
  );
}
