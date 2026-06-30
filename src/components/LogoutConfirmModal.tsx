import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ open, onClose, onConfirm }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="dash-logout-modal" role="presentation">
      <button
        type="button"
        className="dash-logout-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="dash-logout-modal-panel card glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
      >
        <h2 id="logout-confirm-title" className="dash-logout-modal-title">
          Log out?
        </h2>
        <p className="dash-logout-modal-text">Are you sure you want to logout?</p>
        <div className="dash-logout-modal-actions">
          <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="dash-btn-pill dash-pill--yellow" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
