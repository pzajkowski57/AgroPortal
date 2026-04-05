/**
 * ============================================================================
 * REGRESSION TEST SUITE — AgroPortal
 * ============================================================================
 * Run after every sprint to catch broken functionality across the application.
 * Update this file when new features are added, covering critical paths.
 *
 * Run with: npm run test:regression
 * ============================================================================
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockSession } from '@/test/helpers'
import { createListing } from '@/test/factories/listingFactory'

// ---------------------------------------------------------------------------
// Module mocks — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('@/server/db', () => ({
  db: {
    listing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/db', () => ({
  db: {
    listing: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

// NOTE: @/lib/db does not exist as a real file — it is only used by the processor.
// The mock above intercepts the processor's import at test time.

vi.mock('@/lib/email/resend', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

// ---------------------------------------------------------------------------
// Lazy component imports (after mocks)
// ---------------------------------------------------------------------------

// Layout
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'

// Home
import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { FeaturedListings } from '@/components/home/FeaturedListings'
import { StatsSection } from '@/components/home/StatsSection'
import { CTASection } from '@/components/home/CTASection'

// Auth components
import { OAuthButton } from '@/components/auth/OAuthButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength, getStrengthInfo } from '@/components/auth/PasswordStrength'

// Listings — barrel export
import {
  ListingCard,
  ListingCardSkeleton,
  Breadcrumbs,
  ImageGallery,
  ListingDetails,
  SellerCard,
  RelatedListings,
  CategoryAccordion,
  ConditionCheckboxes,
  SortSelect,
} from '@/components/listings'

// Shared UI
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { VoivodeshipSelect } from '@/components/ui/VoivodeshipSelect'

// Repositories
import * as listingRepo from '@/lib/repositories/listing.repository'

// Workers
import { processListingExpiry } from '@/workers/listing-expiry/processor'

// Email template
import { buildListingExpiredEmail } from '@/lib/email/templates/listing-expired'

// DB mocks
import { db as serverDb } from '@/server/db'
import { resend } from '@/lib/email/resend'

// libDb is the mock for @/lib/db used by the processor — access via vi.mocked
// We get it after vi.mock('@/lib/db') is hoisted and the import is resolved below.
// We define a helper reference lazily in the describe blocks instead.

// ---------------------------------------------------------------------------
// Navigation mock setup (overrides setup.ts for specific pathname tests)
// ---------------------------------------------------------------------------

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

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated', update: vi.fn() }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(null)),
}))

beforeEach(() => {
  mockUsePathname.mockReturnValue('/')
  vi.clearAllMocks()
})

// ============================================================================
// 1. NAVIGATION & ROUTING
// ============================================================================

describe('Navigation & Routing', () => {
  describe('Header renders with correct navigation links', () => {
    it('renders header element', () => {
      renderWithProviders(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('logo links to /', () => {
      renderWithProviders(<Header />)
      expect(screen.getByRole('link', { name: /agroportal/i })).toHaveAttribute('href', '/')
    })

    it('renders /ogloszenia nav link', () => {
      renderWithProviders(<Header />)
      const nav = screen.getByRole('navigation', { name: 'Nawigacja główna' })
      expect(nav.querySelector('a[href="/ogloszenia"]')).toBeInTheDocument()
    })

    it('renders Zaloguj się link pointing to /auth/signin (not /logowanie)', () => {
      renderWithProviders(<Header />)
      const loginLink = screen.getByRole('link', { name: /zaloguj się/i })
      expect(loginLink).toHaveAttribute('href', '/auth/signin')
    })

    it('renders "Dodaj ogłoszenie" button linking to /ogloszenia/dodaj', () => {
      renderWithProviders(<Header />)
      expect(screen.getByRole('link', { name: /dodaj ogłoszenie/i })).toHaveAttribute(
        'href',
        '/ogloszenia/dodaj',
      )
    })

    it('active nav link is marked with aria-current="page"', () => {
      mockUsePathname.mockReturnValue('/ogloszenia')
      renderWithProviders(<Header />)
      const nav = screen.getByRole('navigation', { name: 'Nawigacja główna' })
      const activeLink = nav.querySelector('[aria-current="page"]')
      expect(activeLink).toBeInTheDocument()
    })
  })

  describe('Footer renders', () => {
    it('renders footer element', () => {
      render(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('footer contains Ogłoszenia nav link', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link', { name: /ogłoszenia/i })
      expect(links.length).toBeGreaterThan(0)
    })

    it('footer displays copyright text', () => {
      render(<Footer />)
      expect(screen.getByText(/wszelkie prawa zastrzeżone/i)).toBeInTheDocument()
    })
  })

  describe('Mobile nav opens and closes', () => {
    it('hamburger button opens mobile nav', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Header />)
      await user.click(screen.getByRole('button', { name: /otwórz menu/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('MobileNav renders when isOpen is true', () => {
      renderWithProviders(<MobileNav isOpen={true} onClose={vi.fn()} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('MobileNav does not render dialog when isOpen is false', () => {
      renderWithProviders(<MobileNav isOpen={false} onClose={vi.fn()} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('MobileNav close button calls onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderWithProviders(<MobileNav isOpen={true} onClose={onClose} />)
      await user.click(screen.getByRole('button', { name: /zamknij menu/i }))
      expect(onClose).toHaveBeenCalledOnce()
    })
  })
})

// ============================================================================
// 2. HOMEPAGE SECTIONS
// ============================================================================

describe('Homepage', () => {
  describe('HeroSection', () => {
    it('renders with search input', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('renders main heading at h1 level', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('renders Szukaj button', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByRole('button', { name: /szukaj/i })).toBeInTheDocument()
    })

    it('renders category chips (Ciągniki, Kombajny visible)', () => {
      renderWithProviders(<HeroSection />)
      expect(screen.getByText(/ciągniki/i)).toBeInTheDocument()
      expect(screen.getByText(/kombajny/i)).toBeInTheDocument()
    })
  })

  describe('CategoriesSection', () => {
    it('renders section heading', () => {
      renderWithProviders(<CategoriesSection />)
      expect(screen.getByRole('heading', { name: /przeglądaj kategorie/i })).toBeInTheDocument()
    })

    it('renders category cards (at least 4)', () => {
      renderWithProviders(<CategoriesSection />)
      // Each category is a link — CategoriesSection uses ?kategoria= query param
      const categoryLinks = screen.getAllByRole('link').filter((l) =>
        l.getAttribute('href')?.includes('kategoria=') || l.getAttribute('href')?.includes('category='),
      )
      expect(categoryLinks.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('FeaturedListings', () => {
    it('renders featured listings section heading', () => {
      renderWithProviders(<FeaturedListings />)
      // Heading reads "Najnowsze ogłoszenia"
      expect(screen.getByRole('heading', { name: /najnowsze ogłoszenia/i })).toBeInTheDocument()
    })

    it('renders listing cards', () => {
      renderWithProviders(<FeaturedListings />)
      // Each placeholder listing card renders a link to its detail page
      const listingLinks = screen.getAllByRole('link').filter((l) =>
        l.getAttribute('href')?.includes('featured-'),
      )
      expect(listingLinks.length).toBeGreaterThan(0)
    })

    it('renders "Zobacz wszystkie ogłoszenia" link', () => {
      renderWithProviders(<FeaturedListings />)
      expect(screen.getByRole('link', { name: /zobacz wszystkie/i })).toBeInTheDocument()
    })
  })

  describe('StatsSection', () => {
    it('renders statistics section', () => {
      renderWithProviders(<StatsSection />)
      // Stats section renders numeric values
      expect(screen.getByText(/ogłoszeń/i)).toBeInTheDocument()
    })

    it('renders user count stat', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText(/użytkowników/i)).toBeInTheDocument()
    })

    it('renders 16 voivodeships stat', () => {
      renderWithProviders(<StatsSection />)
      expect(screen.getByText('16')).toBeInTheDocument()
    })
  })

  describe('CTASection', () => {
    it('renders CTA heading', () => {
      renderWithProviders(<CTASection />)
      expect(screen.getByRole('heading', { name: /dodaj swoje ogłoszenie/i })).toBeInTheDocument()
    })

    it('renders Dodaj ogłoszenie link', () => {
      renderWithProviders(<CTASection />)
      expect(screen.getByRole('link', { name: /dodaj ogłoszenie/i })).toBeInTheDocument()
    })
  })
})

// ============================================================================
// 3. AUTH PAGES
// ============================================================================

describe('Auth Pages', () => {
  describe('Login page components', () => {
    it('PasswordInput renders password field with label', () => {
      renderWithProviders(
        <PasswordInput id="password" label="Hasło" name="password" />,
      )
      expect(screen.getByLabelText('Hasło')).toBeInTheDocument()
    })

    it('PasswordInput has visibility toggle button', () => {
      renderWithProviders(
        <PasswordInput id="password" label="Hasło" name="password" />,
      )
      expect(screen.getByRole('button', { name: /pokaż hasło/i })).toBeInTheDocument()
    })

    it('PasswordInput toggle switches input type from password to text', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PasswordInput id="password" label="Hasło" name="password" />,
      )
      const input = screen.getByLabelText('Hasło')
      expect(input).toHaveAttribute('type', 'password')
      await user.click(screen.getByRole('button', { name: /pokaż hasło/i }))
      expect(input).toHaveAttribute('type', 'text')
    })

    it('PasswordInput toggle button label changes to Ukryj hasło when visible', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PasswordInput id="password" label="Hasło" name="password" />,
      )
      await user.click(screen.getByRole('button', { name: /pokaż hasło/i }))
      expect(screen.getByRole('button', { name: /ukryj hasło/i })).toBeInTheDocument()
    })

    it('OAuthButton renders with label', () => {
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={vi.fn()} />,
      )
      expect(screen.getByRole('button', { name: /kontynuuj z google/i })).toBeInTheDocument()
    })

    it('OAuthButton disables when isLoading is true', () => {
      renderWithProviders(
        <OAuthButton provider="google" label="Kontynuuj z Google" onClick={vi.fn()} isLoading />,
      )
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Registration page — PasswordStrength indicator', () => {
    it('renders nothing when password is empty', () => {
      const { container } = renderWithProviders(<PasswordStrength password="" />)
      expect(container.firstChild).toBeNull()
    })

    it('shows Słabe for short password', () => {
      renderWithProviders(<PasswordStrength password="abc" />)
      expect(screen.getByText(/słabe/i)).toBeInTheDocument()
    })

    it('shows Średnie for 8-char lowercase password', () => {
      renderWithProviders(<PasswordStrength password="abcdefgh" />)
      expect(screen.getByText(/średnie/i)).toBeInTheDocument()
    })

    it('shows Mocne for password with uppercase, digit', () => {
      renderWithProviders(<PasswordStrength password="Password1" />)
      expect(screen.getByText(/mocne/i)).toBeInTheDocument()
    })

    it('shows Bardzo mocne for complex password', () => {
      renderWithProviders(<PasswordStrength password="Password1!longxx" />)
      expect(screen.getByText(/bardzo mocne/i)).toBeInTheDocument()
    })

    it('getStrengthInfo returns weak for empty/short password', () => {
      expect(getStrengthInfo('abc').level).toBe('weak')
    })

    it('getStrengthInfo returns medium for 8-char lowercase', () => {
      expect(getStrengthInfo('abcdefgh').level).toBe('medium')
    })

    it('getStrengthInfo returns strong for Password1', () => {
      expect(getStrengthInfo('Password1').level).toBe('strong')
    })

    it('getStrengthInfo returns very-strong for Password1!longxx', () => {
      expect(getStrengthInfo('Password1!longxx').level).toBe('very-strong')
    })
  })
})

// ============================================================================
// 4. LISTINGS PAGE (/ogloszenia)
// ============================================================================

describe('Listings Page', () => {
  describe('Filters sidebar components', () => {
    it('CategoryAccordion renders all category options', () => {
      renderWithProviders(<CategoryAccordion value="" onChange={vi.fn()} />)
      expect(screen.getByText('Ciągniki')).toBeInTheDocument()
      expect(screen.getByText('Kombajny')).toBeInTheDocument()
      expect(screen.getByText('Wszystkie kategorie')).toBeInTheDocument()
    })

    it('CategoryAccordion calls onChange when category is clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(<CategoryAccordion value="" onChange={onChange} />)
      await user.click(screen.getByText('Ciągniki'))
      expect(onChange).toHaveBeenCalledWith('ciagniki')
    })

    it('CategoryAccordion shows at least 8 category options', () => {
      renderWithProviders(<CategoryAccordion value="" onChange={vi.fn()} />)
      const buttons = screen.getAllByRole('button')
      // 8 categories + "Wszystkie" = 9 buttons
      expect(buttons.length).toBeGreaterThanOrEqual(8)
    })

    it('ConditionCheckboxes renders 3 options (Nowy, Używany, Na części)', () => {
      renderWithProviders(<ConditionCheckboxes value={[]} onChange={vi.fn()} />)
      expect(screen.getByText('Nowy')).toBeInTheDocument()
      expect(screen.getByText('Używany')).toBeInTheDocument()
      expect(screen.getByText('Na części')).toBeInTheDocument()
    })

    it('ConditionCheckboxes calls onChange when checkbox is clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(<ConditionCheckboxes value={[]} onChange={onChange} />)
      await user.click(screen.getByRole('checkbox', { name: /nowy/i }))
      expect(onChange).toHaveBeenCalledWith(['new'])
    })

    it('ConditionCheckboxes removes value when already-checked checkbox is unchecked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(<ConditionCheckboxes value={['new']} onChange={onChange} />)
      await user.click(screen.getByRole('checkbox', { name: /nowy/i }))
      expect(onChange).toHaveBeenCalledWith([])
    })

    it('SortSelect renders all sort options', () => {
      renderWithProviders(<SortSelect value="newest" onChange={vi.fn()} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /najnowsze/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /rosnąco/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /malejąco/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /popularne/i })).toBeInTheDocument()
    })

    it('SortSelect calls onChange when value changes', () => {
      const onChange = vi.fn()
      renderWithProviders(<SortSelect value="newest" onChange={onChange} />)
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price_asc' } })
      expect(onChange).toHaveBeenCalledWith('price_asc')
    })
  })

  describe('ListingCardSkeleton', () => {
    it('renders skeleton card during loading', () => {
      const { container } = renderWithProviders(<ListingCardSkeleton />)
      expect(container.querySelector('[class*="animate-pulse"]')).toBeInTheDocument()
    })

    it('skeleton has aria-hidden (not announced to screen readers)', () => {
      const { container } = renderWithProviders(<ListingCardSkeleton />)
      const skeleton = container.firstChild as Element
      expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    })
  })
})

// ============================================================================
// 5. LISTING DETAIL (/ogloszenia/[id])
// ============================================================================

describe('Listing Detail', () => {
  describe('Breadcrumbs', () => {
    const breadcrumbItems = [
      { label: 'Ogłoszenia', href: '/ogloszenia' },
      { label: 'Ciągniki', href: '/ogloszenia?category=ciagniki' },
      { label: 'Ciągnik John Deere 6120M' },
    ]

    it('renders all breadcrumb labels', () => {
      renderWithProviders(<Breadcrumbs items={breadcrumbItems} />)
      expect(screen.getByText('Ogłoszenia')).toBeInTheDocument()
      expect(screen.getByText('Ciągniki')).toBeInTheDocument()
      expect(screen.getByText('Ciągnik John Deere 6120M')).toBeInTheDocument()
    })

    it('renders correct hierarchy — links for non-last items', () => {
      renderWithProviders(<Breadcrumbs items={breadcrumbItems} />)
      const links = screen.getAllByRole('link')
      expect(links.length).toBe(2)
      expect(links[0]).toHaveAttribute('href', '/ogloszenia')
    })

    it('last breadcrumb item is not a link', () => {
      renderWithProviders(<Breadcrumbs items={breadcrumbItems} />)
      const lastItem = screen.getByText('Ciągnik John Deere 6120M')
      expect(lastItem.tagName).not.toBe('A')
    })

    it('last breadcrumb item has aria-current="page"', () => {
      renderWithProviders(<Breadcrumbs items={breadcrumbItems} />)
      expect(screen.getByText('Ciągnik John Deere 6120M')).toHaveAttribute(
        'aria-current',
        'page',
      )
    })
  })

  describe('ImageGallery', () => {
    const mockImages = [
      { id: 'img-1', url: 'https://example.com/img1.jpg', order: 0 },
      { id: 'img-2', url: 'https://example.com/img2.jpg', order: 1 },
    ]

    it('renders main image when images provided', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik John Deere" />)
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })

    it('renders thumbnails for multiple images', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik John Deere" />)
      // Thumbnails list container is rendered via role="list" with aria-label="Miniatury zdjęć"
      const thumbsContainer = screen.getByRole('list', { name: /miniatury zdjęć/i })
      expect(thumbsContainer).toBeInTheDocument()
      // Each thumbnail is a button inside the list
      const thumbButtons = thumbsContainer.querySelectorAll('button')
      expect(thumbButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('renders empty state when no images provided', () => {
      renderWithProviders(<ImageGallery images={[]} title="Ciągnik John Deere" />)
      expect(screen.getByText(/brak zdjęć/i)).toBeInTheDocument()
    })

    it('opens lightbox when main image is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik John Deere" />)
      await user.click(screen.getByRole('button', { name: /otwórz galerię/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('ListingDetails', () => {
    const defaultProps = {
      title: 'Ciągnik John Deere 6120M',
      price: '280000',
      currency: 'PLN',
      condition: 'used' as const,
      voivodeshipName: 'Mazowieckie',
      city: 'Warszawa',
      createdAt: new Date('2024-03-15T10:00:00Z'),
    }

    it('renders title as h1', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Ciągnik John Deere 6120M',
      )
    })

    it('renders price and currency', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      const priceEl = screen.getByTestId('listing-detail-price')
      expect(priceEl).toHaveTextContent(/280/)
      expect(priceEl).toHaveTextContent(/PLN/)
    })

    it('renders "Cena do uzgodnienia" for price 0', () => {
      renderWithProviders(<ListingDetails {...defaultProps} price="0" />)
      expect(screen.getByText(/cena do uzgodnienia/i)).toBeInTheDocument()
    })

    it('renders condition badge: used → Używany', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByText('Używany')).toBeInTheDocument()
    })

    it('renders condition badge: new → Nowy', () => {
      renderWithProviders(<ListingDetails {...defaultProps} condition="new" />)
      expect(screen.getByText('Nowy')).toBeInTheDocument()
    })

    it('renders condition badge: for_parts → Na części', () => {
      renderWithProviders(<ListingDetails {...defaultProps} condition="for_parts" />)
      expect(screen.getByText('Na części')).toBeInTheDocument()
    })

    it('renders voivodeship and city', () => {
      renderWithProviders(<ListingDetails {...defaultProps} />)
      expect(screen.getByText(/mazowieckie/i)).toBeInTheDocument()
      expect(screen.getByText(/warszawa/i)).toBeInTheDocument()
    })
  })

  describe('SellerCard', () => {
    const sellerProps = {
      userId: 'user-1',
      name: 'Jan Kowalski',
      memberSince: new Date('2022-01-01'),
    }

    it('renders seller name', () => {
      renderWithProviders(<SellerCard {...sellerProps} />)
      expect(screen.getByText('Jan Kowalski')).toBeInTheDocument()
    })

    it('renders "Sprzedający" heading', () => {
      renderWithProviders(<SellerCard {...sellerProps} />)
      expect(screen.getByRole('heading', { name: /sprzedający/i })).toBeInTheDocument()
    })

    it('renders "Członek od" text', () => {
      renderWithProviders(<SellerCard {...sellerProps} />)
      expect(screen.getByText(/członek od/i)).toBeInTheDocument()
    })

    it('renders link to seller other listings', () => {
      renderWithProviders(<SellerCard {...sellerProps} />)
      const link = screen.getByRole('link', { name: /inne ogłoszenia/i })
      expect(link).toHaveAttribute('href', '/ogloszenia?userId=user-1')
    })
  })

  describe('RelatedListings', () => {
    const relatedListings = [
      createListing({ id: 'related-1', title: 'Traktor ABC', price: '100000' }),
      createListing({ id: 'related-2', title: 'Kombajn XYZ', price: '200000' }),
    ].map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      currency: l.currency,
      condition: l.condition,
      voivodeship: l.voivodeship,
      city: l.city,
    }))

    it('renders related listings section', () => {
      renderWithProviders(<RelatedListings listings={relatedListings} />)
      expect(screen.getByRole('region', { name: /podobne ogłoszenia/i })).toBeInTheDocument()
    })

    it('renders listing cards for each related listing', () => {
      renderWithProviders(<RelatedListings listings={relatedListings} />)
      expect(screen.getByText('Traktor ABC')).toBeInTheDocument()
      expect(screen.getByText('Kombajn XYZ')).toBeInTheDocument()
    })

    it('returns null when no related listings', () => {
      const { container } = renderWithProviders(<RelatedListings listings={[]} />)
      expect(container.firstChild).toBeNull()
    })
  })
})

// ============================================================================
// 6. API ENDPOINTS (unit-level via repository mocks)
// ============================================================================

describe('API Endpoints — unit level', () => {
  const mockDb = vi.mocked(serverDb)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/listings', () => {
    it('findListings returns listings array and total', async () => {
      const mockListings = [
        createListing({ id: 'listing-1' }),
        createListing({ id: 'listing-2' }),
      ]
      mockDb.listing.findMany.mockResolvedValue(mockListings as never)
      mockDb.listing.count.mockResolvedValue(2)

      const result = await listingRepo.findListings({ limit: 20 })

      expect(result.listings).toHaveLength(2)
      expect(result.total).toBe(2)
    })

    it('findListings filters by category slug', async () => {
      mockDb.listing.findMany.mockResolvedValue([])
      mockDb.listing.count.mockResolvedValue(0)

      await listingRepo.findListings({ limit: 20, category: 'ciagniki' })

      const callArgs = mockDb.listing.findMany.mock.calls[0][0] as { where?: Record<string, unknown> }
      expect(callArgs?.where?.['category']).toEqual({ slug: 'ciagniki' })
    })

    it('findListings filters by voivodeship', async () => {
      mockDb.listing.findMany.mockResolvedValue([])
      mockDb.listing.count.mockResolvedValue(0)

      await listingRepo.findListings({ limit: 20, voivodeship: '14' })

      const callArgs = mockDb.listing.findMany.mock.calls[0][0] as { where?: Record<string, unknown> }
      expect(callArgs?.where?.['voivodeship']).toBe('14')
    })

    it('findListings filters by price range', async () => {
      mockDb.listing.findMany.mockResolvedValue([])
      mockDb.listing.count.mockResolvedValue(0)

      await listingRepo.findListings({
        limit: 20,
        priceMin: 10000,
        priceMax: 50000,
      })

      const callArgs = mockDb.listing.findMany.mock.calls[0][0] as { where?: Record<string, unknown> }
      const priceWhere = callArgs?.where?.['price'] as Record<string, number>
      expect(priceWhere?.gte).toBe(10000)
      expect(priceWhere?.lte).toBe(50000)
    })

    it('findListings filters by multiple conditions', async () => {
      mockDb.listing.findMany.mockResolvedValue([])
      mockDb.listing.count.mockResolvedValue(0)

      await listingRepo.findListings({ limit: 20, condition: ['new', 'used'] })

      const callArgs = mockDb.listing.findMany.mock.calls[0][0] as { where?: Record<string, unknown> }
      expect(callArgs?.where?.['condition']).toEqual({ in: ['new', 'used'] })
    })

    it('findListings applies sort: price_asc', async () => {
      mockDb.listing.findMany.mockResolvedValue([])
      mockDb.listing.count.mockResolvedValue(0)

      await listingRepo.findListings({ limit: 20, sort: 'price_asc' })

      const callArgs = mockDb.listing.findMany.mock.calls[0][0] as { orderBy?: unknown[] }
      const orderBy = callArgs?.orderBy as Array<Record<string, string>>
      const hasPriceAsc = orderBy?.some((o) => o['price'] === 'asc')
      expect(hasPriceAsc).toBe(true)
    })
  })

  describe('GET /api/v1/listings/[id]', () => {
    it('findListingById returns single listing', async () => {
      const mockListing = createListing({ id: 'listing-1' })
      mockDb.listing.findUnique.mockResolvedValue(mockListing as never)

      const result = await listingRepo.findListingById('listing-1')
      expect(result).toEqual(mockListing)
    })

    it('findListingById returns null for missing listing', async () => {
      mockDb.listing.findUnique.mockResolvedValue(null)

      const result = await listingRepo.findListingById('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('POST /api/v1/listings — requires authentication', () => {
    it('returns 401 when no session', async () => {
      const { auth } = await import('@/auth')
      vi.mocked(auth).mockResolvedValue(null)

      const { POST } = await import('@/app/api/v1/listings/route')
      const req = new Request('http://localhost/api/v1/listings', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
      })
      const res = await POST(req)
      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/v1/listings/[id] — requires ownership', () => {
    it('returns 401 when not authenticated', async () => {
      const { auth } = await import('@/auth')
      vi.mocked(auth).mockResolvedValue(null)

      const { PATCH } = await import('@/app/api/v1/listings/[id]/route')
      const req = new Request('http://localhost/api/v1/listings/listing-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      })
      const res = await PATCH(req, { params: Promise.resolve({ id: 'listing-1' }) })
      expect(res.status).toBe(401)
    })

    it('returns 403 when authenticated as non-owner', async () => {
      const { auth } = await import('@/auth')
      vi.mocked(auth).mockResolvedValue(createMockSession('user') as never)

      mockDb.listing.findUnique.mockResolvedValue(
        createListing({ id: 'listing-1', userId: 'different-user-id' }) as never,
      )

      const { PATCH } = await import('@/app/api/v1/listings/[id]/route')
      const req = new Request('http://localhost/api/v1/listings/listing-1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      })
      const res = await PATCH(req, { params: Promise.resolve({ id: 'listing-1' }) })
      expect(res.status).toBe(403)
    })
  })

  describe('findRelatedListings', () => {
    it('returns related listings excluding current listing id', async () => {
      const relatedListings = [createListing({ id: 'related-1' })]
      mockDb.listing.findMany.mockResolvedValue(relatedListings as never)

      const result = await listingRepo.findRelatedListings({
        id: 'listing-1',
        categoryId: 'category-1',
      })

      const callArgs = mockDb.listing.findMany.mock.calls[0][0] as { where?: Record<string, unknown> }
      const idWhere = callArgs?.where?.['id'] as Record<string, string>
      expect(idWhere?.not).toBe('listing-1')
      expect(result).toHaveLength(1)
    })
  })
})

// ============================================================================
// 7. SHARED COMPONENTS
// ============================================================================

describe('Shared Components', () => {
  describe('Button', () => {
    it('renders with default variant', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders with outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>)
      const btn = container.querySelector('button')
      expect(btn?.className).toMatch(/outline|border/)
    })

    it('renders as disabled when disabled prop is passed', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Card', () => {
    it('renders children', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>,
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('accepts value and onChange', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Input value="" onChange={onChange} />)
      await user.type(screen.getByRole('textbox'), 'hello')
      expect(onChange).toHaveBeenCalled()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text..." />)
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
    })
  })

  describe('PaginationControls', () => {
    it('renders page numbers for multi-page results', () => {
      render(
        <PaginationControls
          currentPage={1}
          totalPages={5}
          onPageChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
    })

    it('calls onPageChange when page number clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      render(
        <PaginationControls
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        />,
      )
      await user.click(screen.getByRole('button', { name: '3' }))
      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('disables Previous button on first page', () => {
      render(
        <PaginationControls
          currentPage={1}
          totalPages={5}
          onPageChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: /poprzednia/i })).toBeDisabled()
    })

    it('disables Next button on last page', () => {
      render(
        <PaginationControls
          currentPage={5}
          totalPages={5}
          onPageChange={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: /następna/i })).toBeDisabled()
    })
  })

  describe('VoivodeshipSelect', () => {
    it('renders select trigger with placeholder', () => {
      render(<VoivodeshipSelect onChange={vi.fn()} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders correct aria-label', () => {
      render(<VoivodeshipSelect onChange={vi.fn()} placeholder="Wybierz województwo" />)
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-label',
        'Wybierz województwo',
      )
    })
  })
})

// ============================================================================
// 8. REPOSITORY LAYER
// ============================================================================

describe('Repository Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findListings returns paginated results with nextCursor when there are more pages', async () => {
    // Return limit+1 items to trigger next page detection
    const items = Array.from({ length: 21 }, (_, i) =>
      createListing({ id: `listing-${i + 1}` }),
    )
    vi.mocked(serverDb).listing.findMany.mockResolvedValue(items as never)
    vi.mocked(serverDb).listing.count.mockResolvedValue(50)

    const result = await listingRepo.findListings({ limit: 20 })

    expect(result.listings).toHaveLength(20)
    expect(result.nextCursor).toBe('listing-20')
    expect(result.total).toBe(50)
  })

  it('findListings returns null nextCursor on last page', async () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      createListing({ id: `listing-${i + 1}` }),
    )
    vi.mocked(serverDb).listing.findMany.mockResolvedValue(items as never)
    vi.mocked(serverDb).listing.count.mockResolvedValue(5)

    const result = await listingRepo.findListings({ limit: 20 })

    expect(result.nextCursor).toBeNull()
  })

  it('findListingById returns listing when found', async () => {
    const mockListing = createListing({ id: 'listing-1' })
    vi.mocked(serverDb).listing.findUnique.mockResolvedValue(mockListing as never)

    const result = await listingRepo.findListingById('listing-1')
    expect(result).not.toBeNull()
  })

  it('findListingById returns null when not found', async () => {
    vi.mocked(serverDb).listing.findUnique.mockResolvedValue(null)

    const result = await listingRepo.findListingById('nonexistent')
    expect(result).toBeNull()
  })

  it('findRelatedListings returns up to 4 listings from same category', async () => {
    const related = [
      createListing({ id: 'r1' }),
      createListing({ id: 'r2' }),
      createListing({ id: 'r3' }),
    ]
    vi.mocked(serverDb).listing.findMany.mockResolvedValue(related as never)

    const result = await listingRepo.findRelatedListings({
      id: 'listing-1',
      categoryId: 'category-1',
    })

    const callArgs = vi.mocked(serverDb).listing.findMany.mock.calls[0][0] as { take?: number }
    expect(callArgs?.take).toBe(4)
    expect(result).toHaveLength(3)
  })

  it('findListings applies price_desc sort correctly', async () => {
    vi.mocked(serverDb).listing.findMany.mockResolvedValue([])
    vi.mocked(serverDb).listing.count.mockResolvedValue(0)

    await listingRepo.findListings({ limit: 20, sort: 'price_desc' })

    const callArgs = vi.mocked(serverDb).listing.findMany.mock.calls[0][0] as { orderBy?: unknown[] }
    const orderBy = callArgs?.orderBy as Array<Record<string, string>>
    const hasPriceDesc = orderBy?.some((o) => o['price'] === 'desc')
    expect(hasPriceDesc).toBe(true)
  })

  it('findListings filters by full-text search term (q)', async () => {
    vi.mocked(serverDb).listing.findMany.mockResolvedValue([])
    vi.mocked(serverDb).listing.count.mockResolvedValue(0)

    await listingRepo.findListings({ limit: 20, q: 'traktor' })

    const callArgs = vi.mocked(serverDb).listing.findMany.mock.calls[0][0] as { where?: Record<string, unknown> }
    expect(callArgs?.where?.['OR']).toBeDefined()
  })
})

// ============================================================================
// 9. BACKGROUND JOBS
// ============================================================================

describe('Background Jobs — Listing Expiry Processor', () => {
  // processListingExpiry uses @/lib/db which is mocked via vi.mock above.
  // We access mock functions via vi.mocked after dynamic import.
  let mockFindMany: ReturnType<typeof vi.fn>
  let mockUpdateMany: ReturnType<typeof vi.fn>
  const mockResend = vi.mocked(resend)

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
    mockResend.emails.send.mockResolvedValue({ data: { id: 'email-id' }, error: null } as never)

    // Resolve the mocked @/lib/db module to get typed mock functions
    const libDbMod = await vi.importMock<{ db: { listing: { findMany: ReturnType<typeof vi.fn>; updateMany: ReturnType<typeof vi.fn> } } }>('@/lib/db')
    mockFindMany = libDbMod.db.listing.findMany
    mockUpdateMany = libDbMod.db.listing.updateMany
    mockUpdateMany.mockResolvedValue({ count: 0 })
  })

  it('returns zeros when no expired listings found', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await processListingExpiry()

    expect(result).toEqual({ expired: 0, emailsSent: 0, emailsFailed: 0 })
  })

  it('does not call updateMany when no listings found', async () => {
    mockFindMany.mockResolvedValue([])

    await processListingExpiry()

    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it('expires found listings via updateMany', async () => {
    const listings = [
      { id: '1', title: 'Listing 1', slug: 'listing-1', user: { email: 'a@b.com', name: 'A' } },
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 1 })

    const result = await processListingExpiry()

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ['1'] } },
      data: { status: 'expired' },
    })
    expect(result.expired).toBe(1)
  })

  it('sends email for listings with valid user email', async () => {
    const listings = [
      { id: '1', title: 'Traktor', slug: 'traktor', user: { email: 'jan@example.com', name: 'Jan' } },
      { id: '2', title: 'Kombajn', slug: 'kombajn', user: { email: 'anna@example.com', name: 'Anna' } },
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 2 })

    const result = await processListingExpiry()

    expect(mockResend.emails.send).toHaveBeenCalledTimes(2)
    expect(result.emailsSent).toBe(2)
    expect(result.emailsFailed).toBe(0)
  })

  it('handles null user gracefully — skips email but still expires', async () => {
    const listings = [
      { id: '1', title: 'Traktor', slug: 'traktor', user: null },
      { id: '2', title: 'Kombajn', slug: 'kombajn', user: { email: 'jan@example.com', name: 'Jan' } },
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 2 })

    const result = await processListingExpiry()

    expect(result.expired).toBe(2)
    expect(mockResend.emails.send).toHaveBeenCalledTimes(1)
    expect(result.emailsSent).toBe(1)
  })

  it('skips emails when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY

    const listings = [
      { id: '1', title: 'Traktor', slug: 'traktor', user: { email: 'jan@example.com', name: 'Jan' } },
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 1 })

    const result = await processListingExpiry()

    expect(result.expired).toBe(1)
    expect(result.emailsSent).toBe(0)
    expect(mockResend.emails.send).not.toHaveBeenCalled()
  })

  it('counts emailsFailed when one send fails', async () => {
    const listings = [
      { id: '1', title: 'Listing 1', slug: 'l1', user: { email: 'a@b.com', name: 'A' } },
      { id: '2', title: 'Listing 2', slug: 'l2', user: { email: 'c@d.com', name: 'C' } },
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 2 })
    mockResend.emails.send
      .mockResolvedValueOnce({ data: { id: 'ok' }, error: null } as never)
      .mockRejectedValueOnce(new Error('SMTP error'))

    const result = await processListingExpiry()

    expect(result.emailsSent).toBe(1)
    expect(result.emailsFailed).toBe(1)
  })

  describe('Email template', () => {
    it('buildListingExpiredEmail generates correct subject', () => {
      const { subject } = buildListingExpiredEmail({
        listingTitle: 'Traktor John Deere',
        listingUrl: 'https://agroportal.pl/ogloszenia/traktor-john-deere',
        userName: 'Jan',
      })
      expect(subject).toContain('wygasło')
    })

    it('buildListingExpiredEmail HTML contains listing title', () => {
      const { html } = buildListingExpiredEmail({
        listingTitle: 'Traktor John Deere',
        listingUrl: 'https://agroportal.pl/ogloszenia/traktor-john-deere',
        userName: 'Jan',
      })
      expect(html).toContain('Traktor John Deere')
    })

    it('buildListingExpiredEmail HTML contains listing URL', () => {
      const url = 'https://agroportal.pl/ogloszenia/traktor-john-deere'
      const { html } = buildListingExpiredEmail({
        listingTitle: 'Traktor',
        listingUrl: url,
        userName: 'Jan',
      })
      expect(html).toContain(url)
    })

    it('buildListingExpiredEmail HTML contains user name', () => {
      const { html } = buildListingExpiredEmail({
        listingTitle: 'Traktor',
        listingUrl: 'https://agroportal.pl/ogloszenia/traktor',
        userName: 'Marek Kowalski',
      })
      expect(html).toContain('Marek Kowalski')
    })

    it('buildListingExpiredEmail escapes HTML special characters in title', () => {
      const { html } = buildListingExpiredEmail({
        listingTitle: '<script>alert("xss")</script>',
        listingUrl: 'https://agroportal.pl/ogloszenia/test',
        userName: 'Jan',
      })
      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
    })

    it('buildListingExpiredEmail contains Przedłuż ogłoszenie CTA', () => {
      const { html } = buildListingExpiredEmail({
        listingTitle: 'Traktor',
        listingUrl: 'https://agroportal.pl/ogloszenia/traktor',
        userName: 'Jan',
      })
      expect(html).toContain('Przedłuż ogłoszenie')
    })
  })
})

// ============================================================================
// 10. LISTING CARD — smoke tests
// ============================================================================

describe('ListingCard — smoke tests', () => {
  const baseProps = {
    id: 'listing-1',
    title: 'Ciągnik John Deere 6120M',
    price: '280000',
    currency: 'PLN',
    location: 'Warszawa, mazowieckie',
    condition: 'used' as const,
  }

  it('renders listing title', () => {
    renderWithProviders(<ListingCard {...baseProps} />)
    expect(screen.getByText('Ciągnik John Deere 6120M')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    renderWithProviders(<ListingCard {...baseProps} />)
    expect(screen.getByText(/280\s?000/)).toBeInTheDocument()
  })

  it('renders location', () => {
    renderWithProviders(<ListingCard {...baseProps} />)
    expect(screen.getByText(/warszawa/i)).toBeInTheDocument()
  })

  it('renders condition badge: Używany', () => {
    renderWithProviders(<ListingCard {...baseProps} />)
    expect(screen.getByText(/używan/i)).toBeInTheDocument()
  })

  it('card links to /ogloszenia/listing-1', () => {
    renderWithProviders(<ListingCard {...baseProps} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toContain('listing-1')
  })

  it('renders without crashing with all 3 condition values', () => {
    for (const condition of ['new', 'used', 'for_parts'] as const) {
      expect(() =>
        renderWithProviders(<ListingCard {...baseProps} condition={condition} />),
      ).not.toThrow()
    }
  })
})
