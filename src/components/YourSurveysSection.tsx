import { Link } from 'react-router-dom';
import { AssessmentCard } from './AssessmentCard';
import type { Assignment } from '../types/assessment';

type Props = {
  assignments: Assignment[];
  title?: string;
  subtitle?: string;
};

export function YourSurveysSection({
  assignments,
  title = 'Your surveys',
  subtitle = 'Assigned pulse checks and assessments waiting for your input.',
}: Props) {
  return (
    <section className="dash-your-surveys" aria-labelledby="your-surveys-heading">
      <header className="dash-your-surveys-head">
        <div>
          <h2 id="your-surveys-heading" className="dash-your-surveys-title">
            {title}
          </h2>
          <p className="dash-your-surveys-sub">{subtitle}</p>
        </div>
        <Link to="/assessments" className="dash-btn-pill dash-btn-pill--light dash-your-surveys-all">
          View all
        </Link>
      </header>
      <div className="assessments-grid dash-your-surveys-grid">
        {assignments.map((a) => (
          <AssessmentCard key={a.id} assignment={a} />
        ))}
      </div>
    </section>
  );
}

export function countAssignmentsByStatus(assignments: Assignment[]) {
  return {
    assigned: assignments.filter((a) => a.status === 'assigned').length,
    inProgress: assignments.filter((a) => a.status === 'in_progress').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
  };
}
