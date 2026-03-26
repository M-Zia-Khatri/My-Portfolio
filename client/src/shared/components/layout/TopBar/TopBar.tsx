import { NavLink } from 'react-router';
import { useNavigationStore } from '@/shared/store/navigation.store';
import { AppNavigation } from '@/shared/constants/navigation.constants';
import { motion, type Variants } from 'motion/react';
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Link,
  Text,
} from '@radix-ui/themes';
import { cn } from '@/shared/utils/cn';
import { useEffect, useRef, useState } from 'react';
import { TEXT } from '@/shared/constants/style.constants';

const navItems = [
  { label: 'Home', href: AppNavigation.HOME },
  { label: 'About', href: AppNavigation.ABOUT },
  { label: 'Skills', href: AppNavigation.SKILLS },
  { label: 'Portfolio', href: AppNavigation.PORTFOLIO },
  { label: 'Contact', href: AppNavigation.CONTACT },
] as const;

/** How long (ms) the user must keep scrolling DOWN before the bar hides */
const HIDE_DELAY_MS = 4000;

export default function TopBar() {
  const { activeHash, setActiveHash } = useNavigationStore();

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

  const itemVariants: Variants = {
    initial: { y: 0, opacity: 0.9, fontWeight: 400 },
    hover: {
      y: -5,
      opacity: 1,
      fontWeight: 500,
      scale: 1.02,
      margin: '0 1%',
      transition: { duration: 0.25, ease: 'easeOut' },
    },
  };

  const underlineVariants: Variants = {
    initial: { scaleX: 0, opacity: 0 },
    active: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
    hover: {
      scaleX: 1,
      opacity: 1,
      transition: { delay: 0.1, duration: 0.3, ease: 'easeIn' },
    },
  };

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
              activeHash === AppNavigation.HOME
                ? 'bg-(--blue-4)/15'
                : 'bg-(--blue-4)/20'
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
                <NavLink
                  to={AppNavigation.HOME}
                  className="flex items-center gap-2"
                >
                  <img src="/vite.svg" alt="Brand logo" className="h-8 w-8" />
                  <Text
                    size={TEXT.lg.size}
                    weight="bold"
                    className="text-white"
                  >
                    My Portfolio
                  </Text>
                </NavLink>
              </Link>

              {/* nav links */}
              <Box asChild className="flex-1 overflow-x-auto">
                <nav aria-label="Main navigation">
                  <Flex asChild align="center" justify="center" gap="5">
                    <ul className="min-w-max">
                      {navItems.map((item) => {
                        const isRoute = !item.href.startsWith('#');
                        const isActive = activeHash === item.href;

                        return (
                          <motion.li
                            key={item.label}
                            initial="initial"
                            whileHover="hover"
                            className="relative list-none"
                            variants={itemVariants}
                            onClick={() => setActiveHash(item.href)}
                          >
                            <Link asChild underline="none">
                              {isRoute ? (
                                <NavLink
                                  to={item.href}
                                  className="relative inline-flex items-center pb-1"
                                >
                                  <Text
                                    size={TEXT.base.size}
                                    className="text-white"
                                  >
                                    {item.label}
                                  </Text>
                                  <motion.span
                                    variants={underlineVariants}
                                    animate={isActive ? 'active' : 'initial'}
                                    className="absolute right-0 -bottom-0.5 left-0 h-0.5 w-8 origin-left rounded-full"
                                    style={{ backgroundColor: 'var(--blue-9)' }}
                                  />
                                </NavLink>
                              ) : (
                                <a
                                  href={item.href}
                                  className="relative inline-flex items-center pb-1"
                                >
                                  <Text
                                    size={TEXT.base.size}
                                    className="text-white"
                                  >
                                    {item.label}
                                  </Text>
                                  <motion.span
                                    variants={underlineVariants}
                                    animate={isActive ? 'active' : 'initial'}
                                    className="absolute right-0 -bottom-0.5 left-0 h-0.5 origin-left rounded-full"
                                    style={{ backgroundColor: 'var(--blue-9)' }}
                                  />
                                </a>
                              )}
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </Flex>
                </nav>
              </Box>

              {/* let's talk btn */}
              <Button asChild radius="full" color="gray" className="shrink-0">
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
            </motion.div>
          </Card>
        </Container>
      </motion.header>
    </Box>
  );
}
