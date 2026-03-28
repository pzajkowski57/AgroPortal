/**
 * Zod schemas for the Listing resource.
 * Used by both API route handlers and the repository layer.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared field definitions
// ---------------------------------------------------------------------------

const conditionValues = ['new', 'used', 'for_parts'] as const

// ---------------------------------------------------------------------------
// Create schema
// ---------------------------------------------------------------------------

export const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(10000),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default('PLN'),
  condition: z.enum(conditionValues),
  categoryId: z.string().min(1),
  voivodeship: z.string().min(1).max(10),
  city: z.string().min(1).max(100),
  machineryModelId: z.string().optional(),
  metaTitle: z.string().max(160).optional(),
  metaDesc: z.string().max(320).optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>

// ---------------------------------------------------------------------------
// Patch schema (all fields optional)
// ---------------------------------------------------------------------------

export const patchListingSchema = createListingSchema.partial()

export type PatchListingInput = z.infer<typeof patchListingSchema>

// ---------------------------------------------------------------------------
// Query params schema for GET /listings
// ---------------------------------------------------------------------------

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
  condition: z.enum(conditionValues).optional(),
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
