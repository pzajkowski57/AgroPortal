import { describe, it, expect } from 'vitest'
import { corsHeaders, handleCorsPreflight } from '@/lib/cors'

// In the test environment NEXT_PUBLIC_APP_URL is not set, so the module
// falls back to 'http://localhost:3000' as the single allowed origin.
const ALLOWED_ORIGIN = 'http://localhost:3000'

function makeRequest(method: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/test', { method, headers })
}

// ---------------------------------------------------------------------------
// corsHeaders
// ---------------------------------------------------------------------------

describe('corsHeaders', () => {
  it('returns an empty object when origin is null', () => {
    expect(corsHeaders(null)).toEqual({})
  })

  it('returns an empty object for an origin that is not on the allowlist', () => {
    expect(corsHeaders('http://unknown.com')).toEqual({})
  })

  it('returns an empty object for an origin that partially matches the allowlist', () => {
    // Ensure substring / prefix matching does not accidentally allow an origin.
    expect(corsHeaders('http://localhost:3000.evil.com')).toEqual({})
  })

  it('returns CORS headers for the allowed origin (http://localhost:3000)', () => {
    const headers = corsHeaders(ALLOWED_ORIGIN) as Record<string, string>

    expect(headers['Access-Control-Allow-Origin']).toBe(ALLOWED_ORIGIN)
    expect(headers['Access-Control-Allow-Methods']).toBe(
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    )
    expect(headers['Access-Control-Allow-Headers']).toBe(
      'Content-Type, Authorization',
    )
    expect(headers['Access-Control-Max-Age']).toBe('86400')
    expect(headers['Vary']).toBe('Origin')
  })

  it('reflects the exact origin value back in Access-Control-Allow-Origin', () => {
    const headers = corsHeaders(ALLOWED_ORIGIN) as Record<string, string>
    expect(headers['Access-Control-Allow-Origin']).toBe(ALLOWED_ORIGIN)
  })

  it('returns an empty object for an empty string origin', () => {
    expect(corsHeaders('')).toEqual({})
  })
})

// ---------------------------------------------------------------------------
// handleCorsPreflight
// ---------------------------------------------------------------------------

describe('handleCorsPreflight', () => {
  it('returns null for a GET request (non-OPTIONS method)', () => {
    const request = makeRequest('GET', { origin: ALLOWED_ORIGIN })
    expect(handleCorsPreflight(request)).toBeNull()
  })

  it('returns null for a POST request (non-OPTIONS method)', () => {
    const request = makeRequest('POST', { origin: ALLOWED_ORIGIN })
    expect(handleCorsPreflight(request)).toBeNull()
  })

  it('returns null for an OPTIONS request with a disallowed origin', () => {
    const request = makeRequest('OPTIONS', { origin: 'http://attacker.com' })
    expect(handleCorsPreflight(request)).toBeNull()
  })

  it('returns null for an OPTIONS request with no origin header', () => {
    const request = makeRequest('OPTIONS')
    expect(handleCorsPreflight(request)).toBeNull()
  })

  it('returns a 204 Response for an OPTIONS request with the allowed origin', () => {
    const request = makeRequest('OPTIONS', { origin: ALLOWED_ORIGIN })
    const response = handleCorsPreflight(request)

    expect(response).not.toBeNull()
    expect(response).toBeInstanceOf(Response)
    expect(response!.status).toBe(204)
  })

  it('includes CORS headers in the 204 preflight response', async () => {
    const request = makeRequest('OPTIONS', { origin: ALLOWED_ORIGIN })
    const response = handleCorsPreflight(request)!

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN)
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    )
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
      'Content-Type, Authorization',
    )
    expect(response.headers.get('Access-Control-Max-Age')).toBe('86400')
    expect(response.headers.get('Vary')).toBe('Origin')
  })

  it('returns null for an OPTIONS request with an empty string origin', () => {
    const request = makeRequest('OPTIONS', { origin: '' })
    // An empty Origin header value is not on the allowlist.
    expect(handleCorsPreflight(request)).toBeNull()
  })
})
