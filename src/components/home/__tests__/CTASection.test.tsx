import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { CTASection } from '../CTASection'

describe('CTASection', () => {
  describe('rendering', () => {
    it('renders the main CTA heading', () => {
      renderWithProviders(<CTASection />)
      expect(
        screen.getByRole('heading', { name: /dodaj swoje ogłoszenie za darmo/i }),
      ).toBeInTheDocument()
    })

    it('heading is h2', () => {
      renderWithProviders(<CTASection />)
      expect(
        screen.getByRole('heading', { level: 2, name: /dodaj swoje ogłoszenie za darmo/i }),
      ).toBeInTheDocument()
    })

    it('renders a CTA button or link', () => {
      renderWithProviders(<CTASection />)
      // Either a button or a link that triggers adding listing
      const ctaEl =
        screen.queryByRole('button', { name: /dodaj ogłoszenie/i }) ??
        screen.queryByRole('link', { name: /dodaj ogłoszenie/i })
      expect(ctaEl).toBeInTheDocument()
    })

    it('CTA button links to the add listing page', () => {
      renderWithProviders(<CTASection />)
      const link =
        screen.queryByRole('link', { name: /dodaj ogłoszenie/i })
      if (link) {
        expect(link).toHaveAttribute('href', expect.stringContaining('/ogloszenia'))
      }
    })
  })

  describe('accessibility', () => {
    it('has a section landmark', () => {
      const { container } = renderWithProviders(<CTASection />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })

    it('heading text is descriptive and non-empty', () => {
      renderWithProviders(<CTASection />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.textContent?.trim().length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(<CTASection />)).not.toThrow()
    })
  })
})
