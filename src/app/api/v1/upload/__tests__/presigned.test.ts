/**
 * Tests for POST /api/v1/upload/presigned
 *
 * TDD: tests are written before implementation.
 * External dependencies (NextAuth `auth`, R2 `createPresignedUploadUrl`) are
 * fully mocked — no real network calls or env vars required.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Module mocks — must be hoisted (vi.mock is hoisted automatically)
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

// Mock the R2 helper entirely so env var guards and real S3 calls are bypassed.
vi.mock('@/lib/r2', () => ({
  createPresignedUploadUrl: vi.fn(),
  extForContentType: (ct: string) => {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    return map[ct] ?? 'bin'
  },
}))

// Stub uuid so keys are deterministic in assertions.
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid-1234'),
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { auth } from '@/auth'
import { createPresignedUploadUrl } from '@/lib/r2'
import { POST } from '../presigned/route'

const mockAuth = vi.mocked(auth)
const mockCreatePresignedUploadUrl = vi.mocked(createPresignedUploadUrl)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSession(userId = 'user-abc') {
  return { user: { id: userId, email: 'user@example.com', role: 'user' } }
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/v1/upload/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('POST /api/v1/upload/presigned', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: authenticated user
    mockAuth.mockResolvedValue(makeSession() as never)
    // Default: R2 helper returns a deterministic presigned URL
    mockCreatePresignedUploadUrl.mockImplementation(async ({ key }) => ({
      url: 'https://r2.example.com/presigned-url',
      key,
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  describe('authentication', () => {
    it('returns 401 when the user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null as never)

      const res = await POST(makeRequest({ files: [] }))
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body).toEqual({ success: false, error: 'Unauthorized' })
    })

    it('returns 401 when session has no user id', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'x@x.com' } } as never)

      const res = await POST(makeRequest({ files: [] }))
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body.success).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Request validation
  // -------------------------------------------------------------------------

  describe('request validation', () => {
    it('returns 400 for an empty files array', async () => {
      const res = await POST(makeRequest({ files: [] }))
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error).toBeDefined()
    })

    it('returns 400 when files is missing from the body', async () => {
      const res = await POST(makeRequest({}))
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('returns 400 when body is not valid JSON', async () => {
      const req = new NextRequest('http://localhost/api/v1/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      })
      const res = await POST(req)
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('returns 400 when more than 10 files are submitted', async () => {
      const files = Array.from({ length: 11 }, (_, i) => ({
        filename: `photo${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024 * 100,
      }))
      const res = await POST(makeRequest({ files }))
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('accepts exactly 10 files', async () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        filename: `photo${i}.jpg`,
        contentType: 'image/jpeg',
        size: 1024 * 100,
      }))
      const res = await POST(makeRequest({ files }))

      expect(res.status).toBe(200)
    })

    it('returns 400 for a disallowed content type', async () => {
      const res = await POST(
        makeRequest({
          files: [
            { filename: 'script.gif', contentType: 'image/gif', size: 1000 },
          ],
        })
      )
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('returns 400 for PDF content type', async () => {
      const res = await POST(
        makeRequest({
          files: [
            {
              filename: 'document.pdf',
              contentType: 'application/pdf',
              size: 1000,
            },
          ],
        })
      )

      expect(res.status).toBe(400)
      expect((await res.json()).success).toBe(false)
    })

    it('returns 400 when file size exceeds 5 MB', async () => {
      const FIVE_MB = 5 * 1024 * 1024
      const res = await POST(
        makeRequest({
          files: [
            {
              filename: 'big.jpg',
              contentType: 'image/jpeg',
              size: FIVE_MB + 1,
            },
          ],
        })
      )
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('accepts a file of exactly 5 MB', async () => {
      const FIVE_MB = 5 * 1024 * 1024
      const res = await POST(
        makeRequest({
          files: [
            { filename: 'exact.jpg', contentType: 'image/jpeg', size: FIVE_MB },
          ],
        })
      )

      expect(res.status).toBe(200)
    })

    it('returns 400 when size is negative', async () => {
      const res = await POST(
        makeRequest({
          files: [{ filename: 'x.png', contentType: 'image/png', size: -1 }],
        })
      )

      expect(res.status).toBe(400)
    })

    it('returns 400 when size is zero', async () => {
      const res = await POST(
        makeRequest({
          files: [{ filename: 'x.png', contentType: 'image/png', size: 0 }],
        })
      )

      expect(res.status).toBe(400)
    })

    it('accepts image/webp content type', async () => {
      const res = await POST(
        makeRequest({
          files: [
            { filename: 'photo.webp', contentType: 'image/webp', size: 1024 },
          ],
        })
      )

      expect(res.status).toBe(200)
    })

    it('accepts image/png content type', async () => {
      const res = await POST(
        makeRequest({
          files: [
            { filename: 'photo.png', contentType: 'image/png', size: 1024 },
          ],
        })
      )

      expect(res.status).toBe(200)
    })

    it('returns 400 when filename is empty', async () => {
      const res = await POST(
        makeRequest({
          files: [{ filename: '', contentType: 'image/jpeg', size: 1024 }],
        })
      )

      expect(res.status).toBe(400)
    })
  })

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  describe('successful presigned URL generation', () => {
    it('returns 200 with urls array for a single valid file', async () => {
      const res = await POST(
        makeRequest({
          files: [
            { filename: 'tractor.jpg', contentType: 'image/jpeg', size: 2048 },
          ],
        })
      )
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.urls).toHaveLength(1)
      expect(body.data.urls[0].url).toBe('https://r2.example.com/presigned-url')
      expect(body.data.urls[0].key).toMatch(/^uploads\/user-abc\//)
    })

    it('returns one presigned URL per file', async () => {
      mockCreatePresignedUploadUrl
        .mockResolvedValueOnce({
          url: 'https://r2.example.com/url-1',
          key: 'uploads/user-abc/uuid-1.jpg',
        })
        .mockResolvedValueOnce({
          url: 'https://r2.example.com/url-2',
          key: 'uploads/user-abc/uuid-2.png',
        })

      const res = await POST(
        makeRequest({
          files: [
            { filename: 'a.jpg', contentType: 'image/jpeg', size: 1000 },
            { filename: 'b.png', contentType: 'image/png', size: 2000 },
          ],
        })
      )
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.data.urls).toHaveLength(2)
      expect(body.data.urls[0].url).toBe('https://r2.example.com/url-1')
      expect(body.data.urls[1].url).toBe('https://r2.example.com/url-2')
    })

    it('uses the correct S3 key pattern: uploads/{userId}/{uuid}.{ext}', async () => {
      const res = await POST(
        makeRequest({
          files: [
            { filename: 'photo.jpg', contentType: 'image/jpeg', size: 1024 },
          ],
        })
      )
      const body = await res.json()

      // The key passed to createPresignedUploadUrl must follow the pattern.
      const callArgs = mockCreatePresignedUploadUrl.mock.calls[0][0]
      expect(callArgs.key).toBe('uploads/user-abc/test-uuid-1234.jpg')
      // The returned key is what comes back from the mock (which echoes input key).
      expect(body.data.urls[0].key).toBe('uploads/user-abc/test-uuid-1234.jpg')
    })

    it('derives extension from content type, not client filename', async () => {
      await POST(
        makeRequest({
          files: [
            {
              filename: 'evil.exe',
              contentType: 'image/png',
              size: 1024,
            },
          ],
        })
      )

      const callArgs = mockCreatePresignedUploadUrl.mock.calls[0][0]
      // Extension must be .png (from contentType), never .exe
      expect(callArgs.key).toMatch(/\.png$/)
      expect(callArgs.key).not.toMatch(/\.exe$/)
    })

    it('uses .jpg extension for image/jpeg', async () => {
      await POST(
        makeRequest({
          files: [
            { filename: 'x.anything', contentType: 'image/jpeg', size: 500 },
          ],
        })
      )

      const callArgs = mockCreatePresignedUploadUrl.mock.calls[0][0]
      expect(callArgs.key).toMatch(/\.jpg$/)
    })

    it('uses .webp extension for image/webp', async () => {
      await POST(
        makeRequest({
          files: [{ filename: 'x', contentType: 'image/webp', size: 500 }],
        })
      )

      const callArgs = mockCreatePresignedUploadUrl.mock.calls[0][0]
      expect(callArgs.key).toMatch(/\.webp$/)
    })

    it('calls createPresignedUploadUrl with correct contentType', async () => {
      await POST(
        makeRequest({
          files: [
            { filename: 'photo.png', contentType: 'image/png', size: 1024 },
          ],
        })
      )

      expect(mockCreatePresignedUploadUrl).toHaveBeenCalledTimes(1)
      const callArgs = mockCreatePresignedUploadUrl.mock.calls[0][0]
      expect(callArgs.contentType).toBe('image/png')
    })

    it('response shape matches ApiResponse envelope', async () => {
      const res = await POST(
        makeRequest({
          files: [{ filename: 'x.jpg', contentType: 'image/jpeg', size: 500 }],
        })
      )
      const body = await res.json()

      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('data')
      expect(body.data).toHaveProperty('urls')
    })
  })

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  describe('error handling', () => {
    it('returns 500 when createPresignedUploadUrl throws', async () => {
      mockCreatePresignedUploadUrl.mockRejectedValueOnce(
        new Error('S3 unavailable')
      )

      const res = await POST(
        makeRequest({
          files: [
            { filename: 'photo.jpg', contentType: 'image/jpeg', size: 1024 },
          ],
        })
      )
      const body = await res.json()

      expect(res.status).toBe(500)
      expect(body.success).toBe(false)
      expect(body.error).toBeDefined()
      // Must not leak internal error details to the client
      expect(body.error).not.toContain('S3 unavailable')
    })

    it('does not leak stack traces or internal messages in error responses', async () => {
      mockCreatePresignedUploadUrl.mockRejectedValueOnce(
        new Error('Internal S3 error')
      )

      const res = await POST(
        makeRequest({
          files: [{ filename: 'x.jpg', contentType: 'image/jpeg', size: 100 }],
        })
      )
      const body = await res.json()

      expect(JSON.stringify(body)).not.toContain('stack')
      expect(JSON.stringify(body)).not.toContain('Internal S3 error')
    })
  })
})
