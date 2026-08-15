import { useAuthSession } from "@/routes/AuthUserContext";
import type { User } from "@/lib/api";

/** Current authenticated user from AuthUserProvider. */
export function useAuthUser(): User {
  return useAuthSession().user;
}
