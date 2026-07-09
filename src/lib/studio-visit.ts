const STORAGE_KEY = "lunar:studio:last-visit";

/** Days away before Studio landing uses welcome-back copy. */
export const STUDIO_AWAY_MS = 3 * 24 * 60 * 60 * 1000;

export function isStudioReturnAfterAway(now = Date.now()): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const last = Date.parse(raw);
  if (Number.isNaN(last)) return false;
  return now - last >= STUDIO_AWAY_MS;
}

export function recordStudioVisit(now = Date.now()): void {
  localStorage.setItem(STORAGE_KEY, new Date(now).toISOString());
}
