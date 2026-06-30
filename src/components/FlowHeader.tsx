import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAdminUser } from '../utils/sessionUser';
import { BrandLogo } from './BrandLogo';

type Props = {
  backLabel?: string;
  progress?: React.ReactNode;
  onSaveProgress?: () => void;
  showBack?: boolean;
};

export function FlowHeader({
  backLabel = 'Back to assessments',
  progress,
  onSaveProgress,
  showBack = true,
}: Props) {
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSave() {
    onSaveProgress?.();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  const saveControl = onSaveProgress ? (
    <div className="flow-header-save">
      {savedFlash ? (
        <span className="flow-save-status" role="status">
          Saved
        </span>
      ) : null}
      <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={handleSave}>
        Save progress
      </button>
    </div>
  ) : null;

  const saveInTopRow = !showBack && onSaveProgress;
  const homePath = isAdminUser() ? '/dashboard' : '/assessments';

  return (
    <header className="flow-header">
      <div className="flow-header-top">
        <BrandLogo to={homePath} />
        {showBack ? (
          <Link to="/assessments" className="flow-back">
            {backLabel}
          </Link>
        ) : null}
        {saveInTopRow ? saveControl : null}
      </div>
      {progress || (onSaveProgress && !saveInTopRow) ? (
        <div className="flow-header-sub">
          {progress ? <div className="flow-header-progress">{progress}</div> : null}
          {!saveInTopRow ? saveControl : null}
        </div>
      ) : null}
    </header>
  );
}
