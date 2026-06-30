import { Link } from 'react-router-dom';
import { isSurvey360, type Assignment } from '../types/assessment';

type Props = {
  assignment: Assignment;
};

export function AssessmentCard({ assignment }: Props) {
  const isCompleted = assignment.status === 'completed';

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const now = Date.now();
  const start = assignment.startAt ? new Date(assignment.startAt).getTime() : null;
  const end = assignment.endAt ? new Date(assignment.endAt).getTime() : null;
  const upcoming = !isCompleted && start != null && now < start;
  const closed = !isCompleted && end != null && now > end;
  const blocked = upcoming || closed;

  const windowLabel = upcoming
    ? `Opens ${fmt(assignment.startAt!)}`
    : closed
      ? 'Closed'
      : !isCompleted && assignment.endAt
        ? `Closes ${fmt(assignment.endAt)}`
        : null;
  const windowKind = upcoming ? 'upcoming' : closed ? 'closed' : 'open';

  // Outside its window an assessment isn't takeable, so the card doesn't link.
  const href = isCompleted || blocked
    ? undefined
    : isSurvey360(assignment)
      ? `/assessments/${assignment.id}/peers`
      : `/assessments/${assignment.id}/instructions`;

  const card = (
    <article
      className={`assessment-card${isCompleted ? ' assessment-card--completed' : ''}`}
    >
      <div className="assessment-card-top">
        <span className={`assessment-status assessment-status--${assignment.status}`}>
          {assignment.status === 'completed'
            ? 'Completed'
            : assignment.status === 'in_progress'
              ? 'In progress'
              : 'Assigned'}
        </span>
        {windowLabel ? (
          <span className={`assessment-window assessment-window--${windowKind}`}>{windowLabel}</span>
        ) : (
          <span className="assessment-due">{assignment.dueLabel}</span>
        )}
      </div>
      <h2 className="assessment-card-title">{assignment.title}</h2>
      <p className="assessment-card-sub">{assignment.subtitle}</p>
      <p className="assessment-card-meta">~{assignment.estimatedMinutes} min</p>
      {isCompleted ? null : blocked ? (
        <span className="assessment-card-cta assessment-card-cta--muted">
          {upcoming ? `Opens ${fmt(assignment.startAt!)}` : 'No longer available'}
        </span>
      ) : (
        <span className="assessment-card-cta">Start assessment →</span>
      )}
    </article>
  );

  if (href) {
    return (
      <Link to={href} className="assessment-card-link">
        {card}
      </Link>
    );
  }

  return card;
}
