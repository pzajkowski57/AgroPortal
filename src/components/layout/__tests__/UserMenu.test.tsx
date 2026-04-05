import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, createMockSession } from '@/test/helpers'
import { UserMenu } from '../UserMenu'

const mockUseSession = vi.fn(() => ({ data: null as import('next-auth').Session | null, status: 'unauthenticated', update: vi.fn() }))

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(null)),
}))

beforeEach(() => {
  mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: vi.fn() })
})

describe('UserMenu — unauthenticated state', () => {
  it('renders "Zaloguj się" link', () => {
    renderWithProviders(<UserMenu />)
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toBeInTheDocument()
  })

  it('"Zaloguj się" href points to /auth/signin', () => {
    renderWithProviders(<UserMenu />)
    expect(screen.getByRole('link', { name: /zaloguj się/i })).toHaveAttribute(
      'href',
      '/auth/signin',
    )
  })

  it('does not render avatar button when unauthenticated', () => {
    renderWithProviders(<UserMenu />)
    expect(screen.queryByRole('button', { name: /menu użytkownika/i })).not.toBeInTheDocument()
  })
})

describe('UserMenu — authenticated state', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: createMockSession('user'),
      status: 'authenticated',
      update: vi.fn(),
    })
  })

  it('renders avatar/user button', () => {
    renderWithProviders(<UserMenu />)
    expect(screen.getByRole('button', { name: /menu użytkownika/i })).toBeInTheDocument()
  })

  it('does not render "Zaloguj się" when authenticated', () => {
    renderWithProviders(<UserMenu />)
    expect(screen.queryByRole('link', { name: /zaloguj się/i })).not.toBeInTheDocument()
  })

  it('opens dropdown with menu items after click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /menu użytkownika/i }))
    expect(screen.getByText(/wyloguj/i)).toBeInTheDocument()
  })

  it('dropdown contains a menu item linking to user profile', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /menu użytkownika/i }))
    // Radix DropdownMenu.Item asChild overrides role to menuitem per WAI-ARIA spec
    expect(screen.getByRole('menuitem', { name: /mój profil|profil/i })).toBeInTheDocument()
  })

  it('clicking sign-out item calls signOut', async () => {
    const { signOut } = await import('next-auth/react')
    const user = userEvent.setup()
    renderWithProviders(<UserMenu />)
    await user.click(screen.getByRole('button', { name: /menu użytkownika/i }))
    await user.click(screen.getByText(/wyloguj/i))
    expect(signOut).toHaveBeenCalled()
  })
})

describe('UserMenu — loading state', () => {
  it('renders nothing critical during loading state', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading', update: vi.fn() })
    renderWithProviders(<UserMenu />)
    expect(screen.queryByRole('link', { name: /zaloguj się/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /menu użytkownika/i })).not.toBeInTheDocument()
  })
})

describe('UserMenu — accessibility', () => {
  it('avatar button has aria-label', () => {
    mockUseSession.mockReturnValue({
      data: createMockSession('user'),
      status: 'authenticated',
      update: vi.fn(),
    })
    renderWithProviders(<UserMenu />)
    const btn = screen.getByRole('button', { name: /menu użytkownika/i })
    expect(btn).toHaveAttribute('aria-label')
  })

  it('avatar button has aria-expanded="false" when closed', () => {
    mockUseSession.mockReturnValue({
      data: createMockSession('user'),
      status: 'authenticated',
      update: vi.fn(),
    })
    renderWithProviders(<UserMenu />)
    const btn = screen.getByRole('button', { name: /menu użytkownika/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })
})
