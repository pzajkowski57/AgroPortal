import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ListingsFilters } from '../ListingsFilters'
import type { ListingsFilters as Filters } from '@/hooks/useListingsFilters'

const DEFAULT_FILTERS: Filters = {
  q: '',
  category: '',
  voivodeship: '',
  priceMin: '',
  priceMax: '',
  condition: [],
  sort: 'newest',
}

function buildProps(overrides: Partial<Filters> = {}) {
  const setFilter = vi.fn()
  const resetFilters = vi.fn()

  return {
    filters: { ...DEFAULT_FILTERS, ...overrides },
    setFilter,
    resetFilters,
    activeFilterCount: 0,
    setFilterMock: setFilter,
    resetFiltersMock: resetFilters,
  }
}

describe('ListingsFilters', () => {
  it('renders search input', () => {
    const { filters, setFilter, resetFilters } = buildProps()
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={0}
      />,
    )
    expect(screen.getByPlaceholderText(/wyszukaj/i)).toBeInTheDocument()
  })

  it('renders voivodeship select', () => {
    const { filters, setFilter, resetFilters } = buildProps()
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={0}
      />,
    )
    // "Województwo" appears as section heading; getAllByText handles multiple matches
    const matches = screen.getAllByText(/województwo/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('renders condition checkboxes', () => {
    const { filters, setFilter, resetFilters } = buildProps()
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={0}
      />,
    )
    expect(screen.getByText('Nowy')).toBeInTheDocument()
    expect(screen.getByText('Używany')).toBeInTheDocument()
    expect(screen.getByText('Na części')).toBeInTheDocument()
  })

  it('does not show reset button when activeFilterCount is 0', () => {
    const { filters, setFilter, resetFilters } = buildProps()
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={0}
      />,
    )
    expect(screen.queryByText(/wyczyść/i)).not.toBeInTheDocument()
  })

  it('shows reset button when activeFilterCount > 0', () => {
    const { filters, setFilter, resetFilters } = buildProps({ q: 'traktor' })
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={1}
      />,
    )
    expect(screen.getByText(/wyczyść filtry/i)).toBeInTheDocument()
  })

  it('calls resetFilters when reset button is clicked', () => {
    const { filters, setFilter, resetFilters } = buildProps({ q: 'test' })
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={1}
      />,
    )

    fireEvent.click(screen.getByText(/wyczyść filtry/i))
    expect(resetFilters).toHaveBeenCalledOnce()
  })

  it('renders price range inputs', () => {
    const { filters, setFilter, resetFilters } = buildProps()
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={0}
      />,
    )
    expect(screen.getByPlaceholderText('Od')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Do')).toBeInTheDocument()
  })

  it('renders category accordion', () => {
    const { filters, setFilter, resetFilters } = buildProps()
    render(
      <ListingsFilters
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={0}
      />,
    )
    expect(screen.getByText('Kategoria')).toBeInTheDocument()
    expect(screen.getByText('Ciągniki')).toBeInTheDocument()
  })
})
