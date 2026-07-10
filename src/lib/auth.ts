import type { User } from "./api";
import { API_URL } from "./constants";

const AUTH_SKIP_REFRESH = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/google/onetap",
]);

let refreshPromise: Promise<boolean> | null = null;

export function shouldSkipAuthRefresh(path: string): boolean {
  return AUTH_SKIP_REFRESH.has(path);
}

export async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function fetchWithAuthRetry(
  path: string,
  options?: RequestInit,
  retried = false,
): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  if (response.status === 401 && !retried && !shouldSkipAuthRefresh(path)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return fetchWithAuthRetry(path, options, true);
    }
  }

  return response;
}

export async function signInWithGoogleCredential(credential: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/google/onetap`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Google sign-in failed";
    throw new Error(detail);
  }
}

export async function clearSession(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  });
  if (response.status === 401) {
    const refreshed = await tryRefreshSession();
    if (!refreshed) {
      return null;
    }

    const retry = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });
    if (retry.status === 401) {
      return null;
    }
    if (!retry.ok) {
      throw new Error("Failed to fetch user");
    }
    return retry.json();
  }
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}
