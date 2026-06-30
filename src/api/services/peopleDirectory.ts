import { apiRequest } from '../client';
import type {
  BulkImportResult,
  CreatePersonInput,
  OrgPerson,
  OrgPersonRow,
  PagedResult,
  PeopleStats,
} from '../types';

export async function listPeople(): Promise<OrgPerson[]> {
  return apiRequest<OrgPerson[]>('GET', '/people');
}

export async function listPeoplePaged(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PagedResult<OrgPersonRow>> {
  const q = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.search?.trim()) q.set('search', params.search.trim());
  return apiRequest<PagedResult<OrgPersonRow>>('GET', `/people/paged?${q.toString()}`);
}

export async function getPeopleStats(): Promise<PeopleStats> {
  return apiRequest<PeopleStats>('GET', '/people/stats');
}

export async function createPerson(input: CreatePersonInput): Promise<OrgPerson> {
  return apiRequest<OrgPerson>('POST', '/people', input);
}

export async function deletePerson(personId: string): Promise<void> {
  await apiRequest<void>('DELETE', `/people/${personId}`);
}

export async function bulkImportPeople(rows: CreatePersonInput[]): Promise<BulkImportResult> {
  return apiRequest<BulkImportResult>('POST', '/people/bulk', { rows });
}

/** Issue a one-time activation link for a person; returns a shareable URL. */
export async function sendActivationLink(personId: string): Promise<{ url: string; expiresAt: string }> {
  const res = await apiRequest<{ token: string; expiresAt: string }>(
    'POST',
    `/people/${personId}/activation-link`,
  );
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return { url: `${origin}/signup?token=${encodeURIComponent(res.token)}`, expiresAt: res.expiresAt };
}

export function personDisplayName(person: OrgPerson): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function findPersonByEmail(people: OrgPerson[], email: string): OrgPerson | undefined {
  const normalized = email.trim().toLowerCase();
  return people.find((p) => p.email === normalized);
}
