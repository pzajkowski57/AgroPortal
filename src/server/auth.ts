/**
 * Re-exports auth utilities from the root auth module for use in server-side code.
 * This file exists for backwards compatibility with imports from @/server/auth.
 */

export { auth, signIn, signOut, handlers } from '@/auth'
export {
  getServerSession,
  requireAuth,
  requireRole,
  requireAdmin,
  hasRole,
} from '@/lib/auth-helpers'
