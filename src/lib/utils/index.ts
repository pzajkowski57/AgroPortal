/**
 * Barrel export for all utility functions.
 * Consumers can import from '@/lib/utils' to get cn(), or from the specific
 * sub-module for slugify, voivodeships, etc.
 */

export { cn } from './cn'
export { slugify, uniqueSlug } from './slugify'
export {
  VOIVODESHIPS,
  getVoivodeshipName,
  getVoivodeship,
  isValidVoivodeshipCode,
  getVoivodeshipOptions,
} from './voivodeships'
export type { VoivodeshipCode, VoivodeshipName } from './voivodeships'
