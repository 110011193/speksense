import { isAdminUser } from './sessionUser';

const STORAGE_KEY = 'speksense_user_settings';

export type UserSettings = {
  assessmentReminders: boolean;
  reportReady: boolean;
  calendarDeadlines: boolean;
  includeNameInHrExports: boolean;
};

function hasSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

export function getDefaultUserSettings(): UserSettings {
  return {
    assessmentReminders: true,
    reportReady: true,
    calendarDeadlines: true,
    includeNameInHrExports: isAdminUser(),
  };
}

export function loadUserSettings(): UserSettings {
  const defaults = getDefaultUserSettings();
  if (!hasSessionStorage()) return defaults;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function saveUserSettings(partial: Partial<UserSettings>): UserSettings {
  const next = { ...loadUserSettings(), ...partial };
  if (hasSessionStorage()) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearUserSettings(): void {
  if (!hasSessionStorage()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}
