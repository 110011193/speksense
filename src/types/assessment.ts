export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed';

export type Question =
  | {
      id: string;
      type: 'single';
      prompt: string;
      options: string[];
    }
  | {
      id: string;
      type: 'text';
      prompt: string;
      placeholder?: string;
    };

export type Behavior = {
  id: string;
  statement: string;
};

export type Competency = {
  id: string;
  title: string;
  behaviors: [Behavior, Behavior];
};

type AssignmentBase = {
  id: string;
  title: string;
  subtitle: string;
  dueLabel: string;
  estimatedMinutes: number;
  /** ISO-8601 active window (null/absent = unbounded on that end). */
  startAt?: string | null;
  endAt?: string | null;
  status: AssignmentStatus;
  instructions: string[];
};

export type StandardAssignment = AssignmentBase & {
  kind: 'standard';
  questions: Question[];
};

export type Survey360Assignment = AssignmentBase & {
  kind: 'survey360';
  competencies: [Competency, Competency, Competency, Competency];
};

// A, B, C, … — supports 2-option (True/False) through many-option (e.g. 5-point) trait scales.
export type BehavioralChoiceKey = string;

export type BehavioralScenario = {
  id: string;
  section: string;
  prompt: string;
  choices: { key: BehavioralChoiceKey; text: string }[];
};

export type BehavioralAssignment = AssignmentBase & {
  kind: 'behavioral';
  scenarios: BehavioralScenario[];
};

export type Assignment = StandardAssignment | Survey360Assignment | BehavioralAssignment;

export function isSurvey360(a: Assignment): a is Survey360Assignment {
  return a.kind === 'survey360';
}

export function isStandardAssignment(a: Assignment): a is StandardAssignment {
  return a.kind === 'standard';
}

export function isBehavioralAssignment(a: Assignment): a is BehavioralAssignment {
  return a.kind === 'behavioral';
}

export function getBehaviorSteps(assignment: Survey360Assignment): Behavior[] {
  return assignment.competencies.flatMap((c) => c.behaviors);
}
