import { useLenis } from '@/shared/providers/LenisProvider';
import { useNavigationStore } from '@/shared/store/navigation.store';
import { useEffect, useRef } from 'react';
import { sections } from '../Home.config';

const WHEEL_THRESHOLD = 18;
const COOLDOWN_MS = 900;

export const useLenisSnap = () => {
  const { lenis } = useLenis();
  const { activeHash } = useNavigationStore();
  const lastEventTime = useRef(0);

  const isLocked = useRef(false);
  const wheelAccum = useRef(0);

  const getCurrentIndex = () => sections.findIndex((s) => `#${s.id}` === activeHash);

  const snapTo = (index: number) => {
    if (!lenis) return;

    const clamped = Math.max(0, Math.min(index, sections.length - 1));
    const target = sections[clamped];

    isLocked.current = true;

    lenis.scrollTo(`#${target.id}`, {
      duration: 1.1,
    });

    setTimeout(() => {
      isLocked.current = false;
    }, COOLDOWN_MS);
  };

  useEffect(() => {
    if (!lenis) return;

    const onWheel = (e: WheelEvent) => {
      if (isLocked.current) return;

      const now = Date.now();
      if (now - lastEventTime.current > 100) {
        wheelAccum.current = 0;
      }

      lastEventTime.current = now;
      wheelAccum.current += e.deltaY;

      if (Math.abs(wheelAccum.current) < WHEEL_THRESHOLD) return;

      const currentIndex = getCurrentIndex();

      if (wheelAccum.current > 0) {
        snapTo(currentIndex + 1);
      } else {
        snapTo(currentIndex - 1);
      }

      wheelAccum.current = 0;
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    return () => window.removeEventListener('wheel', onWheel);
  }, [lenis, activeHash]);

  return { snapTo };
};
