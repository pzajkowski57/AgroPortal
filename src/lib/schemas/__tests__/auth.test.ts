import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '../auth'

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------

describe('loginSchema', () => {
  describe('valid input', () => {
    it('accepts a valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1',
      })
      expect(result.success).toBe(true)
    })

    it('accepts a password with exactly 8 characters', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '12345678',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid email', () => {
    it('rejects a missing email', () => {
      const result = loginSchema.safeParse({ password: 'Password1' })
      expect(result.success).toBe(false)
    })

    it('rejects an empty email string', () => {
      const result = loginSchema.safeParse({ email: '', password: 'Password1' })
      expect(result.success).toBe(false)
    })

    it('rejects a non-email string', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Password1' })
      expect(result.success).toBe(false)
    })

    it('rejects null email', () => {
      const result = loginSchema.safeParse({ email: null, password: 'Password1' })
      expect(result.success).toBe(false)
    })
  })

  describe('invalid password', () => {
    it('rejects a password shorter than 8 characters', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short' })
      expect(result.success).toBe(false)
    })

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
      expect(result.success).toBe(false)
    })

    it('rejects a missing password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' })
      expect(result.success).toBe(false)
    })

    it('rejects null password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: null })
      expect(result.success).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('rejects empty object', () => {
      const result = loginSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects null input', () => {
      const result = loginSchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    it('accepts email with subdomains and plus-addressing', () => {
      const result = loginSchema.safeParse({
        email: 'user+tag@mail.example.co.uk',
        password: 'Password1',
      })
      expect(result.success).toBe(true)
    })

    it('accepts a very long password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'A'.repeat(100) + '1',
      })
      expect(result.success).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------

describe('registerSchema', () => {
  const validInput = {
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    terms: 'on' as const,
  }

  describe('valid input', () => {
    it('accepts fully valid registration data', () => {
      const result = registerSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('accepts a name with exactly 2 characters', () => {
      const result = registerSchema.safeParse({ ...validInput, name: 'Jo' })
      expect(result.success).toBe(true)
    })

    it('accepts a password with one uppercase and one digit', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: 'Abcdefg1',
        confirmPassword: 'Abcdefg1',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid name', () => {
    it('rejects a name shorter than 2 characters', () => {
      const result = registerSchema.safeParse({ ...validInput, name: 'J' })
      expect(result.success).toBe(false)
    })

    it('rejects an empty name', () => {
      const result = registerSchema.safeParse({ ...validInput, name: '' })
      expect(result.success).toBe(false)
    })

    it('rejects a missing name', () => {
      const { name: _name, ...withoutName } = validInput
      const result = registerSchema.safeParse(withoutName)
      expect(result.success).toBe(false)
    })
  })

  describe('invalid email', () => {
    it('rejects an invalid email', () => {
      const result = registerSchema.safeParse({ ...validInput, email: 'bad-email' })
      expect(result.success).toBe(false)
    })

    it('rejects an empty email', () => {
      const result = registerSchema.safeParse({ ...validInput, email: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('invalid password', () => {
    it('rejects a password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: 'P1aaaa',
        confirmPassword: 'P1aaaa',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a password without an uppercase letter', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: 'password1',
        confirmPassword: 'password1',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a password without a number', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: 'PasswordA',
        confirmPassword: 'PasswordA',
      })
      expect(result.success).toBe(false)
    })

    it('rejects an empty password', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: '',
        confirmPassword: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('confirmPassword mismatch', () => {
    it('rejects when passwords do not match', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: 'Password1',
        confirmPassword: 'Password2',
      })
      expect(result.success).toBe(false)
    })

    it('rejects when confirmPassword is missing', () => {
      const { confirmPassword: _cp, ...withoutConfirm } = validInput
      const result = registerSchema.safeParse(withoutConfirm)
      expect(result.success).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('rejects empty object', () => {
      const result = registerSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects null input', () => {
      const result = registerSchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    it('accepts special characters in name', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        name: 'Ján Novák-Kowalský',
      })
      expect(result.success).toBe(true)
    })

    it('accepts email with unicode domain', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        email: 'user@example.com',
      })
      expect(result.success).toBe(true)
    })
  })
})
