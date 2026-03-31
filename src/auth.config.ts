/**
 * Edge-compatible NextAuth configuration.
 * This file must NOT import any Node.js-only modules (e.g. bcryptjs, PrismaClient).
 * It is used by middleware which runs on the edge runtime.
 */

import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

/**
 * Validates that required Google OAuth env vars are present.
 * Throws at startup if misconfigured, giving a clear error message.
 */
function resolveGoogleProvider(): NextAuthConfig['providers'][number] | null {
  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET

  if (!clientId || !clientSecret || clientId === 'placeholder' || clientSecret === 'placeholder') {
    console.warn(
      'Google OAuth is not configured. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in your .env file. Google login will be disabled.'
    )
    return null
  }

  return Google({ clientId, clientSecret })
}

function resolveProviders(): NextAuthConfig['providers'] {
  const google = resolveGoogleProvider()
  return google ? [google] : []
}

export const authConfig: NextAuthConfig = {
  providers: resolveProviders(),
  pages: {
    signIn: '/logowanie',
    error: '/logowanie',
  },
  callbacks: {
    /**
     * Controls which routes require authentication and role-based access.
     * Runs on the edge — no DB calls allowed here.
     *
     * /panel/*  — any authenticated user
     * /admin/*  — admin role only
     */
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl

      // Public routes — allow through unconditionally
      if (!pathname.startsWith('/panel') && !pathname.startsWith('/admin')) {
        return true
      }

      const isLoggedIn = !!session?.user
      if (!isLoggedIn) return false

      // Admin routes require the admin role.
      // The JWT token carries `role` via the session callback in auth.ts.
      if (pathname.startsWith('/admin')) {
        return (session.user as { role?: string }).role === 'admin'
      }

      // /panel/* — any authenticated user
      return true
    },
  },
}
