// Production-ready in-memory sliding window rate limiter
// Protects authentication endpoints, lead submissions, and public APIs

interface RateLimitRecord {
  count: number;
  resetTimeMs: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleRecords(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTimeMs <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeMs: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  cleanupStaleRecords();

  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetTimeMs <= now) {
    // New window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTimeMs: now + windowMs
    };
    rateLimitStore.set(key, newRecord);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTimeMs: newRecord.resetTimeMs,
      retryAfterSeconds: 0
    };
  }

  // Existing window
  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetTimeMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetTimeMs: existing.resetTimeMs,
      retryAfterSeconds
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetTimeMs: existing.resetTimeMs,
    retryAfterSeconds: 0
  };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

// Preconfigured limiters for critical application surfaces:
// 1. Lead / Inquiry Form: 5 submissions per 15 minutes per IP
export function checkLeadSubmissionRateLimit(clientIp: string): RateLimitResult {
  return checkRateLimit(`lead_${clientIp}`, 5, 15 * 60 * 1000);
}

// 2. Admin Login Brute Force Protection: 5 failed attempts per 15 minutes per IP
export function checkAdminLoginRateLimit(clientIp: string): RateLimitResult {
  return checkRateLimit(`login_${clientIp}`, 5, 15 * 60 * 1000);
}

// 3. Media Upload Rate Limit: 30 uploads per 10 minutes per IP
export function checkUploadRateLimit(clientIp: string): RateLimitResult {
  return checkRateLimit(`upload_${clientIp}`, 30, 10 * 60 * 1000);
}

// 4. General Public API Endpoint Rate Limit: 120 requests per minute per IP
export function checkGeneralApiRateLimit(clientIp: string): RateLimitResult {
  return checkRateLimit(`api_${clientIp}`, 120, 60 * 1000);
}
