import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SellerCardProps {
  userId: string
  name: string
  image?: string | null
  memberSince: Date
  className?: string
}

function formatMemberSince(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function SellerCard({
  userId,
  name,
  image,
  memberSince,
  className,
}: SellerCardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 flex flex-col gap-4',
        className,
      )}
    >
      <h2 className="text-base font-semibold text-foreground">Sprzedający</h2>

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="relative h-12 w-12 rounded-full overflow-hidden bg-agro-100 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {image ? (
            <Image
              src={image}
              alt={`Avatar: ${name}`}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <User className="h-6 w-6 text-agro-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{name}</span>
          <span className="text-sm text-muted-foreground">
            Członek od {formatMemberSince(memberSince)}
          </span>
        </div>
      </div>

      {/* Link to other listings */}
      <Link
        href={`/ogloszenia?userId=${userId}`}
        className="text-sm text-agro-600 hover:text-agro-700 hover:underline transition-colors"
        aria-label={`Zobacz inne ogłoszenia sprzedającego ${name}`}
      >
        Zobacz inne ogłoszenia sprzedającego &rarr;
      </Link>
    </div>
  )
}
