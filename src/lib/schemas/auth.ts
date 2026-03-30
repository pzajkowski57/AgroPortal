import { z } from 'zod'

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email('Podaj poprawny adres e-mail'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
    email: z.string().email('Podaj poprawny adres e-mail'),
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej jedną wielką literę')
      .regex(/[0-9]/, 'Hasło musi zawierać co najmniej jedną cyfrę'),
    confirmPassword: z.string(),
    terms: z.literal('on', {
      errorMap: () => ({ message: 'Musisz zaakceptować regulamin' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>
