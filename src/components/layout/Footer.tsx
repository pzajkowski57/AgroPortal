'use client'

import Link from 'next/link'
import { Sprout, Facebook, Twitter } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const INFO_LINKS: readonly NavLink[] = [
  { label: 'O nas', href: '/o-nas' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
  { label: 'Regulamin', href: '/regulamin' },
] as const

function FooterLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold text-xl text-agro-600 hover:text-agro-700 transition-colors"
      aria-label="AgroPortal"
    >
      <Sprout className="h-6 w-6" aria-hidden="true" />
      <span>AgroPortal</span>
    </Link>
  )
}

function NavSection() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
        Nawigacja
      </h3>
      <ul className="space-y-2">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-gray-300 hover:text-agro-600 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InfoSection() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
        Informacje
      </h3>
      <ul className="space-y-2">
        {INFO_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-gray-300 hover:text-agro-600 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="https://facebook.com/agroportal"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="text-gray-400 hover:text-agro-600 transition-colors"
      >
        <Facebook className="h-5 w-5" aria-hidden="true" />
      </Link>
      <Link
        href="https://twitter.com/agroportal"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
        className="text-gray-400 hover:text-agro-600 transition-colors"
      >
        <Twitter className="h-5 w-5" aria-hidden="true" />
      </Link>
    </div>
  )
}

function Copyright() {
  const year = new Date().getFullYear()

  return (
    <p className="text-sm text-gray-400">
      &copy; {year} AgroPortal. Wszelkie prawa zastrzeżone.
    </p>
  )
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <FooterLogo />
            <p className="text-sm text-gray-400 max-w-xs">
              Platforma dla rolników i firm z branży rolniczej.
            </p>
            <SocialLinks />
          </div>

          <NavSection />
          <InfoSection />
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Copyright />
        </div>
      </div>
    </footer>
  )
}
