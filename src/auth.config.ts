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
function resolveGoogleProvider(): NextAuthConfig['providers'][number] {
  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(
      'Google OAuth is not configured. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in your .env file.'
    )
  }

  return Google({ clientId, clientSecret })
}

export const authConfig: NextAuthConfig = {
  providers: [resolveGoogleProvider()],
  pages: {
    signIn: '/logowanie',
    error: '/logowanie',
  },
  callbacks: {
    /**
     * Controls which routes require authentication.
     * Runs on the edge — no DB calls allowed here.
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl

      const isProtected =
        pathname.startsWith('/panel') || pathname.startsWith('/admin')

      if (!isProtected) return true

      const isLoggedIn = !!auth?.user
      return isLoggedIn
    },
  },
}
