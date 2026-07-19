// Org-scoped audit trail (GET /api/audit, AdminOnly). Rows are either semantic domain events
// (action/summary set — invites, role changes, org lifecycle) or plain HTTP fallbacks.
import { apiRequest } from '../client';

export type OrgAudit = {
  id: string;
  email: string | null;
  method: string;
  path: string;
  statusCode: number;
  at: string;
  action: string | null;
  entityType: string | null;
  summary: string | null;
};

export const listOrgAudit = (take = 100, action?: string) =>
  apiRequest<OrgAudit[]>(
    'GET',
    `/audit?take=${take}${action ? `&action=${encodeURIComponent(action)}` : ''}`,
  );

/** Human label for a semantic action key (mirrors the backend's AuditActions.Label). */
export function auditActionLabel(action: string | null | undefined): string | null {
  switch (action) {
    case 'org_create': return 'Organization created';
    case 'org_suspend': return 'Organization suspended';
    case 'org_reactivate': return 'Organization reactivated';
    case 'org_archive': return 'Organization archived';
    case 'user_invite': return 'Teammate invited';
    case 'user_change_role': return 'Role changed';
    case 'user_suspend': return 'Access suspended';
    case 'user_reactivate': return 'Access reactivated';
    case 'user_activate': return 'Account activated';
    default: return action || null;
  }
}
