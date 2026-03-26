export const APP_NAME = 'AgroPortal' as const
export const APP_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export const LISTING_EXPIRY_DAYS = 30
export const LISTING_HIGHLIGHT_PRICE_PLN = 29
export const SUBSCRIPTION_BASIC_PRICE_PLN = 49
export const SUBSCRIPTION_PREMIUM_PRICE_PLN = 149

export const VOIVODESHIPS = [
  { code: '02', name: 'Dolnośląskie' },
  { code: '04', name: 'Kujawsko-Pomorskie' },
  { code: '06', name: 'Lubelskie' },
  { code: '08', name: 'Lubuskie' },
  { code: '10', name: 'Łódzkie' },
  { code: '12', name: 'Małopolskie' },
  { code: '14', name: 'Mazowieckie' },
  { code: '16', name: 'Opolskie' },
  { code: '18', name: 'Podkarpackie' },
  { code: '20', name: 'Podlaskie' },
  { code: '22', name: 'Pomorskie' },
  { code: '24', name: 'Śląskie' },
  { code: '26', name: 'Świętokrzyskie' },
  { code: '28', name: 'Warmińsko-Mazurskie' },
  { code: '30', name: 'Wielkopolskie' },
  { code: '32', name: 'Zachodniopomorskie' },
] as const

export type VoivodeshipCode = (typeof VOIVODESHIPS)[number]['code']
