import { ensureOrgStoreSeeded, getAssessmentAssignments, getAssessmentDefinitions, getPeople } from '../api/mock/store';
import {
  definitionToAssignment,
  getPresentation,
  listAssessmentDefinitions,
} from '../api/services/assessmentCatalog';
import { listAssignmentsForEmail } from '../api/services/assignmentService';
import { findPersonByEmail, listPeople } from '../api/services/peopleDirectory';
import type { AssessmentDefinition } from '../api/types';
import type { Assignment, AssignmentStatus } from '../types/assessment';
import type { QuestionPresentation } from '../types/presentation';
import { isAssignmentCompleted } from '../utils/assignmentProgress';
import { getUserEmail, isAdminUser } from '../utils/sessionUser';

function effectiveStatus(assignmentId: string, fallback: AssignmentStatus): AssignmentStatus {
  if (isAssignmentCompleted(assignmentId)) return 'completed';
  return fallback;
}

export function getAssessmentDefinitionSync(id: string): AssessmentDefinition | undefined {
  ensureOrgStoreSeeded();
  return getAssessmentDefinitions().find((a) => a.id === id);
}

export function getPresentationForAssessment(id: string): QuestionPresentation | undefined {
  const def = getAssessmentDefinitionSync(id);
  return def ? getPresentation(def) : undefined;
}

export function getAssignment(id: string): Assignment | undefined {
  const def = getAssessmentDefinitionSync(id);
  if (!def) return undefined;
  if (def.publishStatus !== 'published') {
    if (!isAdminUser()) return undefined;
  }
  return {
    ...definitionToAssignment(def, 'assigned'),
    status: effectiveStatus(id, 'assigned'),
  };
}

export function getAllAssignments(): Assignment[] {
  ensureOrgStoreSeeded();
  return getAssessmentDefinitions()
    .filter((d) => d.publishStatus === 'published')
    .map((d) => ({
      ...definitionToAssignment(d, 'assigned'),
      status: effectiveStatus(d.id, 'assigned'),
    }));
}

export async function getAssignmentsForUserAsync(): Promise<Assignment[]> {
  ensureOrgStoreSeeded();
  const email = getUserEmail();
  if (!email) return [];

  const people = await listPeople();
  const person = findPersonByEmail(people, email);
  if (!person) return [];

  const assignmentRows = await listAssignmentsForEmail(email);
  const assessmentIds = new Set(assignmentRows.map((r) => r.assessmentId));

  const defs = getAssessmentDefinitions().filter(
    (d) => d.publishStatus === 'published' && assessmentIds.has(d.id),
  );

  return defs.map((d) => ({
    ...definitionToAssignment(d, 'assigned'),
    status: effectiveStatus(d.id, 'assigned'),
  }));
}

export function getAssignmentsForUser(): Assignment[] {
  ensureOrgStoreSeeded();
  const email = getUserEmail();
  if (!email) return [];

  const person = getPeople().find((p) => p.email === email.trim().toLowerCase());
  if (!person) return [];

  const rows = getAssessmentAssignments().filter((r) => r.userId === person.id);
  const ids = new Set(rows.map((r) => r.assessmentId));

  return getAssessmentDefinitions()
    .filter((d) => d.publishStatus === 'published' && ids.has(d.id))
    .map((d) => ({
      ...definitionToAssignment(d, 'assigned'),
      status: effectiveStatus(d.id, 'assigned'),
    }));
}

export async function listCatalogDefinitions(): Promise<AssessmentDefinition[]> {
  ensureOrgStoreSeeded();
  return listAssessmentDefinitions();
}