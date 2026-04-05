'use client'

import React from 'react'
import { ListingCard } from '../cards/ListingCard'
import { ListingCardSkeleton } from '../cards/ListingCardSkeleton'
import { SortSelect } from '../filters/SortSelect'
import { PaginationControls } from '@/components/ui/PaginationControls'
import { Button } from '@/components/ui/button'
import { useListings } from '@/hooks/useListings'
import type { ListingsFilters } from '@/hooks/useListingsFilters'
import type { FindListingsResult } from '@/lib/repositories/listing.repository'
import type { SortValue } from '@/lib/schemas/listing'

const SKELETON_COUNT = 9
const PAGE_SIZE = 20

interface ListingsGridProps {
  filters: ListingsFilters
  setSort: (sort: SortValue) => void
  resetFilters: () => void
  initialData: FindListingsResult
}

export function ListingsGrid({
  filters,
  setSort,
  resetFilters,
  initialData,
}: ListingsGridProps): React.ReactElement {
  const { listings, total, isLoading, error, currentPage, totalPages, goToPage } = useListings(
    filters,
    { initialData, pageSize: PAGE_SIZE },
  )

  const resultLabel =
    total === 0
      ? 'Brak wyników'
      : total === 1
        ? 'Znaleziono 1 ogłoszenie'
        : total < 5
          ? `Znaleziono ${total} ogłoszenia`
          : `Znaleziono ${total} ogłoszeń`

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
          {isLoading ? 'Ładowanie...' : resultLabel}
        </p>
        <SortSelect value={filters.sort} onChange={setSort} />
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Błąd: {error}
        </div>
      )}

      {/* Skeletons while loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-green-200 py-16 text-center">
          <p className="text-base font-medium text-foreground">
            Brak ogłoszeń pasujących do filtrów
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Spróbuj zmienić lub usunąć wybrane filtry.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-4"
          >
            Wyczyść filtry
          </Button>
        </div>
      )}

      {/* Listings grid */}
      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const listingWithImages = listing as typeof listing & { images?: { url: string }[] }
            const image = listingWithImages.images?.[0]
            return (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={String(listing.price)}
                currency={listing.currency}
                location={listing.city}
                condition={listing.condition as 'new' | 'used' | 'for_parts'}
                imageUrl={image?.url ?? undefined}
              />
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  )
}
