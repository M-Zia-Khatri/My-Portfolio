// index.ts
export {
  TTL,
  cacheForget,
  cacheInvalidatePrefix,
  cachePut,
  cacheRemember,
  cacheRememberConditional,
  configureCache,
  onCacheEvent,
  setCacheMetrics,
} from './cache.js';

export { cacheRememberCollection } from './cache.collections.js';

export { generateCompositeETag, generateETag, matchETag } from './cache.etag.js';

export type {
  CacheConditionalOptions,
  CacheConfig,
  CacheMetrics,
  CacheOptions,
  CachePayload,
  CacheResult,
} from './cache.types.js';
