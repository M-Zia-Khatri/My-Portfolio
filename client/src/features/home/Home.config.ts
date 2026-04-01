import { lazy, type ComponentType } from 'react';

// ─── Eager (above fold / tiny) ───────────────────────────────────────────────
// Included in the main Home chunk — no async boundary.
import AboutSection from './sections/AboutSection';
import HeroSection from './sections/hero/HeroSection';

const SkillsSection = lazy(() => import('./sections/SkillsSection'));
const PortfolioSection = lazy(() => import('./sections/PortfolioSection'));
const GameSection = lazy(() => import('./sections/GameSection'));
const ContactSection = lazy(() => import('./sections/ContactSection'));

// ─── Section registry ────────────────────────────────────────────────────────

export type SectionConfig = {
  id: string;
  Component: ComponentType;
};

export const sections: SectionConfig[] = [
  { id: 'home', Component: HeroSection }, // eager — above fold
  { id: 'about', Component: AboutSection }, // eager — tiny, near fold
  { id: 'skills', Component: SkillsSection }, // lazy  — heavy GSAP
  { id: 'portfolio', Component: PortfolioSection }, // lazy  — 3-D cards
  { id: 'game', Component: GameSection }, // lazy  — complex state
  { id: 'contact', Component: ContactSection }, // lazy  — live typing
];

// ─── Shared class names ──────────────────────────────────────────────────────
export const sectionClassName =
  'scroll-mt-24 min-h-[calc(100dvh)] flex flex-col justify-center items-center';
