import { describe, it, expect } from 'vitest'
import { slugify, uniqueSlug } from '../slugify'

describe('slugify', () => {
  it('converts Polish diacritics', () => {
    expect(slugify('Ciągnik rolniczy')).toBe('ciagnik-rolniczy')
    expect(slugify('Łódź')).toBe('lodz')
    expect(slugify('Żuław żuław')).toBe('zulaw-zulaw')
  })

  it('handles special characters', () => {
    expect(slugify('Ursus C-360 (używany)')).toBe('ursus-c-360-uzywany')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })

  it('returns "item" for empty string', () => {
    expect(slugify('')).toBe('item')
  })

  it('returns "item" for whitespace-only string', () => {
    expect(slugify('   ')).toBe('item')
  })
})

describe('uniqueSlug', () => {
  it('returns base slug if not taken', () => {
    expect(uniqueSlug('test', [])).toBe('test')
  })

  it('appends counter if taken', () => {
    expect(uniqueSlug('test', ['test'])).toBe('test-2')
    expect(uniqueSlug('test', ['test', 'test-2'])).toBe('test-3')
  })
})
