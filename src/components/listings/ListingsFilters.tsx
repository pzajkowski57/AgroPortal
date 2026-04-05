'use client'

import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { VoivodeshipSelect } from '@/components/ui/VoivodeshipSelect'
import { useDebounce } from '@/hooks/useDebounce'
import { CategoryAccordion } from './CategoryAccordion'
import { PriceRangeInput } from './PriceRangeInput'
import { ConditionCheckboxes } from './ConditionCheckboxes'
import type { ListingsFilters as Filters } from '@/hooks/useListingsFilters'
import type { ListingCondition } from '@/types'
import type { SortValue } from '@/lib/schemas/listing'

const DEBOUNCE_DELAY = 400 // ms

interface ListingsFiltersProps {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
  activeFilterCount: number
}

export function ListingsFilters({
  filters,
  setFilter,
  resetFilters,
  activeFilterCount,
}: ListingsFiltersProps): React.ReactElement {
  const [searchInput, setSearchInput] = useState(filters.q)
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY)

  // Sync debounced search to URL
  React.useEffect(() => {
    setFilter('q', debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  return (
    <aside className="w-full space-y-5 lg:w-60">
      {/* Search */}
      <div>
        <label htmlFor="search-input" className="mb-2 block text-sm font-semibold text-foreground">
          Szukaj
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="search-input"
            type="search"
            placeholder="Wyszukaj ogłoszenie..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 text-sm"
            aria-label="Wyszukaj ogłoszenia"
          />
        </div>
      </div>

      <hr className="border-green-200" />

      {/* Category */}
      <CategoryAccordion
        value={filters.category}
        onChange={(slug) => setFilter('category', slug)}
      />

      <hr className="border-green-200" />

      {/* Voivodeship */}
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Województwo</p>
        <VoivodeshipSelect
          value={filters.voivodeship}
          onChange={(val) => setFilter('voivodeship', val)}
        />
      </div>

      <hr className="border-green-200" />

      {/* Price range */}
      <PriceRangeInput
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        onMinChange={(val) => setFilter('priceMin', val)}
        onMaxChange={(val) => setFilter('priceMax', val)}
      />

      <hr className="border-green-200" />

      {/* Condition */}
      <ConditionCheckboxes
        value={filters.condition}
        onChange={(val: ListingCondition[]) => setFilter('condition', val)}
      />

      {/* Reset */}
      {activeFilterCount > 0 && (
        <>
          <hr className="border-green-200" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="w-full gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Wyczyść filtry ({activeFilterCount})
          </Button>
        </>
      )}
    </aside>
  )
}

// Re-export so parent can use SortValue without extra import
export type { SortValue }
