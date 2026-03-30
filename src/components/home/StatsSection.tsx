import React from 'react'
import { Shield, BadgeCheck, Lock } from 'lucide-react'

interface Stat {
  value: string
  label: string
}

interface TrustBadge {
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: string | boolean }>
  text: string
}

const STATS: Stat[] = [
  { value: '1 250+', label: 'Ogłoszeń' },
  { value: '340+', label: 'Firm' },
  { value: '5 600+', label: 'Użytkowników' },
  { value: '16', label: 'Województw' },
]

const TRUST_BADGES: TrustBadge[] = [
  { Icon: Shield, text: 'Bezpłatne ogłoszenia' },
  { Icon: BadgeCheck, text: 'Weryfikowane firmy' },
  { Icon: Lock, text: 'Bezpieczne transakcje' },
]

export function StatsSection(): React.ReactElement {
  return (
    <section aria-label="Statystyki platformy" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-agro-500">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {TRUST_BADGES.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-5 w-5 text-agro-500" aria-hidden="true" />
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
