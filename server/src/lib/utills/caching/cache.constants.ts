// ---------------------------------------------------------------------------
// TTL Presets (seconds)
// ---------------------------------------------------------------------------

export const TTL = {
  ONE_MINUTE:      60,
  FIVE_MINUTES:    60 * 5,
  FIFTEEN_MINUTES: 60 * 15,
  ONE_HOUR:        60 * 60,
  ONE_DAY:         60 * 60 * 24,
  ONE_WEEK:        60 * 60 * 24 * 7,
} as const

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

export const CACHE_PREFIX     = "app:cache"
export const LOCK_TTL_SECONDS = 5
export const LOCK_RETRY_DELAY = 100

// ---------------------------------------------------------------------------
// Circuit Breaker constants
// ---------------------------------------------------------------------------

export const FAILURE_THRESHOLD  = 3
export const RECOVERY_WINDOW_MS = 30_000
