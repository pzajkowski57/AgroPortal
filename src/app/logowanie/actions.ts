'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'
import { loginSchema } from '@/lib/schemas/auth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginActionState {
  error?: string
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]
    return { error: firstError?.message ?? 'Nieprawidłowe dane' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/',
    })
    return {}
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { error: 'Nieprawidłowy e-mail lub hasło' }
        default:
          return { error: 'Wystąpił błąd podczas logowania. Spróbuj ponownie.' }
      }
    }
    // Next.js throws NEXT_REDIRECT for successful redirects — rethrow it.
    throw err
  }
}
