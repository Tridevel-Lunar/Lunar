export const AUTH_COOKIE_NAME = "lunar_token";
export const AUTH_COOKIE_MAX_AGE = 30 * 60;

/** Browser → backend API */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Next.js server (Route Handlers) → backend on host */
export function getServerApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}
