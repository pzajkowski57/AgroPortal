import React from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ListingCondition } from '@/types'

export interface ListingCardProps {
  id: string
  title: string
  price: string
  currency: string
  location: string
  condition: ListingCondition
  imageUrl?: string
  className?: string
}

const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: 'Nowy',
  used: 'Używany',
  for_parts: 'Na części',
}

const CONDITION_STYLES: Record<ListingCondition, string> = {
  new: 'bg-green-500 text-white',
  used: 'bg-blue-500 text-white',
  for_parts: 'bg-orange-500 text-white',
}

function formatPrice(price: string, currency: string): string {
  const numeric = parseFloat(price)
  if (isNaN(numeric) || numeric === 0) {
    return `0 ${currency}`
  }
  return `${numeric.toLocaleString('pl-PL')} ${currency}`
}

export function ListingCard({
  id,
  title,
  price,
  currency,
  location,
  condition,
  imageUrl,
  className,
}: ListingCardProps): React.ReactElement {
  return (
    <Link
      href={`/ogloszenia/${id}`}
      className={cn(
        'group block rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow',
        className,
      )}
    >
      {/* Image area */}
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="aspect-[4/3] w-full rounded-t-xl object-cover"
          />
        ) : (
          <div className="aspect-[4/3] w-full rounded-t-xl bg-gradient-to-br from-agro-100 to-agro-200" />
        )}
        {/* Condition badge */}
        <span
          className={cn(
            'absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-medium',
            CONDITION_STYLES[condition],
          )}
        >
          {CONDITION_LABELS[condition]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{title}</h3>
        <p
          data-testid="listing-price"
          className="mt-2 text-lg font-bold text-agro-600"
        >
          {formatPrice(price, currency)}
        </p>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{location}</span>
        </div>
      </div>
    </Link>
  )
}
