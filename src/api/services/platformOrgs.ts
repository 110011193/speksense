// SuperAdmin (vendor) console: provision and manage client organizations across the platform.
import { apiRequest } from '../client';

export type OrgStatus = 'active' | 'suspended' | 'archived';

export type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  userCount: number;
  adminCount: number;
  peopleCount: number;
  createdAt: string;
  suspendedAt: string | null;
  archivedAt: string | null;
};

export type CreateOrgInput = {
  name: string;
  slug?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName?: string;
};

export type CreateOrgResult = {
  org: OrgSummary;
  adminEmail: string;
  adminName: string | null;
  activationToken: string;
  activationExpiresAt: string;
};

export type PlatformAudit = {
  id: string;
  organizationId: string;
  organizationName: string | null;
  actorEmail: string | null;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
  /** Semantic fields — set for domain events (org lifecycle, invites), null on HTTP fallback rows. */
  action: string | null;
  entityType: string | null;
  summary: string | null;
};

export const listOrganizations = () => apiRequest<OrgSummary[]>('GET', '/platform/organizations');

export const createOrganization = (input: CreateOrgInput) =>
  apiRequest<CreateOrgResult>('POST', '/platform/organizations', input);

export const suspendOrganization = (id: string) =>
  apiRequest<void>('POST', `/platform/organizations/${id}/suspend`);

export const reactivateOrganization = (id: string) =>
  apiRequest<void>('POST', `/platform/organizations/${id}/reactivate`);

export const archiveOrganization = (id: string) =>
  apiRequest<void>('POST', `/platform/organizations/${id}/archive`);

export const listPlatformAudit = (limit = 100, orgId?: string) =>
  apiRequest<PlatformAudit[]>(
    'GET',
    `/platform/audit?limit=${limit}${orgId ? `&orgId=${encodeURIComponent(orgId)}` : ''}`,
  );
