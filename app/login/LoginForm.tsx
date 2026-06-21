"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";

import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorMessage from "@/components/auth/AuthErrorMessage";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthShell from "@/components/AuthShell";
import { apiFetch, type TokenResponse } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await apiFetch<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await setSession(token.access_token);
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="เข้าสู่ระบบ" subtitle="เริ่มต้นการเรียนรู้เทคโนโลยีอวกาศกับ LUNAR">
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" style={labelStyle}>
          อีเมล
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          placeholder="you@example.com"
        />

        <label htmlFor="password" style={labelStyle}>
          รหัสผ่าน
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          placeholder="••••••••"
        />

        {error && <AuthErrorMessage message={error} />}

        <motion.button
          type="submit"
          className="auth-btn-primary btn-clip"
          disabled={loading}
          whileHover={loading ? undefined : { y: -1 }}
          whileTap={loading ? undefined : { scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {loading ? (
            <>
              <span className="auth-spinner" aria-hidden />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </motion.button>
      </form>

      <AuthDivider />

      <GoogleSignInButton />

      <p className="auth-link-footer">
        ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
      </p>
    </AuthShell>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "0.35rem",
  fontSize: "0.85rem",
};
