import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { createAssessmentDraft } from '../../api/services/assessmentCatalog';
import { getUserEmail, isAdminUser } from '../../utils/sessionUser';

export function ConfigureNewPage() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  // Guard against React StrictMode's double-invoke (and any re-render) creating duplicate
  // orphan drafts — create exactly one draft per visit.
  const createdRef = useRef(false);

  useEffect(() => {
    document.title = 'SpekSense — New assessment';
    if (createdRef.current) return;
    createdRef.current = true;
    createAssessmentDraft({ kind: 'standard', createdByEmail: getUserEmail() })
      .then((draft) => navigate(`/configure/${draft.id}`, { replace: true }))
      .catch(() => {
        createdRef.current = false;
        setFailed(true);
      });
  }, [navigate]);

  if (!isAdminUser()) return <Navigate to="/assessments" replace />;
  if (failed) return <Navigate to="/configure" replace />;

  return (
    <div className="dashboard-page configure-page">
      <p className="configure-muted configure-center">Creating draft…</p>
    </div>
  );
}
