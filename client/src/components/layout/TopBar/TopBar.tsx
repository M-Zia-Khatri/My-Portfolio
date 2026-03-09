import { NavLink } from 'react-router';
import { useEffect } from 'react';
import { themeChange } from 'theme-change';
import { AppNavigation } from '@/constants/navigation.constants';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', href: AppNavigation.HOME },
  // { label: "Skills", href: AppNavigation.SKILLS },
  { label: 'About', href: AppNavigation.ABOUT },
  { label: 'Portfolio', href: AppNavigation.PORTFOLIO },
  { label: 'Experience', href: AppNavigation.EXPERIENCE },
  // { label: "Testimonials", href: AppNavigation.TESTIMONIALS },
  { label: 'Contact', href: AppNavigation.CONTACT },
] as const;

export default function TopBar() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      document.documentElement.setAttribute('data-theme', 'portfolio-dark');
    }
    themeChange(false);
  }, []);

  const itemVariants = {
    initial: {
      color: 'var(--color-base-content)',
      y: 0,
      fontWeight: 400,
      scale: 1.1,
    },
    hover: {
      color: 'var(--color-primary)',
      y: '-20%',
      fontWeight: 600,
      transition: {
        // y: { duration: 0.2, ease: "easeOut" },
        // delay: 0.1,
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const underlineVariants = {
    initial: { scaleX: 0, opacity: 0 },
    hover: {
      scaleX: 1,
      opacity: 1,
      transition: { delay: 0.1, duration: 0.3, ease: 'easeIn' },
    },
  };

  return (
    <header className='fixed top-4 z-50 w-full'>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className='bg-base-200/55 supports-backdrop-filter:bg-background/80 relative mx-auto flex h-15 w-full max-w-6xl items-center justify-between gap-6 rounded-full border border-(--color-border) border-t-(--color-highlight) px-10 shadow-[0_1px_5px_var(--color-shadow)] backdrop-blur'
      >
        <NavLink
          to={AppNavigation.HOME}
          className='flex shrink-0 items-center gap-2'
        >
          <img src='/vite.svg' alt='Brand logo' className='h-8 w-8' />
          <span className='text-lg font-semibold'>My Portfolio</span>
        </NavLink>

        <nav aria-label='Main navigation' className='flex-1 overflow-x-auto'>
          <ul className='flex min-w-max items-center justify-center gap-6 text-sm font-medium'>
            {navItems.map((item) => (
              <motion.li
                key={item.label}
                initial='initial'
                whileHover='hover'
                className='relative list-none'
              >
                <motion.a
                  href={item.href}
                  variants={itemVariants}
                  className='relative inline-block pb-1'
                >
                  {item.label}
                  {/* This replaces the CSS ::after */}
                  <motion.span
                    variants={underlineVariants}
                    className='bg-primary absolute right-0 bottom-0 left-0 h-0.5 origin-left'
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                </motion.a>
              </motion.li>
            ))}
          </ul>
        </nav>

        <motion.a
          href='mailto:hello@example.com'
          className='d-btn d-btn-secondary relative overflow-hidden rounded-full text-base font-semibold'
        >
          Let's Talk
          <motion.span
            initial={{ skewX: '-20deg' }}
            animate={{ x: [-20, 120, -20] }}
            transition={{
              delay: 2,
              repeatDelay: 2,
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className='absolute top-0 left-0 h-full w-[10%] bg-(--color-highlight) blur-xs'
          />
        </motion.a>
      </motion.div>
    </header>
  );
}
