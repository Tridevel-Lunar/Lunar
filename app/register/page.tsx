"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";

import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorMessage from "@/components/auth/AuthErrorMessage";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthShell from "@/components/AuthShell";
import { apiFetch, type TokenResponse } from "@/lib/api";
import { setSession } from "@/lib/auth";

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "0.35rem",
  fontSize: "0.85rem",
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = await apiFetch<TokenResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          display_name: displayName || null,
        }),
      });
      await setSession(token.access_token);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="สมัครสมาชิก" subtitle="เปิดบัญชีฟรี แล้วเริ่มเรียนรู้ ทดลองภารกิจ และพัฒนาไอเดียของคุณ">
      <form onSubmit={handleSubmit}>
        <label htmlFor="displayName" style={labelStyle}>
          ชื่อที่แสดง (ไม่บังคับ)
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="auth-input"
        />

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
          รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
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
              กำลังสมัคร...
            </>
          ) : (
            "สมัครสมาชิก"
          )}
        </motion.button>
      </form>

      <AuthDivider />

      <GoogleSignInButton label="สมัครด้วย Google" />

      <p className="auth-link-footer">
        มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </AuthShell>
  );
}
