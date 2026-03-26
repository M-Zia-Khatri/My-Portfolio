import { redis } from '../redis';
import { LOCK_TTL_SECONDS } from './cache.constants';

/**
 * Tries to acquire a Redis NX lock.
 * Returns `true` if the lock was granted, `false` if another caller holds it.
 */
export async function acquireLock(lockKey: string): Promise<boolean> {
  const result = await redis.set(lockKey, '1', 'NX', 'EX', LOCK_TTL_SECONDS);
  return result !== null;
}

export async function releaseLock(lockKey: string): Promise<void> {
  await redis.del(lockKey).catch(() => undefined);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
