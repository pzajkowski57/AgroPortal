import '@testing-library/jest-dom'
import { server } from './msw/server'

// ---------------------------------------------------------------------------
// MSW server lifecycle
// ---------------------------------------------------------------------------

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// ---------------------------------------------------------------------------
// next/navigation mock
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// ---------------------------------------------------------------------------
// next-auth/react mock
// ---------------------------------------------------------------------------

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn(),
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(() => Promise.resolve(null)),
}))
