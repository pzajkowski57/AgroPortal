'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { SortValue } from '@/lib/schemas/listing'
import type { ListingCondition } from '@/types'

export interface ListingsFilters {
  q: string
  category: string
  voivodeship: string
  priceMin: string
  priceMax: string
  condition: ListingCondition[]
  sort: SortValue
}

const DEFAULT_FILTERS: ListingsFilters = {
  q: '',
  category: '',
  voivodeship: '',
  priceMin: '',
  priceMax: '',
  condition: [],
  sort: 'newest',
}

function parseFilters(searchParams: URLSearchParams): ListingsFilters {
  const conditions = searchParams.getAll('condition') as ListingCondition[]
  const sort = (searchParams.get('sort') ?? 'newest') as SortValue

  return {
    q: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
    voivodeship: searchParams.get('voivodeship') ?? '',
    priceMin: searchParams.get('priceMin') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
    condition: conditions,
    sort,
  }
}

function buildSearchParams(filters: ListingsFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.voivodeship) params.set('voivodeship', filters.voivodeship)
  if (filters.priceMin) params.set('priceMin', filters.priceMin)
  if (filters.priceMax) params.set('priceMax', filters.priceMax)
  for (const c of filters.condition) {
    params.append('condition', c)
  }
  if (filters.sort && filters.sort !== 'newest') {
    params.set('sort', filters.sort)
  }

  return params
}

export function useListingsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = parseFilters(searchParams)

  const setFilter = useCallback(
    <K extends keyof ListingsFilters>(key: K, value: ListingsFilters[K]) => {
      const current = parseFilters(searchParams)
      const updated = { ...current, [key]: value }
      const params = buildSearchParams(updated)
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [router, pathname, searchParams],
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const activeFilterCount = [
    filters.q,
    filters.category,
    filters.voivodeship,
    filters.priceMin,
    filters.priceMax,
    ...filters.condition,
  ].filter(Boolean).length

  return { filters, setFilter, resetFilters, activeFilterCount }
}
