'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  label: string
  error?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PasswordInput({ id, label, error, className, ...inputProps }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  function toggleVisibility() {
    setVisible((prev) => !prev)
  }

  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          className="pr-10"
          {...inputProps}
        />

        <button
          type="button"
          aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
