const STORAGE_PREFIX = 'poem_game_';

export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function storageGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(getStorageKey(key));
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] Failed to get "${key}":`, e);
    return defaultValue;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch (e) {
    console.warn(`[storage] Failed to set "${key}":`, e);
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch (e) {
    console.warn(`[storage] Failed to remove "${key}":`, e);
  }
}

export function storageClearAll(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export const HISTORY_KEY = 'game_history';
export const RECENT_CHARS_KEY = 'recent_chars';
export const BEST_SCORE_KEY = 'best_score';
export const ACHIEVEMENTS_KEY = 'achievements';
