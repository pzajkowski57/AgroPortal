import { db } from '@/lib/db'
import { resend } from '@/lib/email/resend'
import { APP_URL } from '@/lib/constants'
import { buildListingExpiredEmail } from '@/lib/email/templates/listing-expired'

interface ExpiredListing {
  id: string
  title: string
  slug: string
  user: {
    email: string
    name: string | null
  } | null
}

interface ProcessorResult {
  expired: number
  emailsSent: number
  emailsFailed: number
}

async function sendExpiryEmail(listing: ExpiredListing): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@agroportal.pl'

  const user = listing.user
  if (!user?.email) return

  const listingUrl = `${APP_URL}/ogloszenia/${listing.slug}`
  const userName = user.name ?? user.email

  const { subject, html } = buildListingExpiredEmail({
    listingTitle: listing.title,
    listingUrl,
    userName,
  })

  const response = await resend.emails.send({
    from,
    to: user.email,
    subject,
    html,
  })

  if (response.error) {
    throw new Error(`Resend error for listing ${listing.id}: ${response.error.message}`)
  }
}

export async function processListingExpiry(): Promise<ProcessorResult> {
  const now = new Date()

  const expiredListings: ExpiredListing[] = await db.listing.findMany({
    where: {
      status: 'active',
      expiresAt: { lte: now },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  if (expiredListings.length === 0) {
    console.info('[ListingExpiry] No active listings to expire.')
    return { expired: 0, emailsSent: 0, emailsFailed: 0 }
  }

  const ids = expiredListings.map((l) => l.id)

  await db.listing.updateMany({
    where: { id: { in: ids } },
    data: { status: 'expired' },
  })

  console.info(`[ListingExpiry] Expired ${ids.length} listing(s).`)

  const hasResendKey = Boolean(process.env.RESEND_API_KEY)
  if (!hasResendKey) {
    console.warn('[ListingExpiry] RESEND_API_KEY not set — skipping email notifications.')
    return { expired: ids.length, emailsSent: 0, emailsFailed: 0 }
  }

  const listingsWithEmail = expiredListings.filter((l) => Boolean(l.user?.email))

  const emailResults = await Promise.allSettled(
    listingsWithEmail.map((listing) => sendExpiryEmail(listing)),
  )

  const emailsSent = emailResults.filter((r) => r.status === 'fulfilled').length
  const emailsFailed = emailResults.filter((r) => r.status === 'rejected').length

  emailResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        `[ListingExpiry] Failed to send email for listing ${listingsWithEmail[index].id}:`,
        result.reason,
      )
    }
  })

  console.info(
    `[ListingExpiry] Summary: ${ids.length} expired, ${emailsSent} emails sent, ${emailsFailed} failed.`,
  )

  return { expired: ids.length, emailsSent, emailsFailed }
}
