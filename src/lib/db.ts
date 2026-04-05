/**
 * Re-export db client from the canonical location.
 * Some modules (e.g. workers) import from @/lib/db — this file satisfies that alias.
 */
export { db } from '@/server/db'
