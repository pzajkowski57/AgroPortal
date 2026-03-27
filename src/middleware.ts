/**
 * Next.js middleware for route protection.
 * Runs on the edge runtime — uses only the edge-compatible authConfig.
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

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static (Next.js static files)
     *   - _next/image  (Next.js image optimisation)
     *   - favicon.ico
     *   - Public assets (files with extensions: images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$).*)',
  ],
}
