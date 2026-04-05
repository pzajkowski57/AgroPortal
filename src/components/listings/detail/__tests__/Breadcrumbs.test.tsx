import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { Breadcrumbs, type BreadcrumbItem } from '../Breadcrumbs'

const defaultItems: BreadcrumbItem[] = [
  { label: 'Ogłoszenia', href: '/ogloszenia' },
  { label: 'Kategoria', href: '/ogloszenia?category=maszyny' },
  { label: 'Tytuł ogłoszenia' },
]

describe('Breadcrumbs', () => {
  describe('rendering', () => {
    it('renders all breadcrumb labels', () => {
      renderWithProviders(<Breadcrumbs items={defaultItems} />)
      expect(screen.getByText('Ogłoszenia')).toBeInTheDocument()
      expect(screen.getByText('Kategoria')).toBeInTheDocument()
      expect(screen.getByText('Tytuł ogłoszenia')).toBeInTheDocument()
    })

    it('renders links for items with href', () => {
      renderWithProviders(<Breadcrumbs items={defaultItems} />)
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(2)
      expect(links[0]).toHaveAttribute('href', '/ogloszenia')
      expect(links[1]).toHaveAttribute('href', '/ogloszenia?category=maszyny')
    })

    it('renders last item as plain text, not a link', () => {
      renderWithProviders(<Breadcrumbs items={defaultItems} />)
      const lastItem = screen.getByText('Tytuł ogłoszenia')
      expect(lastItem.tagName).not.toBe('A')
    })

    it('marks last item with aria-current="page"', () => {
      renderWithProviders(<Breadcrumbs items={defaultItems} />)
      const lastItem = screen.getByText('Tytuł ogłoszenia')
      expect(lastItem).toHaveAttribute('aria-current', 'page')
    })

    it('has aria-label for accessibility', () => {
      renderWithProviders(<Breadcrumbs items={defaultItems} />)
      expect(screen.getByRole('navigation', { name: /ścieżka nawigacji/i })).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('renders single-item breadcrumb without chevrons', () => {
      const singleItem: BreadcrumbItem[] = [{ label: 'Strona' }]
      renderWithProviders(<Breadcrumbs items={singleItem} />)
      expect(screen.getByText('Strona')).toBeInTheDocument()
    })

    it('renders item without href as plain text', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Ogłoszenia', href: '/ogloszenia' },
        { label: 'Bez linku' },
      ]
      renderWithProviders(<Breadcrumbs items={items} />)
      const noLink = screen.getByText('Bez linku')
      expect(noLink.tagName).not.toBe('A')
    })

    it('renders empty items array without crashing', () => {
      expect(() => renderWithProviders(<Breadcrumbs items={[]} />)).not.toThrow()
    })
  })
})
