// client/src/shared/api/interceptors.ts
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/features/auth/utils/tokenManager';
import { refreshTokenApi } from '@/features/auth/services/auth.api';
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

      // Ensure we don't loop on /auth/refresh or non-401 errors
      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/verify-otp')
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
        const data = await refreshTokenApi(); // Note: ensure this doesn't cause a loop

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
    }
  );
};
