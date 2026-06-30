import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import {
  listNotifications,
  markAllNotificationsRead,
  type NotificationItem,
} from '../api/services/platform';
import { ApiError } from '../api/types';

interface NotificationsPanelProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export function NotificationsPanel({ open, anchorRef, onClose }: NotificationsPanelProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listNotifications());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh notifications each time the panel opens.
  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not mark notifications read.');
    }
  }, [load]);

  // Position the panel under the bell (fixed); rendered in a body portal so it
  // never shifts the header. Re-positions on resize/scroll while open.
  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const rect = anchor.getBoundingClientRect();
      const gap = 10;
      panel.style.position = 'fixed';
      panel.style.top = `${rect.bottom + gap}px`;
      // clientWidth excludes a classic vertical scrollbar (innerWidth includes it), keeping the
      // panel's right edge aligned under the bell regardless of scrollbar/zoom.
      panel.style.right = `${Math.max(16, document.documentElement.clientWidth - rect.right)}px`;
      panel.style.left = 'auto';
      panel.style.bottom = 'auto';
      panel.style.zIndex = '10000';
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open, anchorRef]);

  // Outside-click + Escape to close — bound only while open, fully cleaned up.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      id="notif-panel"
      className="dash-notif-panel"
      role="region"
      aria-label="Notifications"
      aria-busy={loading}
    >
      <div className="dash-notif-panel-head">
        <h2 className="dash-notif-panel-title">Notifications</h2>
        <button
          type="button"
          className="dash-notif-mark"
          id="notif-mark-read"
          onClick={() => void markAllRead()}
        >
          Mark all read
        </button>
      </div>

      {error ? (
        <p className="flow-error" role="alert">
          {error}
        </p>
      ) : loading ? (
        <>
          <span className="sr-only" role="status">
            Loading notifications…
          </span>
          {/* Skeleton rows mirror the real item layout so the box opens at ~final height
              (no pop/grow when the fetch resolves a frame later). */}
          <ul className="dash-notif-list" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="dash-notif-item">
                <span className="dash-notif-item-dot" />
                <div className="dash-notif-item-body">
                  <span className="sk-shimmer notif-sk-line notif-sk-line--title" />
                  <span className="sk-shimmer notif-sk-line notif-sk-line--msg" />
                  <span className="sk-shimmer notif-sk-line notif-sk-line--time" />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : items.length === 0 ? (
        <p className="dash-notif-empty">You&rsquo;re all caught up.</p>
      ) : (
        <ul className="dash-notif-list">
          {items.map((item) => (
            <li
              key={item.id}
              className={
                item.read ? 'dash-notif-item' : 'dash-notif-item dash-notif-item--unread'
              }
            >
              <span className="dash-notif-item-dot" aria-hidden="true" />
              <div className="dash-notif-item-body">
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <time>{item.timeLabel}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body,
  );
}
