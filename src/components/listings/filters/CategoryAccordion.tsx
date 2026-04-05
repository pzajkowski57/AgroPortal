'use client'

import React from 'react'
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
import { cn } from '@/lib/utils'

interface CategoryOption {
  name: string
  slug: string
  Icon: LucideIcon
}

export const LISTING_CATEGORIES: CategoryOption[] = [
  { name: 'Ciągniki', slug: 'ciagniki', Icon: Tractor },
  { name: 'Kombajny', slug: 'kombajny', Icon: Wheat },
  { name: 'Przyczepy', slug: 'przyczepy', Icon: Truck },
  { name: 'Siewniki', slug: 'siewniki', Icon: Sprout },
  { name: 'Opryskiwacze', slug: 'opryskiwacze', Icon: Droplets },
  { name: 'Części', slug: 'czesci', Icon: Wrench },
  { name: 'Maszyny budowlane', slug: 'maszyny-budowlane', Icon: Factory },
  { name: 'Inne', slug: 'inne', Icon: MoreHorizontal },
]

interface CategoryAccordionProps {
  value: string
  onChange: (slug: string) => void
}

export function CategoryAccordion({ value, onChange }: CategoryAccordionProps): React.ReactElement {
  return (
    <details open className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-semibold text-foreground">
        <span>Kategoria</span>
        <svg
          className="h-4 w-4 transition-transform group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>

      <ul className="mt-1 space-y-0.5">
        <li>
          <button
            type="button"
            onClick={() => onChange('')}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted min-h-[44px]',
              value === '' ? 'bg-agro-50 font-medium text-agro-700' : 'text-foreground',
            )}
          >
            Wszystkie kategorie
          </button>
        </li>
        {LISTING_CATEGORIES.map(({ name, slug, Icon }) => (
          <li key={slug}>
            <button
              type="button"
              onClick={() => onChange(slug)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted min-h-[44px]',
                value === slug ? 'bg-agro-50 font-medium text-agro-700' : 'text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-agro-500" aria-hidden="true" />
              {name}
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}
