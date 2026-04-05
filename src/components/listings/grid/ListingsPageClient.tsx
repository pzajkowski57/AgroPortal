'use client'

import React from 'react'
import { useListingsFilters } from '@/hooks/useListingsFilters'
import { ListingsFilters } from '../filters/ListingsFilters'
import { MobileFiltersSheet } from '../filters/MobileFiltersSheet'
import { ListingsGrid } from './ListingsGrid'
import type { FindListingsResult } from '@/lib/repositories/listing.repository'
import type { SortValue } from '@/lib/schemas/listing'

interface ListingsPageClientProps {
  initialData: FindListingsResult
}

export function ListingsPageClient({ initialData }: ListingsPageClientProps): React.ReactElement {
  const { filters, setFilter, resetFilters, activeFilterCount } = useListingsFilters()

  function setSort(sort: SortValue) {
    setFilter('sort', sort)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile filter trigger — visible on small screens */}
      <div className="lg:hidden">
        <MobileFiltersSheet
          filters={filters}
          setFilter={setFilter}
          resetFilters={resetFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Desktop layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:shrink-0">
          <ListingsFilters
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Grid */}
        <ListingsGrid
          filters={filters}
          setSort={setSort}
          resetFilters={resetFilters}
          initialData={initialData}
        />
      </div>
    </div>
  )
}
