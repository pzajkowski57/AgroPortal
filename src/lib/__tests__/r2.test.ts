/**
 * Unit tests for src/lib/r2.ts — extForContentType
 *
 * Tests the pure mapping function directly without any mocks.
 */
import { describe, it, expect } from 'vitest'
import { extForContentType } from '@/lib/r2'

describe('extForContentType', () => {
  it('returns jpg for image/jpeg', () => {
    expect(extForContentType('image/jpeg')).toBe('jpg')
  })

  it('returns png for image/png', () => {
    expect(extForContentType('image/png')).toBe('png')
  })

  it('returns webp for image/webp', () => {
    expect(extForContentType('image/webp')).toBe('webp')
  })
})
