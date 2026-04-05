/**
 * Rate limiting using Upstash Ratelimit with sliding window algorithm.
 *
 * Three limiters are exported for different route categories:
 *   - apiLimiter    — general API routes (/api/v1/*)
 *   - authLimiter   — authentication routes (/api/auth/*)
 *   - uploadLimiter — file upload routes (/api/v1/upload/*)
 *
 * When Upstash env vars are not configured (local dev without Redis),
 * all rate limit checks are bypassed and requests pass through.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const isUpstashConfigured =
  typeof process.env.UPSTASH_REDIS_REST_URL === 'string' &&
  process.env.UPSTASH_REDIS_REST_URL.length > 0 &&
  typeof process.env.UPSTASH_REDIS_REST_TOKEN === 'string' &&
  process.env.UPSTASH_REDIS_REST_TOKEN.length > 0

function createRedis(): Redis | null {
  if (!isUpstashConfigured) {
    return null
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  })
}

const redis = createRedis()

/** 60 requests per 60 seconds — general API routes */
export const apiLimiter: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      prefix: 'rl:api',
    })
  : null

/** 5 requests per 15 minutes — login / register routes */
export const authLimiter: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'rl:auth',
    })
  : null

/** 10 requests per 1 hour — file upload routes */
export const uploadLimiter: Ratelimit | null = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 m'),
      prefix: 'rl:upload',
    })
  : null

/**
 * Extracts the client IP address from a Request object.
 *
 * Priority order:
 *   1. x-forwarded-for (first IP in the chain — the original client)
 *   2. x-real-ip
 *   3. Fallback to '127.0.0.1' for local / unknown environments
 */
export function getRateLimitIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim()
    if (firstIp.length > 0) {
      return firstIp
    }
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim()
  }

  return '127.0.0.1'
}
