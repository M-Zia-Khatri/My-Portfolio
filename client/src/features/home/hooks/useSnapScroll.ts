import { RefObject, useEffect } from 'react';

export interface UseSnapScrollOptions {
  containerRef: RefObject<HTMLElement | null>;
  sectionSelector?: string;
  lockDurationMs?: number;
  touchThresholdPx?: number;
}

const EPSILON = 4;

export function useSnapScroll({
  containerRef,
  sectionSelector = '[data-snap-section="true"]',
  lockDurationMs = 700,
  touchThresholdPx = 40,
}: UseSnapScrollOptions) {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const sections = Array.from(container.querySelectorAll<HTMLElement>(sectionSelector));

    if (!sections.length) {
      return;
    }

    let activeIndex = 0;
    let locked = false;
    let touchStartY = 0;
    let touchTriggered = false;
    let lockTimer: number | null = null;
    let settleFrame: number | null = null;

    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlScrollSnapType: html.style.scrollSnapType,
      htmlScrollBehavior: html.style.scrollBehavior,
      bodyOverscrollBehaviorY: body.style.overscrollBehaviorY,
      bodyTouchAction: body.style.touchAction,
    };

    html.style.scrollSnapType = 'y mandatory';
    html.style.scrollBehavior = 'smooth';
    body.style.overscrollBehaviorY = 'none';
    body.style.touchAction = 'pan-y';

    const getNearestIndex = () => {
      const center = window.scrollY + window.innerHeight / 2;

      return sections.reduce((bestIndex, section, index) => {
        const sectionCenter = section.offsetTop + section.offsetHeight / 2;
        const bestSection = sections[bestIndex];
        const bestCenter = bestSection.offsetTop + bestSection.offsetHeight / 2;

        return Math.abs(sectionCenter - center) < Math.abs(bestCenter - center) ? index : bestIndex;
      }, 0);
    };

    const unlock = () => {
      locked = false;

      if (lockTimer) {
        window.clearTimeout(lockTimer);
        lockTimer = null;
      }

      if (settleFrame) {
        window.cancelAnimationFrame(settleFrame);
        settleFrame = null;
      }
    };

    const waitUntilSettled = (targetTop: number) => {
      const check = () => {
        if (Math.abs(window.scrollY - targetTop) <= EPSILON) {
          unlock();
          activeIndex = getNearestIndex();
          return;
        }

        settleFrame = window.requestAnimationFrame(check);
      };

      settleFrame = window.requestAnimationFrame(check);
    };

    const scrollToIndex = (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= sections.length || locked) {
        return;
      }

      locked = true;
      activeIndex = nextIndex;
      touchTriggered = true;

      const targetSection = sections[nextIndex];
      const targetTop = targetSection.offsetTop;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
      waitUntilSettled(targetTop);

      lockTimer = window.setTimeout(() => {
        unlock();
        activeIndex = getNearestIndex();
      }, lockDurationMs);
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) {
        return;
      }

      event.preventDefault();

      if (locked) {
        return;
      }

      scrollToIndex(activeIndex + (event.deltaY > 0 ? 1 : -1));
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
      touchTriggered = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (locked) {
        event.preventDefault();
        return;
      }

      const touchCurrentY = event.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchCurrentY;

      if (touchTriggered || Math.abs(deltaY) < touchThresholdPx) {
        return;
      }

      event.preventDefault();
      scrollToIndex(activeIndex + (deltaY > 0 ? 1 : -1));
    };

    const onTouchEnd = () => {
      touchTriggered = false;
      touchStartY = 0;
    };

    const onScroll = () => {
      if (!locked) {
        activeIndex = getNearestIndex();
      }
    };

    const onResize = () => {
      activeIndex = getNearestIndex();
    };

    activeIndex = getNearestIndex();

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      unlock();

      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      html.style.scrollSnapType = prev.htmlScrollSnapType;
      html.style.scrollBehavior = prev.htmlScrollBehavior;
      body.style.overscrollBehaviorY = prev.bodyOverscrollBehaviorY;
      body.style.touchAction = prev.bodyTouchAction;
    };
  }, [containerRef, sectionSelector, lockDurationMs, touchThresholdPx]);
}
