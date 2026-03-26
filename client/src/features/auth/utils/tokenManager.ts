// ─── tokenManager.ts ──────────────────────────────────────────────────────────
//
// Manages the short-lived access token on the client.
//
// Storage strategy
// ┌─────────────────────┬────────────────────────────────────────────────────┐
// │ access_token cookie │ Regular (JS-readable), Secure, SameSite=Strict,   │
// │                     │ max-age=900 (15 min). Read by the axios interceptor│
// │                     │ and attached as the Authorization: Bearer header.  │
// ├─────────────────────┼────────────────────────────────────────────────────┤
// │ refresh_token cookie│ HttpOnly (server-set). Never accessible from JS.   │
// │                     │ Sent automatically on POST /auth/refresh.           │
// └─────────────────────┴────────────────────────────────────────────────────┘
//
// Why a cookie instead of a JS variable?
//  - In-memory variables vanish on every page refresh, forcing a round-trip to
//    /auth/refresh before any protected request can fire.
//  - localStorage survives refreshes but is accessible to any script on the
//    page — a larger XSS target.
//  - A non-HttpOnly cookie with SameSite=Strict survives refreshes, is scoped
//    to the origin, and carries no CSRF risk because all state-changing
//    endpoints also require a valid access token in the Authorization header.

import { clearCookie, getCookie, setCookie } from './cookieManager';

const ACCESS_TOKEN_COOKIE = 'access_token';
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes — matches JWT expiry

// ─── API ──────────────────────────────────────────────────────────────────────

export function setAccessToken(token: string): void {
  setCookie(ACCESS_TOKEN_COOKIE, token, { maxAge: ACCESS_TOKEN_MAX_AGE });
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_COOKIE);
}

export function clearAccessToken(): void {
  clearCookie(ACCESS_TOKEN_COOKIE);
}
