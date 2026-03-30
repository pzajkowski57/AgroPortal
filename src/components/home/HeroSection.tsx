'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CategoryChip {
  label: string
  slug: string
}

const CATEGORY_CHIPS: CategoryChip[] = [
  { label: 'Ciągniki', slug: 'ciagniki' },
  { label: 'Kombajny', slug: 'kombajny' },
  { label: 'Przyczepy', slug: 'przyczepy' },
  { label: 'Siewniki', slug: 'siewniki' },
  { label: 'Opryskiwacze', slug: 'opryskiwacze' },
  { label: 'Części', slug: 'czesci' },
]

export function HeroSection(): React.ReactElement {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/ogloszenia?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleChipClick(slug: string) {
    router.push(`/ogloszenia?kategoria=${encodeURIComponent(slug)}`)
  }

  return (
    <section className="w-full bg-gradient-to-br from-agro-600 to-agro-800 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Znajdź maszyny rolnicze, produkty i usługi
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Największy portal z maszynami rolniczymi w Polsce. Tysiące ogłoszeń od
            rolników i firm.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-lg">
              <label htmlFor="hero-search" className="sr-only">
                Szukaj ogłoszeń
              </label>
              <Input
                id="hero-search"
                type="search"
                placeholder="Czego szukasz? np. Ciągnik John Deere..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Szukaj
              </button>
            </form>
          </div>

          {/* Category chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip.slug}
                type="button"
                onClick={() => handleChipClick(chip.slug)}
                className="rounded-full bg-white/20 px-4 py-1 text-sm text-white transition-colors hover:bg-white/30"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
