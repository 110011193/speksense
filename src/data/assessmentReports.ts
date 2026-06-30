import { getAssignment } from './assessments';
import { getCompletedRecords } from '../utils/assignmentProgress';

export type UserReport = {
  id: string;
  assignmentId: string;
  title: string;
  format: 'PDF';
  pageCount: number;
  completedAt: string;
  completedLabel: string;
};

const PAGE_COUNTS: Record<string, number> = {
  '360-feedback': 14,
  'onboarding-experience': 6,
  'wellness-check': 4,
  'q4-culture': 12,
  'security-awareness': 3,
  'behavioral-assessment': 18,
};

function formatCompletedLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function getReportsForUser(): UserReport[] {
  return getCompletedRecords()
    .map((record) => {
      const assignment = getAssignment(record.assignmentId);
      if (!assignment) return null;
      return {
        id: `report-${record.assignmentId}`,
        assignmentId: record.assignmentId,
        title: `${assignment.title} — Report`,
        format: 'PDF' as const,
        pageCount: PAGE_COUNTS[record.assignmentId] ?? 8,
        completedAt: record.completedAt,
        completedLabel: formatCompletedLabel(record.completedAt),
      };
    })
    .filter((r): r is UserReport => r !== null);
}
