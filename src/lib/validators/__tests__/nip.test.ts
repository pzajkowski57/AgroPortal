import { describe, it, expect } from 'vitest'
import { validateNip, formatNip } from '../nip'

describe('validateNip', () => {
  it('validates correct NIP', () => {
    // Known valid NIPs (public company NIPs)
    expect(validateNip('5260250274')).toBe(true)  // PKN Orlen
    expect(validateNip('526-025-02-74')).toBe(true) // with dashes
  })

  it('rejects incorrect NIP', () => {
    expect(validateNip('1234567890')).toBe(false)
    expect(validateNip('0000000000')).toBe(false)
    expect(validateNip('123')).toBe(false)
    expect(validateNip('abcdefghij')).toBe(false)
  })
})

describe('formatNip', () => {
  it('formats 10-digit NIP', () => {
    expect(formatNip('5260250274')).toBe('526-025-02-74')
  })

  it('returns original if not 10 digits', () => {
    expect(formatNip('123')).toBe('123')
  })
})
