/**
 * Unit tests for the Listing repository.
 * Covers FTS helpers (sanitizeSearchQuery, buildTsQuery — tested indirectly via
 * searchListings/findListings) as well as the full CRUD surface.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declared before any imports of the module under test
// ---------------------------------------------------------------------------

vi.mock('@/server/db', () => ({
  db: {
    $queryRawUnsafe: vi.fn(),
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
  searchListings,
  searchSuggestions,
  findListingById,
  findRelatedListings,
  createListing,
  updateListing,
  softDeleteListing,
} from '../listing.repository'

// ---------------------------------------------------------------------------
// Typed mock helpers
// ---------------------------------------------------------------------------

const mockDb = db as unknown as {
  $queryRawUnsafe: ReturnType<typeof vi.fn>
  listing: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseListing = {
  id: 'cuid-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  machineryModelId: null,
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

// Helpers to set up the two $queryRawUnsafe calls that searchListings makes
// (data rows first, count rows second).
function mockFtsQuery(rows: typeof baseListing[], total = rows.length) {
  mockDb.$queryRawUnsafe
    .mockResolvedValueOnce(rows)                        // data SQL
    .mockResolvedValueOnce([{ total: BigInt(total) }])  // count SQL
}

// ---------------------------------------------------------------------------
// sanitizeSearchQuery — tested indirectly via searchListings / findListings
// ---------------------------------------------------------------------------

describe('sanitizeSearchQuery (via searchListings)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty result for blank-only query', async () => {
    const result = await searchListings({ q: '   ' })
    expect(result.listings).toHaveLength(0)
    expect(result.nextCursor).toBeNull()
    expect(result.total).toBe(0)
    expect(mockDb.$queryRawUnsafe).not.toHaveBeenCalled()
  })

  it('trims leading and trailing whitespace before executing the query', async () => {
    mockFtsQuery([baseListing])
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])

    await searchListings({ q: '  ursus  ' })

    // The sanitised string 'ursus' should appear as the second parameter ($2 = similarity arg)
    const firstCall = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(firstCall).toContain('ursus')
  })

  it('collapses multiple internal spaces', async () => {
    mockFtsQuery([baseListing])
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])

    await searchListings({ q: 'ursus   c360' })

    // With collapsed spaces the tsQuery becomes 'ursus:* & c360:*'
    const firstCall = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(firstCall).toContain('ursus:* & c360:*')
  })
})

// ---------------------------------------------------------------------------
// buildTsQuery — tested indirectly via the $queryRawUnsafe call args
// ---------------------------------------------------------------------------

describe('buildTsQuery (via searchListings)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('produces "word:*" for a single-word query', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ursus' })

    const firstCall = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(firstCall).toContain('ursus:*')
  })

  it('joins multiple words with " & " and appends ":*" to each', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ciagnik ursus' })

    const firstCall = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(firstCall).toContain('ciagnik:* & ursus:*')
  })

  it('handles extra internal whitespace the same as single spaces', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ciagnik   ursus' })

    const firstCall = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(firstCall).toContain('ciagnik:* & ursus:*')
  })
})

// ---------------------------------------------------------------------------
// searchListings — SQL construction & result handling
// ---------------------------------------------------------------------------

describe('searchListings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty results for blank query without hitting the DB', async () => {
    const result = await searchListings({ q: '' })
    expect(result).toEqual({ listings: [], nextCursor: null, total: 0 })
    expect(mockDb.$queryRawUnsafe).not.toHaveBeenCalled()
  })

  it('calls $queryRawUnsafe twice (data + count) for a valid query', async () => {
    mockFtsQuery([baseListing])
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])

    await searchListings({ q: 'ursus' })

    expect(mockDb.$queryRawUnsafe).toHaveBeenCalledTimes(2)
  })

  it('includes the category sub-select when category filter is provided', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ursus', category: 'ciagniki' })

    const dataSql = mockDb.$queryRawUnsafe.mock.calls[0][0] as string
    expect(dataSql).toContain('"categoryId"')
    expect(dataSql).toContain('categories')
    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain('ciagniki')
  })

  it('includes voivodeship filter when provided', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ursus', voivodeship: '14' })

    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain('14')
    const dataSql = mockDb.$queryRawUnsafe.mock.calls[0][0] as string
    expect(dataSql).toContain('voivodeship')
  })

  it('includes priceMin filter when provided', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ursus', priceMin: 1000 })

    const dataSql = mockDb.$queryRawUnsafe.mock.calls[0][0] as string
    expect(dataSql).toContain('price >=')
    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain(1000)
  })

  it('includes priceMax filter when provided', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ursus', priceMax: 50000 })

    const dataSql = mockDb.$queryRawUnsafe.mock.calls[0][0] as string
    expect(dataSql).toContain('price <=')
    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain(50000)
  })

  it('includes condition cast filter when provided', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ursus', condition: 'new' })

    const dataSql = mockDb.$queryRawUnsafe.mock.calls[0][0] as string
    expect(dataSql).toContain('"ListingCondition"')
    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain('new')
  })

  it('includes cursor condition when cursor is provided', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await searchListings({ q: 'ursus', cursor: 'prev-id' })

    const dataSql = mockDb.$queryRawUnsafe.mock.calls[0][0] as string
    expect(dataSql).toContain('l.id <')
    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain('prev-id')
  })

  it('returns nextCursor when raw rows exceed limit', async () => {
    const rows = Array.from({ length: 21 }, (_, i) => ({ ...baseListing, id: `cuid-${i}` }))
    mockFtsQuery(rows, 21)
    const hydratedRows = rows.slice(0, 20).map((r) => ({ ...r }))
    mockDb.listing.findMany.mockResolvedValueOnce(hydratedRows)

    const result = await searchListings({ q: 'ursus', limit: 20 })

    expect(result.listings).toHaveLength(20)
    expect(result.nextCursor).toBe('cuid-19')
    expect(result.total).toBe(21)
  })

  it('returns null nextCursor when rows do not exceed limit', async () => {
    mockFtsQuery([baseListing], 1)
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])

    const result = await searchListings({ q: 'ursus', limit: 20 })

    expect(result.nextCursor).toBeNull()
  })

  it('re-hydrates results through db.listing.findMany with correct IDs', async () => {
    mockFtsQuery([baseListing], 1)
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])

    await searchListings({ q: 'ursus' })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.id.in).toContain('cuid-1')
    expect(findManyCall.include.images).toBeDefined()
    expect(findManyCall.include.category).toBeDefined()
    expect(findManyCall.include.user).toBeDefined()
  })

  it('preserves FTS rank order in the returned listings', async () => {
    const row1 = { ...baseListing, id: 'rank-1' }
    const row2 = { ...baseListing, id: 'rank-2' }
    // Raw rows come back in rank order: rank-1 first, rank-2 second
    mockFtsQuery([row1, row2], 2)
    // findMany returns them in a different (arbitrary) order
    mockDb.listing.findMany.mockResolvedValueOnce([row2, row1])

    const result = await searchListings({ q: 'ursus' })

    // Should be re-ordered to match the raw FTS rank
    expect(result.listings[0].id).toBe('rank-1')
    expect(result.listings[1].id).toBe('rank-2')
  })

  it('returns total from count query', async () => {
    mockFtsQuery([baseListing], 42)
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])

    const result = await searchListings({ q: 'ursus' })

    expect(result.total).toBe(42)
  })
})

// ---------------------------------------------------------------------------
// searchSuggestions
// ---------------------------------------------------------------------------

describe('searchSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array for blank query without hitting the DB', async () => {
    const result = await searchSuggestions('   ')
    expect(result).toEqual([])
    expect(mockDb.$queryRawUnsafe).not.toHaveBeenCalled()
  })

  it('returns empty array for empty string', async () => {
    const result = await searchSuggestions('')
    expect(result).toEqual([])
    expect(mockDb.$queryRawUnsafe).not.toHaveBeenCalled()
  })

  it('calls $queryRawUnsafe with similarity SQL for a valid query', async () => {
    const suggestions = [{ title: 'Ciągnik Ursus', sim: 0.9 }]
    mockDb.$queryRawUnsafe.mockResolvedValueOnce(suggestions)

    const result = await searchSuggestions('ursus')

    expect(mockDb.$queryRawUnsafe).toHaveBeenCalledOnce()
    const sql = mockDb.$queryRawUnsafe.mock.calls[0][0] as string
    expect(sql).toContain('similarity')
    expect(result).toEqual(suggestions)
  })

  it('passes the sanitised query as a parameter', async () => {
    mockDb.$queryRawUnsafe.mockResolvedValueOnce([])

    await searchSuggestions('  ursus  ')

    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain('ursus')
  })

  it('respects the limit parameter', async () => {
    mockDb.$queryRawUnsafe.mockResolvedValueOnce([])

    await searchSuggestions('ursus', 3)

    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain(3)
  })

  it('defaults limit to 5', async () => {
    mockDb.$queryRawUnsafe.mockResolvedValueOnce([])

    await searchSuggestions('ursus')

    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain(5)
  })
})

// ---------------------------------------------------------------------------
// findListings — FTS delegation vs ORM path
// ---------------------------------------------------------------------------

describe('findListings — delegation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to searchListings (uses $queryRawUnsafe) when q is provided', async () => {
    mockFtsQuery([baseListing], 1)
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])

    await findListings({ q: 'ursus', limit: 20 })

    expect(mockDb.$queryRawUnsafe).toHaveBeenCalled()
    // findMany is called by the re-hydration step inside searchListings
    expect(mockDb.listing.findMany).toHaveBeenCalledOnce()
  })

  it('uses Prisma ORM path (listing.findMany) and does NOT call $queryRawUnsafe when q is absent', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    await findListings({ limit: 20 })

    expect(mockDb.$queryRawUnsafe).not.toHaveBeenCalled()
    expect(mockDb.listing.findMany).toHaveBeenCalledOnce()
  })

  it('passes all filter params through to searchListings', async () => {
    mockFtsQuery([])
    mockDb.listing.findMany.mockResolvedValueOnce([])

    await findListings({
      q: 'ursus',
      category: 'ciagniki',
      voivodeship: '14',
      priceMin: 1000,
      priceMax: 50000,
      condition: 'used',
      cursor: 'prev-id',
      limit: 10,
    })

    const params = mockDb.$queryRawUnsafe.mock.calls[0] as unknown[]
    expect(params).toContain('ciagniki')
    expect(params).toContain('14')
    expect(params).toContain(1000)
    expect(params).toContain(50000)
    expect(params).toContain('used')
    expect(params).toContain('prev-id')
  })
})

// ---------------------------------------------------------------------------
// findListings — ORM path (no q)
// ---------------------------------------------------------------------------

describe('findListings — ORM path', () => {
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
})

// ---------------------------------------------------------------------------
// generateSlug — via createListing
// ---------------------------------------------------------------------------

describe('listing repository — generateSlug (via createListing)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns base slug when no conflicts exist', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
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

// ---------------------------------------------------------------------------
// findListingById
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// findRelatedListings
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// updateListing
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// softDeleteListing
// ---------------------------------------------------------------------------

describe('listing repository — softDeleteListing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets status to "sold"', async () => {
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, status: 'sold' })

    await softDeleteListing('cuid-1')

    const updateCall = mockDb.listing.update.mock.calls[0][0]
    expect(updateCall.data.status).toBe('sold')
    expect(updateCall.where.id).toBe('cuid-1')
  })
})
