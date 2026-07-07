import type { User } from "@/lib/api";

export function getUserDisplayName(user: User): string {
  if (user.display_name?.trim()) {
    return user.display_name.trim();
  }
  const local = user.email.split("@")[0];
  return local || user.email;
}
