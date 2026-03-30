import { AppNavigation } from '@/shared/constants/navigation.constants';

export const navItems = [
  { label: 'Home', href: AppNavigation.HOME },
  { label: 'About', href: AppNavigation.ABOUT },
  { label: 'Skills', href: AppNavigation.SKILLS },
  { label: 'Portfolio', href: AppNavigation.PORTFOLIO },
  { label: 'Contact', href: AppNavigation.CONTACT },
] as const;

export const HIDE_DELAY_MS = 4000;