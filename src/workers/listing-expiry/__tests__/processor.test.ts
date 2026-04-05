import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db — factory uses vi.fn() directly (hoisted-safe)
vi.mock('@/lib/db', () => ({
  db: {
    listing: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

// Mock resend client — factory uses vi.fn() directly (hoisted-safe)
vi.mock('@/lib/email/resend', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'
import { resend } from '@/lib/email/resend'
import { processListingExpiry } from '../processor'

const mockFindMany = vi.mocked(db.listing.findMany)
const mockUpdateMany = vi.mocked(db.listing.updateMany)
const mockEmailsSend = vi.mocked(resend.emails.send)

function makeExpiredListing(
  id: string,
  overrides: {
    user?: { email: string; name: string | null } | null
  } = {},
) {
  return {
    id,
    title: `Listing ${id}`,
    slug: `listing-${id}`,
    user: overrides.user !== undefined
      ? overrides.user
      : { email: `user${id}@example.com`, name: `User ${id}` },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: RESEND_API_KEY is set
  process.env.RESEND_API_KEY = 'test-key'
  mockEmailsSend.mockResolvedValue({ data: { id: 'email-id' }, error: null, headers: null } as never)
  mockUpdateMany.mockResolvedValue({ count: 0 })
})

describe('processListingExpiry', () => {
  it('returns zeros and skips updateMany when no expired listings', async () => {
    mockFindMany.mockResolvedValue([])

    const result = await processListingExpiry()

    expect(result).toEqual({ expired: 0, emailsSent: 0, emailsFailed: 0 })
    expect(mockUpdateMany).not.toHaveBeenCalled()
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })

  it('calls updateMany with correct ids for 3 expired listings', async () => {
    const listings = [
      makeExpiredListing('1'),
      makeExpiredListing('2'),
      makeExpiredListing('3'),
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 3 })

    const result = await processListingExpiry()

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ['1', '2', '3'] } },
      data: { status: 'expired' },
    })
    expect(result.expired).toBe(3)
    expect(result.emailsSent).toBe(3)
    expect(result.emailsFailed).toBe(0)
  })

  it('sends 3 emails for 3 expired listings with valid user emails', async () => {
    const listings = [
      makeExpiredListing('1'),
      makeExpiredListing('2'),
      makeExpiredListing('3'),
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 3 })

    await processListingExpiry()

    expect(mockEmailsSend).toHaveBeenCalledTimes(3)
  })

  it('skips email for listings where user is null, but still expires them', async () => {
    const listings = [
      makeExpiredListing('1', { user: null }),
      makeExpiredListing('2'),
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 2 })

    const result = await processListingExpiry()

    expect(result.expired).toBe(2)
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ['1', '2'] } },
      data: { status: 'expired' },
    })
    expect(mockEmailsSend).toHaveBeenCalledTimes(1)
    expect(result.emailsSent).toBe(1)
    expect(result.emailsFailed).toBe(0)
  })

  it('continues sending other emails when one fails', async () => {
    const listings = [
      makeExpiredListing('1'),
      makeExpiredListing('2'),
      makeExpiredListing('3'),
    ]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 3 })

    // Second email fails
    mockEmailsSend
      .mockResolvedValueOnce({ data: { id: 'ok' }, error: null } as never)
      .mockRejectedValueOnce(new Error('SMTP error'))
      .mockResolvedValueOnce({ data: { id: 'ok' }, error: null } as never)

    const result = await processListingExpiry()

    expect(mockEmailsSend).toHaveBeenCalledTimes(3)
    expect(result.emailsSent).toBe(2)
    expect(result.emailsFailed).toBe(1)
    expect(result.expired).toBe(3)
  })

  it('propagates error from updateMany for BullMQ retry', async () => {
    const listings = [makeExpiredListing('1')]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockRejectedValue(new Error('DB connection lost'))

    await expect(processListingExpiry()).rejects.toThrow('DB connection lost')
  })

  it('skips sending emails but still expires when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY

    const listings = [makeExpiredListing('1'), makeExpiredListing('2')]
    mockFindMany.mockResolvedValue(listings as never)
    mockUpdateMany.mockResolvedValue({ count: 2 })

    const result = await processListingExpiry()

    expect(result.expired).toBe(2)
    expect(result.emailsSent).toBe(0)
    expect(result.emailsFailed).toBe(0)
    expect(mockUpdateMany).toHaveBeenCalledTimes(1)
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })
})
