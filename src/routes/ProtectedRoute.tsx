import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import SpaceLoadingState from "@/components/space/SpaceLoadingState";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/api";
import { AuthUserProvider } from "@/routes/AuthUserContext";

/** @deprecated Prefer useAuthSession / useAuthUser from AuthUserContext */
export type AuthOutletContext = {
  user: User;
};

export default function ProtectedRoute() {
  const location = useLocation();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div className="flex h-screen w-full flex-col bg-bg text-text">
        <SpaceLoadingState label="กำลังโหลด…" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return (
    <AuthUserProvider
      user={user}
      setUser={(update) => {
        setUser((prev) => {
          if (prev == null) return prev;
          return typeof update === "function" ? update(prev) : update;
        });
      }}
    >
      <Outlet context={{ user } satisfies AuthOutletContext} />
    </AuthUserProvider>
  );
}
