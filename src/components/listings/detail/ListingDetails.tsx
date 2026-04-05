import React from 'react'
import { MapPin, Calendar, Heart, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ListingCondition } from '@/types'

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
  if (isNaN(numeric) || numeric <= 0) {
    return 'Cena do uzgodnienia'
  }
  return `${numeric.toLocaleString('pl-PL')} ${currency}`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export interface ListingDetailsProps {
  title: string
  price: string
  currency: string
  condition: ListingCondition
  voivodeshipName: string
  city: string
  createdAt: Date
  className?: string
}

export function ListingDetails({
  title,
  price,
  currency,
  condition,
  voivodeshipName,
  city,
  createdAt,
  className,
}: ListingDetailsProps): React.ReactElement {
  const formattedPrice = formatPrice(price, currency)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Title */}
      <h1 className="text-2xl font-bold leading-snug">{title}</h1>

      {/* Price */}
      <p
        className="text-3xl font-bold text-agro-600"
        aria-label={`Cena: ${formattedPrice}`}
        data-testid="listing-detail-price"
      >
        {formattedPrice}
      </p>

      {/* Condition badge */}
      <div>
        <span
          className={cn(
            'inline-block rounded-full px-3 py-1 text-sm font-medium',
            CONDITION_STYLES[condition],
          )}
        >
          {CONDITION_LABELS[condition]}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0 text-agro-500" aria-hidden="true" />
        <span>
          {voivodeshipName}, {city}
        </span>
      </div>

      {/* Posted date */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Dodano: {formatDate(createdAt)}</span>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          className="min-h-[44px] bg-agro-500 hover:bg-agro-600 text-white w-full"
          aria-label="Skontaktuj się ze sprzedającym"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Kontakt
        </Button>

        <Button
          variant="outline"
          className="min-h-[44px] w-full border-agro-300 text-agro-600 hover:bg-agro-50"
          aria-label="Zapisz ogłoszenie"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
          Zapisz
        </Button>
      </div>
    </div>
  )
}
