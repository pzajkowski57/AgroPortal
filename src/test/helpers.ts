import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import type { Role } from '@/types'

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

export function createMockSession(role: Role = 'user'): Session {
  return {
    user: {
      id: `mock-user-${role}`,
      email: `${role}@example.com`,
      name: `Mock ${role.charAt(0).toUpperCase()}${role.slice(1)}`,
      image: null,
      role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Router helpers
// ---------------------------------------------------------------------------

export interface MockRouter {
  push: ReturnType<typeof vi.fn>
  replace: ReturnType<typeof vi.fn>
  back: ReturnType<typeof vi.fn>
  forward: ReturnType<typeof vi.fn>
  refresh: ReturnType<typeof vi.fn>
  prefetch: ReturnType<typeof vi.fn>
  pathname: string
  query: Record<string, string>
}

export function createMockRouter(overrides: Partial<MockRouter> = {}): MockRouter {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
    query: {},
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null
}

export function renderWithProviders(
  ui: React.ReactElement,
  { session = null, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(SessionProvider, { session }, children)
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
