import React from 'react'
import { cn } from '@/lib/utils'

interface ListingCardSkeletonProps {
  className?: string
}

export function ListingCardSkeleton({ className }: ListingCardSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'block rounded-xl border bg-card text-card-foreground shadow-sm',
        className,
      )}
      aria-hidden="true"
    >
      {/* Image area */}
      <div className="aspect-[4/3] w-full animate-pulse rounded-t-xl bg-muted" />

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <div className="animate-pulse space-y-1.5">
          <div className="h-3.5 w-full rounded bg-muted" />
          <div className="h-3.5 w-3/4 rounded bg-muted" />
        </div>

        {/* Price */}
        <div className="mt-3 h-6 w-2/5 animate-pulse rounded bg-muted" />

        {/* Location */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
