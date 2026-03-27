/**
 * Next.js middleware for route protection.
 * Runs on the edge runtime — uses only the edge-compatible authConfig.
 *
 * Protected route prefixes:
 *   /panel/*  — any authenticated user
 *   /admin/*  — admin role only (enforced server-side in layouts/pages)
 *
 * The `authorized` callback in auth.config.ts handles the basic auth check.
 * Fine-grained role checks (e.g. admin-only) are enforced in server components.
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
