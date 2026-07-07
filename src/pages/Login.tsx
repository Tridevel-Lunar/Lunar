import { Suspense } from "react";

import LoginForm from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <LoginForm />
    </Suspense>
  );
}
