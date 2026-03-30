'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Search, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { UserMenu } from './UserMenu'
import { MobileNav } from './MobileNav'

interface NavLink {
  readonly label: string
  readonly href: string
}

const NAV_LINKS: readonly NavLink[] = [
  { label: 'Ogłoszenia', href: '/ogloszenia' },
  { label: 'Baza Firm', href: '/baza-firm' },
  { label: 'Giełda', href: '/gielda' },
  { label: 'Aktualności', href: '/aktualnosci' },
] as const

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function openMobileNav() {
    setMobileOpen(true)
  }

  function closeMobileNav() {
    setMobileOpen(false)
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Przejdź do treści
      </a>

      <header className="sticky top-0 z-50 h-16 w-full bg-card border-b border-border">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-agro-500 hover:text-agro-600 transition-colors shrink-0"
          >
            <Leaf className="h-6 w-6" aria-hidden="true" />
            <span>AgroPortal</span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Nawigacja główna"
            className="hidden lg:flex items-center gap-1 flex-1"
          >
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'font-semibold text-agro-600'
                      : 'text-foreground',
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center relative w-80 shrink-0">
            <Search
              className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              role="searchbox"
              type="search"
              placeholder="Szukaj ogłoszeń, firm..."
              className="pl-9 rounded-lg"
              aria-label="Szukaj"
            />
          </div>

          {/* Spacer for mobile (push actions to right) */}
          <div className="flex-1 lg:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/ogloszenia/dodaj"
              className="hidden sm:inline-flex items-center rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              Dodaj ogłoszenie
            </Link>

            <UserMenu />

            {/* Hamburger — mobile only */}
            <button
              aria-label="Otwórz menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={openMobileNav}
              className="lg:hidden rounded-md p-2 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
