const POLISH_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n',
  ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n',
  Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
}

/**
 * Converts a string to a URL-safe slug with Polish diacritics support.
 * Example: "Ciągnik rolniczy Ursus C-360" → "ciagnik-rolniczy-ursus-c-360"
 *
 * Returns `'item'` when the input is empty or whitespace-only (produces no
 * slug-safe characters after normalization).
 */
export function slugify(input: string): string {
  const result = input
    .split('')
    .map((char) => POLISH_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 200)
    .replace(/^-+|-+$/g, '')

  return result === '' ? 'item' : result
}

/**
 * Generates a unique slug by appending a numeric suffix if the base slug already exists.
 *
 * @param base - The raw string to slugify and make unique.
 * @param existingSlugs - A list of already-slugified strings to check uniqueness against.
 *   Each entry must already be a valid slug (i.e. produced by `slugify`). Passing raw
 *   un-slugified strings will produce incorrect results.
 *
 * @remarks
 * This function is NOT atomic. In concurrent or distributed environments two callers
 * may independently receive the same slug before either has persisted it.
 * Enforce uniqueness at the database level (unique index) and retry on conflict.
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
