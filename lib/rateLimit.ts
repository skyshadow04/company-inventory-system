type Entry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10;

const map = new Map<string, Entry>();

export function isRateLimited(key: string) {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) return true;

  entry.count += 1;
  map.set(key, entry);
  return false;
}

export function getRateLimitInfo(key: string) {
  const entry = map.get(key);
  if (!entry) return { remaining: MAX_REQUESTS, resetIn: WINDOW_MS };
  return { remaining: Math.max(0, MAX_REQUESTS - entry.count), resetIn: Math.max(0, entry.resetAt - Date.now()) };
}
