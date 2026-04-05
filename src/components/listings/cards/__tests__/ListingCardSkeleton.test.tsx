import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ListingCardSkeleton } from '../ListingCardSkeleton'

describe('ListingCardSkeleton', () => {
  it('renders without crashing', () => {
    expect(() => render(<ListingCardSkeleton />)).not.toThrow()
  })

  it('has aria-hidden to prevent screen reader announcement', () => {
    const { container } = render(<ListingCardSkeleton />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies animate-pulse class to skeleton elements', () => {
    const { container } = render(<ListingCardSkeleton />)
    const pulseElements = container.querySelectorAll('[class*="animate-pulse"]')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('applies the className prop when provided', () => {
    const { container } = render(<ListingCardSkeleton className="my-custom-class" />)
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('my-custom-class')
  })

  it('has an image area skeleton matching ListingCard aspect ratio', () => {
    const { container } = render(<ListingCardSkeleton />)
    const aspectElement = container.querySelector('[class*="aspect"]')
    expect(aspectElement).toBeInTheDocument()
  })

  it('renders a content area with title and price skeletons', () => {
    const { container } = render(<ListingCardSkeleton />)
    const padded = container.querySelector('.p-4')
    expect(padded).toBeInTheDocument()
  })
})
