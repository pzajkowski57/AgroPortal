'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { User, LogOut, ChevronDown } from 'lucide-react'

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" aria-hidden="true" />
  }

  if (!session) {
    return (
      <Link
        href="/logowanie"
        className="text-sm font-medium text-foreground hover:text-agro-600 transition-colors px-3 py-2 rounded-md hover:bg-accent"
      >
        Zaloguj się
      </Link>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Menu użytkownika"
          className="flex items-center gap-2 rounded-full p-1 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-agro-100 text-agro-700">
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[160px] rounded-md border border-border bg-card shadow-md p-1 text-sm"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/profil"
              className="flex items-center gap-2 rounded px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground outline-none"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              Mój profil
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            onSelect={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 rounded px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground outline-none text-destructive"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Wyloguj
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
