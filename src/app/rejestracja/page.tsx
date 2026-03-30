'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OAuthButton } from '@/components/auth/OAuthButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { registerAction } from './actions'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RejestracjaPage() {
  const [error, setError] = useState<string | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [googleLoading, startGoogleTransition] = useTransition()
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setError(undefined)

    startTransition(async () => {
      const result = await registerAction({ error: undefined }, formData)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  function onGoogleClick() {
    startGoogleTransition(() => {
      void import('next-auth/react').then(({ signIn }) => {
        void signIn('google', { callbackUrl: '/' })
      })
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center space-y-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-agro-500" aria-hidden="true" />
            <span className="text-2xl font-bold text-agro-500">AgroPortal</span>
          </div>

          <h1 className="text-2xl font-bold">Utwórz konto</h1>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google OAuth */}
          <OAuthButton
            provider="google"
            label="Kontynuuj z Google"
            onClick={onGoogleClick}
            isLoading={googleLoading}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">lub</span>
            </div>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Imię</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                required
                placeholder="Jan"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jan@example.com"
              />
            </div>

            {/* Password with strength indicator */}
            <div className="space-y-1">
              <PasswordInput
                id="password"
                label="Hasło"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <PasswordInput
              id="confirmPassword"
              label="Powtórz hasło"
              name="confirmPassword"
              autoComplete="new-password"
            />

            {/* Terms checkbox */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                required
              />
              <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-snug">
                Akceptuję{' '}
                <Link
                  href="/regulamin"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  regulamin serwisu
                </Link>
              </Label>
            </div>

            {/* Global error */}
            <p
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="min-h-[1.25rem] text-sm text-destructive"
            >
              {error ?? ''}
            </p>

            <Button type="submit" className="w-full" disabled={!termsAccepted || isPending}>
              {isPending ? 'Rejestracja…' : 'Zarejestruj się'}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Masz już konto?{' '}
            <Link
              href="/logowanie"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Zaloguj się
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
