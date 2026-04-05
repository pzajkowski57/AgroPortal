/**
 * Security headers applied globally via next.config.ts headers().
 *
 * CSP is configured for Next.js + Google OAuth + Cloudflare R2:
 *   - 'unsafe-eval' and 'unsafe-inline' in script-src are required by Next.js
 *     dev mode and some RSC hydration internals.
 *   - Cloudflare R2 public URLs are allowed in img-src.
 *   - Google OAuth endpoints are allowed in connect-src.
 */

export interface SecurityHeader {
  key: string
  value: string
}

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: *.r2.cloudflarestorage.com lh3.googleusercontent.com",
  "connect-src 'self' *.google.com",
  "frame-src 'none'",
]
  .join('; ')
  .trim()

export const securityHeaders: SecurityHeader[] = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: csp,
  },
]
