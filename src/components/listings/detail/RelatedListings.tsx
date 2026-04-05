import React from 'react'
import { ListingCard } from '../cards/ListingCard'
import type { ListingCondition } from '@/types'

export interface RelatedListing {
  id: string
  title: string
  price: string
  currency: string
  condition: ListingCondition
  voivodeship: string
  city: string
  imageUrl?: string
}

interface RelatedListingsProps {
  listings: RelatedListing[]
  className?: string
}

export function RelatedListings({ listings, className }: RelatedListingsProps): React.ReactElement | null {
  if (listings.length === 0) return null

  return (
    <section className={className} aria-label="Podobne ogłoszenia">
      <h2 className="text-xl font-bold mb-4">Podobne ogłoszenia</h2>

      <div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        role="list"
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="snap-start shrink-0 w-64 sm:w-72"
            role="listitem"
          >
            <ListingCard
              id={listing.id}
              title={listing.title}
              price={listing.price}
              currency={listing.currency}
              condition={listing.condition}
              location={`${listing.city}`}
              imageUrl={listing.imageUrl}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
