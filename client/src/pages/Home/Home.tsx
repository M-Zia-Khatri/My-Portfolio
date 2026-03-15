import { animate, motion, type AnimationPlaybackControls } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type TouchEvent,
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

const TOP_BAR_HEIGHT = 92;
const SCROLL_DURATION_SECONDS = 0.75;
const WHEEL_TRIGGER_THRESHOLD = 16;
const SWIPE_TRIGGER_THRESHOLD = 56;

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
  'scroll-mt-24 h-[calc(100dvh-5rem)] flex flex-col justify-center items-center';

function clampIndex(index: number) {
  return Math.min(Math.max(index, 0), sections.length - 1);
}

function getSectionIndexFromHash(hash: string) {
  const normalizedHash = hash.replace('#', '');
  return sections.findIndex((section) => section.id === normalizedHash);
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const setActiveHash = useNavigationStore((s) => s.setActiveHash);

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

      if (!targetSection) return;

      const targetTop = Math.max(targetSection.offsetTop - TOP_BAR_HEIGHT, 0);

      // Already there — nothing to do
      if (
        nextIndex === activeIndexRef.current &&
        Math.abs(window.scrollY - targetTop) < 2
      ) return;

      // Cancel any in-flight animation before starting a new one
      animationRef.current?.stop();
      animationRef.current = null;

      isAnimatingRef.current = true;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      updateHash(nextIndex);

      const startY = window.scrollY;

      animationRef.current = animate(startY, targetTop, {
        duration: SCROLL_DURATION_SECONDS,
        ease: [0.25, 0.46, 0.45, 0.94], // smooth ease-out-quart
        onUpdate: (latest) => {
          window.scrollTo(0, latest);
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          animationRef.current = null;
        },
      });
    },
    [updateHash],
  );

  // Keep ref in sync with state
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Wheel
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < WHEEL_TRIGGER_THRESHOLD || isAnimatingRef.current) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = clampIndex(activeIndexRef.current + direction);

      if (nextIndex === activeIndexRef.current) return;

      event.preventDefault();
      scrollToSection(nextIndex);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollToSection]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnimatingRef.current) return;

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        scrollToSection(activeIndexRef.current + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        scrollToSection(activeIndexRef.current - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToSection]);

  // Anchor clicks
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      const href = anchor?.getAttribute('href');
      if (!href) return;

      const nextIndex = getSectionIndexFromHash(href);
      if (nextIndex === -1) return;

      event.preventDefault();
      scrollToSection(nextIndex);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [scrollToSection]);

  // Hash change (back/forward nav)
  useEffect(() => {
    const handleHashChange = () => {
      const nextIndex = getSectionIndexFromHash(window.location.hash);
      if (nextIndex === -1) return;
      scrollToSection(nextIndex);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [scrollToSection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current?.stop();
    };
  }, []);

  // Touch
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current || touchStartYRef.current === null) {
      touchStartYRef.current = null;
      return;
    }

    const endY = event.changedTouches[0]?.clientY;
    if (typeof endY !== 'number') {
      touchStartYRef.current = null;
      return;
    }

    const deltaY = touchStartYRef.current - endY;
    touchStartYRef.current = null;

    if (Math.abs(deltaY) < SWIPE_TRIGGER_THRESHOLD) return;

    scrollToSection(activeIndexRef.current + (deltaY > 0 ? 1 : -1));
  };

  return (
    <div
      className='mx-auto px-4'
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      {sections.map((section, index) => {
        const SectionComponent = section.Component;

        return (
          <motion.section
            key={section.id}
            id={section.id}
            ref={(element) => {
              sectionRefs.current[index] = element;
            }}
            className={
              index === 0
                ? 'flex h-[calc(100dvh-5rem)] scroll-mt-24 flex-col justify-center mb-5'
                : sectionClassName
            }
            // Animate based on active index — no whileInView so scroll never triggers re-animation
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