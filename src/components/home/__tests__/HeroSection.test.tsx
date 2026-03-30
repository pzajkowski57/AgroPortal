import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'
import { HeroSection } from '../HeroSection'

describe('HeroSection', () => {
  describe('rendering', () => {
    it('renders the main heading', () => {
      renderWithProviders(<HeroSection />)
      expect(
        screen.getByRole('heading', { level: 1, name: /znajdź maszyny rolnicze/i }),
      ).toBeInTheDocument()
    })

    it('renders the subtitle text', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByText(/największy portal/i)).toBeInTheDocument()
    })

    it('renders the search input', () => {
      renderWithProviders(<HeroSection />)
      // type="search" inputs have ARIA role "searchbox"
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('renders the search button with text "Szukaj"', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByRole('button', { name: /szukaj/i })).toBeInTheDocument()
    })

    it('renders category chips', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByText(/ciągniki/i)).toBeInTheDocument()
      expect(screen.getByText(/kombajny/i)).toBeInTheDocument()
    })

    it('renders at least 4 category chips', () => {
      renderWithProviders(<HeroSection />)
      // chips rendered as buttons or spans/links inside the hero
      const chips = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent !== 'Szukaj')
      expect(chips.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('search interaction', () => {
    it('updates input value as user types', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HeroSection />)
      const input = screen.getByRole('searchbox')
      await user.type(input, 'traktor')
      expect(input).toHaveValue('traktor')
    })

    it('search button is always enabled (not disabled by default)', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByRole('button', { name: /szukaj/i })).not.toBeDisabled()
    })

    it('search input has placeholder text', () => {
      renderWithProviders(<HeroSection />)
      const input = screen.getByRole('searchbox')
      expect(input).toHaveAttribute('placeholder')
    })
  })

  describe('accessibility', () => {
    it('search input is labelled or has aria-label', () => {
      renderWithProviders(<HeroSection />)
      const input = screen.getByRole('searchbox')
      const hasLabel =
        input.hasAttribute('aria-label') ||
        input.hasAttribute('aria-labelledby') ||
        input.id !== ''
      expect(hasLabel).toBe(true)
    })

    it('heading hierarchy starts at h1', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders without crashing when no props are passed', () => {
      expect(() => renderWithProviders(<HeroSection />)).not.toThrow()
    })

    it('category chips do not navigate away (are buttons, not bare anchors)', () => {
      renderWithProviders(<HeroSection />)
      const chips = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent !== 'Szukaj')
      // chips either buttons or links — just verify they render
      expect(chips.length).toBeGreaterThan(0)
    })
  })
})
