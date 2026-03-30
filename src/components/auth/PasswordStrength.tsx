'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Strength scoring
// ---------------------------------------------------------------------------

export type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong'

interface StrengthInfo {
  level: StrengthLevel
  label: string
  color: string
  bars: number
}

export function getStrengthInfo(password: string): StrengthInfo {
  // Criteria scores
  // length < 8  → 0 pts (weak baseline)
  // length >= 8 → 2 pts (medium baseline — 8-char lowercase-only is "Średnie")
  // length >= 12 → +1 pt extra
  // uppercase letter → +1 pt
  // digit           → +1 pt
  // special char    → +1 pt
  // Maximum: 6

  let score = 0

  if (password.length >= 8) score += 2
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  // Score mapping (matches spec):
  //  "abc"        → 0              → Słabe
  //  "abcdefgh"   → 2              → Średnie
  //  "Password1"  → 2+1+1 = 4     → Mocne
  //  "Password1!long" → 2+1+1+1+1 = 6 → Bardzo mocne

  if (score <= 1) {
    return { level: 'weak', label: 'Słabe', color: 'bg-destructive', bars: 1 }
  }
  if (score === 2) {
    return { level: 'medium', label: 'Średnie', color: 'bg-yellow-500', bars: 2 }
  }
  if (score >= 3 && score <= 4) {
    return { level: 'strong', label: 'Mocne', color: 'bg-green-500', bars: 3 }
  }
  return { level: 'very-strong', label: 'Bardzo mocne', color: 'bg-primary', bars: 4 }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PasswordStrengthProps {
  password: string
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  if (!password) return null

  const info = getStrengthInfo(password)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Siła hasła: ${info.label}`}
      className={cn('mt-2 space-y-1', className)}
    >
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', {
              [info.color]: i < info.bars,
              'bg-muted': i >= info.bars,
            })}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Siła hasła:{' '}
        <span
          className={cn('font-medium', {
            'text-destructive': info.level === 'weak',
            'text-yellow-600': info.level === 'medium',
            'text-green-600': info.level === 'strong',
            'text-primary': info.level === 'very-strong',
          })}
        >
          {info.label}
        </span>
      </p>
    </div>
  )
}
