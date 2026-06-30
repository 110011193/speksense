import { Link } from 'react-router-dom';

/** Consistent empty / zero-data state: icon + title + message + optional CTA. */
export function EmptyState({
  icon = '✦',
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
}: {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <p className="empty-state-title">{title}</p>
      {message ? <p className="empty-state-msg">{message}</p> : null}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="dash-btn-pill dash-pill--yellow empty-state-cta">
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <button type="button" className="dash-btn-pill dash-pill--yellow empty-state-cta" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

/** Inline error note — red is reserved for genuine errors. */
export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="error-note" role="alert">
      {message}
    </p>
  );
}
