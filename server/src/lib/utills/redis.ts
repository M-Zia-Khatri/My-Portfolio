import 'dotenv/config';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on('connect', () => {
  console.log('🔴 Redis connected');
});

redis.on('error', (err: Error) => {
  console.error('Redis error:', err);
});

export { redis };

import { configureCache, setCacheMetrics } from './caching/cache';

// Configure global settings
configureCache({
  failureThreshold: 5, // More tolerant
  recoveryWindowMs: 60_000, // 1 minute recovery
  enableCompression: true, // Compress large payloads
  maxCallbackDurationMs: 10_000, // 10s timeout
});

// Optional: Setup metrics (OpenTelemetry, StatsD, etc.)
setCacheMetrics({
  recordHit: (key, stale) => console.log(`[metric] hit: ${key} (stale: ${stale})`),
  recordMiss: (key) => console.log(`[metric] miss: ${key}`),
  recordLatency: (op, ms) => console.log(`[metric] ${op}: ${ms}ms`),
  recordCircuitStateChange: (state) => console.warn(`[metric] circuit: ${state}`),
  recordCorruption: (key) => console.error(`[metric] corruption: ${key}`),
  recordBytesSaved: (bytes) => console.log(`[metric] compression saved: ${bytes}B`),
});
