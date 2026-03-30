import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { FeaturedListings } from '../FeaturedListings'

describe('FeaturedListings', () => {
  describe('rendering', () => {
    it('renders the section heading', () => {
      renderWithProviders(<FeaturedListings />)
      expect(
        screen.getByRole('heading', { name: /najnowsze ogłoszenia/i }),
      ).toBeInTheDocument()
    })

    it('renders listing cards', () => {
      renderWithProviders(<FeaturedListings />)
      // At least one listing card should be present
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('renders "Zobacz wszystkie" link', () => {
      renderWithProviders(<FeaturedListings />)
      expect(screen.getByRole('link', { name: /zobacz wszystkie/i })).toBeInTheDocument()
    })

    it('"Zobacz wszystkie" link points to /ogloszenia', () => {
      renderWithProviders(<FeaturedListings />)
      const link = screen.getByRole('link', { name: /zobacz wszystkie/i })
      expect(link).toHaveAttribute('href', '/ogloszenia')
    })

    it('renders up to 4 listing cards', () => {
      renderWithProviders(<FeaturedListings />)
      // Each listing card has a link with href containing an ID
      const listingLinks = screen
        .getAllByRole('link')
        .filter((a) => a.getAttribute('href')?.includes('/ogloszenia/'))
      expect(listingLinks.length).toBeLessThanOrEqual(4)
    })
  })

  describe('accessibility', () => {
    it('heading is h2', () => {
      renderWithProviders(<FeaturedListings />)
      expect(
        screen.getByRole('heading', { level: 2, name: /najnowsze ogłoszenia/i }),
      ).toBeInTheDocument()
    })

    it('has a section landmark', () => {
      const { container } = renderWithProviders(<FeaturedListings />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(<FeaturedListings />)).not.toThrow()
    })
  })
})
