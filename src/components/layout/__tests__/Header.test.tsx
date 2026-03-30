import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockSession } from '@/test/helpers'
import { Header } from '../Header'

// ---------------------------------------------------------------------------
// next/navigation mock is already in setup.ts
// usePathname returns '/' by default
// next-auth/react mock is already in setup.ts
// useSession returns { data: null, status: 'unauthenticated' } by default
// ---------------------------------------------------------------------------

const mockUsePathname = vi.fn(() => '/')
const mockUseSession = vi.fn(() => ({ data: null, status: 'unauthenticated', update: vi.fn() }))

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

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(null)),
}))

beforeEach(() => {
  mockUsePathname.mockReturnValue('/')
  mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: vi.fn() })
})

describe('Header — structure and accessibility', () => {
  it('renders a <header> element', () => {
    renderWithProviders(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('has sticky positioning class', () => {
    const { container } = renderWithProviders(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toMatch(/sticky/)
  })

  it('has correct z-index class (z-50)', () => {
    const { container } = renderWithProviders(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toMatch(/z-50/)
  })

  it('has white / bg-card background', () => {
    const { container } = renderWithProviders(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toMatch(/bg-card/)
  })

  it('has h-16 height class', () => {
    const { container } = renderWithProviders(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toMatch(/h-16/)
  })

  it('has border-b class', () => {
    const { container } = renderWithProviders(<Header />)
    const header = container.querySelector('header')
    expect(header?.className).toMatch(/border-b/)
  })

  it('renders a skip-to-content link as first focusable element', () => {
    const { container } = renderWithProviders(<Header />)
    const skipLink = container.querySelector('a[href="#main-content"]')
    expect(skipLink).toBeInTheDocument()
  })

  it('renders a main nav with aria-label="Nawigacja główna"', () => {
    renderWithProviders(<Header />)
    expect(screen.getByRole('navigation', { name: 'Nawigacja główna' })).toBeInTheDocument()
  })
})

describe('Header — logo', () => {
  it('renders "AgroPortal" text in the logo', () => {
    renderWithProviders(<Header />)
    expect(screen.getByText('AgroPortal')).toBeInTheDocument()
  })

  it('logo is a link pointing to "/"', () => {
    renderWithProviders(<Header />)
    const logoLink = screen.getByRole('link', { name: /agroportal/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('logo link has agro-500 color class', () => {
    renderWithProviders(<Header />)
    const logoLink = screen.getByRole('link', { name: /agroportal/i })
    expect(logoLink.className).toMatch(/text-agro-500/)
  })

  it('renders Leaf icon inside the logo (aria-hidden)', () => {
    renderWithProviders(<Header />)
    const logoLink = screen.getByRole('link', { name: /agroportal/i })
    const svg = logoLink.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Header — desktop navigation links', () => {
  const navLinks = [
    { label: 'Ogłoszenia', href: '/ogloszenia' },
    { label: 'Baza Firm', href: '/baza-firm' },
    { label: 'Giełda', href: '/gielda' },
    { label: 'Aktualności', href: '/aktualnosci' },
  ]

  for (const { label, href } of navLinks) {
    it(`renders desktop nav link "${label}" with href "${href}"`, () => {
      renderWithProviders(<Header />)
      const nav = screen.getByRole('navigation', { name: 'Nawigacja główna' })
      const link = within(nav).getByRole('link', { name: label })
      expect(link).toHaveAttribute('href', href)
    })
  }

  it('active nav link has font-semibold and text-agro-600 classes', () => {
    mockUsePathname.mockReturnValue('/ogloszenia')
    renderWithProviders(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Nawigacja główna' })
    const activeLink = within(nav).getByRole('link', { name: 'Ogłoszenia' })
    expect(activeLink.className).toMatch(/font-semibold/)
    expect(activeLink.className).toMatch(/text-agro-600/)
  })

  it('inactive nav link does not have active classes', () => {
    mockUsePathname.mockReturnValue('/ogloszenia')
    renderWithProviders(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Nawigacja główna' })
    const inactiveLink = within(nav).getByRole('link', { name: 'Giełda' })
    expect(inactiveLink.className).not.toMatch(/font-semibold.*text-agro-600/)
  })

  it('desktop nav is hidden below lg breakpoint', () => {
    renderWithProviders(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Nawigacja główna' })
    expect(nav.className).toMatch(/hidden/)
    expect(nav.className).toMatch(/lg:flex/)
  })
})

describe('Header — search input (desktop)', () => {
  it('renders a search input', () => {
    renderWithProviders(<Header />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('search input has placeholder text', () => {
    renderWithProviders(<Header />)
    const input = screen.getByRole('searchbox')
    expect(input).toHaveAttribute('placeholder')
    expect(input.getAttribute('placeholder')).not.toBe('')
  })

  it('search input is hidden below lg breakpoint', () => {
    renderWithProviders(<Header />)
    const input = screen.getByRole('searchbox')
    const wrapper = input.closest('[class*="hidden"]')
    expect(wrapper).toBeTruthy()
  })
})

describe('Header — "Dodaj ogłoszenie" CTA button', () => {
  it('renders the CTA link', () => {
    renderWithProviders(<Header />)
    expect(screen.getByRole('link', { name: /dodaj ogłoszenie/i })).toBeInTheDocument()
  })

  it('CTA link has correct href to /ogloszenia/dodaj', () => {
    renderWithProviders(<Header />)
    const link = screen.getByRole('link', { name: /dodaj ogłoszenie/i })
    expect(link).toHaveAttribute('href', '/ogloszenia/dodaj')
  })

  it('CTA link has orange background class', () => {
    renderWithProviders(<Header />)
    const link = screen.getByRole('link', { name: /dodaj ogłoszenie/i })
    expect(link.className).toMatch(/bg-orange-500/)
  })
})

describe('Header — user menu (unauthenticated)', () => {
  it('renders "Zaloguj się" link when not authenticated', () => {
    renderWithProviders(<Header />)
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toBeInTheDocument()
  })

  it('"Zaloguj się" link points to /auth/signin', () => {
    renderWithProviders(<Header />)
    const loginLink = screen.getByRole('link', { name: /zaloguj się/i })
    expect(loginLink).toHaveAttribute('href', '/auth/signin')
  })
})

describe('Header — user menu (authenticated)', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: createMockSession('user'),
      status: 'authenticated',
      update: vi.fn(),
    })
  })

  it('renders user avatar button when authenticated', () => {
    renderWithProviders(<Header />)
    const avatarBtn = screen.getByRole('button', { name: /menu użytkownika/i })
    expect(avatarBtn).toBeInTheDocument()
  })

  it('does not render "Zaloguj się" when authenticated', () => {
    renderWithProviders(<Header />)
    expect(screen.queryByRole('link', { name: /zaloguj się/i })).not.toBeInTheDocument()
  })

  it('opens dropdown menu when avatar is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)
    await user.click(screen.getByRole('button', { name: /menu użytkownika/i }))
    expect(screen.getByText(/wyloguj/i)).toBeInTheDocument()
  })
})

describe('Header — mobile hamburger button', () => {
  it('renders a hamburger menu button', () => {
    renderWithProviders(<Header />)
    expect(screen.getByRole('button', { name: /otwórz menu/i })).toBeInTheDocument()
  })

  it('hamburger button is visible only below lg (has lg:hidden class)', () => {
    renderWithProviders(<Header />)
    const btn = screen.getByRole('button', { name: /otwórz menu/i })
    expect(btn.className).toMatch(/lg:hidden/)
  })

  it('hamburger button has aria-expanded="false" when menu is closed', () => {
    renderWithProviders(<Header />)
    const btn = screen.getByRole('button', { name: /otwórz menu/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking hamburger button opens mobile navigation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)
    await user.click(screen.getByRole('button', { name: /otwórz menu/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
