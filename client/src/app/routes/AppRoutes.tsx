import AppLayout from '@/shared/components/layout/AppLayout';
import { SuspenseFallback } from '@/shared/components/SuspenseFallback';
import { AppNavigation } from '@/shared/constants/navigation.constants';
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router';

// ─── Lazy route components ────────────────────────────────────────────────────

// Public pages
const Home = lazy(() => import('@/features/home/Home'));
const Auth = lazy(() => import('@/features/auth/Auth'));

// Dashboard shell + pages (only loaded when admin navigates to /dashboard)
const DashboardLayout = lazy(() => import('@/features/dashboard/layout/DashboardLayout'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const Skills = lazy(() => import('@/features/dashboard/pages/skills/Skills'));
const Portfolio = lazy(() => import('@/features/dashboard/pages/portfolio/Portfolio'));
const ContactPage = lazy(() => import('@/features/contact/admin/ContactPage'));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Wraps a lazy component in a Suspense boundary with the correct fallback.
 *
 * @param Component  The lazy-loaded page component
 * @param fullPage   Whether the fallback should fill the viewport (default true
 *                   for top-level routes; false for dashboard children where the
 *                   topbar is already visible)
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
  // ── Public shell ───────────────────────────────────────────────────────────
  {
    path: '/',
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

  // Redirect legacy paths
  { path: '/login', element: <Navigate to={AppNavigation.AUTH} /> },
  { path: '/admin', element: <Navigate to={AppNavigation.DASHBOARD} /> },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  {
    path: AppNavigation.DASHBOARD,
    /**
     * DashboardLayout contains ProtectedRoute + Topbar + AnimatePresence.
     * Its chunk is shared by all /dashboard/* children so it is downloaded
     * once on first admin visit and then cached.
     */
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

  // ── Catch-all ───────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" /> },
];

export default AppRoutes;
