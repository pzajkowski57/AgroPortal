/**
 * Listing repository — encapsulates all Prisma queries for the Listing model.
 * Business logic lives in the route handlers; this layer handles only DB access.
 */

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ListingStatus } from '@prisma/client'
import { db } from '@/server/db'
import type { CreateListingInput, PatchListingInput, ListingsQuery } from '@/lib/schemas/listing'
import { slugify } from '@/lib/utils/slugify'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FindListingsResult {
  listings: Awaited<ReturnType<typeof db.listing.findMany>>
  nextCursor: string | null
  total: number
}

interface SearchListingsQuery {
  q: string
  category?: string
  voivodeship?: string
  condition?: string
  priceMin?: number
  priceMax?: number
  cursor?: string
  limit?: number
}

interface RawListingRow {
  id: string
  title: string
  slug: string
  description: string
  price: unknown
  currency: string
  condition: string
  status: string
  voivodeship: string
  city: string
  isHighlighted: boolean
  highlightedUntil: Date | null
  createdAt: Date
  updatedAt: Date
  categoryId: string
  userId: string
  machineryModelId: string | null
  rank: number
  title_similarity: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a unique slug for a new listing title. */
async function generateSlug(title: string): Promise<string> {
  const base = slugify(title)

  // Find slugs that start with the base to check for conflicts
  const existing = await db.listing.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  })

  const existingSlugs = existing.map((l) => l.slug)

  if (!existingSlugs.includes(base)) return base

  let counter = 2
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++
  }
  return `${base}-${counter}`
}

/** Sanitize a search query string: trim whitespace and collapse internal spaces. */
function sanitizeSearchQuery(q: string): string {
  return q.trim().replace(/\s+/g, ' ')
}

/**
 * Convert a plain search string into a tsquery expression.
 * Each word gets a prefix wildcard (:*) so partial matches work.
 * Words are joined with & (AND logic).
 */
function buildTsQuery(q: string): string {
  return sanitizeSearchQuery(q)
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w + ':*')
    .join(' & ')
}

// ---------------------------------------------------------------------------
// FTS search
// ---------------------------------------------------------------------------

/**
 * Search listings using PostgreSQL Full-Text Search on the searchVector column.
 * Returns results ranked by FTS rank, title similarity, and highlighted status.
 */
export async function searchListings(query: SearchListingsQuery): Promise<FindListingsResult> {
  const {
    q,
    category,
    voivodeship,
    condition,
    priceMin,
    priceMax,
    cursor,
    limit = 20,
  } = query

  const sanitizedQ = sanitizeSearchQuery(q)

  // Guard: return empty results for blank queries
  if (!sanitizedQ) {
    return { listings: [], nextCursor: null, total: 0 }
  }

  const tsQuery = buildTsQuery(sanitizedQ)

  const conditions: string[] = [`l.status = 'active'`]
  const params: unknown[] = []
  let paramIndex = 1

  // FTS condition — $1 = tsQuery, $2 = raw query (for similarity)
  conditions.push(`l."searchVector" @@ to_tsquery('polish_unaccent', $${paramIndex})`)
  params.push(tsQuery)
  paramIndex++ // now 2

  params.push(sanitizedQ) // $2 used in ORDER BY similarity
  paramIndex++ // now 3

  if (category) {
    conditions.push(
      `l."categoryId" = (SELECT id FROM categories WHERE slug = $${paramIndex} LIMIT 1)`
    )
    params.push(category)
    paramIndex++
  }

  if (voivodeship) {
    conditions.push(`l.voivodeship = $${paramIndex}`)
    params.push(voivodeship)
    paramIndex++
  }

  if (condition) {
    conditions.push(`l.condition = $${paramIndex}::"ListingCondition"`)
    params.push(condition)
    paramIndex++
  }

  if (priceMin !== undefined) {
    conditions.push(`l.price >= $${paramIndex}`)
    params.push(priceMin)
    paramIndex++
  }

  if (priceMax !== undefined) {
    conditions.push(`l.price <= $${paramIndex}`)
    params.push(priceMax)
    paramIndex++
  }

  if (cursor) {
    conditions.push(`l.id < $${paramIndex}`)
    params.push(cursor)
    paramIndex++
  }

  const whereClause = conditions.join(' AND ')
  const countParams = [...params]

  const dataSql = `
    SELECT
      l.id, l.title, l.slug, l.description, l.price, l.currency,
      l.condition, l.status, l.voivodeship, l.city,
      l."isHighlighted", l."highlightedUntil",
      l."createdAt", l."updatedAt", l."categoryId", l."userId",
      l."machineryModelId",
      ts_rank(l."searchVector", to_tsquery('polish_unaccent', $1)) AS rank,
      similarity(l.title, $2) AS title_similarity
    FROM listings l
    WHERE ${whereClause}
    ORDER BY
      l."isHighlighted" DESC,
      rank DESC,
      title_similarity DESC,
      l."createdAt" DESC
    LIMIT $${paramIndex}
  `
  params.push(limit + 1) // +1 for next-page detection

  const countSql = `
    SELECT COUNT(*) AS total
    FROM listings l
    WHERE ${whereClause}
  `

  const [rawRows, countRows] = await Promise.all([
    db.$queryRawUnsafe(dataSql, ...params) as Promise<RawListingRow[]>,
    db.$queryRawUnsafe(countSql, ...countParams) as Promise<[{ total: bigint }]>,
  ])

  const hasNextPage = rawRows.length > limit
  const pageRows = hasNextPage ? rawRows.slice(0, limit) : rawRows
  const nextCursor = hasNextPage ? pageRows[pageRows.length - 1].id : null
  const total = Number(countRows[0]?.total ?? 0)

  // Re-hydrate each raw row through Prisma to get relations (images, category, user)
  const ids = pageRows.map((r) => r.id)
  const listings = await db.listing.findMany({
    where: { id: { in: ids } },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      category: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, name: true, image: true } },
    },
  })

  // Restore the FTS rank order from pageRows
  const listingMap = new Map(listings.map((l) => [l.id, l]))
  const orderedListings = pageRows
    .map((r) => listingMap.get(r.id))
    .filter((l): l is NonNullable<typeof l> => l !== undefined)

  return { listings: orderedListings, nextCursor, total }
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

export async function findListings(query: ListingsQuery): Promise<FindListingsResult> {
  const { category, voivodeship, priceMin, priceMax, condition, q, cursor, limit } = query

  // Delegate to FTS path when a search query is provided
  if (q) {
    return searchListings({ q, category, voivodeship, condition, priceMin, priceMax, cursor, limit })
  }

  // Build the where clause
  const where: Record<string, unknown> = {
    status: 'active',
  }

  if (category) {
    where['category'] = { slug: category }
  }

  if (voivodeship) {
    where['voivodeship'] = voivodeship
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    where['price'] = {
      ...(priceMin !== undefined ? { gte: priceMin } : {}),
      ...(priceMax !== undefined ? { lte: priceMax } : {}),
    }
  }

  if (condition) {
    where['condition'] = condition
  }

  const take = limit + 1 // fetch one extra to detect if there is a next page

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ isHighlighted: 'desc' }, { createdAt: 'desc' }],
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, image: true } },
      },
    }),
    db.listing.count({ where }),
  ])

  const hasNextPage = listings.length > limit
  const page = hasNextPage ? listings.slice(0, limit) : listings
  const nextCursor = hasNextPage ? page[page.length - 1].id : null

  return { listings: page, nextCursor, total }
}

export async function findListingById(id: string, includeInactive = false) {
  return db.listing.findUnique({
    where: { id, ...(includeInactive ? {} : { status: 'active' }) },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, name: true, image: true } },
    },
  })
}

export async function findRelatedListings(listing: { id: string; categoryId: string }) {
  return db.listing.findMany({
    where: {
      status: 'active',
      categoryId: listing.categoryId,
      id: { not: listing.id },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
    },
  })
}

// ---------------------------------------------------------------------------
// Autocomplete
// ---------------------------------------------------------------------------

interface SuggestionRow {
  title: string
  sim: number
}

/**
 * Return autocomplete title suggestions using trigram similarity.
 * Requires the pg_trgm extension to be enabled in PostgreSQL.
 */
export async function searchSuggestions(q: string, limit = 5): Promise<SuggestionRow[]> {
  const sanitized = sanitizeSearchQuery(q)
  if (!sanitized) return []

  return db.$queryRawUnsafe(
    `SELECT DISTINCT title, similarity(title, $1) AS sim
     FROM listings
     WHERE status = 'active'
       AND (title % $1 OR title ILIKE $2)
     ORDER BY sim DESC
     LIMIT $3`,
    sanitized,
    `%${sanitized}%`,
    limit
  ) as Promise<SuggestionRow[]>
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

export async function createListing(userId: string, data: CreateListingInput) {
  const slug = await generateSlug(data.title)

  const buildData = (resolvedSlug: string) => ({
    userId,
    slug: resolvedSlug,
    status: ListingStatus.active,
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency,
    condition: data.condition,
    categoryId: data.categoryId,
    voivodeship: data.voivodeship,
    city: data.city,
    ...(data.machineryModelId ? { machineryModelId: data.machineryModelId } : {}),
    ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
    ...(data.metaDesc ? { metaDesc: data.metaDesc } : {}),
  })

  try {
    return await db.listing.create({ data: buildData(slug) })
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      const fallbackSlug = slug + '-' + Date.now().toString(36)
      return db.listing.create({ data: buildData(fallbackSlug) })
    }
    throw err
  }
}

export async function updateListing(id: string, data: PatchListingInput) {
  // Strip undefined fields to ensure partial update semantics
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )

  return db.listing.update({
    where: { id },
    data: updateData,
  })
}

export async function softDeleteListing(id: string) {
  return db.listing.update({
    where: { id },
    data: { status: 'sold' as const },
  })
}
