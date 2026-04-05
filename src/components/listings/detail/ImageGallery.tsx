'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GalleryImage {
  id: string
  url: string
  order: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
  title: string
  className?: string
}

interface LightboxProps {
  images: GalleryImage[]
  currentIndex: number
  title: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function Lightbox({
  images,
  currentIndex,
  title,
  onClose,
  onPrev,
  onNext,
}: LightboxProps): React.ReactElement {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  const current = images[currentIndex]
  if (!current) return <></>

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria zdjęć: ${title}`}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        onClick={onClose}
        aria-label="Zamknij galerię"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Poprzednie zdjęcie"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-4xl max-h-[80vh] w-full mx-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={current.url}
            alt={`${title} — zdjęcie ${currentIndex + 1} z ${images.length}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
        </div>
        <p className="text-center text-white/60 text-sm mt-2">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Następne zdjęcie"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function EmptyGallery(): React.ReactElement {
  return (
    <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-agro-100 to-agro-200 flex flex-col items-center justify-center gap-2 text-agro-400">
      <ImageOff className="h-10 w-10" aria-hidden="true" />
      <span className="text-sm">Brak zdjęć</span>
    </div>
  )
}

export function ImageGallery({ images, title, className }: ImageGalleryProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }, [images.length])

  const handleGalleryKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
      }
      if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
      }
    },
    [images.length],
  )

  if (images.length === 0) {
    return (
      <div className={className}>
        <EmptyGallery />
      </div>
    )
  }

  const mainImage = images[activeIndex]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Main image */}
      <button
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agro-500"
        onClick={() => openLightbox(activeIndex)}
        onKeyDown={handleGalleryKeyDown}
        aria-label={`Otwórz galerię — ${title}`}
        tabIndex={0}
      >
        <Image
          src={mainImage.url}
          alt={`${title} — zdjęcie ${activeIndex + 1}`}
          fill
          className="object-cover hover:scale-[1.02] transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Miniatury zdjęć">
          {images.map((img, idx) => (
            <button
              key={img.id}
              role="listitem"
              className={cn(
                'relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agro-500',
                idx === activeIndex
                  ? 'border-agro-500 opacity-100'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
              onClick={() => setActiveIndex(idx)}
              aria-pressed={idx === activeIndex}
              aria-label={`Zdjęcie ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={`${title} — miniatura ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          title={title}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  )
}
