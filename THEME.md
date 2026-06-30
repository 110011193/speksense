# SpekSense frontend theme

Reference for designers and developers. Cursor agents should also use `.cursor/rules/speksense-frontend-theme.mdc`.

## Stack

- **Vite** multi-page build with **clean URLs** in dev/preview (`/dashboard`, `/people`, …) via `vite.cleanUrls.ts`. Built HTML files remain in `dist/`; static hosts use `public/_redirects`.
- **Dashboard host:** React + TypeScript (`src/main.tsx`, **BrowserRouter**). People and Calendar stay vanilla HTML at `/people` and `/calendar`.
- App routes: `/dashboard` (HR admin only), `/profile`, `/settings`, `/configure` (HR admin — assessment builder), `/assessments`, `/reports` (participants), `/assessments/:id/…`. **360 Feedback** uses `/assessments/360-feedback/peers` → instructions → survey360.

## Visual direction

Crextio-inspired HR UI: soft **cream → warm yellow** gradient background, **high border-radius** (pills and cards), light **glassmorphism** on widgets, **charcoal** (`#1a1a1a`) and **yellow** (`#ffd747`) accents.

## Typography

| Use | Font | Weight |
|-----|------|--------|
| Page titles (“People”, “Welcome in…”) | Inter | 300 |
| UI body, table, nav | Inter | 400–500 |
| Emphasis, names | Inter | 600–700 |

Load from Google Fonts: `Inter:wght@300;400;500;600;700`.

## Color palette

### Canvas (auth + app)

| Token | Hex | Role |
|-------|-----|------|
| `--canvas-cool` | `#e5e7eb` | Top-left cool grey |
| `--canvas-warm` | `#fef3c7` | Bottom-right warmth |
| `--canvas-peach` | `#fde68a` | Peach accent in mesh |
| `--canvas-base` | `#f3f4f6` | `body` fallback |

Background = **two fixed layers**: blurred mesh (`blur(56px)`) + sharper gradient overlay (see `src/style.css` `.page::before` / `.auth-card::before` and `src/dashboard.css` `.dashboard-page::before` / `::after`).

### UI

| Token | Hex | Role |
|-------|-----|------|
| `--dash-yellow` / `--yellow` | `#ffd747` / `#ffd666` | Primary accent, active bars, selections |
| `--dash-charcoal` | `#1a1a1a` | Active nav, dark widgets, chart bars |
| `--dash-ink` / `--ink` | `#2b2b2b` | Primary text |
| `--dash-muted` | `#8a8a8a` | Secondary text |

## App header

```
[SpekSense logo]                    [ Nav pill: role-specific links ] [Setting] [🔔] [👤]

HR: Dashboard, People, Assessments, Calendar, Configure. Participants: Assessments, Reports, Calendar.
```

- Nav links live inside **one white rounded pill** (not a full-width header bar).
- **Active** tab: charcoal pill, white text.
- **Setting** (gear): links to `/settings` (account, notifications, privacy, sign out). **Configure** (nav, HR only): `/configure` — create/publish assessments and assign participants (mock API in `src/api/`).
- **Notifications**: bell opens a **fixed** panel (`z-index: 10000`), portaled to `document.body`, aligned under the bell via `src/notifications.js`.
- Header `z-index: 500` so content cards do not intercept clicks.

## Key components

- **Stat pills** — On `/profile`: legacy Interviews, Hired, Project time, Output. Admin `/dashboard` uses HR summary KPI cards (participants, completion rate, active assessments, pending responses).
- **White / glass cards** — `backdrop-filter`, ~28–40px radius, soft shadow.
- **People table** — dotted row borders; selected row full yellow highlight.
- **Calendar grid** — Mon–Sun; Sat/Sun label color accent; multi-day events as white rounded bars.

## File map

```
src/style.css          Auth (login/signup)
src/dashboard.css      App shell + profile widgets (.dash-grid) + header
src/dashboard-insights.css  Survey analytics dashboard (#/dashboard)
src/people.css         People directory page
src/calendar.css       Calendar page
src/main.js            Auth forms + login redirect → /dashboard
src/main.tsx           React entry (dashboard host)
src/App.tsx            BrowserRouter routes
src/pages/             DashboardPage, ProfilePage, assessments/*, configure/*
src/pages/configure/   HR assessment wizard + assign flow
src/api/               API-shaped client + mock localStorage (`speksense_org_*` keys)
src/configure.css      Configure / wizard / assign UI
src/components/        AppHeader, LegacyEmployeeDashboard, YourSurveysSection, …
src/data/assessments.ts Facade over org catalog + per-user assignments
src/data/seedAssignments.ts  Initial published assessments seeded into org store
src/data/hrAdminDashboard.ts   Mock HR admin home content (admin dashboard top)
src/data/orgSurveyAnalytics.ts  Mock org-wide survey metrics (admin analytics charts)
src/data/assessmentReports.ts  Participant PDF report rows from completed assessments
src/utils/sessionUser.ts   Display name, email, isAdmin from sessionStorage
src/utils/assignmentProgress.ts  `speksense_completed_assignments` — completion + report unlock
src/utils/userSettings.ts        `speksense_user_settings` — notification/privacy prefs
src/settings.css                 Settings page layout
src/data/team.ts           Peers for 360 selection
src/survey-360.css         360 peer grid + Effectiveness scale
src/sharedAppNav.js    Role-aware nav on People / Calendar (matches React AppHeader)
src/people.js          Table row selection + setupAppNav
src/calendar.js        Calendar entry + setupAppNav
src/notifications.js   Shared notification dropdown
```

## Do / don’t

- **Do** reuse CSS variables and existing BEM-style classes (`dash-*`, `people-*`, `cal-*`).
- **Do** keep auth and dashboard styles in separate stylesheets.
- **Don’t** add a opaque white bar behind the whole header nav (only the **nav link pill** is white).
- **Don’t** place the notification panel in the header DOM tree long-term — use body portal + fixed positioning.

## Build

```bash
npm run dev    # http://localhost:5173
npm run build  # dist/*.html + hashed assets
```
