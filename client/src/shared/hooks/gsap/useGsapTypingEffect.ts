import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface GsapTypingOptions {
  speed?: number;
  cursorSelector?: string;
  lineSelector?: string;
  replayKey?: string | number;
}

export function useGsapTypingEffect(
  containerRef: RefObject<HTMLElement | null>,
  options: GsapTypingOptions = {},
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      timelineRef.current?.kill();

      const lineSelector = options.lineSelector ?? '.code-line';
      const lines = gsap.utils.toArray<HTMLElement>(lineSelector, containerRef.current);
      if (lines.length === 0) return;

      gsap.set(lines, { autoAlpha: 0, y: 8, willChange: 'transform,opacity' });

      const tl = gsap.timeline();
      timelineRef.current = tl;
      tl.to(lines, {
        autoAlpha: 1,
        y: 0,
        stagger: options.speed ?? 0.05,
        duration: 0.22,
        ease: 'power1.out',
        clearProps: 'willChange',
      });

      const container = containerRef.current;
      if (!container) return;

      const cursor = options.cursorSelector
        ? container.querySelector(options.cursorSelector)
        : null;

      if (cursor) {
        tl.to(
          cursor,
          {
            opacity: 0,
            repeat: -1,
            yoyo: true,
            duration: 0.48,
            ease: 'none',
          },
          0,
        );
      }
    }, containerRef);

    return () => {
      timelineRef.current?.kill();
      ctx.revert();
    };
  }, [containerRef, options.cursorSelector, options.lineSelector, options.replayKey, options.speed]);

  return timelineRef;
}
