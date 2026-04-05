import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { RelatedListings, type RelatedListing } from '../RelatedListings'

const mockListings: RelatedListing[] = [
  {
    id: 'listing-1',
    title: 'Ciągnik Ursus C-360',
    price: '25000',
    currency: 'PLN',
    condition: 'used',
    voivodeship: '14',
    city: 'Warszawa',
    imageUrl: undefined,
  },
  {
    id: 'listing-2',
    title: 'Kombajn Claas Lexion',
    price: '180000',
    currency: 'PLN',
    condition: 'new',
    voivodeship: '12',
    city: 'Kraków',
    imageUrl: undefined,
  },
]

describe('RelatedListings', () => {
  describe('rendering', () => {
    it('renders section heading', () => {
      renderWithProviders(<RelatedListings listings={mockListings} />)
      expect(screen.getByText('Podobne ogłoszenia')).toBeInTheDocument()
    })

    it('renders all listing cards', () => {
      renderWithProviders(<RelatedListings listings={mockListings} />)
      expect(screen.getByText('Ciągnik Ursus C-360')).toBeInTheDocument()
      expect(screen.getByText('Kombajn Claas Lexion')).toBeInTheDocument()
    })

    it('renders as a section with accessible label', () => {
      renderWithProviders(<RelatedListings listings={mockListings} />)
      expect(screen.getByRole('region', { name: /podobne ogłoszenia/i })).toBeInTheDocument()
    })

    it('renders list with correct number of items', () => {
      renderWithProviders(<RelatedListings listings={mockListings} />)
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(mockListings.length)
    })
  })

  describe('empty state', () => {
    it('returns null when listings array is empty', () => {
      const { container } = renderWithProviders(<RelatedListings listings={[]} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('card links', () => {
    it('each card links to the listing detail page', () => {
      renderWithProviders(<RelatedListings listings={mockListings} />)
      const links = screen.getAllByRole('link')
      expect(links.some((l) => l.getAttribute('href')?.includes('listing-1'))).toBe(true)
      expect(links.some((l) => l.getAttribute('href')?.includes('listing-2'))).toBe(true)
    })
  })
})
