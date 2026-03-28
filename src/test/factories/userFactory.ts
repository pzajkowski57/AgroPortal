import type { Role } from '@/types'

export interface MockUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: Role
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

let userCounter = 0

export function createUser(overrides: Partial<MockUser> = {}): MockUser {
  userCounter += 1

  return {
    id: `user-${userCounter}`,
    email: `user${userCounter}@example.com`,
    name: `Test User ${userCounter}`,
    image: null,
    role: 'user',
    emailVerified: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

export function createAdminUser(overrides: Partial<MockUser> = {}): MockUser {
  return createUser({ role: 'admin', ...overrides })
}

export function createCompanyUser(overrides: Partial<MockUser> = {}): MockUser {
  return createUser({ role: 'company', ...overrides })
}
