import { AppNavigation } from '@/shared/constants/navigation.constants';
import { TEXT } from '@/shared/constants/style.constants';
import { Link, Strong, Text } from '@radix-ui/themes'; // ✅ Text from here, not callout
import { motion } from 'motion/react';
import type { ComponentType } from 'react';
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaWhatsapp,
} from 'react-icons/fa6';
import { NavLink } from 'react-router';

const socialMedia: {
  icon: ComponentType<{ className?: string }>;
  href: string;
  label: string;
}[] = [
  {
    icon: FaInstagram,
    href: 'https://instagram.com/YOUR_HANDLE',
    label: 'Instagram',
  },
  {
    icon: FaFacebook,
    href: 'https://facebook.com/YOUR_HANDLE',
    label: 'Facebook',
  },
  {
    icon: FaLinkedin,
    href: 'https://linkedin.com/in/YOUR_HANDLE',
    label: 'LinkedIn',
  },
  { icon: FaGithub, href: 'https://github.com/YOUR_HANDLE', label: 'GitHub' },
  { icon: FaWhatsapp, href: 'https://wa.me/923001234567', label: 'WhatsApp' },
];

export default function Footer() {
  return (
    <footer className="bg-(--blue-a2)/35 border-t border-(--blue-a2)/45 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        {/* Brand / Logo */}
        <Link asChild underline="none" className="shrink-0">
          <NavLink to={AppNavigation.HOME} className="flex items-center gap-2">
            <img src="/vite.svg" alt="Brand logo" className="h-8 w-8" />
            <Text
              size={TEXT.lg.size}
              weight="bold"
              className="text-(--blue-12)"
            >
              My Portfolio
            </Text>
          </NavLink>
        </Link>

        {/* Social Media Icons */}
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
              transition={{
                delay: index * 0.07,
                duration: 0.3,
                ease: 'easeOut',
              }}
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="text-(--blue-11) hover:text-(--blue-12) transition-colors duration-200"
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>

        {/* Copyright */}
        <Text size="1" className="text-(--blue-a11) text-center sm:text-right">
          © 2026 <Strong>Muhammad Zia Khatri</Strong>. All Rights Reserved.
        </Text>
      </div>
    </footer>
  );
}
