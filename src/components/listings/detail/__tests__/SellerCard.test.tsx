import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { SellerCard, type SellerCardProps } from '../SellerCard'

const defaultProps: SellerCardProps = {
  userId: 'user-123',
  name: 'Jan Kowalski',
  image: null,
  memberSince: new Date('2022-06-01T00:00:00Z'),
}

describe('SellerCard', () => {
  describe('rendering', () => {
    it('renders "Sprzedający" heading', () => {
      renderWithProviders(<SellerCard {...defaultProps} />)
      expect(screen.getByText('Sprzedający')).toBeInTheDocument()
    })

    it('renders seller name', () => {
      renderWithProviders(<SellerCard {...defaultProps} />)
      expect(screen.getByText('Jan Kowalski')).toBeInTheDocument()
    })

    it('renders "Członek od" text', () => {
      renderWithProviders(<SellerCard {...defaultProps} />)
      expect(screen.getByText(/członek od/i)).toBeInTheDocument()
    })

    it('renders link to other seller listings', () => {
      renderWithProviders(<SellerCard {...defaultProps} />)
      const link = screen.getByRole('link', { name: /inne ogłoszenia/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('user-123'))
    })

    it('renders user icon placeholder when no image', () => {
      const { container } = renderWithProviders(<SellerCard {...defaultProps} />)
      const avatar = container.querySelector('svg')
      expect(avatar).toBeInTheDocument()
    })

    it('renders image when provided', () => {
      const { container } = renderWithProviders(
        <SellerCard {...defaultProps} image="https://example.com/avatar.jpg" />,
      )
      // Avatar wrapper is aria-hidden; use DOM query to verify image renders
      const img = container.querySelector('img[alt*="Avatar"]')
      expect(img).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders without crashing with minimal props', () => {
      expect(() => renderWithProviders(<SellerCard {...defaultProps} />)).not.toThrow()
    })

    it('handles Unicode characters in name', () => {
      renderWithProviders(<SellerCard {...defaultProps} name="Łukasz Ącki" />)
      expect(screen.getByText('Łukasz Ącki')).toBeInTheDocument()
    })
  })
})
