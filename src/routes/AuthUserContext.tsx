import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { User } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export type AuthUserContextValue = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  refreshUser: () => Promise<User | null>;
};

const AuthUserContext = createContext<AuthUserContextValue | null>(null);

export function AuthUserProvider({
  user,
  setUser,
  children,
}: {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  children: ReactNode;
}) {
  const refreshUser = useCallback(async () => {
    const next = await getCurrentUser();
    if (next) setUser(next);
    return next;
  }, [setUser]);

  const value = useMemo(
    () => ({ user, setUser, refreshUser }),
    [user, setUser, refreshUser],
  );

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>;
}

export function useAuthSession(): AuthUserContextValue {
  const ctx = useContext(AuthUserContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthUserProvider");
  }
  return ctx;
}
