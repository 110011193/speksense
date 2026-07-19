import type { Assignment } from '../types/assessment';
import type { QuestionPresentation } from '../types/presentation';

export type OrgPersonStatus = 'invited' | 'active';
export type OrgPersonSource = 'seed' | 'manual' | 'import';

export type OrgPerson = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department?: string;
  site?: string;
  status: OrgPersonStatus;
  source: OrgPersonSource;
};

export type AssessmentDefinition = Omit<Assignment, 'status'> & {
  publishStatus: 'draft' | 'published';
  assignmentCount?: number;
  createdAt: string;
  updatedAt: string;
  createdByEmail: string | null;
  presentation: QuestionPresentation;
};

export type AssessmentAssignment = {
  id: string;
  assessmentId: string;
  userId: string;
  assignedAt: string;
};

export type OrgPersonRow = OrgPerson & { assignments: number };

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PeopleStats = {
  total: number;
  active: number;
  invited: number;
  activatedPct: number;
};

export type CreatePersonInput = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department?: string;
  site?: string;
};

export type BulkPersonRow = CreatePersonInput;

export type Cohort = {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
};

export type CohortMember = {
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
};

export type CohortDetail = Cohort & { members: CohortMember[] };

export type BulkImportResult = {
  created: OrgPerson[];
  errors: { row: number; message: string }[];
};

export type CreateAssignmentsInput = {
  assessmentId: string;
  userIds: string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
