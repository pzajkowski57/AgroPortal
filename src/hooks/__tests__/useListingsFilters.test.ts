import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useListingsFilters } from '../useListingsFilters'

// next/navigation is already mocked globally in test/setup.ts
// We need access to the mock push function per-test
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/ogloszenia',
  useSearchParams: () => new URLSearchParams(),
}))

describe('useListingsFilters', () => {
  it('returns default filters when no search params are present', () => {
    const { result } = renderHook(() => useListingsFilters())

    expect(result.current.filters).toEqual({
      q: '',
      category: '',
      voivodeship: '',
      priceMin: '',
      priceMax: '',
      condition: [],
      sort: 'newest',
    })
  })

  it('returns activeFilterCount of 0 with no active filters', () => {
    const { result } = renderHook(() => useListingsFilters())
    expect(result.current.activeFilterCount).toBe(0)
  })

  it('calls router.push with updated query when setFilter is called', () => {
    const { result } = renderHook(() => useListingsFilters())

    act(() => {
      result.current.setFilter('q', 'traktor')
    })

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('q=traktor'),
    )
  })

  it('calls router.push with pathname only when resetFilters is called', () => {
    const { result } = renderHook(() => useListingsFilters())

    act(() => {
      result.current.resetFilters()
    })

    expect(mockPush).toHaveBeenCalledWith('/ogloszenia')
  })

  it('does not include sort in URL when sort is newest (default)', () => {
    const { result } = renderHook(() => useListingsFilters())

    act(() => {
      result.current.setFilter('category', 'ciagniki')
    })

    const call = mockPush.mock.calls[mockPush.mock.calls.length - 1][0] as string
    expect(call).not.toContain('sort=')
  })

  it('includes sort in URL when sort is not newest', () => {
    const { result } = renderHook(() => useListingsFilters())

    act(() => {
      result.current.setFilter('sort', 'price_asc')
    })

    const call = mockPush.mock.calls[mockPush.mock.calls.length - 1][0] as string
    expect(call).toContain('sort=price_asc')
  })
})
