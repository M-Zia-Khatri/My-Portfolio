import type { ComponentType } from 'react';
import { AboutSection, PortfolioSection } from './sections';
import ContactSection from './sections/ContactSection';
import GameSection from './sections/GameSection';
import HeroSection from './sections/hero/HeroSection';
import SkillsSection from './sections/SkillsSection';

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
