import { describe, it, expect } from 'vitest'
import { getRateLimitIdentifier } from '@/lib/infra/rate-limit'

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/', { headers })
}

describe('getRateLimitIdentifier', () => {
  describe('x-forwarded-for header', () => {
    it('returns the first IP when x-forwarded-for contains a single IP', () => {
      const request = makeRequest({ 'x-forwarded-for': '203.0.113.5' })
      expect(getRateLimitIdentifier(request)).toBe('203.0.113.5')
    })

    it('returns only the first IP when x-forwarded-for contains a comma-separated chain', () => {
      const request = makeRequest({
        'x-forwarded-for': '203.0.113.5, 10.0.0.1, 192.168.1.1',
      })
      expect(getRateLimitIdentifier(request)).toBe('203.0.113.5')
    })

    it('trims leading whitespace from the first IP in x-forwarded-for', () => {
      const request = makeRequest({ 'x-forwarded-for': '  203.0.113.5  , 10.0.0.1' })
      expect(getRateLimitIdentifier(request)).toBe('203.0.113.5')
    })

    it('trims trailing whitespace from a single-entry x-forwarded-for value', () => {
      const request = makeRequest({ 'x-forwarded-for': '203.0.113.5   ' })
      expect(getRateLimitIdentifier(request)).toBe('203.0.113.5')
    })

    it('prefers x-forwarded-for over x-real-ip when both headers are present', () => {
      const request = makeRequest({
        'x-forwarded-for': '203.0.113.5',
        'x-real-ip': '10.0.0.99',
      })
      expect(getRateLimitIdentifier(request)).toBe('203.0.113.5')
    })
  })

  describe('x-real-ip header (fallback when x-forwarded-for is absent)', () => {
    it('returns x-real-ip when x-forwarded-for is absent', () => {
      const request = makeRequest({ 'x-real-ip': '198.51.100.7' })
      expect(getRateLimitIdentifier(request)).toBe('198.51.100.7')
    })

    it('trims whitespace from x-real-ip', () => {
      const request = makeRequest({ 'x-real-ip': '  198.51.100.7  ' })
      expect(getRateLimitIdentifier(request)).toBe('198.51.100.7')
    })
  })

  describe('fallback to 127.0.0.1', () => {
    it('returns 127.0.0.1 when no IP headers are present', () => {
      const request = makeRequest()
      expect(getRateLimitIdentifier(request)).toBe('127.0.0.1')
    })

    it('returns 127.0.0.1 when x-forwarded-for is present but empty string', () => {
      // An empty x-forwarded-for header should not satisfy the truthy check
      // (browsers / proxies rarely send this, but guard against it)
      const request = makeRequest({ 'x-forwarded-for': '' })
      expect(getRateLimitIdentifier(request)).toBe('127.0.0.1')
    })

    it('returns 127.0.0.1 when x-forwarded-for is whitespace-only', () => {
      const request = makeRequest({ 'x-forwarded-for': '   ' })
      expect(getRateLimitIdentifier(request)).toBe('127.0.0.1')
    })

    it('returns 127.0.0.1 when x-real-ip is whitespace-only', () => {
      const request = makeRequest({ 'x-real-ip': '   ' })
      expect(getRateLimitIdentifier(request)).toBe('127.0.0.1')
    })
  })

  describe('limiter exports (test environment — Upstash not configured)', () => {
    it('apiLimiter is null when Upstash env vars are absent', async () => {
      const { apiLimiter } = await import('@/lib/infra/rate-limit')
      expect(apiLimiter).toBeNull()
    })

    it('authLimiter is null when Upstash env vars are absent', async () => {
      const { authLimiter } = await import('@/lib/infra/rate-limit')
      expect(authLimiter).toBeNull()
    })

    it('uploadLimiter is null when Upstash env vars are absent', async () => {
      const { uploadLimiter } = await import('@/lib/infra/rate-limit')
      expect(uploadLimiter).toBeNull()
    })
  })
})
