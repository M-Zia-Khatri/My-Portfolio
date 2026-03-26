import { create } from 'zustand';
import {
  clearAccessToken,
  setAccessToken,
} from '@/features/auth/utils/tokenManager';
import type { AuthState, AuthUser } from '@/features/auth/types';
import type { QueryClient } from '@tanstack/react-query';

// ─── QueryClient bridge ───────────────────────────────────────────────────────
// Injected once at app boot (in AuthProvider) so logout() can clear the
// React Query cache without the store depending on a hook or React context.

let _queryClient: QueryClient | null = null;

export function setQueryClient(qc: QueryClient): void {
  _queryClient = qc;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthActions {
  /**
   * Clears the in-memory access token, resets auth state, and clears the
   * React Query cache. Always call logoutApi() first so the server revokes
   * the HttpOnly refresh token cookie before state is reset.
   */
  logout: () => void;

  /**
   * Called by AuthProvider once useMe resolves on initial load or after
   * a successful OTP verification (via query invalidation).
   */
  setUser: (user: AuthUser | null) => void;

  setLoading: (loading: boolean) => void;

  /** Returns true if the current user has at least one of the given roles. */
  hasRole: (roles: string[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true until useMe resolves on first mount
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  logout: () => {
    clearAccessToken();
    // Clear the RQ cache here — co-located so it always runs regardless of
    // whether AuthProvider is mounted, no fragile subscription required.
    _queryClient?.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => {
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hasRole: (roles) => {
    const { user } = get();
    return !!user && roles.includes(user.role);
  },
}));

// ─── Convenience selector ─────────────────────────────────────────────────────
// Used by components that only need to know if the user is authenticated,
// without subscribing to the full state object.
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated;
export const selectUser = (s: AuthStore) => s.user;
export const selectIsLoading = (s: AuthStore) => s.isLoading;
