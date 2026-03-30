import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'
import { MobileNav } from '../MobileNav'

const mockUsePathname = vi.fn(() => '/')

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  mockUsePathname.mockReturnValue('/')
})

describe('MobileNav — when open', () => {
  it('renders a dialog/sheet when open', () => {
    renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders all navigation links inside the sheet', () => {
    renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')

    const navLinks = [
      { label: 'Ogłoszenia', href: '/ogloszenia' },
      { label: 'Baza Firm', href: '/baza-firm' },
      { label: 'Giełda', href: '/gielda' },
      { label: 'Aktualności', href: '/aktualnosci' },
    ]

    for (const { label, href } of navLinks) {
      const link = within(dialog).getByRole('link', { name: label })
      expect(link).toHaveAttribute('href', href)
    }
  })

  it('calls onClose when a nav link is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<MobileNav isOpen={true} onClose={onClose} />)
    const dialog = screen.getByRole('dialog')
    const link = within(dialog).getByRole('link', { name: 'Ogłoszenia' })
    await user.click(link)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('highlights active link based on current pathname', () => {
    mockUsePathname.mockReturnValue('/baza-firm')
    renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    const activeLink = within(dialog).getByRole('link', { name: 'Baza Firm' })
    expect(activeLink.className).toMatch(/font-semibold/)
  })

  it('renders "Dodaj ogłoszenie" CTA inside the sheet', () => {
    renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('link', { name: /dodaj ogłoszenie/i })).toBeInTheDocument()
  })
})

describe('MobileNav — when closed', () => {
  it('does not render a dialog when closed', () => {
    renderWithProviders(<MobileNav isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('MobileNav — accessibility', () => {
  it('dialog has a visible title / accessible name', () => {
    renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName()
  })

  it('nav links are stacked (block display or flex-col) inside the sheet', () => {
    renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    const nav = within(dialog).getByRole('navigation')
    expect(nav.className).toMatch(/flex-col|block/)
  })
})
