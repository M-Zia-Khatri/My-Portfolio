import type { CachePayload } from "./cache.types"

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

export function serialize<T>(payload: CachePayload<T>): string {
  return JSON.stringify(payload)
}

/**
 * Parses a cached JSON string and restores ISO date strings back to
 * real `Date` objects so TypeScript types are preserved across round-trips.
 */
export function deserialize<T>(raw: string): CachePayload<T> {
  return JSON.parse(raw, (_key, value) => {
    if (typeof value === "string" && ISO_DATE_RE.test(value)) {
      return new Date(value)
    }
    return value
  }) as CachePayload<T>
}
