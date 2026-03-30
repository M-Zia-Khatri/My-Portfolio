import { useLenisSnap } from '@/features/home/hooks/useLenisSnap';
import { AppNavigation } from '@/shared/constants/navigation.constants';
import { TEXT } from '@/shared/constants/style.constants';
import { useNavigationStore } from '@/shared/store/navigation.store';
import { cn } from '@/shared/utils/cn';
import { Box, Button, Card, Container, Link, Text } from '@radix-ui/themes';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import { HIDE_DELAY_MS } from './TopBar.constants';
import { TopBarMobile } from './TopBarMobile';
import { TopBarNav } from './TopBarNav';

/** How long (ms) the user must keep scrolling DOWN before the bar hides */

export default function TopBar() {
  const { snapTo } = useLenisSnap();
  const { activeHash } = useNavigationStore();

  // ── scroll-hide logic ─────────────────────────────────────────────────────
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;

      if (scrollingDown) {
        // Only schedule a hide when one isn't already pending
        if (!hideTimer.current) {
          hideTimer.current = setTimeout(() => {
            setHidden(true);
            hideTimer.current = null;
          }, HIDE_DELAY_MS);
        }
      } else {
        // Cancel any pending hide and immediately reveal the bar
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Box asChild className="fixed top-4 z-50 w-full px-4">
      <motion.header
        // Mount: slide in from above
        initial={{ y: -80, opacity: 0 }}
        // Scroll state drives hide/show after mount
        animate={{
          y: hidden ? '-120%' : '0%',
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          // Slower, easeIn feels heavier/purposeful when hiding
          // Faster, easeOut snaps back confidently when showing
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
              'h-15',
              'gap-4',
              'px-8 shadow-[0_2px_15px_color-mix(in_srgb,var(--blue-3),transparent_10%)]',
              activeHash === AppNavigation.HOME ? 'bg-(--blue-4)/15' : 'bg-(--blue-4)/20',
            )}
            style={{ outlineColor: 'var(--gray-6)' }}
          >
            <motion.div
              className="flex w-full items-center justify-between gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            >
              {/* brand logo */}
              <Link asChild underline="none" className="shrink-0">
                <NavLink to={AppNavigation.HOME} className="flex items-center gap-2">
                  <img src="/vite.svg" alt="Brand logo" className="h-8 w-8" />
                  <Text size={TEXT.lg.size} weight="bold" className="text-white">
                    My Portfolio
                  </Text>
                </NavLink>
              </Link>

              {/* nav links */}
              <TopBarNav activeHash={activeHash} s snapTo={snapTo} />

              {/* let's talk btn */}
              <Button asChild radius="full" color="gray" className="shrink-0 hidden md:block">
                <motion.a
                  href="mailto:muhammadziakhatri@gmail.com"
                  className="relative overflow-hidden"
                >
                  <motion.span
                    initial={{ skewX: '-18deg' }}
                    animate={{ x: [-24, 140, -24] }}
                    transition={{
                      delay: 1.5,
                      repeatDelay: 2.5,
                      duration: 1,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                    className="pointer-events-none absolute top-0 left-0 h-full bg-(--blue-10) blur-sm"
                  />
                  <Text size={TEXT.lg.size} weight="bold">
                    Let's Talk
                  </Text>
                </motion.a>
              </Button>

              <TopBarMobile activeHash={activeHash} snapTo={snapTo} />
            </motion.div>
          </Card>
        </Container>
      </motion.header>
    </Box>
  );
}
