const STORAGE_KEY = 'speksense_completed_assignments';

export type CompletedAssignmentRecord = {
  assignmentId: string;
  completedAt: string;
};

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

function loadRecords(): CompletedAssignmentRecord[] {
  if (!hasSessionStorage()) return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CompletedAssignmentRecord =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CompletedAssignmentRecord).assignmentId === 'string' &&
        typeof (item as CompletedAssignmentRecord).completedAt === 'string',
    );
  } catch {
    return [];
  }
}

function saveRecords(records: CompletedAssignmentRecord[]): void {
  if (!hasSessionStorage()) return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function markAssignmentCompleted(assignmentId: string): void {
  const records = loadRecords();
  if (records.some((r) => r.assignmentId === assignmentId)) return;
  records.push({
    assignmentId,
    completedAt: new Date().toISOString(),
  });
  saveRecords(records);
}

export function isAssignmentCompleted(assignmentId: string): boolean {
  return loadRecords().some((r) => r.assignmentId === assignmentId);
}

export function getCompletedAssignmentIds(): string[] {
  return loadRecords().map((r) => r.assignmentId);
}

export function getCompletedRecords(): CompletedAssignmentRecord[] {
  return loadRecords();
}

export function getCompletionDate(assignmentId: string): string | undefined {
  return loadRecords().find((r) => r.assignmentId === assignmentId)?.completedAt;
}
