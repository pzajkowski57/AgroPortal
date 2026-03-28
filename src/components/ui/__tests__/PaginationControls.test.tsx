import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'
import { PaginationControls } from '../PaginationControls'

describe('PaginationControls', () => {
  describe('Previous / Next buttons', () => {
    it('disables "Poprzednia" button on the first page', () => {
      renderWithProviders(
        <PaginationControls currentPage={1} totalPages={5} onPageChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: /poprzednia/i })).toBeDisabled()
    })

    it('enables "Poprzednia" button when not on first page', () => {
      renderWithProviders(
        <PaginationControls currentPage={3} totalPages={5} onPageChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: /poprzednia/i })).toBeEnabled()
    })

    it('disables "Następna" button on the last page', () => {
      renderWithProviders(
        <PaginationControls currentPage={5} totalPages={5} onPageChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: /następna/i })).toBeDisabled()
    })

    it('enables "Następna" button when not on last page', () => {
      renderWithProviders(
        <PaginationControls currentPage={3} totalPages={5} onPageChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: /następna/i })).toBeEnabled()
    })

    it('calls onPageChange with page - 1 when "Poprzednia" is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()

      renderWithProviders(
        <PaginationControls currentPage={3} totalPages={5} onPageChange={onPageChange} />,
      )

      await user.click(screen.getByRole('button', { name: /poprzednia/i }))
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('calls onPageChange with page + 1 when "Następna" is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()

      renderWithProviders(
        <PaginationControls currentPage={3} totalPages={5} onPageChange={onPageChange} />,
      )

      await user.click(screen.getByRole('button', { name: /następna/i }))
      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('does not call onPageChange when disabled "Poprzednia" is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()

      renderWithProviders(
        <PaginationControls currentPage={1} totalPages={5} onPageChange={onPageChange} />,
      )

      await user.click(screen.getByRole('button', { name: /poprzednia/i }))
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('does not call onPageChange when disabled "Następna" is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()

      renderWithProviders(
        <PaginationControls currentPage={5} totalPages={5} onPageChange={onPageChange} />,
      )

      await user.click(screen.getByRole('button', { name: /następna/i }))
      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('Page number buttons', () => {
    it('always renders page 1 button', () => {
      renderWithProviders(
        <PaginationControls currentPage={10} totalPages={20} onPageChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    })

    it('always renders last page button', () => {
      renderWithProviders(
        <PaginationControls currentPage={1} totalPages={20} onPageChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument()
    })

    it('marks the current page button as active (aria-current)', () => {
      renderWithProviders(
        <PaginationControls currentPage={3} totalPages={5} onPageChange={vi.fn()} />,
      )

      const currentBtn = screen.getByRole('button', { name: '3' })
      expect(currentBtn).toHaveAttribute('aria-current', 'page')
    })

    it('calls onPageChange with correct page when a page number is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()

      renderWithProviders(
        <PaginationControls currentPage={1} totalPages={5} onPageChange={onPageChange} />,
      )

      await user.click(screen.getByRole('button', { name: '4' }))
      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('does not call onPageChange when the current page button is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()

      renderWithProviders(
        <PaginationControls currentPage={3} totalPages={5} onPageChange={onPageChange} />,
      )

      await user.click(screen.getByRole('button', { name: '3' }))
      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('Ellipsis rendering', () => {
    it('shows ellipsis between page 1 and the window when currentPage is far right', () => {
      renderWithProviders(
        <PaginationControls currentPage={15} totalPages={20} onPageChange={vi.fn()} />,
      )

      const ellipses = screen.getAllByText('...')
      expect(ellipses.length).toBeGreaterThanOrEqual(1)
    })

    it('shows ellipsis between window and last page when currentPage is far left', () => {
      renderWithProviders(
        <PaginationControls currentPage={2} totalPages={20} onPageChange={vi.fn()} />,
      )

      const ellipses = screen.getAllByText('...')
      expect(ellipses.length).toBeGreaterThanOrEqual(1)
    })

    it('shows two ellipses when currentPage is in the middle of a large range', () => {
      renderWithProviders(
        <PaginationControls currentPage={10} totalPages={20} onPageChange={vi.fn()} />,
      )

      const ellipses = screen.getAllByText('...')
      expect(ellipses).toHaveLength(2)
    })

    it('does not show ellipsis when total pages is small enough', () => {
      renderWithProviders(
        <PaginationControls currentPage={1} totalPages={5} onPageChange={vi.fn()} />,
      )

      expect(screen.queryByText('...')).not.toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('renders correctly with a single page', () => {
      renderWithProviders(
        <PaginationControls currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: /poprzednia/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /następna/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    })

    it('accepts optional className and applies it to the container', () => {
      const { container } = renderWithProviders(
        <PaginationControls
          currentPage={1}
          totalPages={5}
          onPageChange={vi.fn()}
          className="my-custom-class"
        />,
      )

      expect(container.firstChild).toHaveClass('my-custom-class')
    })

    it('renders no more than 7 page buttons for a large range (window + edges)', () => {
      renderWithProviders(
        <PaginationControls currentPage={10} totalPages={20} onPageChange={vi.fn()} />,
      )

      // page 1, ..., pages around current (5 max), ..., last page = 7 buttons
      const pageButtons = screen
        .getAllByRole('button')
        .filter((btn) => /^\d+$/.test(btn.textContent ?? ''))

      expect(pageButtons.length).toBeLessThanOrEqual(7)
    })

    it('navigates via callback only — page buttons are not anchor elements', () => {
      renderWithProviders(
        <PaginationControls currentPage={2} totalPages={5} onPageChange={vi.fn()} />,
      )

      // Page number elements must be <button>s, not <a> tags,
      // so they cannot cause browser navigation via href.
      const pageButtons = screen
        .getAllByRole('button')
        .filter((btn) => /^\d+$/.test(btn.textContent ?? ''))

      for (const btn of pageButtons) {
        expect(btn.tagName).toBe('BUTTON')
        expect(btn).not.toHaveAttribute('href')
      }
    })
  })
})
