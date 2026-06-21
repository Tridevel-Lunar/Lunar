export const AUTH_COOKIE_NAME = "lunar_token";
export const AUTH_COOKIE_MAX_AGE = 30 * 60;

/** Browser → API (host machine port published by compose) */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Next.js server (Route Handlers) → read at request time for Docker internal URL */
export function getServerApiUrl(): string {
  return process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}
