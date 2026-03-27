// client/src/shared/api/interceptors.ts
import { refreshTokenApi } from '@/features/auth/services/auth.api';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/features/auth/utils/tokenManager';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

// Auth endpoints that must never trigger a silent token refresh on 401.
// FIX: added /auth/login — a wrong password returns 401, which was previously
// causing a pointless POST /auth/refresh attempt (no cookie exists yet at
// login time), adding a wasted round-trip before the error reached the UI.
const REFRESH_EXCLUDED_URLS = ['/auth/refresh', '/auth/login', '/auth/verify-otp'];

function isExcluded(url: string | undefined): boolean {
  if (!url) return false;
  return REFRESH_EXCLUDED_URLS.some((path) => url.includes(path));
}

export const setupInterceptors = (api: AxiosInstance) => {
  // ── Request — attach access token ──────────────────────────────────────────
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ── Response — silent token refresh on 401 ─────────────────────────────────
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        isExcluded(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshTokenApi();

        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    },
  );
};
