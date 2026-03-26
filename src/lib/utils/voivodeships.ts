export const VOIVODESHIPS = [
  { code: '02', name: 'Dolnośląskie', nameLower: 'dolnoslaskie' },
  { code: '04', name: 'Kujawsko-Pomorskie', nameLower: 'kujawsko-pomorskie' },
  { code: '06', name: 'Lubelskie', nameLower: 'lubelskie' },
  { code: '08', name: 'Lubuskie', nameLower: 'lubuskie' },
  { code: '10', name: 'Łódzkie', nameLower: 'lodzkie' },
  { code: '12', name: 'Małopolskie', nameLower: 'malopolskie' },
  { code: '14', name: 'Mazowieckie', nameLower: 'mazowieckie' },
  { code: '16', name: 'Opolskie', nameLower: 'opolskie' },
  { code: '18', name: 'Podkarpackie', nameLower: 'podkarpackie' },
  { code: '20', name: 'Podlaskie', nameLower: 'podlaskie' },
  { code: '22', name: 'Pomorskie', nameLower: 'pomorskie' },
  { code: '24', name: 'Śląskie', nameLower: 'slaskie' },
  { code: '26', name: 'Świętokrzyskie', nameLower: 'swietokrzyskie' },
  { code: '28', name: 'Warmińsko-Mazurskie', nameLower: 'warminsko-mazurskie' },
  { code: '30', name: 'Wielkopolskie', nameLower: 'wielkopolskie' },
  { code: '32', name: 'Zachodniopomorskie', nameLower: 'zachodniopomorskie' },
] as const

export type VoivodeshipCode = (typeof VOIVODESHIPS)[number]['code']
export type VoivodeshipName = (typeof VOIVODESHIPS)[number]['name']

/**
 * Get voivodeship name by TERYT code.
 */
export function getVoivodeshipName(code: string): string | undefined {
  return VOIVODESHIPS.find((v) => v.code === code)?.name
}

/**
 * Get voivodeship by TERYT code.
 */
export function getVoivodeship(code: string) {
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
