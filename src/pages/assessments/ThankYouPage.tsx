import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FlowHeader } from '../../components/FlowHeader';
import { getMyAssignment } from '../../api/services/platform';

export function ThankYouPage() {
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    document.title = 'SpekSense — Thank you';
    getMyAssignment(id)
      .then((assignment) => {
        if (!active) return;
        setTitle(assignment.title);
      })
      .catch(() => {
        // Completion is recorded server-side; the title is best-effort only.
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="dashboard-page flow-page flow-page--centered">
      <FlowHeader showBack={false} />
      <main className="flow-main flow-main--center">
        <article className="flow-instructions-panel thankyou-panel">
          <h1 className="flow-title">Thank you</h1>
          <p className="flow-sub">
            Your responses for <strong>{title}</strong> have been recorded.
          </p>
          <div className="flow-actions flow-actions--center thankyou-actions">
            <Link to="/assessments" className="dash-btn-pill dash-btn-pill--light thankyou-cta-single">
              Back to assessments
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
