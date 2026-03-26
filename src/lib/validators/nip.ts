import { z } from 'zod'

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7] as const

/**
 * Validates a Polish NIP (tax ID) number using checksum algorithm.
 * Accepts formats: 1234567890, 123-456-78-90, 123-45-67-890
 */
export function validateNip(nip: string): boolean {
  const clean = nip.replace(/[-\s]/g, '')

  if (!/^\d{10}$/.test(clean)) return false

  const digits = clean.split('').map(Number)
  const checksum = NIP_WEIGHTS.reduce(
    (sum, weight, i) => sum + weight * digits[i],
    0
  )

  return checksum % 11 === digits[9]
}

export const nipSchema = z
  .string()
  .min(10, 'NIP musi mieć co najmniej 10 cyfr')
  .refine(validateNip, { message: 'Nieprawidłowy numer NIP' })

export function formatNip(nip: string): string {
  const clean = nip.replace(/[-\s]/g, '')
  if (clean.length !== 10) return nip
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 8)}-${clean.slice(8)}`
}
