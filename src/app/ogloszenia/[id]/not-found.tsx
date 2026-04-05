import React from 'react'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ListingNotFound(): React.ReactElement {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <SearchX
          className="mx-auto h-16 w-16 text-agro-300 mb-6"
          aria-hidden="true"
        />

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Ogłoszenie nie zostało znalezione
        </h1>

        <p className="text-muted-foreground mb-8">
          To ogłoszenie mogło zostać usunięte, wygasnąć lub nigdy nie istniało.
          Sprawdź inne oferty na AgroPortal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-agro-500 hover:bg-agro-600 text-white min-h-[44px]">
            <Link href="/ogloszenia">Przeglądaj ogłoszenia</Link>
          </Button>

          <Button asChild variant="outline" className="min-h-[44px]">
            <Link href="/">Strona główna</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
