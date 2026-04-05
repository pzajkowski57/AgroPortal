import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ListingsGrid } from '../ListingsGrid'
import type { ListingsFilters } from '@/hooks/useListingsFilters'
import type { FindListingsResult } from '@/lib/repositories/listing.repository'

// Mock useListings hook
vi.mock('@/hooks/useListings', () => ({
  useListings: vi.fn(),
}))

import { useListings } from '@/hooks/useListings'

const mockUseListings = useListings as ReturnType<typeof vi.fn>

const DEFAULT_FILTERS: ListingsFilters = {
  q: '',
  category: '',
  voivodeship: '',
  priceMin: '',
  priceMax: '',
  condition: [],
  sort: 'newest',
}

const EMPTY_INITIAL_DATA: FindListingsResult = {
  listings: [],
  nextCursor: null,
  total: 0,
}

function buildListing(overrides = {}) {
  return {
    id: 'listing-1',
    title: 'Ciągnik Ursus C-360',
    price: '25000',
    currency: 'PLN',
    condition: 'used' as const,
    voivodeship: '14',
    city: 'Warszawa',
    images: [],
    ...overrides,
  }
}

describe('ListingsGrid', () => {
  const setSort = vi.fn()
  const resetFilters = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading skeletons when isLoading is true', () => {
    mockUseListings.mockReturnValue({
      listings: [],
      total: 0,
      isLoading: true,
      error: null,
      currentPage: 1,
      totalPages: 0,
      goToPage: vi.fn(),
    })

    const { container } = render(
      <ListingsGrid
        filters={DEFAULT_FILTERS}
        setSort={setSort}
        resetFilters={resetFilters}
        initialData={EMPTY_INITIAL_DATA}
      />,
    )

    const pulseElements = container.querySelectorAll('[class*="animate-pulse"]')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('shows empty state when no listings and not loading', () => {
    mockUseListings.mockReturnValue({
      listings: [],
      total: 0,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 0,
      goToPage: vi.fn(),
    })

    render(
      <ListingsGrid
        filters={DEFAULT_FILTERS}
        setSort={setSort}
        resetFilters={resetFilters}
        initialData={EMPTY_INITIAL_DATA}
      />,
    )

    expect(screen.getByText(/brak ogłoszeń/i)).toBeInTheDocument()
  })

  it('shows error message when error state is present', () => {
    mockUseListings.mockReturnValue({
      listings: [],
      total: 0,
      isLoading: false,
      error: 'HTTP 500',
      currentPage: 1,
      totalPages: 0,
      goToPage: vi.fn(),
    })

    render(
      <ListingsGrid
        filters={DEFAULT_FILTERS}
        setSort={setSort}
        resetFilters={resetFilters}
        initialData={EMPTY_INITIAL_DATA}
      />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/HTTP 500/)).toBeInTheDocument()
  })

  it('renders listing cards when data is available', () => {
    const listings = [
      buildListing({ id: 'l1', title: 'Traktor John Deere' }),
      buildListing({ id: 'l2', title: 'Kombajn Claas' }),
    ]

    mockUseListings.mockReturnValue({
      listings,
      total: 2,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      goToPage: vi.fn(),
    })

    render(
      <ListingsGrid
        filters={DEFAULT_FILTERS}
        setSort={setSort}
        resetFilters={resetFilters}
        initialData={EMPTY_INITIAL_DATA}
      />,
    )

    expect(screen.getByText('Traktor John Deere')).toBeInTheDocument()
    expect(screen.getByText('Kombajn Claas')).toBeInTheDocument()
  })

  it('shows result count', () => {
    mockUseListings.mockReturnValue({
      listings: [buildListing()],
      total: 42,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 3,
      goToPage: vi.fn(),
    })

    render(
      <ListingsGrid
        filters={DEFAULT_FILTERS}
        setSort={setSort}
        resetFilters={resetFilters}
        initialData={EMPTY_INITIAL_DATA}
      />,
    )

    expect(screen.getByText(/42 ogłoszeń/i)).toBeInTheDocument()
  })

  it('shows pagination when totalPages > 1', () => {
    const listings = [buildListing()]
    mockUseListings.mockReturnValue({
      listings,
      total: 50,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 3,
      goToPage: vi.fn(),
    })

    render(
      <ListingsGrid
        filters={DEFAULT_FILTERS}
        setSort={setSort}
        resetFilters={resetFilters}
        initialData={EMPTY_INITIAL_DATA}
      />,
    )

    expect(screen.getByRole('navigation', { name: /paginacja/i })).toBeInTheDocument()
  })

  it('does not show pagination when totalPages <= 1', () => {
    mockUseListings.mockReturnValue({
      listings: [buildListing()],
      total: 5,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      goToPage: vi.fn(),
    })

    render(
      <ListingsGrid
        filters={DEFAULT_FILTERS}
        setSort={setSort}
        resetFilters={resetFilters}
        initialData={EMPTY_INITIAL_DATA}
      />,
    )

    expect(screen.queryByRole('navigation', { name: /paginacja/i })).not.toBeInTheDocument()
  })
})
