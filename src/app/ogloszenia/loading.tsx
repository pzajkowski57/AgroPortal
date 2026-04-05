import React from 'react'
import { ListingCardSkeleton } from '@/components/listings'

const SKELETON_COUNT = 9

export default function ListingsLoading(): React.ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-6 h-7 w-48 animate-pulse rounded bg-muted" />

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="space-y-4">
            <div className="h-9 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
