import { useEffect, useState } from "react";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";

import GoogleOneTap from "@/components/auth/GoogleOneTap";
import { getCurrentUser } from "@/lib/auth";

export default function GuestRoute() {
  const [searchParams] = useSearchParams();
  const [checked, setChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const redirectTo = searchParams.get("next") || "/space";

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
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <>
      <GoogleOneTap redirectTo={redirectTo} />
      <Outlet />
    </>
  );
}
