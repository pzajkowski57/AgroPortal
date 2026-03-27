/**
 * Server-side authentication helpers.
 * Import these in Server Components, Server Actions, and API route handlers.
 * Do NOT use in client components — use the `useSession` hook instead.
 */

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import type { Role } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthenticatedUser {
  id: string
  role: Role
  email: string
  name?: string | null
  image?: string | null
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Returns the current session, or null if the user is not authenticated.
 * Wraps NextAuth's `auth()` for consistent usage across the codebase.
 */
export async function getServerSession() {
  return auth()
}

/**
 * Returns the authenticated user, or redirects to the login page.
 * Use this in Server Components or Server Actions that require a logged-in user.
 *
 * @param redirectTo - Path to redirect unauthenticated users to. Defaults to /logowanie.
 */
export async function requireAuth(
  redirectTo: string = '/logowanie'
): Promise<AuthenticatedUser> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(redirectTo)
  }

  return session.user as AuthenticatedUser
}

/**
 * Returns the authenticated user only if they have one of the allowed roles.
 * Redirects to the login page if unauthenticated, or to a forbidden page if
 * the user's role does not match.
 *
 * @param allowedRoles - One or more roles that are permitted.
 * @param options.loginRedirect  - Where to redirect unauthenticated users.
 * @param options.forbiddenRedirect - Where to redirect users with insufficient role.
 */
export async function requireRole(
  allowedRoles: Role | readonly Role[],
  options: {
    loginRedirect?: string
    forbiddenRedirect?: string
  } = {}
): Promise<AuthenticatedUser> {
  const { loginRedirect = '/logowanie', forbiddenRedirect = '/' } = options

  const session = await auth()

  if (!session?.user?.id) {
    redirect(loginRedirect)
  }

  const user = session.user as AuthenticatedUser
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(user.role)) {
    redirect(forbiddenRedirect)
  }

  return user
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/**
 * Shorthand for requiring the admin role.
 * Redirects non-admins to the home page.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole('admin', { forbiddenRedirect: '/' })
}

/**
 * Returns true if the current session user has one of the given roles.
 * Does NOT redirect — use this for conditional rendering in server components.
 */
export async function hasRole(roles: Role | readonly Role[]): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false

  const user = session.user as AuthenticatedUser
  const roleList = Array.isArray(roles) ? roles : [roles]
  return roleList.includes(user.role)
}
