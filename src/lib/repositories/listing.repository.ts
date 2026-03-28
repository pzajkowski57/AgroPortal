/**
 * Listing repository — encapsulates all Prisma queries for the Listing model.
 * Business logic lives in the route handlers; this layer handles only DB access.
 */

import { db } from '@/server/db'
import type { CreateListingInput, PatchListingInput, ListingsQuery } from '@/lib/schemas/listing'
import { slugify } from '@/lib/utils/slugify'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FindListingsResult {
  listings: Awaited<ReturnType<typeof findListings>>['listings']
  nextCursor: string | null
  total: number
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

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

export async function findListings(query: ListingsQuery): Promise<FindListingsResult> {
  const { category, voivodeship, priceMin, priceMax, condition, q, cursor, limit } = query

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

  if (q) {
    where['OR'] = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
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

export async function findListingById(id: string) {
  return db.listing.findUnique({
    where: { id },
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
// Write operations
// ---------------------------------------------------------------------------

export async function createListing(userId: string, data: CreateListingInput) {
  const slug = await generateSlug(data.title)

  return db.listing.create({
    data: {
      userId,
      slug,
      status: 'active',
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
    },
  })
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
    data: { status: 'inactive' },
  })
}
