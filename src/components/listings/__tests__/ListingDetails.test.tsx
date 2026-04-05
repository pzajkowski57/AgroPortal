import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { ListingDetails, type ListingDetailsProps } from '../ListingDetails'

const defaultProps: ListingDetailsProps = {
  title: 'Ciągnik John Deere 6120M',
  price: '280000',
  currency: 'PLN',
  condition: 'used',
  voivodeshipName: 'Mazowieckie',
  city: 'Warszawa',
  createdAt: new Date('2024-03-15T10:00:00Z'),
}

describe('ListingDetails', () => {
  describe('rendering', () => {
    it('renders title as h1', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Ciągnik John Deere 6120M')
    })

    it('renders formatted price with currency', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      const priceEl = screen.getByTestId('listing-detail-price')
      expect(priceEl).toHaveTextContent(/280/)
      expect(priceEl).toHaveTextContent(/PLN/)
    })

    it('shows "Cena do uzgodnienia" for price 0', () => {
      renderWithProviders(<ListingDetails {...defaultProps} price="0" />)
      expect(screen.getByText(/cena do uzgodnienia/i)).toBeInTheDocument()
    })

    it('renders condition badge for used condition', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByText('Używany')).toBeInTheDocument()
    })

    it('renders condition badge for new condition', () => {
      renderWithProviders(<ListingDetails {...defaultProps} condition="new" />)
      expect(screen.getByText('Nowy')).toBeInTheDocument()
    })

    it('renders condition badge for for_parts condition', () => {
      renderWithProviders(<ListingDetails {...defaultProps} condition="for_parts" />)
      expect(screen.getByText('Na części')).toBeInTheDocument()
    })

    it('renders location with voivodeship and city', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByText(/mazowieckie/i)).toBeInTheDocument()
      expect(screen.getByText(/warszawa/i)).toBeInTheDocument()
    })

    it('renders "Dodano:" date', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByText(/dodano:/i)).toBeInTheDocument()
    })

    it('renders Kontakt button', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByRole('button', { name: /kontakt/i })).toBeInTheDocument()
    })

    it('renders Zapisz button', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByRole('button', { name: /zapisz/i })).toBeInTheDocument()
    })
  })

  describe('condition badge styles', () => {
    it('new condition badge has green styling', () => {
      const { container } = renderWithProviders(<ListingDetails {...defaultProps} condition="new" />)
      const badge = container.querySelector('[class*="bg-green"]')
      expect(badge).toBeInTheDocument()
    })

    it('used condition badge has blue styling', () => {
      const { container } = renderWithProviders(<ListingDetails {...defaultProps} condition="used" />)
      const badge = container.querySelector('[class*="bg-blue"]')
      expect(badge).toBeInTheDocument()
    })

    it('for_parts condition badge has orange styling', () => {
      const { container } = renderWithProviders(<ListingDetails {...defaultProps} condition="for_parts" />)
      const badge = container.querySelector('[class*="bg-orange"]')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('price has aria-label with value', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      const priceEl = screen.getByLabelText(/cena:/i)
      expect(priceEl).toBeInTheDocument()
    })

    it('CTA buttons have min touch target size class', () => {
      const { container } = renderWithProviders(<ListingDetails {...defaultProps} />)
      const buttons = container.querySelectorAll('button[class*="min-h"]')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })
})
