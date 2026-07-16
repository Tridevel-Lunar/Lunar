import { Suspense } from "react";

import LoginForm from "@/components/auth/LoginForm";
import { usePageTitle } from "@/lib/use-page-title";

export default function Login() {
  usePageTitle("Sign In");
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <LoginForm />
    </Suspense>
  );
}
