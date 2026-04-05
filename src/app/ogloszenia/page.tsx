import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { findListings } from '@/lib/repositories/listing.repository'
import { listingsQuerySchema } from '@/lib/schemas/listing'
import { ListingsPageClient } from '@/components/listings/ListingsPageClient'
import ListingsLoading from './loading'

export const metadata: Metadata = {
  title: 'Ogłoszenia — maszyny rolnicze i części',
  description:
    'Przeglądaj tysiące ogłoszeń maszyn rolniczych, ciągników, kombajnów i części. Filtruj po kategorii, województwie i cenie.',
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function OgloszeniaPage({ searchParams }: PageProps) {
  const rawQuery = {
    category: searchParams['category'],
    voivodeship: searchParams['voivodeship'],
    priceMin:
      typeof searchParams['priceMin'] === 'string' ? searchParams['priceMin'] : undefined,
    priceMax:
      typeof searchParams['priceMax'] === 'string' ? searchParams['priceMax'] : undefined,
    condition: searchParams['condition'],
    sort: typeof searchParams['sort'] === 'string' ? searchParams['sort'] : undefined,
    q: typeof searchParams['q'] === 'string' ? searchParams['q'] : undefined,
    cursor: typeof searchParams['cursor'] === 'string' ? searchParams['cursor'] : undefined,
    limit: typeof searchParams['limit'] === 'string' ? searchParams['limit'] : undefined,
  }

  const parsed = listingsQuerySchema.safeParse(rawQuery)
  const query = parsed.success ? parsed.data : { limit: 20 }

  const initialData = await findListings(query)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
        Ogłoszenia
      </h1>
      <Suspense fallback={<ListingsLoading />}>
        <ListingsPageClient initialData={initialData} />
      </Suspense>
    </main>
  )
}
