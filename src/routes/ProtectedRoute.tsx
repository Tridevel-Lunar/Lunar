import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/api";

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
    return <div className="min-h-screen bg-bg p-16 text-text">กำลังโหลด...</div>;
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet context={{ user } satisfies AuthOutletContext} />;
}
