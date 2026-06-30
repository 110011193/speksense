import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { FlowHeader } from '../../components/FlowHeader';
import { getAssignment } from '../../data/assessments';
import { isSurvey360 } from '../../types/assessment';
import { loadSelectedPeers } from '../../utils/survey360Storage';

export function InstructionsPage() {
  const { id } = useParams<{ id: string }>();
  const assignment = id ? getAssignment(id) : undefined;

  useEffect(() => {
    if (assignment) document.title = `SpekSense — ${assignment.title}`;
  }, [assignment]);

  if (!assignment) return <Navigate to="/assessments" replace />;
  if (assignment.status === 'completed') {
    return <Navigate to="/assessments" replace />;
  }

  if (isSurvey360(assignment) && id) {
    const peers = loadSelectedPeers(id);
    if (!peers?.length) {
      return <Navigate to={`/assessments/${id}/peers`} replace />;
    }
  }

  const surveyPath = isSurvey360(assignment)
    ? `/assessments/${assignment.id}/survey360`
    : `/assessments/${assignment.id}/survey`;
  const backPath = isSurvey360(assignment)
    ? `/assessments/${assignment.id}/peers`
    : '/assessments';

  return (
    <div className="dashboard-page flow-page flow-page--centered">
      <FlowHeader />
      <main className="flow-main flow-main--center">
        <div className="flow-instructions-panel">
          <h1 className="flow-title">{assignment.title}</h1>
          <p className="flow-sub">{assignment.subtitle}</p>
          <p className="flow-meta">
            ~{assignment.estimatedMinutes} minutes · {assignment.dueLabel}
          </p>
          <h2 className="flow-section-label">Before you begin</h2>
          <ul className="flow-instructions">
            {assignment.instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="flow-actions">
            <Link to={backPath} className="dash-btn-pill dash-btn-pill--light">
              Back
            </Link>
            <Link
              to={surveyPath}
              className="dash-btn-pill dash-pill--yellow flow-cta-primary"
            >
              Begin
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
