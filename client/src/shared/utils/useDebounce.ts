/**
 * useDebounce.ts
 *
 * Two composable hooks for rate-limiting expensive callbacks:
 *   • useDebounce  — delays execution until calls stop (search, filters)
 *   • useRafThrottle — limits to one call per animation frame (scroll, resize)
 *
 * Both avoid stale-closure issues via a ref that always points to the latest fn,
 * so neither hook needs `fn` in its stable callback's dependency array.
 */

import { useCallback, useEffect, useRef } from 'react';

// ─── useDebounce ──────────────────────────────────────────────────────────────

/**
 * Returns a debounced version of `fn`.
 * The returned callback is stable across renders; the latest `fn` is captured
 * via a ref so callers never get stale closures.
 *
 * @example
 * const onSearch = useDebounce((q: string) => fetchResults(q), 300);
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always reference the latest `fn` without invalidating the callback
  const fnRef = useRef<T>(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  // Cancel pending invocation on unmount to prevent memory leaks
  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        fnRef.current(...args);
      }, delay);
    },
    [delay], // stable: only recreated when delay changes
  );
}

// ─── useRafThrottle ───────────────────────────────────────────────────────────

/**
 * Returns a RAF-throttled version of `fn`.
 *
 * At most one invocation is scheduled per animation frame (≈ 16 ms at 60 fps).
 * Ideal for scroll and resize handlers where sub-frame precision is wasteful.
 *
 * Why RAF over setTimeout(0)?
 *   RAF is automatically paused in background tabs, saving CPU.
 *   It aligns work with the browser's paint cycle, preventing layout thrashing.
 *
 * @example
 * const onScroll = useRafThrottle(() => updateScrollPos());
 * window.addEventListener('scroll', onScroll, { passive: true });
 */
export function useRafThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
): (...args: Parameters<T>) => void {
  const rafRef = useRef<number | null>(null);
  const fnRef = useRef<T>(fn);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  });

  // Cancel any pending RAF on unmount
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return useCallback((...args: Parameters<T>) => {
    // Store latest args so the RAF callback uses them, not stale ones
    pendingArgsRef.current = args;

    if (rafRef.current !== null) return; // already scheduled this frame

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingArgsRef.current !== null) {
        fnRef.current(...pendingArgsRef.current);
        pendingArgsRef.current = null;
      }
    });
  }, []); // truly stable — no deps needed
}
