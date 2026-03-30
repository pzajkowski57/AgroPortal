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
import { loginAction } from './actions'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LogowaniePage() {
  const [error, setError] = useState<string | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [googleLoading, startGoogleTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setError(undefined)

    startTransition(async () => {
      const result = await loginAction({ error: undefined }, formData)
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

          <h1 className="text-2xl font-bold">Zaloguj się</h1>
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

          {/* Credentials form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

            <PasswordInput
              id="password"
              label="Hasło"
              name="password"
              autoComplete="current-password"
            />

            {/* Global error */}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logowanie…' : 'Zaloguj się'}
            </Button>
          </form>

          {/* Registration link */}
          <p className="text-center text-sm text-muted-foreground">
            Nie masz konta?{' '}
            <Link
              href="/rejestracja"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Zarejestruj się
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
