import './people.css';
import { setupNotifications } from './notifications.js';
import { setupAppNav } from './sharedAppNav.js';

document.addEventListener('DOMContentLoaded', () => {
  setupAppNav();
  setupRowHighlight();
  setupNotifications();
});

/** Toggle yellow row highlight when checkbox changes (Katy-style selection). */
function setupRowHighlight() {
  const table = document.querySelector('.people-table tbody');
  if (!table) return;

  table.addEventListener('change', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains('people-check')) {
      return;
    }
    const row = target.closest('tr');
    if (!row) return;
    row.classList.toggle('people-row--selected', target.checked);
  });
}
