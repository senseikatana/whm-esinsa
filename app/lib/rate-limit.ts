const WINDOW_MS = 60_000;
const MAX_ENTRIES = 5_000;

interface Bucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Best-effort in-memory rate limit.
 * Per server instance only; enough to stop accidental loops, not a WAF.
 */
export function rateLimit(key: string, limit: number, windowMs = WINDOW_MS): boolean {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		if (buckets.size > MAX_ENTRIES) {
			for (const [entryKey, entry] of buckets) {
				if (entry.resetAt <= now) buckets.delete(entryKey);
			}
		}
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return true;
	}

	if (bucket.count >= limit) return false;
	bucket.count += 1;
	return true;
}
