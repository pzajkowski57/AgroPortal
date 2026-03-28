/**
 * Tests for /api/v1/listings CRUD API
 *
 * TDD: Tests written before implementation (RED phase).
 * Prisma client is mocked; NextAuth `auth` is mocked.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the modules under test
// ---------------------------------------------------------------------------

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

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import { db } from '@/server/db'
import { auth } from '@/auth'

// We import the route handlers lazily inside each test group to avoid
// ESM caching issues — see helpers below.
import { GET as listingsGET, POST as listingsPOST } from '../route'
import { GET as listingGetById, PATCH as listingPATCH, DELETE as listingDELETE } from '../[id]/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockDb = db as unknown as {
  listing: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
  }
}

const mockAuth = auth as ReturnType<typeof vi.fn>

function makeRequest(url: string, init?: RequestInit): Request {
  return new Request(url, init)
}

function makeJsonRequest(url: string, body: unknown, init?: RequestInit): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  })
}

/** Minimal listing fixture matching Prisma Listing shape */
const baseListing = {
  id: 'cuid-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  machineryModelId: null,
  title: 'Ciągnik Ursus C-360',
  slug: 'ciagnik-ursus-c-360',
  description: 'Dobry ciągnik w dobrym stanie.',
  price: '15000.00',
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
  category: { id: 'cat-1', name: 'Ciągniki', slug: 'ciagniki' },
}

// ---------------------------------------------------------------------------
// GET /api/v1/listings
// ---------------------------------------------------------------------------

describe('GET /api/v1/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a list of active listings with nextCursor and total', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([baseListing])
    mockDb.listing.count.mockResolvedValueOnce(1)

    const req = makeRequest('http://localhost/api/v1/listings')
    const res = await listingsGET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.listings).toHaveLength(1)
    expect(json.data.listings[0].id).toBe('cuid-1')
    expect(json.data.total).toBe(1)
    expect('nextCursor' in json.data).toBe(true)
  })

  it('filters by category query param', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings?category=ciagniki')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.category?.slug).toBe('ciagniki')
  })

  it('filters by voivodeship query param', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings?voivodeship=14')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.voivodeship).toBe('14')
  })

  it('filters by priceMin and priceMax', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings?priceMin=5000&priceMax=20000')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.price.gte).toBe(5000)
    expect(findManyCall.where.price.lte).toBe(20000)
  })

  it('filters by condition query param', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings?condition=new')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.condition).toBe('new')
  })

  it('always filters status=active', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.status).toBe('active')
  })

  it('applies cursor-based pagination', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings?cursor=cuid-prev&limit=10')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.cursor).toEqual({ id: 'cuid-prev' })
    expect(findManyCall.take).toBe(11) // limit + 1 for hasNextPage detection
  })

  it('returns nextCursor when there are more results', async () => {
    // Return limit+1 items to signal hasNextPage
    const items = Array.from({ length: 21 }, (_, i) => ({ ...baseListing, id: `cuid-${i}` }))
    mockDb.listing.findMany.mockResolvedValueOnce(items)
    mockDb.listing.count.mockResolvedValueOnce(21)

    const req = makeRequest('http://localhost/api/v1/listings?limit=20')
    const res = await listingsGET(req)
    const json = await res.json()

    expect(json.data.nextCursor).toBe('cuid-19') // last item of the page (index 19)
    expect(json.data.listings).toHaveLength(20)
  })

  it('caps limit at 100', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings?limit=999')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.take).toBeLessThanOrEqual(101) // 100 + 1
  })

  it('returns 400 for invalid condition value', async () => {
    const req = makeRequest('http://localhost/api/v1/listings?condition=broken')
    const res = await listingsGET(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('returns 400 for non-numeric priceMin', async () => {
    const req = makeRequest('http://localhost/api/v1/listings?priceMin=abc')
    const res = await listingsGET(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('handles DB error gracefully', async () => {
    mockDb.listing.findMany.mockRejectedValueOnce(new Error('DB down'))
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings')
    const res = await listingsGET(req)

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.success).toBe(false)
    // Must not leak internal error details
    expect(json.error).not.toContain('DB down')
  })

  it('handles full-text search via q param', async () => {
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.count.mockResolvedValueOnce(0)

    const req = makeRequest('http://localhost/api/v1/listings?q=ursus')
    await listingsGET(req)

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    // Should include a title/description search condition
    expect(JSON.stringify(findManyCall.where)).toContain('ursus')
  })
})

// ---------------------------------------------------------------------------
// POST /api/v1/listings
// ---------------------------------------------------------------------------

describe('POST /api/v1/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validBody = {
    title: 'Ciągnik Ursus C-360',
    description: 'Dobry ciągnik w dobrym stanie.',
    price: 15000,
    currency: 'PLN',
    condition: 'used',
    categoryId: 'cat-1',
    voivodeship: '14',
    city: 'Warszawa',
  }

  it('creates a listing for authenticated user', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findMany.mockResolvedValueOnce([]) // for slug uniqueness check
    mockDb.listing.create.mockResolvedValueOnce({ ...baseListing })

    const req = makeJsonRequest('http://localhost/api/v1/listings', validBody)
    const res = await listingsPOST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
    expect(json.data.id).toBe('cuid-1')
  })

  it('auto-generates slug from title', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.create.mockResolvedValueOnce({ ...baseListing })

    const req = makeJsonRequest('http://localhost/api/v1/listings', validBody)
    await listingsPOST(req)

    const createCall = mockDb.listing.create.mock.calls[0][0]
    expect(createCall.data.slug).toMatch(/ciagnik-ursus-c-360/)
  })

  it('sets status to active by default', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.create.mockResolvedValueOnce({ ...baseListing })

    const req = makeJsonRequest('http://localhost/api/v1/listings', validBody)
    await listingsPOST(req)

    const createCall = mockDb.listing.create.mock.calls[0][0]
    expect(createCall.data.status).toBe('active')
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const req = makeJsonRequest('http://localhost/api/v1/listings', validBody)
    const res = await listingsPOST(req)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 400 for missing required fields', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })

    const req = makeJsonRequest('http://localhost/api/v1/listings', { title: 'Only title' })
    const res = await listingsPOST(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('returns 400 for invalid condition value', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })

    const req = makeJsonRequest('http://localhost/api/v1/listings', {
      ...validBody,
      condition: 'excellent',
    })
    const res = await listingsPOST(req)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('returns 400 for negative price', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })

    const req = makeJsonRequest('http://localhost/api/v1/listings', {
      ...validBody,
      price: -100,
    })
    const res = await listingsPOST(req)

    expect(res.status).toBe(400)
  })

  it('handles DB error gracefully', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findMany.mockResolvedValueOnce([])
    mockDb.listing.create.mockRejectedValueOnce(new Error('DB error'))

    const req = makeJsonRequest('http://localhost/api/v1/listings', validBody)
    const res = await listingsPOST(req)

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).not.toContain('DB error')
  })
})

// ---------------------------------------------------------------------------
// GET /api/v1/listings/[id]
// ---------------------------------------------------------------------------

describe('GET /api/v1/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a listing with related listings', async () => {
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.findMany.mockResolvedValueOnce([
      { ...baseListing, id: 'related-1' },
    ])

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1')
    const res = await listingGetById(req, { params: Promise.resolve({ id: 'cuid-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.listing.id).toBe('cuid-1')
    expect(json.data.related).toHaveLength(1)
  })

  it('returns 404 when listing does not exist', async () => {
    mockDb.listing.findUnique.mockResolvedValueOnce(null)

    const req = makeRequest('http://localhost/api/v1/listings/nonexistent')
    const res = await listingGetById(req, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('limits related listings to 4', async () => {
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.findMany.mockResolvedValueOnce([])

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1')
    await listingGetById(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.take).toBe(4)
  })

  it('excludes the current listing from related results', async () => {
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.findMany.mockResolvedValueOnce([])

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1')
    await listingGetById(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    const findManyCall = mockDb.listing.findMany.mock.calls[0][0]
    expect(findManyCall.where.id.not).toBe('cuid-1')
  })

  it('handles DB error gracefully', async () => {
    mockDb.listing.findUnique.mockRejectedValueOnce(new Error('DB error'))

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1')
    const res = await listingGetById(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/listings/[id]
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates a listing as the owner', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, title: 'Updated' })

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/cuid-1',
      { title: 'Updated' },
      { method: 'PATCH' }
    )
    const res = await listingPATCH(req, { params: Promise.resolve({ id: 'cuid-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('allows admin to update any listing', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'admin-user', role: 'admin' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing) // owned by user-1, not admin-user
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, title: 'Admin Updated' })

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/cuid-1',
      { title: 'Admin Updated' },
      { method: 'PATCH' }
    )
    const res = await listingPATCH(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(200)
  })

  it('returns 403 when non-owner non-admin tries to update', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'other-user', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing) // owned by user-1

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/cuid-1',
      { title: 'Hacked' },
      { method: 'PATCH' }
    )
    const res = await listingPATCH(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/cuid-1',
      { title: 'Updated' },
      { method: 'PATCH' }
    )
    const res = await listingPATCH(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(401)
  })

  it('returns 404 when listing does not exist', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(null)

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/nonexistent',
      { title: 'Updated' },
      { method: 'PATCH' }
    )
    const res = await listingPATCH(req, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid patch fields', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/cuid-1',
      { price: -999 },
      { method: 'PATCH' }
    )
    const res = await listingPATCH(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(400)
  })

  it('does a partial update — only provided fields are changed', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, title: 'Nowy tytul' })

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/cuid-1',
      { title: 'Nowy tytul' },
      { method: 'PATCH' }
    )
    await listingPATCH(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    const updateCall = mockDb.listing.update.mock.calls[0][0]
    expect(updateCall.data).toEqual({ title: 'Nowy tytul' })
  })

  it('handles DB error during update gracefully', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.update.mockRejectedValueOnce(new Error('DB error'))

    const req = makeJsonRequest(
      'http://localhost/api/v1/listings/cuid-1',
      { title: 'Nowy tytul' },
      { method: 'PATCH' }
    )
    const res = await listingPATCH(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).not.toContain('DB error')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/listings/[id]
// ---------------------------------------------------------------------------

describe('DELETE /api/v1/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('soft-deletes a listing by setting status to inactive', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, status: 'inactive' })

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1', { method: 'DELETE' })
    const res = await listingDELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)

    const updateCall = mockDb.listing.update.mock.calls[0][0]
    expect(updateCall.data.status).toBe('inactive')
  })

  it('allows admin to delete any listing', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'admin-user', role: 'admin' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, status: 'inactive' })

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1', { method: 'DELETE' })
    const res = await listingDELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(200)
  })

  it('returns 403 for non-owner non-admin', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'other-user', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing) // owned by user-1

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1', { method: 'DELETE' })
    const res = await listingDELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1', { method: 'DELETE' })
    const res = await listingDELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(401)
  })

  it('returns 404 when listing does not exist', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(null)

    const req = makeRequest('http://localhost/api/v1/listings/nonexistent', { method: 'DELETE' })
    const res = await listingDELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(res.status).toBe(404)
  })

  it('never physically deletes — uses update, not delete', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.update.mockResolvedValueOnce({ ...baseListing, status: 'inactive' })

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1', { method: 'DELETE' })
    await listingDELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    // `db.listing.delete` must NEVER be called
    expect((mockDb.listing as unknown as Record<string, ReturnType<typeof vi.fn>>).delete).toBeUndefined()
    expect(mockDb.listing.update).toHaveBeenCalledOnce()
  })

  it('handles DB error during soft-delete gracefully', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1', role: 'user' } })
    mockDb.listing.findUnique.mockResolvedValueOnce(baseListing)
    mockDb.listing.update.mockRejectedValueOnce(new Error('DB error'))

    const req = makeRequest('http://localhost/api/v1/listings/cuid-1', { method: 'DELETE' })
    const res = await listingDELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).not.toContain('DB error')
  })
})
