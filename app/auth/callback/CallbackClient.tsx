"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { setSession } from "@/lib/auth";

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("access_token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    setSession(accessToken)
      .then(() => {
        router.replace("/dashboard");
        router.refresh();
      })
      .catch(() => setError("ตั้งค่า session ไม่สำเร็จ"));
  }, [accessToken, router]);

  const message = !accessToken
    ? "ไม่พบ access token จาก Google"
    : error ?? "กำลังเข้าสู่ระบบ...";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-text">
      {message}
    </div>
  );
}
