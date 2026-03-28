/**
 * GET /api/v1/listings  — list active listings with filtering + cursor pagination
 * POST /api/v1/listings — create a new listing (auth required)
 */

import { auth } from '@/auth'
import { createListingSchema, listingsQuerySchema } from '@/lib/schemas/listing'
import {
  findListings,
  createListing,
} from '@/lib/repositories/listing.repository'

// ---------------------------------------------------------------------------
// GET /api/v1/listings
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const rawQuery = {
      category: searchParams.get('category') ?? undefined,
      voivodeship: searchParams.get('voivodeship') ?? undefined,
      priceMin: searchParams.get('priceMin') ?? undefined,
      priceMax: searchParams.get('priceMax') ?? undefined,
      condition: searchParams.get('condition') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    }

    const parsed = listingsQuerySchema.safeParse(rawQuery)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const result = await findListings(parsed.data)

    return Response.json({
      success: true,
      data: result,
    })
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/listings
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: unknown = await request.json()
    const parsed = createListingSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const listing = await createListing(session.user.id, parsed.data)

    return Response.json({ success: true, data: listing }, { status: 201 })
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
