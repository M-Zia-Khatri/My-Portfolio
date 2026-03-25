export type UserRole = "admin" | "user" | "guest";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
