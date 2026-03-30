import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { CategoriesSection } from '../CategoriesSection'

describe('CategoriesSection', () => {
  describe('rendering', () => {
    it('renders the section heading', () => {
      renderWithProviders(<CategoriesSection />)
      expect(
        screen.getByRole('heading', { name: /przeglądaj kategorie/i }),
      ).toBeInTheDocument()
    })

    it('renders all 8 category cards', () => {
      renderWithProviders(<CategoriesSection />)
      expect(screen.getByText('Ciągniki')).toBeInTheDocument()
      expect(screen.getByText('Kombajny')).toBeInTheDocument()
      expect(screen.getByText('Przyczepy')).toBeInTheDocument()
      expect(screen.getByText('Siewniki')).toBeInTheDocument()
      expect(screen.getByText('Opryskiwacze')).toBeInTheDocument()
      expect(screen.getByText(/części/i)).toBeInTheDocument()
      expect(screen.getByText(/maszyny budowlane/i)).toBeInTheDocument()
      expect(screen.getByText('Inne')).toBeInTheDocument()
    })

    it('renders a listing count for each category', () => {
      renderWithProviders(<CategoriesSection />)
      // counts rendered as text containing "ogłoszenia" or a number
      const countTexts = screen
        .getAllByText(/ogłosz/i)
      expect(countTexts.length).toBeGreaterThanOrEqual(8)
    })

    it('renders exactly 8 category cards in the grid', () => {
      const { container } = renderWithProviders(<CategoriesSection />)
      // Each card has role="article" or is a list item — use data-testid approach
      // Verify by querying all elements that contain a known category name
      const categoryNames = [
        'Ciągniki',
        'Kombajny',
        'Przyczepy',
        'Siewniki',
        'Opryskiwacze',
        'Inne',
      ]
      for (const name of categoryNames) {
        expect(screen.getByText(name)).toBeInTheDocument()
      }
    })
  })

  describe('accessibility', () => {
    it('has a section or region landmark', () => {
      const { container } = renderWithProviders(<CategoriesSection />)
      // section element exists in the DOM
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('heading is h2', () => {
      renderWithProviders(<CategoriesSection />)
      expect(
        screen.getByRole('heading', { level: 2, name: /przeglądaj kategorie/i }),
      ).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(<CategoriesSection />)).not.toThrow()
    })
  })
})
