import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface GsapStaggerOptions {
  y?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
}

export function useGsapStagger(
  parentRef: RefObject<HTMLElement | null>,
  options: GsapStaggerOptions = {},
) {
  useLayoutEffect(() => {
    if (!parentRef.current) return;

    const ctx = gsap.context(() => {
      const children = Array.from(parentRef.current?.children ?? []);
      if (children.length === 0) return;

      gsap.from(children, {
        autoAlpha: 0,
        y: options.y ?? 20,
        duration: options.duration ?? 0.6,
        stagger: options.stagger ?? 0.1,
        ease: 'power2.out',
        willChange: 'transform,opacity',
        clearProps: 'willChange',
        scrollTrigger: {
          trigger: parentRef.current,
          start: 'top 82%',
          once: options.once ?? true,
        },
      });
    }, parentRef);

    return () => ctx.revert();
  }, [parentRef, options.duration, options.once, options.stagger, options.y]);
}
