import { animate, type AnimationPlaybackControls } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigationStore } from '@/lib/store/navigation.store';
import {
  sections,
  TOP_BAR_HEIGHT,
  SCROLL_DURATION_SECONDS,
  WHEEL_TRIGGER_THRESHOLD,
  SWIPE_TRIGGER_THRESHOLD,
  WHEEL_ACCUMULATE_WINDOW_MS,
  SNAP_COOLDOWN_MS,
} from './Home.config';
import {
  clampIndex,
  getSectionIndexFromHash,
  isAtSectionBottom,
  isAtSectionTop,
  isSectionTall,
} from './Home.utils';

export function useSnapScroll() {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(0);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapCooldownRef = useRef(false);

  const setActiveHash = useNavigationStore((s) => s.setActiveHash);

  // ─── Disable browser scroll restoration ───────────────────────────────────
  // useEffect(() => {
  //   if ('scrollRestoration' in window.history) {
  //     window.history.scrollRestoration = 'manual';
  //   }
  // }, []);

  // ─── Update URL hash ───────────────────────────────────────────────────────
  const updateHash = useCallback(
    (nextIndex: number) => {
      const nextHash = `#${sections[nextIndex].id}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, '', nextHash);
        setActiveHash(nextHash);
      }
    },
    [setActiveHash],
  );

  // ─── Core: animated snap to a section's top ────────────────────────────────
  const scrollToSection = useCallback(
    (targetIndex: number) => {
      const nextIndex = clampIndex(targetIndex);
      const targetSection = sectionRefs.current[nextIndex];

      if (!targetSection) {
        requestAnimationFrame(() => scrollToSection(targetIndex));
        return;
      }

      const targetTop = Math.max(targetSection.offsetTop - TOP_BAR_HEIGHT, 0);

      if (
        nextIndex === activeIndexRef.current &&
        Math.abs(window.scrollY - targetTop) < 2
      ) return;

      animationRef.current?.stop();
      animationRef.current = null;

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      updateHash(nextIndex);

      const startY = window.scrollY;
      animationRef.current = animate(startY, targetTop, {
        duration: SCROLL_DURATION_SECONDS,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (latest) => window.scrollTo(0, latest),
        onComplete: () => { animationRef.current = null; },
      });
    },
    [updateHash],
  );

  // ─── Snap with cooldown (short sections only) ──────────────────────────────
  const snapToSection = useCallback(
    (targetIndex: number) => {
      if (snapCooldownRef.current) return;
      snapCooldownRef.current = true;
      setTimeout(() => { snapCooldownRef.current = false; }, SNAP_COOLDOWN_MS);
      scrollToSection(targetIndex);
    },
    [scrollToSection],
  );

  // ─── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      animationRef.current?.stop();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, []);

  // ─── Wheel ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const current = sectionRefs.current[activeIndexRef.current];

      if (current && isSectionTall(current)) {
        // Tall section — only intercept at boundaries
        const goingDown = e.deltaY > 0;
        if (goingDown && isAtSectionBottom(current)) {
          e.preventDefault();
          scrollToSection(activeIndexRef.current + 1);
        } else if (!goingDown && isAtSectionTop(current)) {
          e.preventDefault();
          scrollToSection(activeIndexRef.current - 1);
        }
        return; // browser scrolls naturally otherwise
      }

      // Short section — accumulate then snap
      e.preventDefault();
      wheelAccumRef.current += e.deltaY;
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);

      wheelTimerRef.current = setTimeout(() => {
        const accum = wheelAccumRef.current;
        wheelAccumRef.current = 0;
        wheelTimerRef.current = null;
        if (Math.abs(accum) < WHEEL_TRIGGER_THRESHOLD) return;
        snapToSection(activeIndexRef.current + (accum > 0 ? 1 : -1));
      }, WHEEL_ACCUMULATE_WINDOW_MS);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollToSection, snapToSection]);

  // ─── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDown = e.key === 'ArrowDown' || e.key === 'PageDown';
      const isUp = e.key === 'ArrowUp' || e.key === 'PageUp';
      if (!isDown && !isUp) return;

      const current = sectionRefs.current[activeIndexRef.current];

      if (current && isSectionTall(current)) {
        if (isDown && isAtSectionBottom(current)) {
          e.preventDefault();
          scrollToSection(activeIndexRef.current + 1);
        } else if (isUp && isAtSectionTop(current)) {
          e.preventDefault();
          scrollToSection(activeIndexRef.current - 1);
        }
        return;
      }

      e.preventDefault();
      snapToSection(activeIndexRef.current + (isDown ? 1 : -1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToSection, snapToSection]);

  // ─── Anchor clicks ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const anchor = e.target.closest<HTMLAnchorElement>('a[href^="#"]');
      const href = anchor?.getAttribute('href');
      if (!href) return;
      const nextIndex = getSectionIndexFromHash(href);
      if (nextIndex === -1) return;
      e.preventDefault();
      scrollToSection(nextIndex);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [scrollToSection]);

  // ─── Force scroll to top on mount ─────────────────────────────────────────
  // Bug: main.tsx clears '#contact' from the URL before React renders, but Chrome
  // queues a "scroll to element id=contact" *before* JS runs.  Once React creates
  // <section id="contact"> the browser fires that queued scroll — AFTER our
  // main.tsx scrollTo(0,0) has already run.  handleScroll then silently updates
  // activeIndexRef to 4 (contact), so every subsequent snap navigates from there.
  //
  // Fix: run TWO nested rAFs (≈2 frames) so this reset fires after the browser's
  // deferred scroll-to-hash, guaranteeing the page is truly at the top before the
  // user can interact.  Empty deps ensures this only ever runs once on mount.
  useEffect(() => {
    let raf2: ReturnType<typeof requestAnimationFrame>;
    const raf1 = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      raf2 = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        activeIndexRef.current = 0;
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []); // ← empty deps: run ONCE on mount, never re-run

  // ─── Hash change listener (and initial hash navigation) ───────────────────
  // Kept separate from the scroll-reset above so the two concerns don't
  // interfere.  The initial hash check here handles intentional deep-links
  // (e.g. user pastes "/#about" in the address bar after the reset has run).
  useEffect(() => {
    const handleHashChange = () => {
      const nextIndex = getSectionIndexFromHash(window.location.hash);
      if (nextIndex === -1) return;
      setTimeout(() => scrollToSection(nextIndex), 100);
    };

    window.addEventListener('hashchange', handleHashChange);

    // If a hash is present after the reset (intentional deep-link), honour it.
    if (window.location.hash) {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [scrollToSection]);

  // ─── Touch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = document.getElementById('home-scroll-container');
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const endY = e.changedTouches[0]?.clientY;
      const start = touchStartYRef.current;
      touchStartYRef.current = null;
      if (typeof endY !== 'number') return;

      const deltaY = start - endY;
      if (Math.abs(deltaY) < SWIPE_TRIGGER_THRESHOLD) return;

      const goingDown = deltaY > 0;
      const current = sectionRefs.current[activeIndexRef.current];

      if (current && isSectionTall(current)) {
        if (goingDown && isAtSectionBottom(current)) {
          e.preventDefault();
          scrollToSection(activeIndexRef.current + 1);
        } else if (!goingDown && isAtSectionTop(current)) {
          e.preventDefault();
          scrollToSection(activeIndexRef.current - 1);
        }
        return;
      }

      e.preventDefault();
      snapToSection(activeIndexRef.current + (goingDown ? 1 : -1));
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollToSection, snapToSection]);

  // ─── Sync activeIndex during free scroll (tall sections) ──────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (animationRef.current) return;

      const viewportMid = window.scrollY + window.innerHeight / 2;
      let closestIndex = activeIndexRef.current;
      let closestDist = Infinity;

      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        const dist = Math.abs(viewportMid - (el.offsetTop + el.offsetHeight / 2));
        if (dist < closestDist) { closestDist = dist; closestIndex = i; }
      });

      if (closestIndex !== activeIndexRef.current) {
        activeIndexRef.current = closestIndex;
        setActiveIndex(closestIndex);
        updateHash(closestIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateHash]);

  return { activeIndex, sectionRefs, scrollToSection };
}