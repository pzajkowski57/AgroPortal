/**
 * CORS helper for API route handlers.
 *
 * Usage in a route handler:
 *
 *   import { corsHeaders, handleCorsPreflight } from '@/lib/cors'
 *
 *   export async function OPTIONS(request: Request) {
 *     return handleCorsPreflight(request) ?? new Response(null, { status: 204 })
 *   }
 *
 *   export async function GET(request: Request) {
 *     const origin = request.headers.get('origin')
 *     return Response.json({ ok: true }, { headers: corsHeaders(origin) })
 *   }
 */

const ALLOWED_ORIGINS: string[] = [
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
]

/**
 * Returns CORS response headers for allowed origins.
 * Returns an empty object for origins that are not on the allowlist,
 * which causes the browser to block the cross-origin response.
 */
export function corsHeaders(origin: string | null): HeadersInit {
  if (origin === null || !ALLOWED_ORIGINS.includes(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

/**
 * Handles CORS preflight OPTIONS requests.
 * Returns a 204 response with CORS headers when the origin is allowed,
 * or null when no preflight handling is needed.
 */
export function handleCorsPreflight(request: Request): Response | null {
  if (request.method !== 'OPTIONS') {
    return null
  }

  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)

  if (Object.keys(headers).length === 0) {
    return null
  }

  return new Response(null, { status: 204, headers })
}
