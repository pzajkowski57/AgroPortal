/**
 * Regression Test Suite — AgroPortal
 *
 * Purpose: Guard every critical path that exists today so that future sprints
 * cannot accidentally break navigation, auth flows, or homepage sections.
 *
 * How to extend:
 *   1. Add a new `describe` block (e.g. "Sprint 3: Listings") when a new feature lands.
 *   2. Keep each test focused on WHAT renders and WHERE links point — not styling.
 *   3. If a component requires a new server-action mock, add it at the top of the
 *      relevant describe block with `vi.mock(...)`.
 *
 * Mocks that apply globally (next/navigation, next-auth/react) are already set up
 * in src/test/setup.ts and do not need to be repeated here.
 */

import React from 'react'
import { screen, within } from '@testing-library/react'
import { vi } from 'vitest'

// next-auth — vi.fn version so we can override per-test with mockReturnValueOnce
import * as NextAuthReact from 'next-auth/react'

// Layout components
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { UserMenu } from '@/components/layout/UserMenu'
import { Footer } from '@/components/layout/Footer'
import { NAV_LINKS } from '@/components/layout/nav-links'

// Home sections
import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { FeaturedListings } from '@/components/home/FeaturedListings'
import { StatsSection } from '@/components/home/StatsSection'
import { CTASection } from '@/components/home/CTASection'

// Auth pages — server-action dependencies mocked below
import LogowaniePage from '@/app/logowanie/page'
import RejestracjaPage from '@/app/rejestracja/page'

// Test helpers
import { renderWithProviders, createMockSession } from '@/test/helpers'

// ---------------------------------------------------------------------------
// Server-action mocks (pages call these at import time via closure)
// ---------------------------------------------------------------------------

vi.mock('@/app/logowanie/actions', () => ({
  loginAction: vi.fn(),
}))

vi.mock('@/app/rejestracja/actions', () => ({
  registerAction: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Override next-auth/react mock to expose useSession as vi.fn so individual
// tests can call mockReturnValueOnce on it.
// setup.ts already mocks this module; here we just reassign useSession.
// ---------------------------------------------------------------------------

vi.mock('next-auth/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('next-auth/react')>()
  return {
    ...original,
    useSession: vi.fn(() => ({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(() => Promise.resolve(null)),
  }
})

// ---------------------------------------------------------------------------
// Sprint 1-2: Navigation
// ---------------------------------------------------------------------------

describe('Sprint 1-2: Navigation', () => {
  describe('NAV_LINKS constant', () => {
    it('exports the expected four navigation entries', () => {
      const hrefs = NAV_LINKS.map((l) => l.href)
      expect(hrefs).toContain('/ogloszenia')
      expect(hrefs).toContain('/baza-firm')
      expect(hrefs).toContain('/gielda')
      expect(hrefs).toContain('/aktualnosci')
    })
  })

  describe('Header — desktop navigation', () => {
    beforeEach(() => {
      renderWithProviders(<Header />)
    })

    it('renders the logo linking to /', () => {
      const logoLink = screen.getByRole('link', { name: /agroportal/i })
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toHaveAttribute('href', '/')
    })

    it('renders all NAV_LINKS in desktop nav', () => {
      const nav = screen.getByRole('navigation', { name: /nawigacja główna/i })
      NAV_LINKS.forEach(({ label, href }) => {
        const link = within(nav).getByRole('link', { name: label })
        expect(link).toHaveAttribute('href', href)
      })
    })

    it('"Dodaj ogłoszenie" CTA links to /ogloszenia/dodaj', () => {
      const ctaLinks = screen.getAllByRole('link', { name: /dodaj ogłoszenie/i })
      // The header renders the CTA inside the actions area
      const ctaLink = ctaLinks.find((el) => el.getAttribute('href') === '/ogloszenia/dodaj')
      expect(ctaLink).toBeTruthy()
      expect(ctaLink).toHaveAttribute('href', '/ogloszenia/dodaj')
    })

    it('has a skip-to-content link', () => {
      const skipLink = screen.getByRole('link', { name: /przejdź do treści/i })
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })

    it('header element has the sticky class', () => {
      const headerEl = document.querySelector('header')
      expect(headerEl).toHaveClass('sticky')
    })
  })

  describe('MobileNav — navigation parity', () => {
    it('contains all the same nav links as desktop', () => {
      renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
      const nav = screen.getByRole('navigation', { name: /nawigacja mobilna/i })
      NAV_LINKS.forEach(({ label, href }) => {
        const link = within(nav).getByRole('link', { name: label })
        expect(link).toHaveAttribute('href', href)
      })
    })

    it('"Dodaj ogłoszenie" in mobile nav links to /ogloszenia/dodaj', () => {
      renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
      const link = screen.getByRole('link', { name: /dodaj ogłoszenie/i })
      expect(link).toHaveAttribute('href', '/ogloszenia/dodaj')
    })
  })

  describe('Footer', () => {
    it('renders', () => {
      renderWithProviders(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// Sprint 1-2: Auth
// ---------------------------------------------------------------------------

describe('Sprint 1-2: Auth', () => {
  describe('UserMenu — unauthenticated', () => {
    it('shows "Zaloguj się" link pointing to /logowanie (not /auth/signin)', () => {
      renderWithProviders(<UserMenu />)
      const link = screen.getByRole('link', { name: /zaloguj się/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/logowanie')
      expect(link).not.toHaveAttribute('href', '/auth/signin')
    })

    it('does NOT show user menu button when unauthenticated', () => {
      renderWithProviders(<UserMenu />)
      expect(screen.queryByRole('button', { name: /menu użytkownika/i })).toBeNull()
    })
  })

  describe('UserMenu — authenticated', () => {
    it('shows the user menu button and hides "Zaloguj się"', () => {
      vi.mocked(NextAuthReact.useSession).mockReturnValueOnce({
        data: createMockSession('user'),
        status: 'authenticated',
        update: vi.fn(),
      })

      renderWithProviders(<UserMenu />, { session: createMockSession('user') })
      expect(screen.getByRole('button', { name: /menu użytkownika/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /zaloguj się/i })).toBeNull()
    })
  })

  describe('Login page (/logowanie)', () => {
    beforeEach(() => {
      renderWithProviders(<LogowaniePage />)
    })

    it('renders an email input', () => {
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    })

    it('renders a password input', () => {
      // Use the input id directly to avoid matching the "Pokaż hasło" toggle button
      expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeInTheDocument()
      expect(document.getElementById('password')).toBeInTheDocument()
    })

    it('has a link to /rejestracja', () => {
      const link = screen.getByRole('link', { name: /zarejestruj się/i })
      expect(link).toHaveAttribute('href', '/rejestracja')
    })
  })

  describe('Registration page (/rejestracja)', () => {
    beforeEach(() => {
      renderWithProviders(<RejestracjaPage />)
    })

    it('renders an email input', () => {
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    })

    it('renders a password input', () => {
      // Multiple password fields — just verify at least one exists
      const passwordInputs = screen.getAllByLabelText(/hasło/i)
      expect(passwordInputs.length).toBeGreaterThanOrEqual(1)
    })

    it('renders a name (Imię) input', () => {
      expect(screen.getByLabelText(/imię/i)).toBeInTheDocument()
    })

    it('renders the terms acceptance checkbox', () => {
      const checkbox = screen.getByRole('checkbox', { name: /akceptuję/i })
      expect(checkbox).toBeInTheDocument()
    })

    it('has a link back to /logowanie', () => {
      const link = screen.getByRole('link', { name: /zaloguj się/i })
      expect(link).toHaveAttribute('href', '/logowanie')
    })
  })
})

// ---------------------------------------------------------------------------
// Sprint 1-2: Homepage Sections
// ---------------------------------------------------------------------------

describe('Sprint 1-2: Homepage Sections', () => {
  it('HeroSection renders with a search input', () => {
    renderWithProviders(<HeroSection />)
    // The hero search input has aria-label via a <label for="hero-search">
    expect(screen.getByLabelText(/szukaj ogłoszeń/i)).toBeInTheDocument()
  })

  it('CategoriesSection renders category links', () => {
    renderWithProviders(<CategoriesSection />)
    expect(screen.getByRole('heading', { name: /przeglądaj kategorie/i })).toBeInTheDocument()
    // Should render category links (at least one)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('FeaturedListings renders the section heading', () => {
    renderWithProviders(<FeaturedListings />)
    expect(screen.getByRole('heading', { name: /najnowsze ogłoszenia/i })).toBeInTheDocument()
  })

  it('FeaturedListings renders a "Zobacz wszystkie" link to /ogloszenia', () => {
    renderWithProviders(<FeaturedListings />)
    const link = screen.getByRole('link', { name: /zobacz wszystkie/i })
    expect(link).toHaveAttribute('href', '/ogloszenia')
  })

  it('StatsSection renders', () => {
    renderWithProviders(<StatsSection />)
    expect(screen.getByRole('region', { name: /statystyki platformy/i })).toBeInTheDocument()
  })

  it('CTASection renders a call-to-action link', () => {
    renderWithProviders(<CTASection />)
    const link = screen.getByRole('link', { name: /dodaj ogłoszenie/i })
    expect(link).toBeInTheDocument()
  })

  it('All 5 homepage sections can be rendered without crashing', () => {
    const { unmount: u1 } = renderWithProviders(<HeroSection />)
    u1()
    const { unmount: u2 } = renderWithProviders(<CategoriesSection />)
    u2()
    const { unmount: u3 } = renderWithProviders(<FeaturedListings />)
    u3()
    const { unmount: u4 } = renderWithProviders(<StatsSection />)
    u4()
    renderWithProviders(<CTASection />)
  })
})
