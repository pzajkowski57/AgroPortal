import type { CompanyStatus, SubscriptionTier } from '@/types'

export interface MockCompanyProfile {
  id: string
  userId: string
  name: string
  slug: string
  nip: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  phone: string | null
  email: string | null
  voivodeship: string
  city: string
  street: string | null
  postalCode: string | null
  lat: number | null
  lng: number | null
  status: CompanyStatus
  subscriptionTier: SubscriptionTier
  createdAt: Date
  updatedAt: Date
}

let companyCounter = 0

export function createCompanyProfile(
  overrides: Partial<MockCompanyProfile> = {},
): MockCompanyProfile {
  companyCounter += 1

  const name = overrides.name ?? `Firma Rolnicza ${companyCounter} Sp. z o.o.`
  const slug =
    overrides.slug ??
    name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')

  return {
    id: `company-${companyCounter}`,
    userId: `user-${companyCounter}`,
    name,
    slug,
    nip: `${1000000000 + companyCounter}`,
    description: null,
    logoUrl: null,
    websiteUrl: null,
    phone: null,
    email: `kontakt@firma${companyCounter}.pl`,
    voivodeship: '14',
    city: 'Warszawa',
    street: null,
    postalCode: null,
    lat: null,
    lng: null,
    status: 'pending',
    subscriptionTier: 'none',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

export function createVerifiedCompany(
  overrides: Partial<MockCompanyProfile> = {},
): MockCompanyProfile {
  return createCompanyProfile({ status: 'verified', subscriptionTier: 'basic', ...overrides })
}
