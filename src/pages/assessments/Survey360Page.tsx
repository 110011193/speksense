import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EffectivenessScale } from '../../components/360/EffectivenessScale';
import { FlowHeader } from '../../components/FlowHeader';
import {
  getDraft,
  getMyAssignment,
  getPeers,
  saveDraft,
  submitRatings,
} from '../../api/services/platform';
import type { Competency } from '../../types/assessment';
import type { TeamMember } from '../../types/team';

type Survey360Draft = {
  competencyIndex: number;
  behaviorIndex: number;
  // behaviorId -> peerId -> rating
  ratings: Record<string, Record<string, number>>;
  // behaviorId -> peerId[]
  touched: Record<string, string[]>;
};

/** A peer without an uploaded photo still needs a valid <img src> in the drag/rating UI —
 *  render an initials avatar as an inline SVG data URL so nothing shows a broken image. */
function initialsAvatar(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const text = parts.length === 0 ? '?' : (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">` +
    `<rect width="64" height="64" rx="32" fill="#1a1a1a"/>` +
    `<text x="32" y="33" font-family="Inter,Arial,sans-serif" font-size="26" font-weight="600" ` +
    `fill="#fff" text-anchor="middle" dominant-baseline="central">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function Survey360Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [peers, setPeers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [competencyIndex, setCompetencyIndex] = useState(0);
  const [behaviorIndex, setBehaviorIndex] = useState(0);
  const [ratings, setRatings] = useState<Survey360Draft['ratings']>({});
  const [touched, setTouched] = useState<Survey360Draft['touched']>({});

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getMyAssignment(id),
      getPeers(id),
      getDraft<Survey360Draft>(id),
    ])
      .then(([assignment, peerList, draft]) => {
        if (!active) return;
        setTitle(assignment.title);
        setCompetencies((assignment.competencies as Competency[] | undefined) ?? []);
        setPeers(
          peerList.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.role,
            avatarUrl: p.avatarUrl || initialsAvatar(p.name),
          })),
        );
        if (draft) {
          setCompetencyIndex(draft.competencyIndex ?? 0);
          setBehaviorIndex(draft.behaviorIndex ?? 0);
          setRatings(draft.ratings ?? {});
          setTouched(draft.touched ?? {});
        }
        document.title = `SpekSense — ${assignment.title}`;
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Could not load this assessment.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const competency = competencies[competencyIndex];
  const behavior = competency?.behaviors[behaviorIndex];
  const behaviorId = behavior?.id ?? '';

  const behaviorRatings = behaviorId ? (ratings[behaviorId] ?? {}) : {};

  const behaviorTouched = useMemo(
    () => new Set(behaviorId ? (touched[behaviorId] ?? []) : []),
    [touched, behaviorId],
  );

  const mergedRatings = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of peers) {
      m[p.id] = behaviorRatings[p.id] ?? 0;
    }
    return m;
  }, [peers, behaviorRatings]);

  const allRated = peers.length > 0 && peers.every((p) => behaviorTouched.has(p.id));

  // Persist the draft via the platform service whenever progress changes.
  useEffect(() => {
    if (!id || loading || error) return;
    void saveDraft(id, { competencyIndex, behaviorIndex, ratings, touched });
  }, [id, loading, error, competencyIndex, behaviorIndex, ratings, touched]);

  function setRating(peerId: string, value: number) {
    if (!behaviorId) return;
    setRatings((prev) => ({
      ...prev,
      [behaviorId]: {
        ...(prev[behaviorId] ?? {}),
        [peerId]: value,
      },
    }));
  }

  function markTouched(peerId: string) {
    if (!behaviorId) return;
    setTouched((prev) => {
      const list = prev[behaviorId] ?? [];
      if (list.includes(peerId)) return prev;
      return { ...prev, [behaviorId]: [...list, peerId] };
    });
  }

  function invertRatings(): Record<string, Record<string, number>> {
    // ratings: behaviorId -> peerId -> value  ⇒  peerId -> behaviorId -> value
    const inverted: Record<string, Record<string, number>> = {};
    for (const [bId, perPeer] of Object.entries(ratings)) {
      for (const [peerId, value] of Object.entries(perPeer)) {
        (inverted[peerId] ??= {})[bId] = value;
      }
    }
    return inverted;
  }

  async function goNext() {
    if (!allRated || !id) return;
    if (behaviorIndex < 1) {
      setBehaviorIndex(1);
      return;
    }
    if (competencyIndex < 3) {
      setCompetencyIndex((c) => c + 1);
      setBehaviorIndex(0);
      return;
    }
    // Final step — submit inverted ratings to the server.
    try {
      setError(null);
      await submitRatings(id, invertRatings());
      navigate(`/assessments/${id}/complete`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your ratings.');
    }
  }

  function goBack() {
    if (behaviorIndex > 0) {
      setBehaviorIndex(0);
      return;
    }
    if (competencyIndex > 0) {
      setCompetencyIndex((c) => c - 1);
      setBehaviorIndex(1);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page flow-page flow-page--centered">
        <FlowHeader showBack={false} />
        <main className="flow-main flow-main--wide flow-main--center">
          <div className="survey360-panel">
            <p className="flow-meta">Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !competency || !behavior) {
    return (
      <div className="dashboard-page flow-page flow-page--centered">
        <FlowHeader showBack={false} />
        <main className="flow-main flow-main--wide flow-main--center">
          <div className="survey360-panel">
            <h1 className="flow-title">{title}</h1>
            <p className="flow-error" role="alert">
              {error ?? 'This assessment is unavailable.'}
            </p>
            <div className="flow-actions">
              <Link to="/assessments" className="dash-btn-pill dash-btn-pill--light">
                Back to assessments
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const flatStep = competencyIndex * 2 + behaviorIndex + 1;
  const totalSteps = 8;
  const canGoBack = competencyIndex > 0 || behaviorIndex > 0;
  const isLastStep = competencyIndex === 3 && behaviorIndex === 1;

  return (
    <div className="dashboard-page flow-page flow-page--centered">
      <FlowHeader
        showBack={false}
        onSaveProgress={() => {
          if (!id) return;
          void saveDraft(id, { competencyIndex, behaviorIndex, ratings, touched });
        }}
      />
      <main className="flow-main flow-main--wide flow-main--center">
        <div className="survey360-panel">
          <div className="survey360-scale-block">
            <p className="survey360-competency">{competency.title}</p>
            <h1 className="flow-question">{behavior.statement}</h1>

            <EffectivenessScale
            peers={peers}
            ratings={mergedRatings}
            touchedPeerIds={behaviorTouched}
            onRate={setRating}
            onTouched={markTouched}
            />
          </div>

          {!allRated ? (
            <p className="flow-hint">
              Drag each peer along Effectiveness to continue (they start at 0.0).
            </p>
          ) : null}

          {error ? (
            <p className="flow-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flow-actions survey360-panel-actions">
            {canGoBack ? (
              <button type="button" className="dash-btn-pill dash-btn-pill--light" onClick={goBack}>
                Back
              </button>
            ) : (
              <Link
                to={`/assessments/${id}/peers`}
                className="dash-btn-pill dash-btn-pill--light"
              >
                Back
              </Link>
            )}
            <button
              type="button"
              className="dash-btn-pill dash-pill--yellow flow-cta-primary"
              disabled={!allRated}
              onClick={goNext}
            >
              {isLastStep ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </main>
      <p className="survey360-step-indicator" aria-live="polite">
        Competency {competencyIndex + 1} of 4 · Behavior {behaviorIndex + 1} of 2 · Step{' '}
        {flatStep} of {totalSteps}
      </p>
    </div>
  );
}
