import { DEFAULT_PRESENTATION } from '../../types/presentation';
import type { Assignment } from '../../types/assessment';
import { ApiError } from '../types';
import type {
  AssessmentDefinition,
  BulkImportResult,
  BulkPersonRow,
  CreateAssignmentsInput,
  CreatePersonInput,
  OrgPerson,
} from '../types';
import {
  getAssessmentAssignments,
  getAssessmentDefinitions,
  getPeople,
  newId,
  setAssessmentAssignments,
  setAssessmentDefinitions,
  setPeople,
} from './store';
import { normalizeAssessmentDefinition } from '../normalizeAssessment';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

function parsePath(path: string): { resource: string; id?: string; action?: string; query: URLSearchParams } {
  const [pathname, search = ''] = path.split('?');
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const query = new URLSearchParams(search);
  if (parts[0] === 'assessments' && parts.length === 3 && parts[2] === 'publish') {
    return { resource: 'assessments', id: parts[1], action: 'publish', query };
  }
  if (parts.length === 1) return { resource: parts[0], query };
  if (parts.length === 2) return { resource: parts[0], id: parts[1], query };
  return { resource: parts[0] ?? '', query };
}

function emptyDraft(kind: Assignment['kind']): Partial<AssessmentDefinition> {
  const base = {
    title: '',
    subtitle: '',
    dueLabel: 'Due soon',
    estimatedMinutes: 15,
    instructions: [''],
    publishStatus: 'draft' as const,
    presentation: { ...DEFAULT_PRESENTATION },
  };
  if (kind === 'standard') return { ...base, kind, questions: [] };
  if (kind === 'behavioral') return { ...base, kind, scenarios: [] };
  return {
    ...base,
    kind: 'survey360',
    competencies: [
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
      { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
    ],
  };
}

function validateForPublish(def: AssessmentDefinition): string | null {
  if (def.instructions.filter((s) => s.trim()).length === 0) {
    return 'Add at least one instruction before publishing.';
  }
  if (def.kind === 'standard') {
    if (def.questions.length === 0) return 'Add at least one question before publishing.';
  }
  if (def.kind === 'behavioral') {
    if (def.scenarios.length === 0) return 'Add at least one scenario before publishing.';
    for (const s of def.scenarios) {
      if (!s.prompt.trim()) return 'Every scenario needs a prompt.';
      if (s.choices.length !== 4) return 'Each scenario needs four choices.';
    }
  }
  if (def.kind === 'survey360') {
    for (const c of def.competencies) {
      if (!c.title.trim()) return 'Every competency needs a title.';
      for (const b of c.behaviors) {
        if (!b.statement.trim()) return 'Every behavior needs a statement.';
      }
    }
  }
  if (!def.title.trim()) return 'Title is required.';
  return null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createPerson(input: CreatePersonInput, source: OrgPerson['source']): OrgPerson {
  const email = normalizeEmail(input.email);
  const people = getPeople();
  if (people.some((p) => p.email === email)) {
    throw new ApiError('A person with this email already exists.', 409);
  }
  const person: OrgPerson = {
    id: newId('person'),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email,
    jobTitle: input.jobTitle.trim(),
    department: input.department?.trim() || undefined,
    site: input.site?.trim() || undefined,
    status: 'invited',
    source,
  };
  setPeople([...people, person]);
  return person;
}

export function handleMockRequest(method: HttpMethod, path: string, body?: unknown): unknown {
  const { resource, id, action, query } = parsePath(path);

  if (resource === 'people') {
    if (method === 'GET') {
      return getPeople();
    }
    if (method === 'POST' && id === 'bulk') {
      const rows = (body as { rows?: BulkPersonRow[] })?.rows ?? [];
      if (rows.length > 500) throw new ApiError('Maximum 500 rows per import.', 400);
      const created: OrgPerson[] = [];
      const errors: BulkImportResult['errors'] = [];
      rows.forEach((row, index) => {
        const rowNum = index + 2;
        try {
          if (!row.firstName?.trim() || !row.lastName?.trim() || !row.email?.trim()) {
            errors.push({ row: rowNum, message: 'first_name, last_name, and email are required.' });
            return;
          }
          if (!row.jobTitle?.trim()) {
            errors.push({ row: rowNum, message: 'job_title is required.' });
            return;
          }
          created.push(
            createPerson(
              {
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                jobTitle: row.jobTitle,
                department: row.department,
                site: row.site,
              },
              'import',
            ),
          );
        } catch (e) {
          const message = e instanceof ApiError ? e.message : 'Could not import row.';
          errors.push({ row: rowNum, message });
        }
      });
      return { created, errors } satisfies BulkImportResult;
    }
    if (method === 'POST') {
      return createPerson(body as CreatePersonInput, 'manual');
    }
  }

  if (resource === 'assessments') {
    const list = getAssessmentDefinitions();
    if (method === 'GET' && !id) return list;
    if (method === 'POST' && !id) {
      const now = new Date().toISOString();
      const kind = ((body as { kind?: Assignment['kind'] })?.kind ?? 'standard') as Assignment['kind'];
      const draft = emptyDraft(kind);
      const created: AssessmentDefinition = {
        id: newId('assessment'),
        createdAt: now,
        updatedAt: now,
        createdByEmail: (body as { createdByEmail?: string })?.createdByEmail ?? null,
        publishStatus: 'draft',
        presentation: { ...DEFAULT_PRESENTATION },
        title: '',
        subtitle: '',
        dueLabel: 'Due soon',
        estimatedMinutes: 15,
        instructions: [''],
        ...draft,
      } as AssessmentDefinition;
      setAssessmentDefinitions([...list, created]);
      return normalizeAssessmentDefinition(created);
    }
    if (method === 'GET' && id) {
      const found = list.find((a) => a.id === id);
      if (!found) throw new ApiError('Assessment not found.', 404);
      return normalizeAssessmentDefinition(found);
    }
    if (method === 'PATCH' && id) {
      const idx = list.findIndex((a) => a.id === id);
      if (idx === -1) throw new ApiError('Assessment not found.', 404);
      const patch = body as Partial<AssessmentDefinition>;
      let merged: AssessmentDefinition = {
        ...list[idx],
        ...patch,
        id: list[idx].id,
        updatedAt: new Date().toISOString(),
      };
      if (patch.kind && patch.kind !== list[idx].kind) {
        if (patch.kind === 'standard') {
          const { scenarios, competencies, ...rest } = merged as AssessmentDefinition & {
            scenarios?: unknown;
            competencies?: unknown;
          };
          void scenarios;
          void competencies;
          merged = { ...rest, kind: 'standard', questions: patch.questions ?? [] } as AssessmentDefinition;
        } else if (patch.kind === 'behavioral') {
          const { questions, competencies, ...rest } = merged as AssessmentDefinition & {
            questions?: unknown;
            competencies?: unknown;
          };
          void questions;
          void competencies;
          merged = { ...rest, kind: 'behavioral', scenarios: patch.scenarios ?? [] } as AssessmentDefinition;
        } else {
          const { questions, scenarios, ...rest } = merged as AssessmentDefinition & {
            questions?: unknown;
            scenarios?: unknown;
          };
          void questions;
          void scenarios;
          merged = {
            ...rest,
            kind: 'survey360',
            competencies:
              patch.competencies ??
              (list[idx].kind === 'survey360'
                ? (list[idx] as Extract<AssessmentDefinition, { kind: 'survey360' }>).competencies
                : emptyDraft('survey360').competencies),
          } as AssessmentDefinition;
        }
      }
      const next = [...list];
      next[idx] = normalizeAssessmentDefinition(merged);
      setAssessmentDefinitions(next);
      return next[idx];
    }
    if (method === 'POST' && id && action === 'publish') {
      const idx = list.findIndex((a) => a.id === id);
      if (idx === -1) throw new ApiError('Assessment not found.', 404);
      const def = list[idx];
      if (def.publishStatus === 'published') return def;
      const err = validateForPublish(def);
      if (err) throw new ApiError(err, 400);
      const updated: AssessmentDefinition = {
        ...def,
        publishStatus: 'published',
        updatedAt: new Date().toISOString(),
      };
      const next = [...list];
      next[idx] = updated;
      setAssessmentDefinitions(next);
      return updated;
    }
  }

  if (resource === 'assignments') {
    const rows = getAssessmentAssignments();
    if (method === 'GET') {
      const email = query.get('email');
      if (email) {
        const person = getPeople().find((p) => p.email === normalizeEmail(email));
        if (!person) return [];
        return rows.filter((r) => r.userId === person.id);
      }
      return rows;
    }
    if (method === 'POST') {
      const input = body as CreateAssignmentsInput;
      const defs = getAssessmentDefinitions();
      const def = defs.find((a) => a.id === input.assessmentId);
      if (!def) throw new ApiError('Assessment not found.', 404);
      if (def.publishStatus !== 'published') {
        throw new ApiError('Publish the assessment before assigning participants.', 400);
      }
      const people = getPeople();
      const now = new Date().toISOString();
      const next = [...rows];
      for (const userId of input.userIds) {
        if (!people.some((p) => p.id === userId)) continue;
        if (next.some((r) => r.assessmentId === input.assessmentId && r.userId === userId)) continue;
        next.push({
          id: newId('assign'),
          assessmentId: input.assessmentId,
          userId,
          assignedAt: now,
        });
      }
      setAssessmentAssignments(next);
      return next.filter((r) => r.assessmentId === input.assessmentId);
    }
  }

  throw new ApiError(`No mock handler for ${method} ${path}`, 404);
}
