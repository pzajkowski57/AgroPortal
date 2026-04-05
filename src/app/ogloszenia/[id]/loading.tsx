import React from 'react'

function Skeleton({ className }: { className?: string }): React.ReactElement {
  return <div className={`animate-pulse bg-muted rounded ${className ?? ''}`} />
}

export default function ListingDetailLoading(): React.ReactElement {
  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Gallery skeleton */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-20 rounded-lg" />
              ))}
            </div>

            {/* Description skeleton */}
            <div className="mt-8 flex flex-col gap-2">
              <Skeleton className="h-7 w-24 mb-3" />
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className={`h-4 ${i === 5 ? 'w-2/3' : 'w-full'}`} />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <aside className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>

            {/* Seller card skeleton */}
            <div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
              <Skeleton className="h-5 w-28" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-4 w-56" />
            </div>
          </aside>
        </div>

        {/* Related listings skeleton */}
        <div className="mt-12">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-64 shrink-0">
                <Skeleton className="aspect-[4/3] w-full rounded-t-xl" />
                <div className="p-4 border border-t-0 rounded-b-xl flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
