import '@testing-library/jest-dom'
import { server } from './msw/server'

// ---------------------------------------------------------------------------
// Radix UI pointer capture mocks (jsdom limitation)
// ---------------------------------------------------------------------------

Element.prototype.hasPointerCapture = vi.fn() as unknown as typeof Element.prototype.hasPointerCapture
Element.prototype.setPointerCapture = vi.fn() as unknown as typeof Element.prototype.setPointerCapture
Element.prototype.releasePointerCapture = vi.fn() as unknown as typeof Element.prototype.releasePointerCapture
Element.prototype.scrollIntoView = vi.fn()

// ---------------------------------------------------------------------------
// ResizeObserver mock (required by Radix UI)
// ---------------------------------------------------------------------------

global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

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
