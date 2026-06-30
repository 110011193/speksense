import type { AssessmentDefinition } from '../../api/types';

/**
 * Stable per-field key for the first invalid field, so a wizard step can wire
 * aria-invalid / aria-describedby to the exact offending input. Indexed keys
 * (competency / behavior) encode their position.
 */
export type InvalidField =
  | { field: 'title'; message: string }
  | { field: 'endAt'; message: string }
  | { field: 'instructions'; message: string }
  | { field: 'questions'; message: string }
  | { field: 'scenarios'; message: string }
  | { field: `comp-${number}-title`; message: string }
  | { field: `comp-${number}-behavior-${number}`; message: string };

export function firstInvalidField(def: AssessmentDefinition): InvalidField | null {
  if (!def.title.trim()) return { field: 'title', message: 'Title is required.' };
  if (def.startAt && def.endAt && new Date(def.endAt).getTime() <= new Date(def.startAt).getTime()) {
    return { field: 'endAt', message: 'The close date must be after the open date.' };
  }
  if (def.instructions.filter((s) => s.trim()).length === 0) {
    return { field: 'instructions', message: 'Add at least one instruction.' };
  }
  if (def.kind === 'standard') {
    if (def.questions.length === 0) return { field: 'questions', message: 'Add at least one question.' };
  }
  if (def.kind === 'behavioral') {
    if (def.scenarios.length === 0) return { field: 'scenarios', message: 'Add at least one statement.' };
  }
  if (def.kind === 'survey360') {
    for (let ci = 0; ci < def.competencies.length; ci++) {
      const c = def.competencies[ci];
      if (!c.title.trim()) {
        return { field: `comp-${ci}-title`, message: 'Each competency needs a title.' };
      }
      for (let bi = 0; bi < c.behaviors.length; bi++) {
        if (!c.behaviors[bi].statement.trim()) {
          return { field: `comp-${ci}-behavior-${bi}`, message: 'Each behavior needs a statement.' };
        }
      }
    }
  }
  return null;
}

export function canPublish(def: AssessmentDefinition): string | null {
  return firstInvalidField(def)?.message ?? null;
}

export const WIZARD_STEP_LABELS = [
  'Type',
  'Basics',
  'Instructions',
  'Content',
  'Experience',
  'Review',
  'Assign',
] as const;
