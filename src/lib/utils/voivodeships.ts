import { slugify } from './slugify'

const VOIVODESHIPS_RAW = [
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

export const VOIVODESHIPS = VOIVODESHIPS_RAW.map((v) => ({
  ...v,
  nameLower: slugify(v.name),
}))

export type VoivodeshipCode = (typeof VOIVODESHIPS_RAW)[number]['code']
export type VoivodeshipName = (typeof VOIVODESHIPS_RAW)[number]['name']

/**
 * Get voivodeship name by TERYT code.
 */
export function getVoivodeshipName(code: string): string | undefined {
  return VOIVODESHIPS.find((v) => v.code === code)?.name
}

/**
 * Get voivodeship by TERYT code.
 */
export function getVoivodeship(
  code: string
): (typeof VOIVODESHIPS)[number] | undefined {
  return VOIVODESHIPS.find((v) => v.code === code)
}

/**
 * Validate a voivodeship code.
 */
export function isValidVoivodeshipCode(code: string): code is VoivodeshipCode {
  return VOIVODESHIPS.some((v) => v.code === code)
}

/**
 * Returns voivodeships as select options [{value, label}] for UI components.
 */
export function getVoivodeshipOptions() {
  return VOIVODESHIPS.map((v) => ({ value: v.code, label: v.name }))
}
