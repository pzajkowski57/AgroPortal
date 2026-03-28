'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** Maximum total pages before ellipsis logic kicks in. */
const ELLIPSIS_THRESHOLD = 7

/**
 * Computes the list of page items to render.
 * Returns an array where items are either a page number or the string '...'
 * representing an ellipsis.
 *
 * Rules:
 * - Always show page 1 and the last page.
 * - When totalPages <= ELLIPSIS_THRESHOLD, show all pages with no ellipsis.
 * - Otherwise show a window of up to 5 pages centered around currentPage,
 *   plus page 1 and last, with '...' inserted where gaps exist.
 */
function buildPageItems(currentPage: number, totalPages: number): Array<number | '...'> {
  if (totalPages <= 0) return []
  const safePage = Math.min(currentPage, totalPages)
  if (totalPages <= 1) return [1]

  if (totalPages <= ELLIPSIS_THRESHOLD) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const WINDOW_HALF = 2 // pages on each side of current

  const windowStart = Math.max(1, safePage - WINDOW_HALF)
  const windowEnd = Math.min(totalPages, safePage + WINDOW_HALF)

  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)
  for (let p = windowStart; p <= windowEnd; p++) {
    pages.add(p)
  }

  const sorted = Array.from(pages).sort((a, b) => a - b)

  const items: Array<number | '...'> = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push('...')
    }
    items.push(sorted[i])
  }

  return items
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const pageItems = buildPageItems(currentPage, totalPages)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page)
    }
  }

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label="Paginacja"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        aria-label="Poprzednia strona"
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>Poprzednia</span>
      </Button>

      <ul className="flex items-center gap-1">
        {pageItems.map((item, index) => {
          if (item === '...') {
            return (
              <li key={`ellipsis-${index}`}>
                <span
                  className="px-2 py-1 text-sm text-gray-500 select-none"
                  aria-hidden="true"
                >
                  ...
                </span>
              </li>
            )
          }

          const page = item
          const isActive = page === currentPage

          return (
            <li key={page}>
              <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageClick(page)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'min-w-[2rem]',
                  isActive && 'bg-agro-600 hover:bg-agro-700 text-white border-agro-600',
                )}
              >
                {page}
              </Button>
            </li>
          )
        })}
      </ul>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        aria-label="Następna strona"
        className="gap-1"
      >
        <span>Następna</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
