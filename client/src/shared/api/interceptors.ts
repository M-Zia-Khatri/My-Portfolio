// ─── interceptors.ts ─────────────────────────────────────────────────────────
//
// Axios request + response interceptors.
//
// Request  → reads the access_token cookie via getAccessToken() and attaches
//            it as the Authorization: Bearer header.
// Response → on a 401, silently calls POST /auth/refresh (which sends the
//            HttpOnly refresh_token cookie automatically), stores the new
//            access token, and retries the original request.
//
// The only change vs. the original: getAccessToken() now reads from a cookie
// instead of a module-level variable, so tokens survive page refreshes.

import { api } from "./axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/features/auth/utils/tokenManager";
import { refreshTokenApi } from "@/features/auth/services/auth.api";

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

// ── Request — attach access token ────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken(); // reads the access_token cookie

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response — silent token refresh on 401 ───────────────────────────────────

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue subsequent 401s until the refresh resolves
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
      // POST /auth/refresh — no body needed; the browser sends the
      // HttpOnly refresh_token cookie via withCredentials: true.
      const data = await refreshTokenApi();

      setAccessToken(data.accessToken); // writes the access_token cookie
      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      clearAccessToken(); // clear the stale cookie
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
