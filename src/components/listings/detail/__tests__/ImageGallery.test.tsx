import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import { ImageGallery, type GalleryImage } from '../ImageGallery'

const mockImages: GalleryImage[] = [
  { id: 'img-1', url: 'https://example.com/img1.jpg', order: 0 },
  { id: 'img-2', url: 'https://example.com/img2.jpg', order: 1 },
  { id: 'img-3', url: 'https://example.com/img3.jpg', order: 2 },
]

describe('ImageGallery', () => {
  describe('rendering — zero images', () => {
    it('shows "Brak zdjęć" when no images provided', () => {
      renderWithProviders(<ImageGallery images={[]} title="Test" />)
      expect(screen.getByText('Brak zdjęć')).toBeInTheDocument()
    })

    it('does not render thumbnails when no images', () => {
      const { container } = renderWithProviders(<ImageGallery images={[]} title="Test" />)
      expect(container.querySelectorAll('[aria-label*="Zdjęcie"]')).toHaveLength(0)
    })
  })

  describe('rendering — single image', () => {
    it('renders main image with correct alt text', () => {
      const single = [mockImages[0]]
      renderWithProviders(<ImageGallery images={single} title="Ciągnik" />)
      expect(screen.getByAltText(/Ciągnik/i)).toBeInTheDocument()
    })

    it('does not render thumbnail row with only one image', () => {
      const single = [mockImages[0]]
      renderWithProviders(<ImageGallery images={single} title="Ciągnik" />)
      expect(screen.queryByRole('list', { name: /miniatury/i })).not.toBeInTheDocument()
    })
  })

  describe('rendering — multiple images', () => {
    it('renders thumbnail list', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      expect(screen.getByRole('list', { name: /miniatury/i })).toBeInTheDocument()
    })

    it('renders correct number of thumbnails', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      const thumbnails = screen.getAllByRole('listitem')
      expect(thumbnails).toHaveLength(mockImages.length)
    })

    it('first thumbnail is pressed by default', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      // Thumbnail buttons themselves have role="listitem" and aria-pressed
      const thumbnails = screen.getAllByRole('listitem')
      expect(thumbnails[0]).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('thumbnail interaction', () => {
    it('clicking thumbnail changes the active index', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      // Thumbnail buttons have role="listitem" and aria-label="Zdjęcie N"
      const thumbnails = screen.getAllByRole('listitem')
      fireEvent.click(thumbnails[1])
      expect(thumbnails[1]).toHaveAttribute('aria-pressed', 'true')
      expect(thumbnails[0]).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('lightbox', () => {
    it('opens lightbox when main image button is clicked', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      const openBtn = screen.getByRole('button', { name: /otwórz galerię/i })
      fireEvent.click(openBtn)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('closes lightbox when close button is clicked', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      fireEvent.click(screen.getByRole('button', { name: /otwórz galerię/i }))
      fireEvent.click(screen.getByRole('button', { name: /zamknij galerię/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('closes lightbox with Escape key', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      fireEvent.click(screen.getByRole('button', { name: /otwórz galerię/i }))
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('navigates to next with ArrowRight key in lightbox', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      fireEvent.click(screen.getByRole('button', { name: /otwórz galerię/i }))
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })

    it('navigates to prev with ArrowLeft key in lightbox', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      fireEvent.click(screen.getByRole('button', { name: /otwórz galerię/i }))
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      fireEvent.keyDown(document, { key: 'ArrowLeft' })
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('wraps around from last to first on next', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      fireEvent.click(screen.getByRole('button', { name: /otwórz galerię/i }))
      // advance to last
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(screen.getByText('3 / 3')).toBeInTheDocument()
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('main image has a descriptive aria-label', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Test Maszyna" />)
      const mainBtn = screen.getByRole('button', { name: /otwórz galerię.*Test Maszyna/i })
      expect(mainBtn).toBeInTheDocument()
    })

    it('lightbox has aria-modal and aria-label', () => {
      renderWithProviders(<ImageGallery images={mockImages} title="Ciągnik" />)
      fireEvent.click(screen.getByRole('button', { name: /otwórz galerię/i }))
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-label')
    })
  })
})
