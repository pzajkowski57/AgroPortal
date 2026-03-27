/**
 * NextAuth.js v5 route handler.
 * Delegates all /api/auth/* requests to NextAuth.
 */

import { handlers } from '@/auth'

export const { GET, POST } = handlers
