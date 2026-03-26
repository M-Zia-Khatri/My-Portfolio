import { sections, BOUNDARY_THRESHOLD, TOP_BAR_HEIGHT } from './Home.config';

// ─── Index helpers ───────────────────────────────────────────────────────────

export function clampIndex(index: number) {
  return Math.min(Math.max(index, 0), sections.length - 1);
}

export function getSectionIndexFromHash(hash: string) {
  const normalised = hash.replace('#', '');
  return sections.findIndex((s) => s.id === normalised);
}

// ─── Section geometry helpers ────────────────────────────────────────────────

/** True when the section is taller than the viewport */
export function isSectionTall(el: HTMLElement) {
  return el.offsetHeight > window.innerHeight + BOUNDARY_THRESHOLD;
}

/** True when the viewport bottom has reached the section's bottom edge */
export function isAtSectionBottom(el: HTMLElement) {
  const sectionBottom = el.offsetTop - TOP_BAR_HEIGHT + el.offsetHeight;
  return (
    window.scrollY + window.innerHeight >= sectionBottom - BOUNDARY_THRESHOLD
  );
}

/** True when the viewport top is at or above the section's top edge */
export function isAtSectionTop(el: HTMLElement) {
  const sectionTop = el.offsetTop - TOP_BAR_HEIGHT;
  return window.scrollY <= sectionTop + BOUNDARY_THRESHOLD;
}
