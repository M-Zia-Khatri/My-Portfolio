import { CACHE_PREFIX } from "./cache.constants"

/**
 * Builds a namespaced Redis key using `:` as the delimiter.
 *
 *   "skills"            → "app:cache:skills"
 *   "skills:detail:42"  → "app:cache:skills:detail:42"
 *   "portfolio:item:7"  → "app:cache:portfolio:item:7"
 */
export function buildKey(key: string): string {
  return `${CACHE_PREFIX}:${key}`
}

export function buildLockKey(redisKey: string): string {
  return `${redisKey}:lock`
}
