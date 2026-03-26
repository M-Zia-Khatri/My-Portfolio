/**
 * AuthProvider — React Query + Zustand bridge
 *
 * Responsibilities:
 *  1. Injects the React Query client into useAuthStore once at mount so
 *     store.logout() can clear the cache without relying on a subscription.
 *  2. On mount → useMe fetches GET /auth/me. If the access token is expired
 *     the axios interceptor silently refreshes it via the HttpOnly cookie
 *     before useMe sees a 401.
 *  3. Syncs the useMe result into useAuthStore so any component can read
 *     auth state without prop-drilling or useContext.
 *
 * Pattern:
 *  Server state  → React Query  (useMe, useLogin, useVerifyOtp …)
 *  Client state  → Zustand      (useAuthStore)
 *  Bridge        → AuthProvider (this file)
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/axios';
import { useMe } from '../hooks/useMe';
import { setQueryClient, useAuthStore } from '@/shared/store/useAuthStore';

// ─── Logout API ───────────────────────────────────────────────────────────────

/**
 * Hits POST /auth/logout.
 * The server revokes the DB refresh token and clears the HttpOnly cookie.
 * Always call this BEFORE store.logout() so the cookie is gone first.
 */
export const logoutApi = async (): Promise<void> => {
  await api.post('/auth/logout');
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, isSuccess, isError } = useMe();
  const { setUser, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  // ── Inject queryClient into the store once ──────────────────────────────
  // This allows store.logout() to clear the RQ cache directly, avoiding the
  // fragile subscription pattern that only worked while this component was mounted.
  useEffect(() => {
    setQueryClient(queryClient);
  }, [queryClient]);

  // ── Sync React Query → Zustand ──────────────────────────────────────────
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    if (isSuccess && user) {
      setUser(user);
    }
    if (isError) {
      setUser(null);
    }

    setLoading(false);
  }, [user, isLoading, isSuccess, isError, setUser, setLoading]);

  return <>{children}</>;
};

// ─── Re-exports for convenience ───────────────────────────────────────────────

/**
 * Primary auth hook — reads from Zustand, zero re-renders on unrelated state.
 *
 * @example
 * const { user, isAuthenticated, logout, hasRole } = useAuth()
 */
export { useAuthStore as useAuth } from '@/shared/store/useAuthStore';
