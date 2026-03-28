/**
 * Next.js middleware for route protection and rate limiting.
 * Runs on the edge runtime — uses only edge-compatible APIs.
 *
 * Execution order:
 *   1. Rate limiting (Upstash) — returns 429 if limit exceeded
 *   2. NextAuth auth check — redirects unauthenticated users
 *
 * Rate limit tiers:
 *   /api/auth/*       — authLimiter   (5 req / 15 min)
 *   /api/v1/upload/*  — uploadLimiter (10 req / 1 h)
 *   /api/v1/*         — apiLimiter    (60 req / 60 s)
 *
 * When Upstash env vars are absent (local dev without Redis),
 * rate limiting is skipped entirely.
 *
 * Protected route prefixes:
 *   /panel/*  — any authenticated user
 *   /admin/*  — admin role only (enforced in the `authorized` callback)
 *
 * The `authorized` callback in auth.config.ts handles both the auth check
 * and the admin role guard for /admin/* routes.
 */

import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  getRateLimitIdentifier,
} from './lib/rate-limit'
import type { Ratelimit } from '@upstash/ratelimit'

const { auth } = NextAuth(authConfig)

function selectLimiter(pathname: string): Ratelimit | null {
  if (pathname.startsWith('/api/auth/')) return authLimiter
  if (pathname.startsWith('/api/v1/upload/')) return uploadLimiter
  if (pathname.startsWith('/api/v1/')) return apiLimiter
  return null
}

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl
  const limiter = selectLimiter(pathname)

  if (limiter !== null) {
    const identifier = getRateLimitIdentifier(request)
    const result = await limiter.limit(identifier)

    if (!result.success) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      })
    }
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static (Next.js static files)
     *   - _next/image  (Next.js image optimisation)
     *   - favicon.ico
     *   - Public assets (files with extensions: images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)',
  ],
}
