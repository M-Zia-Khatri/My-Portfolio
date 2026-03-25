/**
 * AuthContext — enterprise Zustand + React Query hybrid
 *
 * Responsibilities:
 *  1. On mount → useMe (React Query) fetches /auth/me with the in-memory
 *     access token (attached by the axios request interceptor).
 *     If the access token is expired the interceptor auto-refreshes via the
 *     httpOnly cookie before useMe even sees a 401.
 *  2. Query result is synced → useAuthStore (Zustand) so any component can
 *     read auth state without prop-drilling or useContext.
 *  3. logoutApi is exported so callers can fire-and-forget the server call
 *     independently of the store reset.
 *
 * Pattern:
 *  Server state  → React Query  (useMe, useLogin, useVerifyOtp …)
 *  Client state  → Zustand      (useAuthStore)
 *  Bridge        → AuthProvider (this file)
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/axios";
import { useMe } from "../hooks/useMe";
import { useAuthStore } from "@/shared/store/useAuthStore";

// ─── Logout API ───────────────────────────────────────────────────────────────

/**
 * Hits the server logout endpoint.
 * The server clears the httpOnly refreshToken cookie.
 * Call this BEFORE store.logout() so the cookie is gone before state resets.
 */
export const logoutApi = async (): Promise<void> => {
  await api.post("/auth/logout");
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, isSuccess, isError } = useMe();
  const { setUser, setLoading, logout } = useAuthStore();
  const queryClient = useQueryClient();

  // ── Sync React Query → Zustand ──────────────────────────────────────────
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    if (isSuccess && user) {
      setUser(user);
    } else if (isError || (!isLoading && !user)) {
      // /me failed or returned nothing — user is not authenticated
      setUser(null);
    }
  }, [user, isLoading, isSuccess, isError, setUser, setLoading]);

  // ── Enhanced logout — used via useAuthStore().logout ────────────────────
  // We monkey-patch the Zustand logout here so it also clears the RQ cache.
  // Components call: useAuthStore().logout() — this wrapper runs automatically.
  useEffect(() => {
    // Subscribe to Zustand; whenever isAuthenticated flips false → clear RQ cache.
    const unsubscribe = useAuthStore.subscribe((state, prev) => {
      if (prev.isAuthenticated && !state.isAuthenticated) {
        queryClient.clear();
      }
    });
    return unsubscribe;
  }, [queryClient]);

  return <>{children}</>;
};

// ─── Re-exports for convenience ───────────────────────────────────────────────

/**
 * Primary auth hook — reads from Zustand, zero re-renders on unrelated state.
 *
 * @example
 * const { user, isAuthenticated, login, logout, hasRole } = useAuth();
 */
export { useAuthStore as useAuth } from "@/shared/store/useAuthStore";