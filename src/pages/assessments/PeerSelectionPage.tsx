import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FlowHeader } from '../../components/FlowHeader';
import { getMyAssignment, getPeers, type PeerItem } from '../../api/services/platform';

function peerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function PeerSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [peers, setPeers] = useState<PeerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowState, setWindowState] = useState<
    { availability?: string; startAt?: string | null; endAt?: string | null } | null
  >(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([getMyAssignment(id), getPeers(id)])
      .then(([assignment, peerList]) => {
        if (!active) return;
        setTitle(assignment.title);
        setPeers(peerList);
        setWindowState({
          availability: assignment.availability,
          startAt: assignment.startAt,
          endAt: assignment.endAt,
        });
        document.title = `SpekSense — ${assignment.title}`;
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Could not load your raters.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function onContinue() {
    if (!id) return;
    navigate(`/assessments/${id}/survey360`);
  }

  // The server gates 360s on having a profile picture; turn that error into an actionable CTA.
  const needsPhoto = !loading && !!error && /profile picture/i.test(error);

  // Missing profile picture: a 360 prerequisite — send them to their profile to upload one.
  if (needsPhoto) {
    return (
      <div className="dashboard-page flow-page flow-page--centered">
        <FlowHeader />
        <main className="flow-main flow-main--center">
          <div className="flow-instructions-panel">
            <h1 className="flow-title">{title || 'Your 360 review'}</h1>
            <p className="flow-sub">Add a profile picture to begin</p>
            <p className="flow-meta">
              A profile picture is required for 360 reviews — your colleagues see your photo when they rate
              you, so please add one before you start.
            </p>
            <div className="flow-actions">
              <Link to="/profile" className="dash-btn-pill dash-pill--yellow flow-cta-primary">
                Go to your profile
              </Link>
              <Link to="/assessments" className="dash-btn-pill dash-btn-pill--light">
                Back to assessments
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Outside the active window: show a friendly gate (the server also blocks ratings).
  if (!loading && windowState?.availability && windowState.availability !== 'open') {
    const upcoming = windowState.availability === 'upcoming';
    const when = upcoming ? windowState.startAt : windowState.endAt;
    const whenLabel = when
      ? new Date(when).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
      : null;
    return (
      <div className="dashboard-page flow-page flow-page--centered">
        <FlowHeader />
        <main className="flow-main flow-main--center">
          <div className="flow-instructions-panel">
            <h1 className="flow-title">{title}</h1>
            <p className="flow-sub">
              {upcoming
                ? whenLabel
                  ? `This assessment opens on ${whenLabel}. Please come back then.`
                  : 'This assessment is not open yet.'
                : whenLabel
                  ? `This assessment closed on ${whenLabel} and can no longer be completed.`
                  : 'This assessment is closed.'}
            </p>
            <div className="flow-actions">
              <Link to="/assessments" className="dash-btn-pill dash-pill--yellow flow-cta-primary">
                Back to assessments
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page flow-page flow-page--centered">
      <FlowHeader />
      <main className="flow-main flow-main--wide flow-main--center">
        <div className="peer-selection-panel">
          <h1 className="flow-title">{title}</h1>
          <p className="flow-sub">You'll be rating these colleagues</p>
          <p className="flow-meta">
            These are the colleagues assigned for you to rate.
          </p>

          {loading ? (
            <p className="flow-meta">Loading…</p>
          ) : error ? (
            <p className="flow-error" role="alert">
              {error}
            </p>
          ) : peers.length === 0 ? (
            <p className="flow-meta">No one is assigned for you to rate yet.</p>
          ) : (
            <div className="peer-grid" role="list">
              {peers.map((peer) => (
                <div key={peer.id} role="listitem" className="peer-card">
                  {peer.avatarUrl ? (
                    <img
                      src={peer.avatarUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="peer-card-avatar"
                    />
                  ) : (
                    <div className="peer-card-avatar peer-card-avatar--initials" aria-hidden="true">
                      {peerInitials(peer.name)}
                    </div>
                  )}
                  <span className="peer-card-name">{peer.name}</span>
                  <span className="peer-card-role">{peer.role}</span>
                  {peer.rated ? <span className="peer-card-badge">Rated</span> : null}
                </div>
              ))}
            </div>
          )}

          <div className="flow-actions">
            <Link to="/assessments" className="dash-btn-pill dash-btn-pill--light">
              Back
            </Link>
            <button
              type="button"
              className="dash-btn-pill dash-pill--yellow flow-cta-primary"
              disabled={loading || !!error || peers.length === 0}
              onClick={onContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
