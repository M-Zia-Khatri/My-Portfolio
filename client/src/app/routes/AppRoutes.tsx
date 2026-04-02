import AppLayout from '@/shared/components/layout/AppLayout';
import { SuspenseFallback } from '@/shared/components/SuspenseFallback';
import { AppNavigation } from '@/shared/constants/navigation.constants';
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router';

// ─── Lazy route components ────────────────────────────────────────────────────

/**
 * LandingPage — minimal chunk, loaded only when a visitor hits `/` without
 * the visited flag.  No heavy deps; GSAP and Lenis are NOT imported.
 */
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));

/**
 * Home — the full portfolio page (GSAP, 3-D cards, CodeCard, GameSection).
 * Lazy-loaded to keep the initial JS bundle small.
 */
const Home = lazy(() => import('@/features/home/Home'));

// Dashboard family — downloaded only when admin navigates to /dashboard
const DashboardLayout = lazy(() => import('@/features/dashboard/layout/DashboardLayout'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const Skills = lazy(() => import('@/features/dashboard/pages/skills/Skills'));
const Portfolio = lazy(() => import('@/features/dashboard/pages/portfolio/Portfolio'));
const ContactPage = lazy(() => import('@/features/contact/admin/ContactPage'));

// Auth — rarely visited
const Auth = lazy(() => import('@/features/auth/Auth'));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Wraps a lazy component in a Suspense boundary.
 *
 * @param Component  The lazy page component
 * @param fullPage   true  → fallback fills 100dvh (top-level routes)
 *                   false → fallback fills content area (dashboard children)
 */
function withSuspense(Component: ComponentType, fullPage = true): ReactNode {
  return (
    <Suspense fallback={<SuspenseFallback fullPage={fullPage} />}>
      <Component />
    </Suspense>
  );
}

// ─── Route tree ──────────────────────────────────────────────────────────────

const AppRoutes: RouteObject[] = [
  // ── Landing (no shell) ───────────────────────────────────────────────────
  {
    /**
     * `/` renders LandingPage standalone — no AppLayout, no TopBar, no Footer.
     * LandingPage itself handles:
     *   • Auto-redirect to /home if localStorage visited flag is set.
     *   • Writing the flag + navigating to /home on CTA click.
     */
    path: AppNavigation.LANDING,
    element: withSuspense(LandingPage),
  },

  // ── Portfolio site (with TopBar + Footer shell) ───────────────────────────
  {
    /**
     * `/home` is the main portfolio page wrapped in AppLayout.
     * AppLayout starts Lenis, renders TopBar + Footer.
     */
    path: AppNavigation.HOME_ROUTE,
    Component: AppLayout,
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
    ],
  },

  // ── Auth ────────────────────────────────────────────────────────────────────
  {
    path: AppNavigation.AUTH,
    element: withSuspense(Auth),
  },

  // ── Legacy / convenience redirects ──────────────────────────────────────────
  {
    // /login was an old alias; keep it alive for any bookmarked URLs
    path: '/login',
    element: <Navigate to={AppNavigation.AUTH} />,
  },
  {
    // /admin used to redirect to dashboard; preserve the redirect
    path: '/admin',
    element: <Navigate to={AppNavigation.DASHBOARD} />,
  },

  // ── Dashboard (admin only, protected) ────────────────────────────────────
  {
    /**
     * DashboardLayout contains ProtectedRoute + Topbar + AnimatePresence.
     * Downloaded once on first admin visit, then cached by the browser.
     */
    path: AppNavigation.DASHBOARD,
    element: withSuspense(DashboardLayout),
    children: [
      {
        index: true,
        element: withSuspense(Dashboard, false),
      },
      {
        path: AppNavigation.A_SKILLS,
        element: withSuspense(Skills, false),
      },
      {
        path: AppNavigation.A_PORTFOLIO,
        element: withSuspense(Portfolio, false),
      },
      {
        path: AppNavigation.A_CONTACT,
        element: withSuspense(ContactPage, false),
      },
    ],
  },

  // ── 404 catch-all ───────────────────────────────────────────────────────────
  {
    path: '*',
    // Unknown URLs bounce to landing; landing then redirects to /home if
    // the user has already visited.
    element: <Navigate to={AppNavigation.LANDING} />,
  },
];

export default AppRoutes;
