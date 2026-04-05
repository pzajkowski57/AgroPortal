'use client'

import React from 'react'
import type { SortValue } from '@/lib/schemas/listing'

interface SortOption {
  value: SortValue
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'price_asc', label: 'Cena: rosnąco' },
  { value: 'price_desc', label: 'Cena: malejąco' },
  { value: 'popular', label: 'Popularne' },
]

interface SortSelectProps {
  value: SortValue
  onChange: (value: SortValue) => void
}

export function SortSelect({ value, onChange }: SortSelectProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="shrink-0 text-sm text-muted-foreground">
        Sortuj:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Sortowanie wyników"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
