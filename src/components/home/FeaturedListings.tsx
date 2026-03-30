import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard'
import type { ListingCardProps } from '@/components/listings/ListingCard'

// Static placeholder listings for the homepage (replaced by real API data later)
const PLACEHOLDER_LISTINGS: ListingCardProps[] = [
  {
    id: 'featured-1',
    title: 'Ciągnik John Deere 6120M 2020r. Stan idealny, serwisowany',
    price: '285000',
    currency: 'PLN',
    location: 'Poznań, wielkopolskie',
    condition: 'used',
  },
  {
    id: 'featured-2',
    title: 'Kombajn zbożowy Claas Lexion 670 Terra Trac',
    price: '650000',
    currency: 'PLN',
    location: 'Wrocław, dolnośląskie',
    condition: 'used',
  },
  {
    id: 'featured-3',
    title: 'Przyczepa wywrotka Pronar T679/2 nowa gwarancja',
    price: '48000',
    currency: 'PLN',
    location: 'Lublin, lubelskie',
    condition: 'new',
  },
  {
    id: 'featured-4',
    title: 'Siewnik zbożowy Great Plains 3S-3000 HD',
    price: '75000',
    currency: 'PLN',
    location: 'Bydgoszcz, kujawsko-pomorskie',
    condition: 'used',
  },
]

export function FeaturedListings(): React.ReactElement {
  return (
    <section className="bg-muted/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Najnowsze ogłoszenia
          </h2>
          <Link
            href="/ogloszenia"
            className="flex items-center gap-1 text-sm font-medium text-agro-600 hover:text-agro-700"
          >
            Zobacz wszystkie
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLACEHOLDER_LISTINGS.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </div>
    </section>
  )
}
