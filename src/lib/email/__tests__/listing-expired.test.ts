import { describe, it, expect } from 'vitest'
import { buildListingExpiredEmail } from '../templates/listing-expired'

describe('buildListingExpiredEmail', () => {
  const baseParams = {
    listingTitle: 'Ciągnik John Deere 6120M',
    listingUrl: 'https://agroportal.pl/ogloszenia/ciagnik-john-deere',
    userName: 'Jan Kowalski',
  }

  it('returns correct subject in Polish', () => {
    const { subject } = buildListingExpiredEmail(baseParams)
    expect(subject).toBe('Twoje ogłoszenie wygasło — przedłuż je')
  })

  it('includes listing title in html', () => {
    const { html } = buildListingExpiredEmail(baseParams)
    expect(html).toContain('Ciągnik John Deere 6120M')
  })

  it('includes listing url as CTA link', () => {
    const { html } = buildListingExpiredEmail(baseParams)
    expect(html).toContain('https://agroportal.pl/ogloszenia/ciagnik-john-deere')
  })

  it('includes user name in greeting', () => {
    const { html } = buildListingExpiredEmail(baseParams)
    expect(html).toContain('Jan Kowalski')
  })

  it('contains AgroPortal branding', () => {
    const { html } = buildListingExpiredEmail(baseParams)
    expect(html).toContain('AgroPortal')
  })

  it('escapes html special characters in title', () => {
    const { html } = buildListingExpiredEmail({
      ...baseParams,
      listingTitle: '<script>alert("xss")</script>',
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('escapes html special characters in user name', () => {
    const { html } = buildListingExpiredEmail({
      ...baseParams,
      userName: 'O\'Neil & <Brothers>',
    })
    expect(html).not.toContain('<Brothers>')
    expect(html).toContain('&amp;')
    expect(html).toContain('&lt;Brothers&gt;')
  })

  it('returns both subject and html fields', () => {
    const result = buildListingExpiredEmail(baseParams)
    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('html')
    expect(typeof result.subject).toBe('string')
    expect(typeof result.html).toBe('string')
  })
})
