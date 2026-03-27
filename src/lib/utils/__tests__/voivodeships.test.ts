import { describe, it, expect } from 'vitest'
import {
  VOIVODESHIPS,
  getVoivodeshipName,
  isValidVoivodeshipCode,
  getVoivodeshipOptions,
} from '../voivodeships'

describe('VOIVODESHIPS', () => {
  it('has 16 voivodeships', () => {
    expect(VOIVODESHIPS).toHaveLength(16)
  })

  it('all have valid TERYT codes (2-digit)', () => {
    VOIVODESHIPS.forEach((v) => {
      expect(v.code).toMatch(/^\d{2}$/)
    })
  })

  it('all have a nameLower field that is a non-empty string', () => {
    VOIVODESHIPS.forEach((v) => {
      expect(typeof v.nameLower).toBe('string')
      expect(v.nameLower.length).toBeGreaterThan(0)
    })
  })

  it('nameLower contains only lowercase ASCII letters, digits, and hyphens', () => {
    VOIVODESHIPS.forEach((v) => {
      expect(v.nameLower).toMatch(/^[a-z0-9-]+$/)
    })
  })
})

describe('getVoivodeshipName', () => {
  it('returns name for valid code', () => {
    expect(getVoivodeshipName('14')).toBe('Mazowieckie')
    expect(getVoivodeshipName('12')).toBe('Małopolskie')
  })

  it('returns undefined for invalid code', () => {
    expect(getVoivodeshipName('99')).toBeUndefined()
  })
})

describe('isValidVoivodeshipCode', () => {
  it('validates correct codes', () => {
    expect(isValidVoivodeshipCode('14')).toBe(true)
    expect(isValidVoivodeshipCode('99')).toBe(false)
  })
})

describe('getVoivodeshipOptions', () => {
  it('returns 16 options with value/label', () => {
    const opts = getVoivodeshipOptions()
    expect(opts).toHaveLength(16)
    expect(opts[0]).toHaveProperty('value')
    expect(opts[0]).toHaveProperty('label')
  })
})
