import './tokens.css'; // design tokens (--brand-*, spacing, type). Without this the static page's
// dashboard.css aliases (e.g. --dash-charcoal: var(--brand-charcoal)) resolve to nothing — which made
// the active "Calendar" nav pill render white-on-white (invisible).
import './calendar.css';
import './polish.css'; // .empty-state / .error-note styles live here; calendar.html doesn't load it otherwise
import { setupNotifications } from './notifications.js';
import { setupAppNav } from './sharedAppNav.js';
import { getCalendarEvents } from './api/services/platform';
import { ApiError } from './api/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** ISO yyyy-mm-dd in local time (matches the backend's date-only strings). */
function iso(y, m /* 0-based */, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Build a 6-week (42-cell) Monday-first grid and render events into matching day cells. */
function renderMonth(grid, year, month, eventsByDate) {
  grid.setAttribute('aria-label', `${MONTHS[month]} ${year}`);
  grid.setAttribute('aria-busy', 'false');
  grid.replaceChildren();

  const today = new Date();
  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());

  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Mon=0 … Sun=6 leading blanks
  const start = new Date(year, month, 1 - lead);

  for (let i = 0; i < 42; i++) {
    const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const inMonth = dt.getMonth() === month;
    const dow = dt.getDay();
    const weekend = dow === 0 || dow === 6;
    const dayIso = iso(dt.getFullYear(), dt.getMonth(), dt.getDate());

    const cell = document.createElement('div');
    cell.className = 'cal-day';
    if (!inMonth) cell.classList.add('cal-day--other');
    if (weekend) cell.classList.add('cal-day--weekend');
    if (dayIso === todayIso) cell.classList.add('cal-day--today');
    cell.setAttribute('role', 'gridcell');

    const num = document.createElement('span');
    num.className = 'cal-day-num';
    num.textContent = String(dt.getDate());
    cell.appendChild(num);

    const dayEvents = inMonth ? (eventsByDate.get(dayIso) ?? []) : [];
    for (const ev of dayEvents) {
      const badge = document.createElement('span');
      badge.className = 'cal-day-event';
      const dot = document.createElement('span');
      dot.className = 'cal-event-dot cal-event-dot--yellow';
      badge.appendChild(dot);
      badge.appendChild(document.createTextNode(ev.title));
      if (ev.meta) badge.title = `${ev.title} · ${ev.meta}`;
      cell.appendChild(badge);
    }
    grid.appendChild(cell);
  }
}

function showEmpty(status) {
  status.innerHTML =
    '<div class="empty-state" role="status">' +
    '<div class="empty-state-icon" aria-hidden="true">✦</div>' +
    '<p class="empty-state-title">No upcoming deadlines</p>' +
    '<p class="empty-state-msg">Assessment due dates appear here once assignments are scheduled.</p>' +
    '</div>';
}

function showError(status, message) {
  status.innerHTML = '<p class="error-note" role="alert"></p>';
  const note = status.querySelector('.error-note');
  if (note) note.textContent = message;
}

async function setupCalendar() {
  const grid = document.getElementById('cal-grid');
  const status = document.getElementById('cal-status');
  const title = document.getElementById('cal-month-title');
  if (!grid || !status) return;

  const now = new Date();
  const state = { year: now.getFullYear(), month: now.getMonth() };
  let byDate = new Map();
  let totalEvents = 0;

  const update = () => {
    if (title) title.textContent = `${MONTHS[state.month]} ${state.year}`;
    renderMonth(grid, state.year, state.month, byDate);
    // The big empty state only shows when there are NO events in ANY month;
    // a month with no events just renders an empty grid (navigate to find them).
    if (totalEvents === 0) showEmpty(status);
    else status.replaceChildren();
  };

  const shift = (delta) => {
    const d = new Date(state.year, state.month + delta, 1);
    state.year = d.getFullYear();
    state.month = d.getMonth();
    update();
  };
  document.getElementById('cal-prev')?.addEventListener('click', () => shift(-1));
  document.getElementById('cal-next')?.addEventListener('click', () => shift(1));

  let events = [];
  try {
    events = await getCalendarEvents();
  } catch (e) {
    update(); // render an empty current month…
    showError(status, e instanceof ApiError ? e.message : 'Could not load calendar events.'); // …then surface the error
    return;
  }

  totalEvents = events.length;
  byDate = new Map();
  for (const ev of events) {
    if (!ev?.date) continue;
    const key = ev.date.slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(ev);
  }
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  setupAppNav();
  setupNotifications();
  void setupCalendar();
});
