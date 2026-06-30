import { apiRequest } from '../client';
import type { AssessmentDefinition } from '../types';
import type { Assignment } from '../../types/assessment';

export async function listAssessmentDefinitions(): Promise<AssessmentDefinition[]> {
  return apiRequest<AssessmentDefinition[]>('GET', '/assessments');
}

/** Human label for an assessment kind (the 'behavioral' kind is branded "Trait Assessment"). */
export function kindLabel(kind: string): string {
  switch (kind) {
    case 'behavioral':
      return 'Trait Assessment';
    case 'survey360':
      return '360 Feedback';
    case 'standard':
      return 'Standard survey';
    default:
      return kind;
  }
}

export async function getAssessmentDefinition(id: string): Promise<AssessmentDefinition> {
  return apiRequest<AssessmentDefinition>('GET', `/assessments/${id}`);
}

export async function createAssessmentDraft(input: {
  kind: Assignment['kind'];
  createdByEmail?: string | null;
}): Promise<AssessmentDefinition> {
  return apiRequest<AssessmentDefinition>('POST', '/assessments', input);
}

export async function updateAssessmentDefinition(
  id: string,
  patch: Partial<AssessmentDefinition>,
): Promise<AssessmentDefinition> {
  return apiRequest<AssessmentDefinition>('PATCH', `/assessments/${id}`, patch);
}

export async function publishAssessmentDefinition(id: string): Promise<AssessmentDefinition> {
  return apiRequest<AssessmentDefinition>('POST', `/assessments/${id}/publish`);
}

/** Delete a draft assessment (backend 409s if it's published or has assignments). */
export async function deleteAssessmentDraft(id: string): Promise<void> {
  await apiRequest<void>('DELETE', `/assessments/${id}`);
}

/**
 * Edit only the dates of a PUBLISHED assessment, in place — existing assignments stay valid and
 * every assigned participant is emailed when a date actually changes. (Content stays locked; for
 * drafts use updateAssessmentDefinition instead.) `null` clears a date.
 */
export async function updateAssessmentSchedule(
  id: string,
  dates: { startAt: string | null; endAt: string | null },
): Promise<AssessmentDefinition> {
  return apiRequest<AssessmentDefinition>('PATCH', `/assessments/${id}/schedule`, {
    startAt: dates.startAt ?? '',
    endAt: dates.endAt ?? '',
  });
}

export function definitionToAssignment(
  def: AssessmentDefinition,
  participantStatus: 'assigned' | 'in_progress' | 'completed' = 'assigned',
): Assignment {
  const { publishStatus, createdAt, updatedAt, createdByEmail, presentation, ...assignment } = def;
  void publishStatus;
  void createdAt;
  void updatedAt;
  void createdByEmail;
  void presentation;
  return { ...assignment, status: participantStatus };
}

export function getPresentation(def: AssessmentDefinition) {
  return def.presentation;
}
