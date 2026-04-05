import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findListingById, findRelatedListings } from '@/lib/repositories/listing.repository'
import { getVoivodeshipName } from '@/lib/utils/voivodeships'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { Breadcrumbs } from '@/components/listings/Breadcrumbs'
import { ImageGallery } from '@/components/listings/ImageGallery'
import { ListingDetails } from '@/components/listings/ListingDetails'
import { SellerCard } from '@/components/listings/SellerCard'
import { RelatedListings } from '@/components/listings/RelatedListings'
import type { ListingCondition } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>
}

// ---------------------------------------------------------------------------
// Metadata (dynamic SEO)
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await findListingById(id)

  if (!listing) {
    return { title: 'Ogłoszenie nie znalezione' }
  }

  const title = listing.metaTitle ?? listing.title
  const description = listing.metaDesc ?? listing.description.slice(0, 160)
  const mainImage = listing.images[0]?.url

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${APP_NAME}`,
      description,
      type: 'website',
      locale: 'pl_PL',
      siteName: APP_NAME,
      url: `${APP_URL}/ogloszenia/${id}`,
      ...(mainImage ? { images: [{ url: mainImage, alt: listing.title }] } : {}),
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ListingDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params
  const listing = await findListingById(id)

  if (!listing) {
    notFound()
  }

  const relatedRaw = await findRelatedListings({ id: listing.id, categoryId: listing.categoryId })

  const voivodeshipName = getVoivodeshipName(listing.voivodeship) ?? listing.voivodeship

  const galleryImages = listing.images.map((img) => ({
    id: img.id,
    url: img.url,
    order: img.order,
  }))

  const relatedListings = relatedRaw.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price.toString(),
    currency: r.currency,
    condition: r.condition as ListingCondition,
    voivodeship: r.voivodeship,
    city: r.city,
    imageUrl: r.images[0]?.url,
  }))

  const breadcrumbs = [
    { label: 'Ogłoszenia', href: '/ogloszenia' },
    { label: listing.category.name, href: `/ogloszenia?category=${listing.category.slug}` },
    { label: listing.title },
  ]

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: image gallery (60% ~ 3/5 cols) */}
          <div className="lg:col-span-3">
            <ImageGallery
              images={galleryImages}
              title={listing.title}
            />

            {/* Description — below gallery on desktop */}
            <section className="mt-8" aria-label="Opis ogłoszenia">
              <h2 className="text-xl font-bold mb-3">Opis</h2>
              <div className="prose max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </div>
            </section>
          </div>

          {/* Right: details sidebar (40% ~ 2/5 cols) */}
          <aside className="lg:col-span-2 flex flex-col gap-6">
            <ListingDetails
              title={listing.title}
              price={listing.price.toString()}
              currency={listing.currency}
              condition={listing.condition as ListingCondition}
              voivodeshipName={voivodeshipName}
              city={listing.city}
              createdAt={listing.createdAt}
            />

            {listing.user && (
              <SellerCard
                userId={listing.user.id}
                name={listing.user.name ?? 'Anonimowy sprzedający'}
                image={listing.user.image}
                memberSince={listing.createdAt}
              />
            )}
          </aside>
        </div>

        {/* Related listings — full width below */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <RelatedListings listings={relatedListings} />
          </div>
        )}
      </div>
    </div>
  )
}
