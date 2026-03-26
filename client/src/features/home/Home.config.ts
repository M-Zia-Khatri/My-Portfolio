import type { ComponentType } from 'react';
import { AboutSection, PortfolioSection } from './sections';
import ContactSection from './sections/ContactSection';
import GameSection from './sections/GameSection';
import HeroSection from './sections/hero/HeroSection';
import SkillsSection from './sections/SkillsSection';

// ─── Scroll constants ────────────────────────────────────────────────────────

export const TOP_BAR_HEIGHT = 0;
export const SCROLL_DURATION_SECONDS = 0.75;
export const WHEEL_TRIGGER_THRESHOLD = 16;
export const SWIPE_TRIGGER_THRESHOLD = 56;
export const WHEEL_ACCUMULATE_WINDOW_MS = 80;

/** px tolerance for "are we at the section boundary?" */
export const BOUNDARY_THRESHOLD = 6;

/** ms to block further snaps after one fires (short sections only) */
export const SNAP_COOLDOWN_MS = SCROLL_DURATION_SECONDS * 1000 + 200;

// ─── Section registry ────────────────────────────────────────────────────────

export type SectionConfig = {
  id: string;
  Component: ComponentType;
};

export const sections: SectionConfig[] = [
  { id: 'home', Component: HeroSection },
  { id: 'about', Component: AboutSection },
  { id: 'skills', Component: SkillsSection },
  { id: 'portfolio', Component: PortfolioSection },
  { id: 'game', Component: GameSection },
  { id: 'contact', Component: ContactSection },
];

// ─── Shared class names ──────────────────────────────────────────────────────

export const sectionClassName =
  'scroll-mt-24 min-h-[calc(100dvh)] flex flex-col justify-center items-center';
