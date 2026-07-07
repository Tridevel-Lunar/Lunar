import { useOutletContext } from "react-router-dom";

import type { User } from "@/lib/api";
import type { AuthOutletContext } from "@/routes/ProtectedRoute";

export function useAuthUser(): User {
  return useOutletContext<AuthOutletContext>().user;
}
