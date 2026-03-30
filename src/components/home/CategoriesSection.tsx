import React from 'react'
import Link from 'next/link'
import {
  Tractor,
  Wheat,
  Truck,
  Sprout,
  Droplets,
  Wrench,
  Factory,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

interface Category {
  name: string
  slug: string
  count: number
  Icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { name: 'Ciągniki', slug: 'ciagniki', count: 342, Icon: Tractor },
  { name: 'Kombajny', slug: 'kombajny', count: 89, Icon: Wheat },
  { name: 'Przyczepy', slug: 'przyczepy', count: 156, Icon: Truck },
  { name: 'Siewniki', slug: 'siewniki', count: 74, Icon: Sprout },
  { name: 'Opryskiwacze', slug: 'opryskiwacze', count: 63, Icon: Droplets },
  { name: 'Części', slug: 'czesci', count: 421, Icon: Wrench },
  { name: 'Maszyny budowlane', slug: 'maszyny-budowlane', count: 47, Icon: Factory },
  { name: 'Inne', slug: 'inne', count: 58, Icon: MoreHorizontal },
]

export function CategoriesSection(): React.ReactElement {
  return (
    <section aria-labelledby="categories-heading" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="categories-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
          Przeglądaj kategorie
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const { Icon } = category
            return (
              <Link
                key={category.slug}
                href={`/ogloszenia?kategoria=${category.slug}`}
                className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agro-500"
              >
                <Icon
                  className="h-8 w-8 text-agro-500"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold text-foreground">{category.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.count} ogłoszeń
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
