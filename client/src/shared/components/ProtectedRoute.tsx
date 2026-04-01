import { motion } from 'motion/react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { selectIsAuthenticated, selectIsLoading, useAuthStore } from '../store/useAuthStore';

// ─── Loading screen ───────────────────────────────────────────────────────────
// Shown while useMe is resolving on app boot. Keep this component stable so
// React doesn't need to reconcile it on every auth state tick.
const AuthLoadingScreen = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-background)">
    <motion.span
      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 1.4, repeat: Infinity }}
      className="size-12 rounded-full bg-(--blue-8) opacity-60"
    />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const ProtectedRoute = ({
  allowedRoles,
  redirectTo = '/',
  children,
}: {
  allowedRoles?: string[];
  redirectTo?: string;
  children?: React.ReactNode;
}) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);

  // `hasRole` is a function — extract it separately so we call it once
  const hasRole = useAuthStore((s) => s.hasRole);

  const location = useLocation();

  if (isLoading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  if (allowedRoles && !hasRole(allowedRoles)) return <Navigate to="/" replace />;

  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;
