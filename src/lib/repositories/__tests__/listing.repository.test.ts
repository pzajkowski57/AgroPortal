/**
 * Unit tests for the Listing repository.
 * Focuses on edge cases not fully covered by the API route tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/db', () => ({
  db: {
    listing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { db } from '@/server/db'
import {
  findListings,
  findListingById,
  findRelatedListings,
  createListing,
  updateListing,
  softDeleteListing,
} from '../listing.repository'

const mockDb = db as unknown as {
  listing: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
  }
}

const baseListing = {
  id: 'cuid-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: 'Test Listing',
  slug: 'test-listing',
  description: 'Test description.',
  price: '5000.00',
  currency: 'PLN',
  condition: 'used',
  status: 'active',
  voivodeship: '14',
  city: 'Warszawa',
  images: [],
  isHighlighted: false,
  highlightedUntil: null,
  expiresAt: null,
  metaTitle: null,
  metaDesc: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  user: { id: 'user-1', name: 'Jan Kowalski', image: null },
  category: { id: 'cat-1', name: 'Test', slug: 'test' },
}

describe('listing repository — generateSlug (via createListing)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns base slug when no conflicts exist', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([]) // no existing slugs
    mockDb.listing.create.mockResolvedValueOnce({ ...baseListing, slug: 'test-listing' })

    await createListing('user-1', {
      title: 'Test Listing',
      description: 'Test description.',
      price: 5000,
      currency: 'PLN',
      condition: 'used',
      categoryId: 'cat-1',
      voivodeship: '14',
      city: 'Warszawa',
    })

    const createCall = mockDb.listing.create.mock.calls[0][0]
    expect(createCall.data.slug).toBe('test-listing')
  })

  it('appends -2 suffix when base slug conflicts', async () => {
    // Simulate existing slug 'test-listing' already in DB
    mockDb.listing.findMany.mockResolvedValueOnce([{ slug: 'test-listing' }])
    mockDb.listing.create.mockResolvedValueOnce({ ...baseListing, slug: 'test-listing-2' })

    await createListing('user-1', {
      title: 'Test Listing',
      description: 'Test description.',
      price: 5000,
      currency: 'PLN',
      condition: 'used',
      categoryId: 'cat-1',
      voivodeship: '14',
      city: 'Warszawa',
    })

    const createCall = mockDb.listing.create.mock.calls[0][0]
    expect(createCall.data.slug).toBe('test-listing-2')
  })

  it('increments counter until a free slug is found', async () => {
    // 'test-listing', 'test-listing-2', and 'test-listing-3' are taken
    mockDb.listing.findMany.mockResolvedValueOnce([
      { slug: 'test-listing' },
      { slug: 'test-listing-2' },
      { slug: 'test-listing-3' },
    ])
    mockDb.listing.create.mockResolvedValueOnce({ ...baseListing, slug: 'test-listing-4' })

    await createListing('user-1', {
      title: 'Test Listing',
      description: 'Test description.',
      price: 5000,
      currency: 'PLN',
      condition: 'used',
      categoryId: 'cat-1',
      voivodeship: '14',
      city: 'Warszawa',
    })

    const createCall = mockDb.listing.create.mock.calls[0][0]
    expect(createCall.data.slug).toBe('test-listing-4')
  })

  it('sets machineryModelId when provided', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.create.mockResolvedValueOnce({ ...baseListing })

    await createListing('user-1', {
      title: 'Test Listing',
      description: 'Test description.',
      price: 5000,
      currency: 'PLN',
      condition: 'used',
      categoryId: 'cat-1',
      voivodeship: '14',
      city: 'Warszawa',
      machineryModelId: 'model-1',
    })

    const createCall = mockDb.listing.create.mock.calls[0][0]
    expect(createCall.data.machineryModelId).toBe('model-1')
  })
})

describe('listing repository — findListings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty listings and null nextCursor when DB has none', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const result = await findListings({ limit: 20 })

    expect(result.listings).toHaveLength(0)
    expect(result.nextCursor).toBeNull()
    expect(result.total).toBe(0)
  })

  it('returns nextCursor when more items exist than limit', async () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ ...baseListing, id: `cuid-${i}` }))
    mockDb.listing.findMany.mockResolvedValueOnce(items)
    mockDb.listing.count.mockResolvedValueOnce(21)

    const result = await findListings({ limit: 20 })

    expect(result.listings).toHaveLength(20)
    expect(result.nextCursor).toBe('cuid-19')
  })

  it('applies full-text search filter on OR clause', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, q: 'ursus' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.OR).toBeDefined()
    expect(findManyCall.where.OR[0].title.contains).toBe('ursus')
    expect(findManyCall.where.OR[1].description.contains).toBe('ursus')
  })

  it('applies cursor pagination correctly', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 10, cursor: 'prev-cursor' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.cursor).toEqual({ id: 'prev-cursor' })
    expect(findManyCall.skip).toBe(1)
  })

  it('applies both priceMin and priceMax filters together', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, priceMin: 1000, priceMax: 50000 })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.price.gte).toBe(1000)
    expect(findManyCall.where.price.lte).toBe(50000)
  })

  it('applies only priceMin when priceMax is not provided', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, priceMin: 1000 })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.price.gte).toBe(1000)
    expect(findManyCall.where.price.lte).toBeUndefined()
  })

  it('applies condition as { in: [...] } when an array is provided', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, condition: ['new', 'used'] })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.condition).toEqual({ in: ['new', 'used'] })
  })

  it('does not add condition filter when condition array is empty', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, condition: [] })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.condition).toBeUndefined()
  })

  it('orders by price ascending when sort is price_asc', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, sort: 'price_asc' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.orderBy).toContainEqual({ price: 'asc' })
  })

  it('orders by price descending when sort is price_desc', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, sort: 'price_desc' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.orderBy).toContainEqual({ price: 'desc' })
  })

  it('orders by createdAt desc when sort is newest (default)', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20 })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.orderBy).toContainEqual({ createdAt: 'desc' })
  })

  it('orders by createdAt desc when sort is popular', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, sort: 'popular' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.orderBy).toContainEqual({ createdAt: 'desc' })
  })

  it('always includes isHighlighted: desc in orderBy for promoted listings', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20, sort: 'price_asc' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.orderBy).toContainEqual({ isHighlighted: 'desc' })
  })
})

describe('listing repository — findListingById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when listing does not exist', async () => {
    mockDb.listing.findUnique.mockResolvedValueOnce(null)

    const result = await findListingById('nonexistent')
    expect(result).toBeNull()
  })

  it('returns listing when found', async () => {
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)

    const result = await findListingById('cuid-1')
    expect(result?.id).toBe('cuid-1')
  })
})

describe('listing repository — findRelatedListings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('excludes the source listing from results', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await findRelatedListings({ id: 'cuid-1', categoryId: 'cat-1' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.id.not).toBe('cuid-1')
  })

  it('limits results to 4', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await findRelatedListings({ id: 'cuid-1', categoryId: 'cat-1' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.take).toBe(4)
  })
})

describe('listing repository — updateListing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('strips undefined fields from update data', async () => {
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, title: 'Nowy tytul' })

    await updateListing('cuid-1', { title: 'Nowy tytul' })

    const updateCall = mockDb.listing.update.mock.calls[0][0]
    expect(updateCall.data).toEqual({ title: 'Nowy tytul' })
  })
})

describe('listing repository — softDeleteListing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets status to sold', async () => {
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, status: 'sold' })

    await softDeleteListing('cuid-1')

    const updateCall = mockDb.listing.update.mock.calls[0][0]
    expect(updateCall.data.status).toBe('sold')
    expect(updateCall.where.id).toBe('cuid-1')
  })
})
