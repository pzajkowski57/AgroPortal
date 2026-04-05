import { Resend } from 'resend'

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[Email] RESEND_API_KEY is required in production. Set it in your environment variables.',
      )
    }
    console.warn('[Email] RESEND_API_KEY is not set. Emails will not be sent.')
  }

  return new Resend(apiKey)
}

export const resend: Resend = createResendClient()
