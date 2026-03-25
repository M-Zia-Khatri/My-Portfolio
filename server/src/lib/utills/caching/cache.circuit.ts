import { FAILURE_THRESHOLD, RECOVERY_WINDOW_MS } from "./cache.constants"

const circuit = {
  isOpen:     false,
  failures:   0,
  halfOpenAt: 0,
}

export function recordSuccess(): void {
  if (circuit.isOpen) {
    console.info("[cache] Circuit CLOSED — Redis is healthy again.")
  }
  circuit.failures   = 0
  circuit.isOpen     = false
  circuit.halfOpenAt = 0
}

export function recordFailure(err: unknown, context: string): void {
  circuit.failures += 1
  console.error(`[cache] Redis error in ${context}:`, err)

  if (circuit.failures >= FAILURE_THRESHOLD && !circuit.isOpen) {
    circuit.isOpen     = true
    circuit.halfOpenAt = Date.now() + RECOVERY_WINDOW_MS
    console.warn(
      `[cache] Circuit OPEN — Redis bypassed for ${RECOVERY_WINDOW_MS / 1000}s ` +
      `after ${circuit.failures} failures.`
    )
  }
}

export function isCircuitOpen(): boolean {
  if (!circuit.isOpen) return false
  if (Date.now() >= circuit.halfOpenAt) {
    console.info("[cache] Circuit HALF-OPEN — probing Redis.")
    return false
  }
  return true
}
