import Lenis from '@studio-freight/lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;
let mountCount = 0;

const defaultOptions: ConstructorParameters<typeof Lenis>[0] = {
  duration: 1.05,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.25,
};

function raf(time: number) {
  lenisInstance?.raf(time);
  rafId = window.requestAnimationFrame(raf);
}

export function getLenis() {
  if (typeof window === 'undefined') return null;

  if (!lenisInstance) {
    lenisInstance = new Lenis(defaultOptions);
  }

  return lenisInstance;
}

export function startLenis() {
  if (typeof window === 'undefined') return;

  mountCount += 1;
  const lenis = getLenis();

  if (!lenis || rafId !== null) return;
  rafId = window.requestAnimationFrame(raf);
}

export function stopLenis() {
  if (typeof window === 'undefined') return;

  mountCount = Math.max(0, mountCount - 1);
  if (mountCount > 0) return;

  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  lenisInstance?.destroy();
  lenisInstance = null;
}
