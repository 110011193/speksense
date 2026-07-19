import { apiRequest } from '../client';
import type { Cohort, CohortDetail, CreatePersonInput } from '../types';

export const listCohorts = () => apiRequest<Cohort[]>('GET', '/cohorts');

export const getCohort = (id: string) => apiRequest<CohortDetail>('GET', `/cohorts/${id}`);

export const createCohort = (name: string, personIds?: string[]) =>
  apiRequest<Cohort>('POST', '/cohorts', { name, personIds });

export const addCohortMembers = (id: string, personIds: string[]) =>
  apiRequest<CohortDetail>('POST', `/cohorts/${id}/members`, { personIds });

export const removeCohortMember = (id: string, personId: string) =>
  apiRequest<void>('DELETE', `/cohorts/${id}/members/${personId}`);

export const deleteCohort = (id: string) => apiRequest<void>('DELETE', `/cohorts/${id}`);

/** Upload a named cohort from parsed people rows (creates/matches directory people, then groups them). */
export const uploadCohort = (name: string, rows: CreatePersonInput[]) =>
  apiRequest<CohortDetail>('POST', '/cohorts/upload', { name, rows });
