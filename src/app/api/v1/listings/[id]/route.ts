/**
 * GET    /api/v1/listings/[id] — get a single listing + related listings (public)
 * PATCH  /api/v1/listings/[id] — partial update (owner or admin)
 * DELETE /api/v1/listings/[id] — soft-delete (owner or admin)
 */

import { auth } from '@/auth'
import { patchListingSchema } from '@/lib/schemas/listing'
import {
  findListingById,
  findRelatedListings,
  updateListing,
  softDeleteListing,
} from '@/lib/repositories/listing.repository'

// ---------------------------------------------------------------------------
// Route segment context type
// ---------------------------------------------------------------------------

interface RouteContext {
  params: { id: string }
}

// ---------------------------------------------------------------------------
// Auth/ownership guard helpers
// ---------------------------------------------------------------------------

function isOwnerOrAdmin(userId: string, role: string, listingUserId: string | null): boolean {
  if (role === 'admin') return true
  return userId === listingUserId
}

// ---------------------------------------------------------------------------
// GET /api/v1/listings/[id]
// ---------------------------------------------------------------------------

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const listing = await findListingById(params.id)

    if (!listing) {
      return Response.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    const related = await findRelatedListings({
      id: listing.id,
      categoryId: listing.categoryId,
    })

    return Response.json({
      success: true,
      data: { listing, related },
    })
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/listings/[id]
// ---------------------------------------------------------------------------

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const listing = await findListingById(params.id)

    if (!listing) {
      return Response.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (!isOwnerOrAdmin(session.user.id, session.user.role, listing.userId)) {
      return Response.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body: unknown = await request.json()
    const parsed = patchListingSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const updated = await updateListing(params.id, parsed.data)

    return Response.json({ success: true, data: updated })
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/listings/[id]
// ---------------------------------------------------------------------------

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const listing = await findListingById(params.id)

    if (!listing) {
      return Response.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (!isOwnerOrAdmin(session.user.id, session.user.role, listing.userId)) {
      return Response.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    await softDeleteListing(params.id)

    return Response.json({ success: true, data: null })
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
