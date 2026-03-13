import { animate, motion } from 'framer-motion';
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
const SCROLL_DURATION_SECONDS = 0.7;
const WHEEL_TRIGGER_THRESHOLD = 16;
const SWIPE_TRIGGER_THRESHOLD = 56;

type SectionConfig = {
  id: string;
  Component: ComponentType;
};

const sections: SectionConfig[] = [
  {
    id: 'home',
    Component: HeroSection,
  },
  {
    id: 'about',
    Component: AboutSection,
  },
  {
    id: 'skills',
    Component: SkillsSection,
  },
  {
    id: 'portfolio',
    Component: PortfolioSection,
  },
  {
    id: 'experience',
    Component: ExperienceSection,
  },
  // {
  //   id: "testimonials",
  //   Component: TestimonialsSection,
  // },
  {
    id: 'contact',
    Component: ContactSection,
  },
];

const sectionClassName =
  'scroll-mt-24 border-t h-[calc(100dvh-5rem)] flex flex-col justify-center';

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
  const unlockTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const setActiveHash = useNavigationStore((s) => s.setActiveHash); // ← add

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const updateHash = useCallback((nextIndex: number) => {
    const nextHash = `#${sections[nextIndex].id}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
      setActiveHash(nextHash);  // ← sync store
    }
  }, []);

  const unlockScroll = useCallback(() => {
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
    }
    unlockTimerRef.current = window.setTimeout(
      () => {
        isAnimatingRef.current = false;
        unlockTimerRef.current = null;
      },
      Math.ceil(SCROLL_DURATION_SECONDS * 1000) + 80,
    );
  }, []);

  const scrollToSection = useCallback(
    (targetIndex: number) => {
      const nextIndex = clampIndex(targetIndex);
      const targetSection = sectionRefs.current[nextIndex];

      if (!targetSection) {
        return;
      }

      const targetTop = Math.max(targetSection.offsetTop - TOP_BAR_HEIGHT, 0);
      if (
        nextIndex === activeIndexRef.current &&
        Math.abs(window.scrollY - targetTop) < 2
      ) {
        return;
      }

      isAnimatingRef.current = true;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      updateHash(nextIndex);

      animate(window.scrollY, targetTop, {
        duration: SCROLL_DURATION_SECONDS,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          window.scrollTo({ top: latest, behavior: 'auto' });
        },
      });

      unlockScroll();
    },
    [unlockScroll, updateHash],
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (
        Math.abs(event.deltaY) < WHEEL_TRIGGER_THRESHOLD ||
        isAnimatingRef.current
      ) {
        return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = clampIndex(activeIndexRef.current + direction);

      if (nextIndex === activeIndexRef.current) {
        return;
      }

      event.preventDefault();
      scrollToSection(nextIndex);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [scrollToSection]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnimatingRef.current) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        scrollToSection(activeIndexRef.current + 1);
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        scrollToSection(activeIndexRef.current - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollToSection]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      const href = anchor?.getAttribute('href');
      if (!href) {
        return;
      }

      const nextIndex = getSectionIndexFromHash(href);
      if (nextIndex === -1) {
        return;
      }

      event.preventDefault();
      scrollToSection(nextIndex);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [scrollToSection]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextIndex = getSectionIndexFromHash(window.location.hash);
      if (nextIndex === -1) {
        return;
      }

      scrollToSection(nextIndex);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [scrollToSection]);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current !== null) {
        window.clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

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

    if (Math.abs(deltaY) < SWIPE_TRIGGER_THRESHOLD) {
      return;
    }

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
                ? 'flex h-[calc(100dvh-5rem)] scroll-mt-24 flex-col justify-center'
                : `${sectionClassName} `
            }
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.55 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionComponent />
          </motion.section>
        );
      })}
    </div>
  );
}
