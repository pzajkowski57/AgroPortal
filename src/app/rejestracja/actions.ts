'use server'

import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { Prisma } from '@prisma/client'
import { signIn } from '@/auth'
import { db } from '@/server/db'
import { registerSchema } from '@/lib/schemas/auth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RegisterActionState {
  error?: string
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    terms: formData.get('terms'),
  }

  const parsed = registerSchema.safeParse(rawData)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { error: firstError?.message ?? 'Nieprawidłowe dane' }
  }

  const { name, email, password } = parsed.data

  // Check for duplicate e-mail
  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: 'Konto z tym adresem e-mail już istnieje' }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  try {
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'user',
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Konto z tym adresem e-mail już istnieje' }
    }
    throw err
  }

  // Auto-login after registration
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/',
    })
    return {}
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return { error: 'Konto zostało utworzone, ale logowanie nie powiodło się. Zaloguj się ręcznie.' }
    }
    throw err
  }
}
