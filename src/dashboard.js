import './dashboard.css';
import { setupNotifications } from './notifications.js';

document.addEventListener('DOMContentLoaded', () => {
  setupGreeting();
  setupNotifications();
});

function setupGreeting() {
  const el = document.getElementById('dash-greeting-name');
  if (!el) return;

  const stored = sessionStorage.getItem('speksense_display_name');
  el.textContent = stored && stored.trim() ? stored.trim() : 'there';
}
