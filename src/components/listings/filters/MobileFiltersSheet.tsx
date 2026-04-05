'use client'

import React, { useState, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListingsFilters } from './ListingsFilters'
import type { ListingsFilters as Filters } from '@/hooks/useListingsFilters'

interface MobileFiltersSheetProps {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
  activeFilterCount: number
}

export function MobileFiltersSheet({
  filters,
  setFilter,
  resetFilters,
  activeFilterCount,
}: MobileFiltersSheetProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 lg:hidden"
        aria-label="Otwórz filtry"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        <span>Filtry</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-agro-600 text-[11px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtry wyszukiwania"
        className={`fixed bottom-0 left-0 right-0 z-50 flex max-h-[85dvh] flex-col overflow-y-auto rounded-t-2xl bg-background pb-safe shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Filtry</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Zamknij filtry"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Filters content */}
        <div className="overflow-y-auto px-4 py-4">
          <ListingsFilters
            filters={filters}
            setFilter={setFilter}
            resetFilters={() => {
              resetFilters()
              setIsOpen(false)
            }}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Apply button */}
        <div className="border-t px-4 py-3">
          <Button
            type="button"
            className="w-full bg-agro-600 hover:bg-agro-700 text-white"
            onClick={() => setIsOpen(false)}
          >
            Pokaż wyniki
          </Button>
        </div>
      </div>
    </>
  )
}
