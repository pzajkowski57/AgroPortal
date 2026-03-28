import type { ListingStatus, ListingCondition } from '@/types'

export interface MockListing {
  id: string
  userId: string | null
  categoryId: string
  title: string
  slug: string
  description: string
  price: string
  currency: string
  condition: ListingCondition
  status: ListingStatus
  voivodeship: string
  city: string
  isHighlighted: boolean
  highlightedUntil: Date | null
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

let listingCounter = 0

export function createListing(overrides: Partial<MockListing> = {}): MockListing {
  listingCounter += 1

  const title = overrides.title ?? `Maszyna rolnicza ${listingCounter}`
  const slug =
    overrides.slug ??
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')

  return {
    id: `listing-${listingCounter}`,
    userId: `user-1`,
    categoryId: `category-1`,
    title,
    slug,
    description: `Opis ogłoszenia numer ${listingCounter}. Stan bardzo dobry.`,
    price: '50000.00',
    currency: 'PLN',
    condition: 'used',
    status: 'active',
    voivodeship: '14',
    city: 'Warszawa',
    isHighlighted: false,
    highlightedUntil: null,
    expiresAt: new Date('2025-12-31T00:00:00.000Z'),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

export function createHighlightedListing(
  overrides: Partial<MockListing> = {},
): MockListing {
  return createListing({
    isHighlighted: true,
    highlightedUntil: new Date('2025-06-30T00:00:00.000Z'),
    ...overrides,
  })
}

export function createDraftListing(overrides: Partial<MockListing> = {}): MockListing {
  return createListing({ status: 'draft', ...overrides })
}
