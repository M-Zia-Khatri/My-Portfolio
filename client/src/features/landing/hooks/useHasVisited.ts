/**
 * useHasVisited.ts
 *
 * Isolated visit-persistence logic.
 *
 * WHAT IT DOES
 * Reads / writes a single `localStorage` key (`'zia_portfolio_visited'`).
 * The LandingPage uses this to decide:
 *   a) Should it auto-redirect to /home immediately?  → user already visited.
 *   b) Should it render and wait for the CTA click?  → first-time visitor.
 *
 * DESIGN DECISIONS
 *
 * 1. Namespaced key: prefixed with `zia_portfolio_` to avoid collisions with
 *    other apps on the same localhost origin during development.
 *
 * 2. SSR-safe: the `typeof window` guard prevents crashes in environments
 *    where localStorage is not available (SSR, tests with jsdom misconfigured,
 *    private-browsing modes that throw on write).
 *
 * 3. No state: the hook returns plain values + a stable setter function.
 *    There is no `useState` here because:
 *      • The read is synchronous — no async gap between render and value.
 *      • The write happens once (CTA click) and immediately triggers navigate().
 *      • Adding state would cause an extra render for no benefit.
 *
 * 4. Separation of concerns: all localStorage touch-points live here, not
 *    scattered across route components. If the persistence strategy ever
 *    changes (sessionStorage, IndexedDB, cookie), only this file changes.
 *
 * USAGE
 * ```tsx
 * const { hasVisited, markVisited } = useHasVisited();
 * if (hasVisited) return <Navigate to="/home" replace />;
 * // ...
 * <button onClick={() => { markVisited(); navigate('/home'); }}>Enter</button>
 * ```
 */

import { useCallback } from 'react';

const STORAGE_KEY = 'zia_portfolio_visited';

// ─── Helpers (module-scope so they're created once) ───────────────────────────

function readFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // Private browsing / storage quota exceeded — treat as first visit.
    return false;
  }
}

function writeFlag(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Fail silently — the UX still works, user just sees the landing on
    // every visit instead of being redirected.
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseHasVisitedReturn {
  /** True if the user has previously clicked "Enter Site". */
  hasVisited: boolean;
  /**
   * Persist the visited flag.
   * Call this *before* or *during* the navigation to /home so the flag is
   * written even if navigation is fast and the component unmounts immediately.
   */
  markVisited: () => void;
}

export function useHasVisited(): UseHasVisitedReturn {
  // Synchronous read — safe to call during render (no useEffect needed).
  const hasVisited = readFlag();

  // Stable reference — writeFlag is module-level so useCallback has no deps.
  const markVisited = useCallback(() => writeFlag(), []);

  return { hasVisited, markVisited };
}
