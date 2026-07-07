import type { User } from "./api";
import { API_URL } from "./constants";

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
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}
