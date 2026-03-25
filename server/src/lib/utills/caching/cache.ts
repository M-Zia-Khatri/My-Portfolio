import { redis } from "../redis"
import { CACHE_PREFIX, LOCK_RETRY_DELAY } from "./cache.constants"
import { isCircuitOpen, recordFailure, recordSuccess } from "./cache.circuit"
import { buildKey, buildLockKey } from "./cache.keys"
import { acquireLock, releaseLock, sleep } from "./cache.lock"
import { deserialize, serialize } from "./cache.serializer"
import type { CacheOptions, CachePayload } from "./cache.types"

export { TTL } from "./cache.constants"
export type { CacheOptions } from "./cache.types"

// ---------------------------------------------------------------------------
// Internal write helper
// ---------------------------------------------------------------------------

async function writeToCache<T>(
  redisKey: string,
  data: T,
  ttl: number,
  staleTtl: number
): Promise<void> {
  const payload: CachePayload<T> = {
    data,
    expiry: Date.now() + ttl * 1_000,
  }
  await redis.set(redisKey, serialize(payload), "EX", ttl + staleTtl)
  recordSuccess()
}

// ---------------------------------------------------------------------------
// Internal: background stale revalidation (fire-and-forget)
// ---------------------------------------------------------------------------

function revalidateInBackground<T>(
  redisKey: string,
  lockKey: string,
  ttl: number,
  staleTtl: number,
  callback: () => Promise<T>
): void {
  Promise.resolve()
    .then(async () => {
      const acquired = await acquireLock(lockKey)
      if (!acquired) return

      try {
        const fresh = await callback()
        await writeToCache(redisKey, fresh, ttl, staleTtl)
        console.debug(`[cache] Background revalidated: ${redisKey}`)
      } finally {
        await releaseLock(lockKey)
      }
    })
    .catch((err) =>
      recordFailure(err, `background revalidation of "${redisKey}"`)
    )
}

// ---------------------------------------------------------------------------
// cacheRemember
// ---------------------------------------------------------------------------

/**
 * Returns a cached value when fresh, or calls `callback` on a miss and
 * stores the result.
 *
 * Stampede protection  — only the first concurrent request acquires an NX
 * lock and runs `callback`; all others wait briefly and read the freshly
 * written value.
 *
 * Stale-while-revalidate — when `staleTtl` is provided, expired-but-stored
 * data is returned instantly while a background refresh runs silently.
 *
 * @example
 * const skills = await cacheRemember("skills", {
 *   ttl:      TTL.FIVE_MINUTES,
 *   staleTtl: TTL.ONE_MINUTE,
 *   callback: () => db.skill.findMany(),
 * })
 */
export async function cacheRemember<T>(
  key: string,
  options: CacheOptions<T>
): Promise<T> {
  const { ttl, staleTtl = 0, callback } = options
  const redisKey                         = buildKey(key)
  const lockKey                          = buildLockKey(redisKey)

  if (isCircuitOpen()) {
    console.warn(`[cache] BYPASS (circuit open): ${redisKey}`)
    return callback()
  }

  try {
    const raw = await redis.get(redisKey)
    recordSuccess()

    if (raw !== null) {
      const payload = deserialize<T>(raw)

      if (payload.expiry > Date.now()) {
        console.debug(`[cache] HIT (fresh): ${redisKey}`)
        return payload.data
      }

      if (staleTtl > 0) {
        console.debug(`[cache] HIT (stale — revalidating in background): ${redisKey}`)
        revalidateInBackground(redisKey, lockKey, ttl, staleTtl, callback)
        return payload.data
      }
    } else {
      console.debug(`[cache] MISS: ${redisKey}`)
    }
  } catch (err) {
    recordFailure(err, `GET "${redisKey}"`)
  }

  const acquired = await acquireLock(lockKey).catch(() => false)

  if (acquired) {
    try {
      const data = await callback()
      writeToCache(redisKey, data, ttl, staleTtl).catch((err) =>
        recordFailure(err, `SET "${redisKey}"`)
      )
      return data
    } finally {
      await releaseLock(lockKey)
    }
  }

  await sleep(LOCK_RETRY_DELAY)

  try {
    const retry = await redis.get(redisKey)
    recordSuccess()
    if (retry !== null) {
      console.debug(`[cache] HIT (post-lock retry): ${redisKey}`)
      return deserialize<T>(retry).data
    }
  } catch (err) {
    recordFailure(err, `GET retry "${redisKey}"`)
  }

  return callback()
}

// ---------------------------------------------------------------------------
// cachePut
// ---------------------------------------------------------------------------

/**
 * Explicitly writes `value` into the cache under `key` for `ttl` seconds.
 * Use after a mutation to keep the cache warm.
 *
 * @example
 * await cachePut("skills:detail:42", updatedSkill, TTL.ONE_HOUR)
 */
export async function cachePut<T>(
  key: string,
  value: T,
  ttl: number
): Promise<void> {
  if (isCircuitOpen()) return
  const redisKey = buildKey(key)

  try {
    await writeToCache(redisKey, value, ttl, 0)
    console.info(`[cache] PUT: ${redisKey}`)
  } catch (err) {
    recordFailure(err, `cachePut "${redisKey}"`)
  }
}

// ---------------------------------------------------------------------------
// cacheForget
// ---------------------------------------------------------------------------

/**
 * Removes a single key from the cache.
 *
 * @example
 * await cacheForget("skills:detail:42")
 */
export async function cacheForget(key: string): Promise<void> {
  if (isCircuitOpen()) return
  const redisKey = buildKey(key)

  try {
    await redis.del(redisKey)
    recordSuccess()
    console.info(`[cache] FORGET: ${redisKey}`)
  } catch (err) {
    recordFailure(err, `cacheForget "${redisKey}"`)
  }
}

// ---------------------------------------------------------------------------
// cacheInvalidatePrefix
// ---------------------------------------------------------------------------

/**
 * Deletes every cache key that starts with the given logical namespace prefix.
 *
 * Uses cursor-based `SCAN` (never `KEYS`) — safe under production load on
 * large Redis instances because it never blocks the server for O(N) time.
 *
 * @param prefix - Logical prefix without the `app:cache:` root.
 *                 Internally expanded to `"app:cache:<prefix>:*"`.
 *
 * @example
 * await cacheInvalidatePrefix("skills")
 * await cacheInvalidatePrefix("portfolio:item")
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  if (isCircuitOpen()) return

  const pattern      = `${CACHE_PREFIX}:${prefix}:*`
  let   cursor       = "0"
  const keysToDelete: string[] = []

  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor, "MATCH", pattern, "COUNT", 100
      )
      cursor = nextCursor
      keysToDelete.push(...keys)
    } while (cursor !== "0")

    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete)
      recordSuccess()
      console.info(
        `[cache] Invalidated prefix "${prefix}": ${keysToDelete.length} key(s) removed.`
      )
    } else {
      console.debug(`[cache] Invalidate prefix "${prefix}": nothing to delete.`)
    }
  } catch (err) {
    recordFailure(err, `cacheInvalidatePrefix "${prefix}"`)
  }
}
