/**
 * ProtectedRoute — role-aware navigation guard
 *
 * Usage:
 *   // Authenticated only
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Admin only
 *   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 *
 *   // Redirect to a custom path
 *   <Route element={<ProtectedRoute redirectTo="/sign-in" />}>
 *     ...
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/shared/utils/cn";
import type { UserRole } from "@/features/auth/types";
import { useAuthStore } from "../store/useAuthStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  /** Roles that are allowed to access the children. Omit to allow any authenticated user. */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users. Defaults to "/". */
  redirectTo?: string;
  /** Where to redirect users who lack the required role. Defaults to "/". */
  unauthorizedRedirectTo?: string;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const AuthLoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-(--color-background)",
    )}
  >
    {/* Pulsing ring that matches the blue theme from index.css */}
    <div className={cn("relative flex items-center justify-center size-12")}>
      <motion.span
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute inset-0 rounded-full",
          "bg-(--blue-8) opacity-60",
        )}
      />
      <span
        className={cn(
          "relative size-5 rounded-full",
          "bg-(--blue-9)",
        )}
      />
    </div>
  </motion.div>
);

// ─── Unauthorized Screen ──────────────────────────────────────────────────────

const UnauthorizedScreen = ({ redirectTo }: { redirectTo: string }) => {
  return <Navigate to={redirectTo} replace />;
};

// ─── Guard ────────────────────────────────────────────────────────────────────

export const ProtectedRoute = ({
  allowedRoles,
  redirectTo = "/",
  unauthorizedRedirectTo = "/",
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
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }} // so login page can redirect back
        replace
      />
    );
  }

  // ── Role check ───────────────────────────────────────────────────────────
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <UnauthorizedScreen redirectTo={unauthorizedRedirectTo} />;
  }

  // ── Authorized ───────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn("contents")}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProtectedRoute;
