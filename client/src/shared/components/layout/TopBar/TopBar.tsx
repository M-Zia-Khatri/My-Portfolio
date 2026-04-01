import { AppNavigation } from '@/shared/constants/navigation.constants';
import { TEXT } from '@/shared/constants/style.constants';
import { cn } from '@/shared/utils/cn';
import { Box, Card, Container, Link, Text } from '@radix-ui/themes';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { MagneticShinyButton } from './MagneticShinyButton';
import { HIDE_DELAY_MS } from './TopBar.constants';
import { TopBarMobile } from './TopBarMobile';
import { TopBarNav } from './TopBarNav';

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
}

export default function TopBar() {
  const [hidden, setHidden] = useState(false);

  // Mutable refs — never cause re-renders, always have the latest value
  const lastScrollY = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // ── Core logic — runs inside RAF, so at most once per animation frame ──
    const processScroll = () => {
      rafId.current = null; // slot is free for the next frame

      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;

      if (scrollingDown) {
        // Start the hide countdown only if one isn't already running
        if (hideTimer.current === null) {
          hideTimer.current = setTimeout(() => {
            setHidden(true);
            hideTimer.current = null;
          }, HIDE_DELAY_MS);
        }
      } else {
        // User scrolled up — cancel hide and reveal immediately
        if (hideTimer.current !== null) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    const onScroll = () => {
      if (rafId.current !== null) return; // already scheduled this frame
      rafId.current = requestAnimationFrame(processScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      // Cancel any in-flight RAF and pending hide timer on unmount
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    };
  }, []); // no deps — all mutable state lives in refs

  return (
    <Box asChild className="fixed top-4 z-50 w-full px-4">
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: hidden ? '-120%' : '0%',
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          duration: hidden ? 0.45 : 0.35,
          ease: hidden ? 'easeIn' : 'easeOut',
        }}
        style={{ willChange: 'transform, opacity' }}
      >
        <Container size={{ initial: '3' }}>
          <Card
            asChild
            size="2"
            variant="surface"
            className={cn(
              'mx-auto flex w-full items-center rounded-full outline-2 -outline-offset-2 backdrop-blur-lg',
              'h-15 gap-4 px-8',
              'shadow-[0_2px_15px_color-mix(in_srgb,var(--blue-3),transparent_10%)]',
              'bg-(--blue-4)/20',
            )}
            style={{ outlineColor: 'var(--gray-6)' }}
          >
            <motion.div
              className="flex w-full items-center justify-between gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            >
              {/* Brand logo */}
              <Link asChild underline="none" className="shrink-0">
                <NavLink
                  to={AppNavigation.HOME}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('home');
                  }}
                  className="flex items-center gap-2"
                >
                  <Text size={TEXT.lg.size} weight="bold" className="text-white">
                    M.Zia Khatri
                  </Text>
                </NavLink>
              </Link>

              <TopBarNav />

              {/* Let's talk btn */}
              <MagneticShinyButton />

              <TopBarMobile />
            </motion.div>
          </Card>
        </Container>
      </motion.header>
    </Box>
  );
}
