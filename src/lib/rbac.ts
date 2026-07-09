import type { User } from "@/lib/api";

export function isAdmin(user: User): boolean {
  return user.role === "admin";
}
