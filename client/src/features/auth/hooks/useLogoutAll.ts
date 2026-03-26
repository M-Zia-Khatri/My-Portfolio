import { api } from '@/shared/api/axios';
import { useMutation } from '@tanstack/react-query';
import { logoutApi, useAuth } from '../context/AuthContext';

/**
 * Revokes every active session for the current admin on the server,
 * then resets local auth state.
 *
 * Use this for "Sign out of all devices" in the admin UI, or call it
 * programmatically on a detected token anomaly.
 */
export const useLogoutAll = () => {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () => api.post('/auth/logout-all'),
    onSuccess: async () => {
      // The server already revoked all tokens and cleared the cookie.
      // Reset local state and clear the RQ cache.
      await logoutApi().catch(() => {}); // best-effort — already logged out
      logout();
    },
    onError: () => {
      // Even on network failure, clear local state — the user should not
      // remain logged in if the server call fails.
      logout();
    },
  });
};
