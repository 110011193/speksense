export function storageKey(assignmentId: string): string {
  return `speksense_survey_${assignmentId}`;
}

export type SurveyDraft = {
  step: number;
  answers: Record<string, string>;
};

export function loadDraft(assignmentId: string): SurveyDraft | null {
  try {
    const raw = sessionStorage.getItem(storageKey(assignmentId));
    if (!raw) return null;
    return JSON.parse(raw) as SurveyDraft;
  } catch {
    return null;
  }
}

export function saveDraft(assignmentId: string, draft: SurveyDraft): void {
  sessionStorage.setItem(storageKey(assignmentId), JSON.stringify(draft));
}

export function clearDraft(assignmentId: string): void {
  sessionStorage.removeItem(storageKey(assignmentId));
}
