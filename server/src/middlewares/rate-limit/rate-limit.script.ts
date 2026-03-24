// Sliding window via Redis sorted set — single Lua round-trip.
//
// [1] Returns [newCount, oldestScore] — no secondary call needed
// [2] Uses redis.call('TIME') — server-side clock, immune to app-server drift
// [3] Inserts `weight` members — heavy requests consume multiple slots
//
// Compatibility: Redis >= 2.6 (no 6.2-only ZRANGE flags used)
//
// ioredis call convention:
//   redis.eval(script, 1, KEYS[1], ARGV[1], ARGV[2], ARGV[3], ARGV[4])
//
//   KEYS[1]  → composite rate-limit key
//   ARGV[1]  → interval  (seconds)
//   ARGV[2]  → limit     (max slots)
//   ARGV[3]  → requestId (unique prefix for inserted members)
//   ARGV[4]  → weight    (slots consumed by this request)
//
// Returns: Redis array → [newCount, oldestScore]
//   newCount    → total slots used after this request
//   oldestScore → unix timestamp (float) of the oldest member in the window,
//                 used upstream to compute RateLimit-Reset

export const SLIDING_WINDOW_SCRIPT = `
local key       = KEYS[1]
local interval  = tonumber(ARGV[1])
local limit     = tonumber(ARGV[2])
local requestId = ARGV[3]
local weight    = tonumber(ARGV[4])

-- [2] Redis server clock (seconds + microseconds) — no app-server drift
local t           = redis.call('TIME')
local now         = tonumber(t[1]) + tonumber(t[2]) / 1000000
local windowStart = now - interval

-- Evict members that have fallen outside the current window
redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

local count = redis.call('ZCARD', key)

-- [3] Insert 'weight' synthetic members.
--     Each score is micro-offset so ZADD never silently deduplicates them.
if count + weight <= limit then
  for i = 1, weight do
    redis.call('ZADD', key, now + (i * 0.000001), requestId .. ':' .. i)
  end
  redis.call('EXPIRE', key, interval)
end

local newCount = redis.call('ZCARD', key)

-- [1] Derive oldest score without ZRANGE...WITHSCORES (requires Redis 6.2+).
--     ZRANGE returns just the member name; ZSCORE then fetches its score.
--     Both calls are inside the same Lua execution — still fully atomic.
local oldestScore = now
local members     = redis.call('ZRANGE', key, 0, 0)

if members[1] then
  local raw = redis.call('ZSCORE', key, members[1])
  if raw then
    oldestScore = tonumber(raw)
  end
end

return { newCount, oldestScore }
`