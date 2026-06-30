// Real-API service layer for the Phase 4/5 surfaces (dashboard, reports, notifications,
// settings, calendar) and the participant taking flow (/api/me/*). All calls go through
// apiRequest, which attaches the JWT and handles refresh.
import { apiRequest } from '../client';
import { getAccessToken } from '../authSession';
import type { UserSettings } from '../../utils/userSettings';

// ── Dashboard / analytics (admin) ──────────────────────────────────────────────
export type DashboardData = {
  summaryKpis: { id: string; label: string; value: string; subtext: string; subtextVariant: string }[];
  orgWideAvg: string;
  activeAssessments: { id: string; title: string; assignedBy: string; status: string; statusLabel: string }[];
  participation: { id: string; title: string; percent: number }[];
  recentActivity: { id: string; label: string; timeLabel: string }[];
  upcomingDeadlines: { id: string; dateShort: string; title: string; meta: string }[];
  quickActions: { id: string; label: string; href: string }[];
};
export type AnalyticsData = {
  monthlyResponses: { id: string; label: string; responses: number }[];
  surveyTypeMix: { id: string; label: string; percent: number; variant: string | null }[];
  enpsBreakdown: { id: string; label: string; percent: number; variant: string | null }[];
  weekdaySubmissionVolume: { label: string; heightPercent: number }[];
  responseTimeDistribution: { id: string; label: string; percent: number; variant: string | null }[];
  participationFunnel: { id: string; label: string; count: number; percent: number }[];
  departmentStacked: { id: string; name: string; completed: number; inProgress: number; notStarted: number }[];
  completionSparkline: number[];
  chartInsights: Record<string, string>;
};
export const getDashboard = () => apiRequest<DashboardData>('GET', 'dashboard');
export const getDashboardAnalytics = () => apiRequest<AnalyticsData>('GET', 'dashboard/analytics');

// ── Notifications ───────────────────────────────────────────────────────────────
export type NotificationItem = {
  id: string; type: string; title: string; message: string; timeLabel: string; read: boolean; link?: string | null;
};
export const listNotifications = () => apiRequest<NotificationItem[]>('GET', 'notifications');
export const markAllNotificationsRead = () => apiRequest<void>('POST', 'notifications/read-all');
export const markNotificationRead = (id: string) => apiRequest<void>('POST', `notifications/${id}/read`);

// ── Settings & profile ────────────────────────────────────────────────────────
export type ProfileData = {
  displayName: string; email: string; role: string; isAdmin: boolean;
  organization?: string; profilePictureUrl?: string | null;
};
export const getSettings = () => apiRequest<UserSettings>('GET', 'me/settings');
export const patchSettings = (partial: Partial<UserSettings>) => apiRequest<UserSettings>('PATCH', 'me/settings', partial);
export const getProfile = () => apiRequest<ProfileData>('GET', 'me/profile');
export const patchProfile = (displayName: string) => apiRequest<ProfileData>('PATCH', 'me/profile', { displayName });
/** Upload a profile picture as base64 (no multipart — keeps the JSON client simple; the server
 *  returns the updated profile with a data: URL the UI renders directly). */
export const uploadAvatar = (contentType: string, base64: string) =>
  apiRequest<ProfileData>('POST', 'me/avatar', { contentType, base64 });

// ── Reports ──────────────────────────────────────────────────────────────────────
export type UserReport = {
  id: string; assignmentId?: string | null; assessmentId: string; title: string;
  kind: string; format: string; pageCount: number; status: string; completedAt?: string | null; completedLabel: string;
};
export const listMyReports = () => apiRequest<UserReport[]>('GET', 'me/reports');

/** Fetch a report PDF (auth header required) and either download it or open it inline. */
export async function fetchReportBlob(id: string): Promise<string> {
  const res = await fetch(`/api/reports/${id}/download`, {
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
  });
  if (!res.ok) throw new Error((await res.text()) || 'Could not download report.');
  return URL.createObjectURL(await res.blob());
}

// ── Calendar ───────────────────────────────────────────────────────────────────
export type CalendarEvent = { id: string; title: string; date: string; endDate?: string | null; type: string; meta?: string | null };
export const getCalendarEvents = () => apiRequest<CalendarEvent[]>('GET', 'calendar/events');

// ── Participant taking (/api/me/assignments) ───────────────────────────────────
export type ParticipantAssignment = {
  id: string; assignmentId: string; kind: 'standard' | 'behavioral' | 'survey360';
  title: string; subtitle: string; dueLabel: string; estimatedMinutes: number;
  startAt?: string | null; endAt?: string | null;
  availability?: 'upcoming' | 'open' | 'closed';
  instructions: string[]; status: 'assigned' | 'in_progress' | 'completed';
  presentation: { mode: string; showProgressBar: boolean; behavioralShowSectionHeaders: boolean };
  questions?: unknown[]; scenarios?: unknown[]; competencies?: unknown[];
};
export type PeerItem = { id: string; name: string; role: string; avatarUrl?: string | null; relationship: string; rated: boolean };

export const listMyAssignments = () => apiRequest<ParticipantAssignment[]>('GET', 'me/assignments');
export const getMyAssignment = (assessmentId: string) =>
  apiRequest<ParticipantAssignment>('GET', `me/assignments/${assessmentId}`);
export const getDraft = <T = unknown>(assessmentId: string) =>
  apiRequest<T | undefined>('GET', `me/assignments/${assessmentId}/draft`);
export const saveDraft = (assessmentId: string, draft: unknown) =>
  apiRequest<void>('PUT', `me/assignments/${assessmentId}/draft`, draft);
export const submitAnswers = (assessmentId: string, answers: Record<string, string>) =>
  apiRequest<ParticipantAssignment>('POST', `me/assignments/${assessmentId}/submit`, { answers });
export const getPeers = (assessmentId: string) =>
  apiRequest<PeerItem[]>('GET', `me/assignments/${assessmentId}/peers`);
export const submitRatings = (assessmentId: string, ratings: Record<string, Record<string, number>>) =>
  apiRequest<{ completed: boolean; ratedPeerIds: string[] }>('POST', `me/assignments/${assessmentId}/ratings`, { ratings });
