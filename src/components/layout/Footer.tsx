import Link from 'next/link'
import { Sprout, Facebook, Twitter } from 'lucide-react'

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

interface SocialLink {
  readonly label: string
  readonly href: string
  readonly Icon: React.ComponentType<{ className?: string }>
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Facebook', href: 'https://facebook.com/agroportal', Icon: Facebook },
  { label: 'Twitter', href: 'https://twitter.com/agroportal', Icon: Twitter },
] as const

function FooterLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold text-xl text-agro-600 hover:text-agro-700 transition-colors"
    >
      <Sprout className="h-6 w-6" aria-hidden="true" />
      <span>AgroPortal</span>
    </Link>
  )
}

function NavSection() {
  return (
    <nav aria-label="Nawigacja">
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
    </nav>
  )
}

function InfoSection() {
  return (
    <nav aria-label="Informacje">
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
    </nav>
  )
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-gray-400 hover:text-agro-600 transition-colors"
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </Link>
      ))}
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
