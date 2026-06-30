import { SEED_ASSIGNMENTS } from '../../data/seedAssignments';
import { DEFAULT_PRESENTATION } from '../../types/presentation';
import type {
  AssessmentAssignment,
  AssessmentDefinition,
  OrgPerson,
} from '../types';
import { SEED_PEOPLE } from './seedPeople';

const PEOPLE_KEY = 'speksense_org_people';
const ASSESSMENTS_KEY = 'speksense_org_assessments';
const ASSIGNMENTS_KEY = 'speksense_org_assignments';
const SEEDED_KEY = 'speksense_org_seeded_v1';

function hasLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasLocalStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasLocalStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildSeedAssessments(): AssessmentDefinition[] {
  const now = new Date().toISOString();
  return SEED_ASSIGNMENTS.map((a) => ({
    ...a,
    publishStatus: 'published' as const,
    createdAt: now,
    updatedAt: now,
    createdByEmail: null,
    presentation: { ...DEFAULT_PRESENTATION },
  }));
}

function buildSeedAssignments(people: OrgPerson[], assessments: AssessmentDefinition[]): AssessmentAssignment[] {
  const now = new Date().toISOString();
  const published = assessments.filter((a) => a.publishStatus === 'published');
  const rows: AssessmentAssignment[] = [];
  for (const person of people) {
    for (const assessment of published) {
      rows.push({
        id: newId('assign'),
        assessmentId: assessment.id,
        userId: person.id,
        assignedAt: now,
      });
    }
  }
  return rows;
}

export function ensureOrgStoreSeeded(): void {
  if (!hasLocalStorage()) return;
  if (localStorage.getItem(SEEDED_KEY) === 'true') return;

  const people = [...SEED_PEOPLE];
  const assessments = buildSeedAssessments();
  const assignments = buildSeedAssignments(people, assessments);

  writeJson(PEOPLE_KEY, people);
  writeJson(ASSESSMENTS_KEY, assessments);
  writeJson(ASSIGNMENTS_KEY, assignments);
  localStorage.setItem(SEEDED_KEY, 'true');
}

export function getPeople(): OrgPerson[] {
  ensureOrgStoreSeeded();
  return readJson<OrgPerson[]>(PEOPLE_KEY, []);
}

export function setPeople(people: OrgPerson[]): void {
  writeJson(PEOPLE_KEY, people);
}

export function getAssessmentDefinitions(): AssessmentDefinition[] {
  ensureOrgStoreSeeded();
  return readJson<AssessmentDefinition[]>(ASSESSMENTS_KEY, []);
}

export function setAssessmentDefinitions(definitions: AssessmentDefinition[]): void {
  writeJson(ASSESSMENTS_KEY, definitions);
}

export function getAssessmentAssignments(): AssessmentAssignment[] {
  ensureOrgStoreSeeded();
  return readJson<AssessmentAssignment[]>(ASSIGNMENTS_KEY, []);
}

export function setAssessmentAssignments(assignments: AssessmentAssignment[]): void {
  writeJson(ASSIGNMENTS_KEY, assignments);
}

export { newId };
