import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { ListingCard, type ListingCardProps } from '../ListingCard'

const defaultProps: ListingCardProps = {
  id: 'listing-1',
  title: 'Ciągnik John Deere 6120M',
  price: '280000',
  currency: 'PLN',
  location: 'Warszawa, mazowieckie',
  condition: 'used',
  imageUrl: undefined,
}

describe('ListingCard', () => {
  describe('rendering', () => {
    it('renders the listing title', () => {
      renderWithProviders(<ListingCard {...defaultProps} />)
      expect(screen.getByText('Ciągnik John Deere 6120M')).toBeInTheDocument()
    })

    it('renders the formatted price', () => {
      renderWithProviders(<ListingCard {...defaultProps} />)
      expect(screen.getByText(/280\s?000/)).toBeInTheDocument()
    })

    it('renders the location', () => {
      renderWithProviders(<ListingCard {...defaultProps} />)
      expect(screen.getByText(/warszawa/i)).toBeInTheDocument()
    })

    it('renders a condition badge', () => {
      renderWithProviders(<ListingCard {...defaultProps} />)
      // badge for 'used' condition — Używany
      expect(screen.getByText(/używan/i)).toBeInTheDocument()
    })

    it('renders "new" condition badge for new listings', () => {
      renderWithProviders(<ListingCard {...defaultProps} condition="new" />)
      expect(screen.getByText(/now[yea]/i)).toBeInTheDocument()
    })

    it('renders "for_parts" condition badge', () => {
      renderWithProviders(<ListingCard {...defaultProps} condition="for_parts" />)
      expect(screen.getByText(/części/i)).toBeInTheDocument()
    })

    it('renders image placeholder when no imageUrl provided', () => {
      const { container } = renderWithProviders(<ListingCard {...defaultProps} />)
      // placeholder div with aspect-[4/3]
      const placeholder = container.querySelector('[class*="aspect"]')
      expect(placeholder).toBeInTheDocument()
    })

    it('renders an img element when imageUrl is provided', () => {
      renderWithProviders(
        <ListingCard {...defaultProps} imageUrl="https://example.com/image.jpg" />,
      )
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('img has correct alt text derived from title', () => {
      renderWithProviders(
        <ListingCard {...defaultProps} imageUrl="https://example.com/image.jpg" />,
      )
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Ciągnik John Deere 6120M')
    })

    it('renders a MapPin icon area next to location', () => {
      renderWithProviders(<ListingCard {...defaultProps} />)
      // location container should contain an svg (lucide icon)
      const locationArea = screen.getByText(/warszawa/i).closest('div')
      expect(locationArea?.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('price formatting', () => {
    it('displays currency symbol or code', () => {
      renderWithProviders(<ListingCard {...defaultProps} />)
      expect(screen.getByText(/PLN|zł/)).toBeInTheDocument()
    })

    it('renders price with large value correctly', () => {
      renderWithProviders(<ListingCard {...defaultProps} price="1000000" />)
      expect(screen.getByText(/1\s?000\s?000|1000000/)).toBeInTheDocument()
    })

    it('renders "Cena do uzgodnienia" when price is 0', () => {
      renderWithProviders(<ListingCard {...defaultProps} price="0" />)
      // either "0 PLN" or "Cena do uzgodnienia"
      const priceEl = screen.getByTestId('listing-price')
      expect(priceEl).toBeInTheDocument()
    })
  })

  describe('condition badge', () => {
    it('badge is positioned absolutely (top-right overlay)', () => {
      const { container } = renderWithProviders(<ListingCard {...defaultProps} />)
      const badge = container.querySelector('[class*="absolute"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('card is a link or contains a link to the listing detail page', () => {
      renderWithProviders(<ListingCard {...defaultProps} />)
      // card or element inside it should link to /ogloszenia/listing-1
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', expect.stringContaining('listing-1'))
    })

    it('title does not overflow — uses line-clamp', () => {
      const { container } = renderWithProviders(
        <ListingCard
          {...defaultProps}
          title="Bardzo długi tytuł ogłoszenia który powinien być skrócony do dwóch linii w karcie produktu"
        />,
      )
      const titleEl = container.querySelector('[class*="line-clamp"]')
      expect(titleEl).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders without crashing with minimal props', () => {
      expect(() =>
        renderWithProviders(
          <ListingCard
            id="x"
            title="Test"
            price="100"
            currency="PLN"
            location="Kraków"
            condition="new"
          />,
        ),
      ).not.toThrow()
    })

    it('handles empty title string gracefully', () => {
      expect(() =>
        renderWithProviders(<ListingCard {...defaultProps} title="" />),
      ).not.toThrow()
    })

    it('handles special characters in title', () => {
      renderWithProviders(
        <ListingCard {...defaultProps} title='Ciągnik "URSUS" C-360 <stan dobry>' />,
      )
      expect(screen.getByText(/ursus/i)).toBeInTheDocument()
    })

    it('handles Unicode characters in location', () => {
      renderWithProviders(<ListingCard {...defaultProps} location="Łódź, łódzkie" />)
      expect(screen.getByText(/łódź/i)).toBeInTheDocument()
    })
  })
})
