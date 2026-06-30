/**
 * Notifications dropdown anchored to the bell button.
 */
export function setupNotifications() {
  const toggle = document.getElementById('notif-toggle');
  const panel = document.getElementById('notif-panel');
  if (!toggle || !panel) return;

  // Keep panel out of header layout so first open doesn't shift the page
  if (panel.parentElement !== document.body) {
    document.body.appendChild(panel);
  }

  const positionPanel = () => {
    const rect = toggle.getBoundingClientRect();
    const gap = 10;
    panel.style.position = 'fixed';
    panel.style.top = `${rect.bottom + gap}px`;
    // clientWidth excludes a classic vertical scrollbar (innerWidth includes it), keeping the
    // panel's right edge aligned under the bell regardless of scrollbar/zoom.
    panel.style.right = `${Math.max(16, document.documentElement.clientWidth - rect.right)}px`;
    panel.style.left = 'auto';
    panel.style.bottom = 'auto';
    panel.style.width = '';
    panel.style.transform = 'none';
    panel.style.zIndex = '10000';
  };

  const close = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    // Position synchronously BEFORE the browser paints: positionPanel() reads the already-laid-out
    // bell's rect, so the panel is painted under the bell in frame 0 — no corner flash, no
    // visibility/rAF gate (the old double-rAF reveal left the panel invisibly stuck in a
    // backgrounded tab, where rAF is paused).
    panel.hidden = false;
    positionPanel();
    toggle.setAttribute('aria-expanded', 'true');
    // One late correction for layout that settles after first paint (web-font swap, scrollbar).
    // This never gates visibility — the panel is already visible and correctly placed.
    requestAnimationFrame(positionPanel);
  };

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (panel.hidden) {
      open();
    } else {
      close();
    }
  });

  panel.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('click', (e) => {
    if (panel.hidden) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (toggle.contains(target) || panel.contains(target)) return;
    close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) close();
  });

  window.addEventListener('resize', () => {
    if (!panel.hidden) positionPanel();
  });

  window.addEventListener(
    'scroll',
    () => {
      if (!panel.hidden) positionPanel();
    },
    true
  );

  const markRead = document.getElementById('notif-mark-read');
  if (markRead) {
    markRead.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.querySelectorAll('.dash-notif-item--unread').forEach((item) => {
        item.classList.remove('dash-notif-item--unread');
      });
      const dot = toggle.querySelector('.dash-notif-dot');
      if (dot) dot.style.display = 'none';
    });
  }
}
