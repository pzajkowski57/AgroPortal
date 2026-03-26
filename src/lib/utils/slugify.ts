const POLISH_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n',
  ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n',
  Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
}

/**
 * Converts a string to a URL-safe slug with Polish diacritics support.
 * Example: "Ciągnik rolniczy Ursus C-360" → "ciagnik-rolniczy-ursus-c-360"
 */
export function slugify(input: string): string {
  return input
    .split('')
    .map((char) => POLISH_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 200)
    .replace(/^-+|-+$/g, '')
}

/**
 * Generates a unique slug by appending a suffix if the base slug already exists.
 */
export function uniqueSlug(base: string, existingSlugs: string[]): string {
  const baseSlug = slugify(base)
  const existingSet = new Set(existingSlugs)
  if (!existingSet.has(baseSlug)) return baseSlug

  let counter = 2
  while (existingSet.has(`${baseSlug}-${counter}`)) {
    counter++
  }
  return `${baseSlug}-${counter}`
}
