import { create } from "zustand";
import type { AuthState, AuthUser } from "../types";
import {
  setAccessToken,
  clearAccessToken,
} from "@/features/auth/utils/tokenManager";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthActions {
  /** Called after a successful login mutation — stores the in-memory token. */
  login: (user: AuthUser, accessToken: string) => void;
  /** Clears in-memory token and resets state (call logoutApi + queryClient.clear() alongside). */
  logout: () => void;
  /** Synced by AuthProvider once useMe resolves on initial load. */
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  hasRole: (roles: string[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true until useMe resolves
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  login: (user, accessToken) => {
    // Store the short-lived JWT in memory only — never localStorage.
    // The httpOnly refreshToken cookie is set by the server automatically.
    setAccessToken(accessToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearAccessToken();
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
    return roles.includes(user?.role ?? "");
  },
}));
