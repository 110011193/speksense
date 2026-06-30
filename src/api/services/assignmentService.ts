import { apiRequest } from '../client';
import type { AssessmentAssignment, CreateAssignmentsInput } from '../types';

export async function listAssignmentsForEmail(email: string): Promise<AssessmentAssignment[]> {
  return apiRequest<AssessmentAssignment[]>('GET', `/assignments?email=${encodeURIComponent(email)}`);
}

export async function createAssignments(input: CreateAssignmentsInput): Promise<AssessmentAssignment[]> {
  return apiRequest<AssessmentAssignment[]>('POST', '/assignments', input);
}

export async function listAllAssignments(): Promise<AssessmentAssignment[]> {
  return apiRequest<AssessmentAssignment[]>('GET', '/assignments');
}
