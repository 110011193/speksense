import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TeamMember } from '../../types/team';
import { getEffectivenessBand } from '../../data/effectivenessRatings';
import {
  getOverlapGroups,
  groupForPeer,
  positionsFromRatings,
} from './overlap';

const MIN = 0;
const MAX = 5;
const DRAG_THRESHOLD_PX = 6;
const TRACK_DROP_PAD_Y = 56;

function snapValue(raw: number): number {
  const clamped = Math.min(MAX, Math.max(MIN, raw));
  return Math.round(clamped * 10) / 10;
}

function valueFromClientX(clientX: number, rect: DOMRect): number {
  const ratio = (clientX - rect.left) / rect.width;
  return snapValue(ratio * MAX);
}

/** Vertical band aligned with the scale; horizontal position is clamped to 0.0–5.0. */
function isInScaleDropBand(_clientX: number, clientY: number, rect: DOMRect): boolean {
  return (
    clientY >= rect.top - TRACK_DROP_PAD_Y &&
    clientY <= rect.bottom + TRACK_DROP_PAD_Y
  );
}

type PickerState = {
  x: number;
  y: number;
  peerIds: string[];
};

type DragSession = {
  peerId: string;
  startX: number;
  startY: number;
  startValue: number;
  moved: boolean;
  clickOnly: boolean;
};

type Props = {
  peers: TeamMember[];
  ratings: Record<string, number>;
  touchedPeerIds: Set<string>;
  onRate: (peerId: string, value: number) => void;
  onTouched: (peerId: string) => void;
};

export function EffectivenessScale({
  peers,
  ratings,
  touchedPeerIds,
  onRate,
  onTouched,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<DragSession | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [draggingPeerId, setDraggingPeerId] = useState<string | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [trackHover, setTrackHover] = useState(false);
  const [previewValue, setPreviewValue] = useState<number | null>(null);

  const closePicker = useCallback(() => setPicker(null), []);

  const getTrackRect = useCallback(() => trackRef.current?.getBoundingClientRect(), []);

  const getGroups = useCallback(() => {
    const track = trackRef.current;
    if (!track || peers.length === 0) return [] as string[][];
    const rect = track.getBoundingClientRect();
    const positions = positionsFromRatings(
      peers.map((p) => p.id),
      ratings,
      rect,
      MAX,
    );
    return getOverlapGroups(positions);
  }, [peers, ratings]);

  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      const session = sessionRef.current;
      if (!session) return;

      if (!session.moved) {
        const dist = Math.hypot(clientX - session.startX, clientY - session.startY);
        if (dist <= DRAG_THRESHOLD_PX) return;
        session.moved = true;
        setDraggingPeerId(session.peerId);
      }

      setGhostPos({ x: clientX, y: clientY });

      const rect = getTrackRect();
      if (rect && isInScaleDropBand(clientX, clientY, rect)) {
        setTrackHover(true);
        setPreviewValue(valueFromClientX(clientX, rect));
      } else {
        setTrackHover(false);
        setPreviewValue(null);
      }
    },
    [getTrackRect],
  );

  const endDrag = useCallback(
    (clientX: number, clientY: number) => {
      const session = sessionRef.current;

      if (session?.clickOnly && !session.moved) {
        const groups = getGroups();
        const group = groupForPeer(groups, session.peerId);
        if (group.length > 1) {
          setPicker({ x: clientX, y: clientY, peerIds: group });
        }
      } else if (session?.moved) {
        const rect = getTrackRect();
        if (rect && isInScaleDropBand(clientX, clientY, rect)) {
          onRate(session.peerId, valueFromClientX(clientX, rect));
          onTouched(session.peerId);
        } else {
          onRate(session.peerId, session.startValue);
        }
      }

      sessionRef.current = null;
      setDragActive(false);
      setDraggingPeerId(null);
      setGhostPos(null);
      setTrackHover(false);
      setPreviewValue(null);
    },
    [getTrackRect, getGroups, onRate, onTouched],
  );

  useEffect(() => {
    if (!picker) return;
    const onDoc = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('.effectiveness-overlap-picker')) return;
      closePicker();
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [picker, closePicker]);

  useEffect(() => {
    if (!dragActive) return;
    const onMove = (e: PointerEvent) => moveDrag(e.clientX, e.clientY);
    const onUp = (e: PointerEvent) => endDrag(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragActive, moveDrag, endDrag]);

  // Keyboard operability (WCAG): focus a chip, adjust 0–5 with arrows / Home / End / PageUp-Down.
  const onKeyChip = (peerId: string, current: number, e: React.KeyboardEvent) => {
    const step = 0.5;
    let next = current;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'PageUp':
        next = current + 1;
        break;
      case 'PageDown':
        next = current - 1;
        break;
      case 'Home':
        next = MIN;
        break;
      case 'End':
        next = MAX;
        break;
      default:
        return;
    }
    e.preventDefault();
    const snapped = snapValue(next);
    onRate(peerId, snapped);
    onTouched(peerId);
  };

  const onPointerDownChip = (peerId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closePicker();
    const groups = getGroups();
    const group = groupForPeer(groups, peerId);
    const clickOnly = group.length > 1;

    sessionRef.current = {
      peerId,
      startX: e.clientX,
      startY: e.clientY,
      startValue: ratings[peerId] ?? 0,
      moved: false,
      clickOnly,
    };
    setDragActive(true);
  };

  function startDragFromPicker(peerId: string, e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    closePicker();
    sessionRef.current = {
      peerId,
      startX: e.clientX,
      startY: e.clientY,
      startValue: ratings[peerId] ?? 0,
      moved: true,
      clickOnly: false,
    };
    setDraggingPeerId(peerId);
    setGhostPos({ x: e.clientX, y: e.clientY });
    setDragActive(true);
    moveDrag(e.clientX, e.clientY);
  }

  const pickerPeers = useMemo(() => {
    if (!picker) return [];
    return picker.peerIds
      .map((id) => peers.find((p) => p.id === id))
      .filter((p): p is TeamMember => Boolean(p));
  }, [picker, peers]);

  const ghostPeer = draggingPeerId
    ? peers.find((p) => p.id === draggingPeerId)
    : undefined;

  const ghostRatingValue =
    ghostPeer !== undefined
      ? previewValue ?? ratings[ghostPeer.id] ?? 0
      : null;
  const ghostBand =
    ghostRatingValue !== null ? getEffectivenessBand(ghostRatingValue) : null;

  return (
    <div className="effectiveness-scale">
      <div className="effectiveness-scale-head">
        <span className="effectiveness-scale-name">Effectiveness</span>
      </div>

      <div
        ref={trackRef}
        className={`effectiveness-track${trackHover ? ' effectiveness-track--hover' : ''}`}
        role="group"
        aria-label="Effectiveness scale"
      >
        <div className="effectiveness-track-fill" aria-hidden="true" />
        {peers.map((peer) => {
          const value = ratings[peer.id] ?? 0;
          const left = `${(value / MAX) * 100}%`;
          const isTouched = touchedPeerIds.has(peer.id);
          const isDragging = draggingPeerId === peer.id;
          return (
            <button
              key={peer.id}
              type="button"
              className={`effectiveness-chip effectiveness-chip--on-track${isDragging ? ' effectiveness-chip--hidden' : ''}`}
              style={{ left }}
              onPointerDown={(e) => onPointerDownChip(peer.id, e)}
              onKeyDown={(e) => onKeyChip(peer.id, value, e)}
              role="slider"
              tabIndex={0}
              aria-valuemin={MIN}
              aria-valuemax={MAX}
              aria-valuenow={value}
              aria-valuetext={`${peer.name}: ${value.toFixed(1)} out of 5`}
              aria-label={`Rate ${peer.name} (0 to 5). Use arrow keys.`}
            >
              <img src={peer.avatarUrl} alt="" width={40} height={40} />
              {isTouched ? (
                <span className="effectiveness-chip-value">{value.toFixed(1)}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {picker && pickerPeers.length > 0 ? (
        <div
          className="effectiveness-overlap-picker"
          style={{ left: picker.x, top: picker.y }}
          role="dialog"
          aria-label="Select peer to rate"
        >
          <p className="effectiveness-overlap-picker-title">Drag a peer onto the scale</p>
          <ul className="effectiveness-overlap-picker-list">
            {pickerPeers.map((peer) => (
              <li key={peer.id}>
                <button
                  type="button"
                  className="effectiveness-overlap-picker-item"
                  onPointerDown={(e) => startDragFromPicker(peer.id, e)}
                  aria-label={`Drag ${peer.name} onto scale`}
                >
                  <img src={peer.avatarUrl} alt="" width={32} height={32} draggable={false} />
                  <span>{peer.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {ghostPeer && ghostPos && ghostBand
        ? createPortal(
            <div
              className="effectiveness-drag-ghost"
              style={{ left: ghostPos.x, top: ghostPos.y }}
              role="status"
              aria-live="polite"
            >
              <div className="effectiveness-drag-ghost-inner">
                <img
                  className="effectiveness-drag-ghost-avatar"
                  src={ghostPeer.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                />
                <div className="effectiveness-drag-desc">
                <p className="effectiveness-drag-desc-name">{ghostPeer.name}</p>
                <p className="effectiveness-drag-desc-role">{ghostPeer.role}</p>
                <p className="effectiveness-drag-desc-rating">
                  {ghostRatingValue.toFixed(1)}
                </p>
                <p className="effectiveness-drag-desc-meaning">{ghostBand.meaning}</p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
