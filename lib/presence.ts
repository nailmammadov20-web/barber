const ONLINE_WINDOW_MS = 90_000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isOnline(lastActiveAt: Date | null): boolean {
  return !!lastActiveAt && Date.now() - lastActiveAt.getTime() < ONLINE_WINDOW_MS;
}

export function isNewSince(createdAt: Date, days: number): boolean {
  return createdAt.getTime() >= Date.now() - days * DAY_MS;
}

export function isInactiveSince(lastActiveAt: Date | null, days: number): boolean {
  return !lastActiveAt || lastActiveAt.getTime() < Date.now() - days * DAY_MS;
}
