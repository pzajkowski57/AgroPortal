import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('renders AgroPortal logo text', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText('AgroPortal')).toBeInTheDocument()
  })

  it('renders the Sprout logo link pointing to home', () => {
    renderWithProviders(<Footer />)

    const logoLink = screen.getByRole('link', { name: /agroportal/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('renders all navigation links with correct hrefs', () => {
    renderWithProviders(<Footer />)

    const navLinks: Array<{ label: string; href: string }> = [
      { label: 'Ogłoszenia', href: '/ogloszenia' },
      { label: 'Baza Firm', href: '/baza-firm' },
      { label: 'Giełda', href: '/gielda' },
      { label: 'Aktualności', href: '/aktualnosci' },
    ]

    for (const { label, href } of navLinks) {
      const link = screen.getByRole('link', { name: label })
      expect(link).toHaveAttribute('href', href)
    }
  })

  it('renders informational links', () => {
    renderWithProviders(<Footer />)

    const infoLinks = ['O nas', 'Kontakt', 'Polityka prywatności', 'Regulamin']
    for (const label of infoLinks) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('renders Facebook social link', () => {
    renderWithProviders(<Footer />)

    const facebookLink = screen.getByRole('link', { name: /facebook/i })
    expect(facebookLink).toBeInTheDocument()
  })

  it('renders Twitter/X social link', () => {
    renderWithProviders(<Footer />)

    const twitterLink = screen.getByRole('link', { name: /twitter|x/i })
    expect(twitterLink).toBeInTheDocument()
  })

  it('renders copyright text with current year and AgroPortal branding', () => {
    renderWithProviders(<Footer />)

    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
    expect(screen.getByText(/wszelkie prawa zastrzeżone/i)).toBeInTheDocument()
  })

  it('has dark background styling', () => {
    const { container } = renderWithProviders(<Footer />)

    const footer = container.querySelector('footer')
    expect(footer).toBeInTheDocument()
    expect(footer?.className).toMatch(/bg-gray-900/)
  })

  it('renders a navigation landmark for main footer nav', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('navigation section heading is visible', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText(/nawigacja/i)).toBeInTheDocument()
  })

  it('informational section heading is visible', () => {
    renderWithProviders(<Footer />)

    expect(screen.getByText(/informacje/i)).toBeInTheDocument()
  })
})
