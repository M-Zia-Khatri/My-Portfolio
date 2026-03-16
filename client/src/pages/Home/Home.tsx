import { animate, motion, type AnimationPlaybackControls } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import {
  AboutSection,
  ContactSection,
  ExperienceSection,
  HeroSection,
  PortfolioSection,
  SkillsSection,
} from './sections';
import { useNavigationStore } from '@/lib/store/navigation.store';

const TOP_BAR_HEIGHT = 0;
const SCROLL_DURATION_SECONDS = 0.75;
const WHEEL_TRIGGER_THRESHOLD = 16;
const SWIPE_TRIGGER_THRESHOLD = 56;
const WHEEL_ACCUMULATE_WINDOW_MS = 80;

type SectionConfig = {
  id: string;
  Component: ComponentType;
};

const sections: SectionConfig[] = [
  { id: 'home', Component: HeroSection },
  { id: 'about', Component: AboutSection },
  { id: 'skills', Component: SkillsSection },
  { id: 'portfolio', Component: PortfolioSection },
  { id: 'experience', Component: ExperienceSection },
  { id: 'contact', Component: ContactSection },
];

const sectionClassName =
  'scroll-mt-24 h-[calc(100dvh)] flex flex-col justify-center items-center';

function clampIndex(index: number) {
  return Math.min(Math.max(index, 0), sections.length - 1);
}

function getSectionIndexFromHash(hash: string) {
  const normalised = hash.replace('#', '');
  return sections.findIndex((s) => s.id === normalised);
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(0);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const wheelAccumRef = useRef(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setActiveHash = useNavigationStore((s) => s.setActiveHash);

  // 1. DISABLE BROWSER SCROLL RESTORATION
  // This prevents the browser from trying to "jump" back to a scroll position on reload.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

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

  const scrollToSection = useCallback(
    (targetIndex: number) => {
      const nextIndex = clampIndex(targetIndex);
      const targetSection = sectionRefs.current[nextIndex];

      // SAFETY: If the ref isn't attached yet (common on hard reload), retry in the next frame
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
        onUpdate: (latest) => {
          window.scrollTo(0, latest);
        },
        onComplete: () => {
          animationRef.current = null;
        },
      });
    },
    [updateHash],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      animationRef.current?.stop();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, []);

  // Wheel handling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelAccumRef.current += e.deltaY;
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);

      wheelTimerRef.current = setTimeout(() => {
        const accum = wheelAccumRef.current;
        wheelAccumRef.current = 0;
        wheelTimerRef.current = null;
        if (Math.abs(accum) < WHEEL_TRIGGER_THRESHOLD) return;

        const direction = accum > 0 ? 1 : -1;
        scrollToSection(activeIndexRef.current + direction);
      }, WHEEL_ACCUMULATE_WINDOW_MS);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollToSection]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToSection(activeIndexRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToSection(activeIndexRef.current - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToSection]);

  // Anchor clicks
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
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

  // 2. INITIAL HASH LOAD FIX
  useEffect(() => {
    const handleHashChange = () => {
      const nextIndex = getSectionIndexFromHash(window.location.hash);
      if (nextIndex === -1) return;
      
      // Delay allows 100ms for browser to finish calculating section heights (100dvh)
      setTimeout(() => {
        scrollToSection(nextIndex);
      }, 100);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    if (window.location.hash) {
      handleHashChange();
    } else {
        // Force top on load if no hash
        window.scrollTo(0, 0);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [scrollToSection]);

  // Touch handling
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
      e.preventDefault();
      scrollToSection(activeIndexRef.current + (deltaY > 0 ? 1 : -1));
    };
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollToSection]);

  return (
    <div
      id='home-scroll-container'
      className='mx-auto px-4'
      style={{ overscrollBehavior: 'none' }} // Stops browser "elastic" bounce
    >
      <div className='bg-[url(@/assets/images/bg-noise.png)] opacity-2.5 -z-100 absolute top-0 w-full h-full left-0 ' />
      <div className=' -z-90 absolute top-0 w-full h-full left-0 bg-(--blue-3)/15' />
      {sections.map((section, index) => {
        const SectionComponent = section.Component;
        return (
          <motion.section
            key={section.id}
            id={section.id}
            ref={(el) => { sectionRefs.current[index] = el; }}
            className={
              index === 0
                ? 'flex h-[calc(100dvh-5rem)] scroll-mt-24 flex-col justify-center mb-5'
                : sectionClassName
            }
            animate={{
              opacity: activeIndex === index ? 1 : 0.35,
              y: activeIndex === index ? 0 : 16,
            }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <SectionComponent />
          </motion.section>
        );
      })}
    </div>
  );
}