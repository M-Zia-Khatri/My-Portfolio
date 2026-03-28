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
} from './cache';

export { cacheRememberCollection } from './cache.collections';

export { generateCompositeETag, generateETag, matchETag } from './cache.etag';

export type {
  CacheConditionalOptions,
  CacheConfig,
  CacheMetrics,
  CacheOptions,
  CachePayload,
  CacheResult,
} from './cache.types';
