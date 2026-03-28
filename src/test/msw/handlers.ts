import { http, HttpResponse } from 'msw'
import { createListing } from '../factories/listingFactory'
import { createMockSession } from '../helpers'

const mockListings = [
  createListing({ id: 'listing-1', title: 'Traktor John Deere 6120M' }),
  createListing({ id: 'listing-2', title: 'Kombajn Claas Lexion 770' }),
  createListing({ id: 'listing-3', title: 'Opryskiwacz Amazone UX 5200' }),
]

export const handlers = [
  http.get('/api/v1/listings', () => {
    return HttpResponse.json({
      success: true,
      data: mockListings,
      meta: { total: mockListings.length, page: 1, limit: 20 },
    })
  }),

  http.get('/api/v1/listings/:id', ({ params }) => {
    const listing = mockListings.find((l) => l.id === params.id)

    if (!listing) {
      return HttpResponse.json(
        { success: false, data: null, error: 'Listing not found' },
        { status: 404 },
      )
    }

    return HttpResponse.json({ success: true, data: listing })
  }),

  http.post('/api/auth/signin', () => {
    return HttpResponse.json(createMockSession('user'))
  }),

  // Example 500 error handler — can be overridden per-test with server.use()
  http.get('/api/v1/error-example', () => {
    return HttpResponse.json(
      { success: false, data: null, error: 'Internal server error' },
      { status: 500 },
    )
  }),
]
