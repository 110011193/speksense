import type { Survey360Assignment } from '../types/assessment';
import { getBehaviorSteps } from '../types/assessment';

export function peersKey(assignmentId: string): string {
  return `speksense_survey_${assignmentId}_peers`;
}

export function survey360Key(assignmentId: string): string {
  return `speksense_survey_${assignmentId}_360`;
}

export function ratedPeersKey(assignmentId: string): string {
  return `speksense_survey_${assignmentId}_rated_peers`;
}

export type Survey360Draft = {
  competencyIndex: number;
  behaviorIndex: number;
  ratings: Record<string, Record<string, number>>;
  touched: Record<string, string[]>;
};

export function loadSelectedPeers(assignmentId: string): string[] | null {
  try {
    const raw = sessionStorage.getItem(peersKey(assignmentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSelectedPeers(assignmentId: string, peerIds: string[]): void {
  sessionStorage.setItem(peersKey(assignmentId), JSON.stringify(peerIds));
}

export function loadRatedPeers(assignmentId: string): string[] {
  try {
    const raw = sessionStorage.getItem(ratedPeersKey(assignmentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRatedPeers(assignmentId: string, peerIds: string[]): void {
  const existing = new Set(loadRatedPeers(assignmentId));
  for (const id of peerIds) existing.add(id);
  sessionStorage.setItem(ratedPeersKey(assignmentId), JSON.stringify([...existing]));
}

export function loadSurvey360Draft(assignmentId: string): Survey360Draft | null {
  try {
    const raw = sessionStorage.getItem(survey360Key(assignmentId));
    if (!raw) return null;
    return JSON.parse(raw) as Survey360Draft;
  } catch {
    return null;
  }
}

export function saveSurvey360Draft(assignmentId: string, draft: Survey360Draft): void {
  sessionStorage.setItem(survey360Key(assignmentId), JSON.stringify(draft));
}

/** Clears in-progress draft and current selection; keeps completed rated peer ids. */
export function clearSurvey360Session(assignmentId: string): void {
  sessionStorage.removeItem(peersKey(assignmentId));
  sessionStorage.removeItem(survey360Key(assignmentId));
}

export function clearSurvey360Data(assignmentId: string): void {
  clearSurvey360Session(assignmentId);
  sessionStorage.removeItem(ratedPeersKey(assignmentId));
}

export function getSurvey360BehaviorIds(assignment: Survey360Assignment): string[] {
  return getBehaviorSteps(assignment).map((b) => b.id);
}

export function areSessionPeersFullyRated(
  peerIds: string[],
  draft: Survey360Draft,
  behaviorIds: string[],
): boolean {
  if (peerIds.length === 0) return false;
  return peerIds.every((peerId) =>
    behaviorIds.every((behaviorId) => draft.touched[behaviorId]?.includes(peerId)),
  );
}
