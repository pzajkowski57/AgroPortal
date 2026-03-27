/**
 * Full NextAuth.js v5 configuration.
 * This file runs only in a Node.js context (server-side, API routes).
 * Do NOT import this in middleware — use src/auth.config.ts instead.
 */

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { db } from '@/server/db'
import type { Role } from '@/types'
import { authConfig } from './auth.config'

// ---------------------------------------------------------------------------
// Startup environment validation
// ---------------------------------------------------------------------------

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required')
}

// ---------------------------------------------------------------------------
// Input validation schema for credentials login
// ---------------------------------------------------------------------------

const credentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

function buildGoogleProvider() {
  // Google env validation is handled in auth.config.ts — no duplicate guard needed here
  return Google()
}

function buildCredentialsProvider() {
  return Credentials({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Hasło', type: 'password' },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials)
      if (!parsed.success) return null

      const { email, password } = parsed.data

      const user = await db.user.findUnique({ where: { email } })

      // Always run a bcrypt compare to prevent user-enumeration timing attacks.
      // When no real hash is available we compare against a dummy hash so the
      // execution time is indistinguishable from a real verification attempt.
      if (!user || !user.passwordHash) {
        await bcrypt.compare(
          password,
          '$2b$10$dummy.hash.to.prevent.timing.attack.padding00'
        )
        return null
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (!passwordMatch) return null

      // Return only the fields NextAuth needs
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role as Role,
      }
    },
  })
}

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Type cast needed due to version mismatch between @auth/prisma-adapter and
  // the @auth/core bundled inside next-auth@beta
  adapter: PrismaAdapter(db) as Adapter,

  // Spread edge-compatible settings (pages, authorized callback)
  ...authConfig,

  // Override providers with full Node.js versions
  providers: [buildGoogleProvider(), buildCredentialsProvider()],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // Keep the authorized callback from authConfig
    ...authConfig.callbacks,

    /**
     * Called when a JWT is created or updated.
     * Persists role and id into the token so they survive across requests.
     */
    async jwt({ token, user }) {
      if (user) {
        // First sign-in — user object is populated.
        // The next-auth.d.ts augmentation adds `role` to User so no cast is needed.
        return {
          ...token,
          id: user.id ?? token.sub ?? '',
          role: user.role,
        }
      }

      // Subsequent requests — fetch fresh role from DB to reflect changes.
      // Wrapped in try/catch so a transient DB error does not log out all users;
      // we fall back to the role already stored in the token.
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id },
            select: { role: true },
          })
          if (dbUser) {
            return { ...token, role: dbUser.role as Role }
          }
        } catch (error) {
          console.error(
            '[auth] jwt callback: DB lookup failed, using cached token role',
            error
          )
        }
      }

      return token
    },

    /**
     * Exposes id and role to the client-side session object.
     */
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      }
    },
  },
})
