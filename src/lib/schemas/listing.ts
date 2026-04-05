/**
 * Zod schemas for the Listing resource.
 * Used by both API route handlers and the repository layer.
 */

import { z } from 'zod'
import { isValidVoivodeshipCode } from '@/lib/utils/voivodeships'

// ---------------------------------------------------------------------------
// Shared field definitions
// ---------------------------------------------------------------------------

const conditionValues = ['new', 'used', 'for_parts'] as const
const currencyValues = ['PLN', 'EUR', 'USD'] as const

const voivodeshipField = z
  .string()
  .refine((val) => isValidVoivodeshipCode(val), { message: 'Invalid voivodeship code' })

// ---------------------------------------------------------------------------
// Create schema
// ---------------------------------------------------------------------------

export const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(10000),
  price: z.number().nonnegative(),
  currency: z.enum(currencyValues).default('PLN'),
  condition: z.enum(conditionValues),
  categoryId: z.string().min(1),
  voivodeship: voivodeshipField,
  city: z.string().min(1).max(100),
  machineryModelId: z.string().optional(),
  metaTitle: z.string().max(160).optional(),
  metaDesc: z.string().max(320).optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>

// ---------------------------------------------------------------------------
// Patch schema defined independently with only safe, user-editable fields
// ---------------------------------------------------------------------------

export const patchListingSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(10000).optional(),
    price: z.number().nonnegative().optional(),
    currency: z.enum(currencyValues).optional(),
    condition: z.enum(conditionValues).optional(),
    voivodeship: voivodeshipField.optional(),
    categoryId: z.string().min(1).optional(),
    imageKeys: z.array(z.string()).optional(),
    contact: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export type PatchListingInput = z.infer<typeof patchListingSchema>

// ---------------------------------------------------------------------------
// Query params schema for GET /listings
// ---------------------------------------------------------------------------

const sortValues = ['newest', 'price_asc', 'price_desc', 'popular'] as const
export type SortValue = (typeof sortValues)[number]

export const listingsQuerySchema = z.object({
  category: z.string().optional(),
  voivodeship: z.string().optional(),
  priceMin: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .pipe(z.number().nonnegative().optional()),
  priceMax: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .pipe(z.number().nonnegative().optional()),
  condition: z
    .preprocess(
      (val) => {
        if (Array.isArray(val)) return val
        if (typeof val === 'string') return [val]
        return val
      },
      z.array(z.enum(conditionValues)).optional(),
    ),
  sort: z.enum(sortValues).optional(),
  q: z.string().max(200).optional(),
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = val !== undefined ? Number(val) : 20
      if (isNaN(num) || !Number.isInteger(num) || num < 1) return 20
      return Math.min(num, 100)
    }),
})

export type ListingsQuery = z.infer<typeof listingsQuerySchema>