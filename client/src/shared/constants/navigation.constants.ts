export const AppNavigation = {
  // ── Section anchors (used by TopBar smooth-scroll links) ─────────────────
  HOME: '#home',
  SKILLS: '#skills',
  ABOUT: '#about',
  PORTFOLIO: '#portfolio',
  EXPERIENCE: '#experience',
  TESTIMONIALS: '#testimonials',
  CONTACT: '#contact',

  // ── Page routes ───────────────────────────────────────────────────────────
  /** Entry landing screen — shown once on first visit, then skipped. */
  LANDING: '/',

  /** Main portfolio page (formerly the `/` route). */
  HOME_ROUTE: '/home',

  AUTH: '/auth',
  ADMIN: '/admin',
  DASHBOARD: '/dashboard',
  A_SKILLS: '/dashboard/skills',
  A_CONTACT: '/dashboard/contact',
  A_PORTFOLIO: '/dashboard/portfolio',
} as const;
