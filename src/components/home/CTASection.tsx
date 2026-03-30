import React from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export function CTASection(): React.ReactElement {
  return (
    <section aria-labelledby="cta-heading" className="bg-agro-500 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 id="cta-heading" className="text-3xl font-bold text-white sm:text-4xl">
            Dodaj swoje ogłoszenie za darmo
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Dotrzej do tysięcy rolników i firm w całej Polsce. Bezpłatne ogłoszenia
            dla każdego.
          </p>
          <div className="mt-8">
            <Link
              href="/ogloszenia/nowe"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-lg font-semibold text-white hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 transition-colors"
            >
              <PlusCircle className="h-5 w-5" aria-hidden="true" />
              Dodaj ogłoszenie
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
