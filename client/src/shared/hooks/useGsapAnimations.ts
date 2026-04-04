import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal(
  scopeRef: RefObject<HTMLElement | null>,
  target: string,
  options?: { y?: number; duration?: number; ease?: string; once?: boolean },
) {
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    if (!scopeRef.current || initializedRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { autoAlpha: 0, y: options?.y ?? 20, willChange: 'transform,opacity' },
        {
          autoAlpha: 1,
          y: 0,
          duration: options?.duration ?? 0.55,
          ease: options?.ease ?? 'power2.out',
          clearProps: 'willChange',
          scrollTrigger: {
            trigger: scopeRef.current,
            start: 'top 80%',
            once: options?.once ?? true,
          },
        },
      );
    }, scopeRef);

    initializedRef.current = true;
    return () => ctx.revert();
  }, [scopeRef, target, options?.duration, options?.ease, options?.once, options?.y]);
}

export function useGsapStagger(
  scopeRef: RefObject<HTMLElement | null>,
  target: string,
  options?: { y?: number; stagger?: number; duration?: number },
) {
  useLayoutEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { autoAlpha: 0, y: options?.y ?? 16, willChange: 'transform,opacity' },
        {
          autoAlpha: 1,
          y: 0,
          duration: options?.duration ?? 0.5,
          stagger: options?.stagger ?? 0.08,
          ease: 'power2.out',
          clearProps: 'willChange',
          scrollTrigger: {
            trigger: scopeRef.current,
            start: 'top 78%',
            once: true,
          },
        },
      );
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef, target, options?.duration, options?.stagger, options?.y]);
}

export function useGsapTypingEffect(
  scopeRef: RefObject<HTMLElement | null>,
  deps: unknown[],
  setup: (timeline: gsap.core.Timeline) => void,
  paused?: boolean,
) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      tlRef.current?.kill();
      const timeline = gsap.timeline({ paused: !!paused });
      tlRef.current = timeline;
      setup(timeline);
      if (!paused) timeline.play(0);
    }, scopeRef);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      ctx.revert();
    };
  }, [scopeRef, paused, ...deps]);

  useLayoutEffect(() => {
    if (!tlRef.current) return;
    if (paused) tlRef.current.pause();
    else tlRef.current.resume();
  }, [paused]);

  return tlRef;
}
