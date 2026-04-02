/**
 * Footer.tsx
 *
 * Change: brand NavLink `to` updated from `AppNavigation.HOME` (`'#home'`)
 * to `AppNavigation.HOME_ROUTE` (`'/home'`).
 *
 * The old value (`#home`) was a hash anchor — fine when the portfolio lived
 * at `/`, but now that `/` is the LandingPage, clicking the brand logo in
 * the footer would navigate to the landing screen instead of scrolling to the
 * top of the portfolio.
 *
 * `HOME_ROUTE` (`/home`) is the correct destination.  React Router resolves
 * the absolute path and re-renders the Home page if not already there.
 */

import { AppNavigation } from '@/shared/constants/navigation.constants';
import { TEXT } from '@/shared/constants/style.constants';
import { cn } from '@/shared/utils/cn';
import { Link, Strong, Text } from '@radix-ui/themes';
import { motion } from 'motion/react';
import type { ComponentType } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { FaFacebook, FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa6';
import { NavLink } from 'react-router';

// ─── Social links (module-level — stable array, never recreated) ──────────────
const socialMedia: {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
}[] = [
  { icon: FaInstagram, href: 'https://instagram.com/m_zia_khatri',                                     label: 'Instagram' },
  { icon: FaFacebook,  href: 'https://www.facebook.com/profile.php?id=61579565593155',                 label: 'Facebook'  },
  { icon: FaLinkedin,  href: 'https://www.linkedin.com/in/muhammad-zia-khatri-1891ab390/',             label: 'LinkedIn'  },
  { icon: FaGithub,    href: 'https://github.com/M-Zia-Khatri',                                        label: 'GitHub'    },
  { icon: FaWhatsapp,  href: 'https://wa.me/923121070936',                                             label: 'WhatsApp'  },
];

export default function Footer() {
  return (
    <footer className={cn('border-t border-(--blue-a2)/45 bg-(--blue-a2)/35 px-6 py-4')}>
      <div className="flex flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">

        {/* Brand — navigates to /home (the portfolio page) */}
        <Link asChild underline="none" className="shrink-0">
          <NavLink
            to={AppNavigation.HOME_ROUTE}   // ← changed from AppNavigation.HOME
            className="flex items-center gap-2"
          >
            <Text size={TEXT.lg.size} weight="bold" className="text-(--blue-12)">
              Muhammad Zia Khatri
            </Text>
          </NavLink>
        </Link>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          {socialMedia.map(({ icon: Icon, href, label }, index) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="text-(--blue-11) transition-colors duration-200 hover:text-(--blue-12)"
            >
              <Icon className="h-5 w-5" />
            </motion.a>
          ))}
        </div>

        {/* Copyright */}
        <Text size="1" className="text-center text-(--blue-a11) sm:text-right">
          © 2026 <Strong>Muhammad Zia Khatri</Strong>. All Rights Reserved.
        </Text>
      </div>
    </footer>
  );
}