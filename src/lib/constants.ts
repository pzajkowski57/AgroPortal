export const APP_NAME = 'AgroPortal' as const
export const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export const LISTING_EXPIRY_DAYS = 30
export const LISTING_HIGHLIGHT_PRICE_PLN = 29
export const SUBSCRIPTION_BASIC_PRICE_PLN = 49
export const SUBSCRIPTION_PREMIUM_PRICE_PLN = 149

export { VOIVODESHIPS } from './utils/voivodeships'
export type { VoivodeshipCode } from './utils/voivodeships'
