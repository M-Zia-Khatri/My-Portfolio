/**
 * ProtectedRoute — role-aware navigation guard
 *
 * Usage (element pattern — wraps children directly):
 *   <Route
 *     path="/dashboard"
 *     element={
 *       <ProtectedRoute allowedRoles={["admin"]} redirectTo="/login">
 *         <Dashboard />
 *       </ProtectedRoute>
 *     }
 *   />
 *
 * Usage (outlet pattern — wraps nested routes):
 *   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */

import type { UserRole } from '@/features/auth/types';
import { cn } from '@/shared/utils/cn';
import { AnimatePresence, motion } from 'motion/react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  /** Roles that are allowed to access the children. Omit to allow any authenticated user. */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users. Defaults to "/". */
  redirectTo?: string;
  /** Where to redirect users who lack the required role. Defaults to "/". */
  unauthorizedRedirectTo?: string;
  /**
   * FIX: added children support so ProtectedRoute can be used as a route
   * element wrapping a component directly (element pattern), not just as a
   * layout route that renders <Outlet />. Without this, <Dashboard /> passed
   * as children was silently ignored and the page rendered nothing.
   */
  children?: React.ReactNode;
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

const AuthLoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className={cn('fixed inset-0 z-50 flex items-center justify-center', 'bg-(--color-background)')}
  >
    <div className={cn('relative flex items-center justify-center size-12')}>
      <motion.span
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className={cn('absolute inset-0 rounded-full', 'bg-(--blue-8) opacity-60')}
      />
      <span className={cn('relative size-5 rounded-full', 'bg-(--blue-9)')} />
    </div>
  </motion.div>
);

// ─── Guard ────────────────────────────────────────────────────────────────────

export const ProtectedRoute = ({
  allowedRoles,
  redirectTo = '/',
  unauthorizedRedirectTo = '/',
  children,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole } = useAuthStore();
  const location = useLocation();

  // ── Still resolving /me ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AnimatePresence>
        <AuthLoadingScreen />
      </AnimatePresence>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ── Role check ───────────────────────────────────────────────────────────
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  // ── Authorized ───────────────────────────────────────────────────────────
  // FIX: removed className="contents" — display:contents causes browsers to
  // silently ignore CSS transform and opacity animations on that element.
  // The fade/slide transition between routes was never actually playing.
  // Also renders {children ?? <Outlet />} to support both usage patterns.
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ minHeight: '100dvh' }}
      >
        {children ?? <Outlet />}
      </motion.div>
    </AnimatePresence>
  );
};

export default ProtectedRoute;
