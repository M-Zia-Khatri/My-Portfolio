export interface CacheOptions<T> {
  ttl: number;
  staleTtl?: number;
  callback: () => Promise<T>;
}

export interface CachePayload<T> {
  data: T;
  expiry: number;
}
