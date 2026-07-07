import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { getCurrentUser } from "@/lib/auth";

export default function GuestRoute() {
  const [checked, setChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setIsAuthenticated(Boolean(user)))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return <div className="min-h-screen bg-bg" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/space" replace />;
  }

  return <Outlet />;
}
