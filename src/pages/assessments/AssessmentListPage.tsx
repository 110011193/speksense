import { useEffect, useState } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { AssessmentCard } from '../../components/AssessmentCard';
import { EmptyState, ErrorNote } from '../../components/EmptyState';
import { SkeletonCard } from '../../components/Skeleton';
import { listMyAssignments, type ParticipantAssignment } from '../../api/services/platform';
import type {
  Assignment,
  BehavioralScenario,
  Competency,
  Question,
} from '../../types/assessment';

type Survey360Competencies = [Competency, Competency, Competency, Competency];

// listMyAssignments() returns ParticipantAssignment, whose payload fields
// (questions/scenarios/competencies) are typed as unknown[] on the wire.
// Map each item back onto the strict Assignment discriminated union so the
// AssessmentCard (and its isSurvey360 guard) receive a fully-typed value.
function toAssignment(p: ParticipantAssignment): Assignment {
  const base = {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    dueLabel: p.dueLabel,
    estimatedMinutes: p.estimatedMinutes,
    startAt: p.startAt,
    endAt: p.endAt,
    status: p.status,
    instructions: p.instructions,
  };
  switch (p.kind) {
    case 'survey360':
      return {
        ...base,
        kind: 'survey360',
        competencies: (p.competencies ?? []) as unknown as Survey360Competencies,
      };
    case 'behavioral':
      return {
        ...base,
        kind: 'behavioral',
        scenarios: (p.scenarios ?? []) as BehavioralScenario[],
      };
    case 'standard':
    default:
      return {
        ...base,
        kind: 'standard',
        questions: (p.questions ?? []) as Question[],
      };
  }
}

export function AssessmentListPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'SpekSense — Assessments';
    let active = true;
    listMyAssignments()
      .then((items) => {
        if (active) setAssignments(items.map(toAssignment));
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Could not load your assessments.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="dashboard-page assessments-page">
      <AppHeader />
      <main className="dash-main assessments-main">
        <header className="assessments-hero">
          <h1 className="assessments-title">Your assessments</h1>
          <p className="assessments-sub">Complete assigned surveys and pulse checks.</p>
        </header>
        {loading ? (
          <div className="assessments-grid" aria-busy="true">
            <SkeletonCard count={3} lines={3} />
          </div>
        ) : error ? (
          <ErrorNote message={error} />
        ) : assignments.length === 0 ? (
          <article className="card glass">
            <EmptyState
              icon="✓"
              title="You're all caught up"
              message="No assessments are assigned to you right now. We'll let you know when something needs your attention."
            />
          </article>
        ) : (
          <div className="assessments-grid">
            {assignments.map((a) => (
              <AssessmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
