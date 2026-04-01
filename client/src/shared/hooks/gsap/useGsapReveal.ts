import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface GsapRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  ease?: string;
  once?: boolean;
}

export function useGsapReveal(
  ref: RefObject<HTMLElement | null>,
  options: GsapRevealOptions = {},
) {
  useLayoutEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: options.y ?? 24, willChange: 'transform,opacity' },
        {
          autoAlpha: 1,
          y: 0,
          delay: options.delay ?? 0,
          duration: options.duration ?? 0.8,
          ease: options.ease ?? 'power2.out',
          clearProps: 'willChange',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            once: options.once ?? true,
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [ref, options.delay, options.duration, options.ease, options.once, options.y]);
}
