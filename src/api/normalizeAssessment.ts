import type { Assignment } from '../types/assessment';
import { DEFAULT_PRESENTATION } from '../types/presentation';
import type { AssessmentDefinition } from './types';
import { newId } from './mock/store';

function build360Competencies(): Extract<AssessmentDefinition, { kind: 'survey360' }>['competencies'] {
  return [
    { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
    { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
    { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
    { id: newId('comp'), title: '', behaviors: [{ id: newId('b'), statement: '' }, { id: newId('b'), statement: '' }] },
  ];
}

/** Ensures kind-specific fields exist so Configure wizard never crashes on .map. */
export function normalizeAssessmentDefinition(raw: AssessmentDefinition): AssessmentDefinition {
  const presentation = raw.presentation ?? { ...DEFAULT_PRESENTATION };
  const instructions = Array.isArray(raw.instructions) ? raw.instructions : [''];
  const kind = (raw.kind ?? 'standard') as Assignment['kind'];

  const base = {
    ...raw,
    kind,
    instructions,
    presentation,
  };

  if (kind === 'standard') {
    return {
      ...base,
      kind: 'standard',
      questions: Array.isArray((raw as { questions?: unknown }).questions)
        ? (raw as Extract<AssessmentDefinition, { kind: 'standard' }>).questions
        : [],
    };
  }

  if (kind === 'behavioral') {
    return {
      ...base,
      kind: 'behavioral',
      scenarios: Array.isArray((raw as { scenarios?: unknown }).scenarios)
        ? (raw as Extract<AssessmentDefinition, { kind: 'behavioral' }>).scenarios
        : [],
    };
  }

  const competencies = (raw as Extract<AssessmentDefinition, { kind: 'survey360' }>).competencies;
  return {
    ...base,
    kind: 'survey360',
    competencies: Array.isArray(competencies) && competencies.length === 4 ? competencies : build360Competencies(),
  };
}
