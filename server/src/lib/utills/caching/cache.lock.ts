// cache.lock.ts
import { redis } from '../redis';
import { LOCK_TTL_SECONDS, MAX_LOCK_RETRIES, LOCK_RETRY_DELAY } from './cache.constants';

export async function acquireLock(lockKey: string): Promise<boolean> {
  const result = await redis.set(lockKey, '1', 'NX', 'EX', LOCK_TTL_SECONDS);
  return result !== null;
}

export async function releaseLock(lockKey: string): Promise<void> {
  await redis.del(lockKey).catch(() => undefined);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function acquireLockWithBackoff(
  lockKey: string, 
  maxRetries = MAX_LOCK_RETRIES
): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (await acquireLock(lockKey)) {
      return true;
    }
    
    if (attempt < maxRetries - 1) {
      const backoff = Math.min(LOCK_RETRY_DELAY * Math.pow(2, attempt), 1000);
      const jitter = Math.random() * 100;
      await sleep(backoff + jitter);
    }
  }
  return false;
}