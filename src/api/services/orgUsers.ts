// Org-admin console: invite teammates, change roles, suspend logins (all scoped to the caller's org).
import { apiRequest } from '../client';

export type UserRoleWire = 'participant' | 'admin' | 'superadmin';
export type UserStatusWire = 'invited' | 'active' | 'disabled';

export type OrgUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRoleWire;
  status: UserStatusWire;
  personId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  /** Invited but not yet activated (no login exists). id is the personId; only re-sending the link applies. */
  pending: boolean;
};

export type AssignableRole = 'participant' | 'manager' | 'admin';

export type InviteUserInput = {
  firstName: string;
  lastName?: string;
  email: string;
  jobTitle?: string;
  role: AssignableRole;
};

export type InviteUserResult = {
  personId: string;
  email: string;
  displayName: string | null;
  role: string;
  activationToken: string;
  activationExpiresAt: string;
};

export const listUsers = () => apiRequest<OrgUser[]>('GET', '/users');

export const inviteUser = (input: InviteUserInput) =>
  apiRequest<InviteUserResult>('POST', '/users/invite', input);

export const changeUserRole = (id: string, role: AssignableRole) =>
  apiRequest<void>('PATCH', `/users/${id}/role`, { role });

export const suspendUser = (id: string) => apiRequest<void>('POST', `/users/${id}/suspend`);

export const reactivateUser = (id: string) => apiRequest<void>('POST', `/users/${id}/reactivate`);
