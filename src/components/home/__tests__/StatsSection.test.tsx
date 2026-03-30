import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { StatsSection } from '../StatsSection'

describe('StatsSection', () => {
  describe('stats rendering', () => {
    it('renders the Ogłoszeń stat', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText('1 250+')).toBeInTheDocument()
      expect(screen.getByText('Ogłoszeń')).toBeInTheDocument()
    })

    it('renders the Firm stat', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText('340+')).toBeInTheDocument()
      expect(screen.getByText('Firm')).toBeInTheDocument()
    })

    it('renders the Użytkowników stat', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText('5 600+')).toBeInTheDocument()
      expect(screen.getByText('Użytkowników')).toBeInTheDocument()
    })

    it('renders the Województw stat', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText('16')).toBeInTheDocument()
      expect(screen.getByText('Województw')).toBeInTheDocument()
    })

    it('renders all 4 stat items', () => {
      renderWithProviders(<StatsSection />)
      const statLabels = ['Ogłoszeń', 'Firm', 'Użytkowników', 'Województw']
      for (const label of statLabels) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
    })
  })

  describe('trust badges rendering', () => {
    it('renders "Bezpłatne ogłoszenia" trust badge', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText(/bezpłatne ogłoszenia/i)).toBeInTheDocument()
    })

    it('renders "Weryfikowane firmy" trust badge', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText(/weryfikowane firmy/i)).toBeInTheDocument()
    })

    it('renders "Bezpieczne transakcje" trust badge', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText(/bezpieczne transakcje/i)).toBeInTheDocument()
    })

    it('renders all 3 trust badges', () => {
      renderWithProviders(<StatsSection />)
      const badges = [
        /bezpłatne ogłoszenia/i,
        /weryfikowane firmy/i,
        /bezpieczne transakcje/i,
      ]
      for (const badge of badges) {
        expect(screen.getByText(badge)).toBeInTheDocument()
      }
    })

    it('renders Lucide icons for trust badges (svg elements)', () => {
      const { container } = renderWithProviders(<StatsSection />)
      const svgs = container.querySelectorAll('svg')
      // 3 trust badge icons + 4 stat icons (optional) = at least 3
      expect(svgs.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('accessibility', () => {
    it('has a section landmark', () => {
      const { container } = renderWithProviders(<StatsSection />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders without crashing', () => {
      expect(() => renderWithProviders(<StatsSection />)).not.toThrow()
    })
  })
})
