'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { FindListingsResult } from '@/lib/repositories/listing.repository'
import type { ListingsFilters } from './useListingsFilters'

type Listing = FindListingsResult['listings'][number]

export interface UseListingsState {
  listings: Listing[]
  nextCursor: string | null
  total: number
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
}

interface UseListingsOptions {
  initialData?: FindListingsResult
  pageSize?: number
}

function buildQueryString(filters: ListingsFilters, cursor?: string, limit?: number): string {
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
  if (cursor) params.set('cursor', cursor)
  if (limit) params.set('limit', String(limit))

  return params.toString()
}

export function useListings(
  filters: ListingsFilters,
  { initialData, pageSize = 20 }: UseListingsOptions = {},
) {
  const [state, setState] = useState<UseListingsState>({
    listings: initialData?.listings ?? [],
    nextCursor: initialData?.nextCursor ?? null,
    total: initialData?.total ?? 0,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: initialData ? Math.ceil(initialData.total / pageSize) : 0,
  })

  // Stack of cursors for backwards navigation: index = page-1, value = cursor to get that page
  const cursorStackRef = useRef<Array<string | null>>([null])
  const isFirstRender = useRef(true)

  const fetchPage = useCallback(
    async (page: number) => {
      const cursor = cursorStackRef.current[page - 1] ?? undefined

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const controller = new AbortController()
      const query = buildQueryString(filters, cursor, pageSize)

      try {
        const res = await fetch(`/api/v1/listings?${query}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const json = (await res.json()) as {
          success: boolean
          data: FindListingsResult
          error?: string
        }

        if (!json.success) {
          throw new Error(json.error ?? 'Nieznany błąd')
        }

        const result = json.data
        const computed = Math.max(1, Math.ceil(result.total / pageSize))

        // Store next cursor at index `page` so we can go forward
        cursorStackRef.current = [
          ...cursorStackRef.current.slice(0, page),
          result.nextCursor,
        ]

        setState({
          listings: result.listings,
          nextCursor: result.nextCursor,
          total: result.total,
          isLoading: false,
          error: null,
          currentPage: page,
          totalPages: computed,
        })
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Błąd pobierania ogłoszeń',
        }))
      }

      return () => controller.abort()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, pageSize],
  )

  // Reset to page 1 when filters change (but not on first render with SSR data)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    cursorStackRef.current = [null]
    fetchPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.category, filters.voivodeship, filters.priceMin, filters.priceMax, filters.condition.join(','), filters.sort])

  const goToPage = useCallback(
    (page: number) => {
      fetchPage(page)
    },
    [fetchPage],
  )

  return { ...state, goToPage }
}
