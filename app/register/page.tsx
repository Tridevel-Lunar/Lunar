"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorMessage from "@/components/auth/AuthErrorMessage";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthShell from "@/components/AuthShell";
import { apiFetch, type TokenResponse } from "@/lib/api";
import { setSession } from "@/lib/auth";

const labelClass = "mb-1.5 block text-[0.85rem]";

const inputClass =
  "mb-4 w-full border border-cyan/20 bg-[rgba(3,8,18,0.6)] px-4 py-3 text-[0.95rem] text-text outline-none transition-[border-color,box-shadow,background] focus:border-cyan/55 focus:bg-[rgba(3,8,18,0.85)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.12),0_0_20px_rgba(0,229,255,0.08)]";

const submitClass =
  "auth-btn-shine relative w-full overflow-hidden border border-cyan bg-cyan px-4 py-3 font-mono text-[0.72rem] tracking-[0.12em] text-bg uppercase transition-[transform,box-shadow,opacity] not-disabled:hover:-translate-y-px not-disabled:hover:shadow-[0_4px_24px_rgba(0,229,255,0.35)] disabled:cursor-wait disabled:opacity-70";

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
        <label htmlFor="displayName" className={labelClass}>
          ชื่อที่แสดง (ไม่บังคับ)
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
        />

        <label htmlFor="email" className={labelClass}>
          อีเมล
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />

        <label htmlFor="password" className={labelClass}>
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
          className={inputClass}
          placeholder="••••••••"
        />

        {error && <AuthErrorMessage message={error} />}

        <motion.button
          type="submit"
          className={`${submitClass} btn-clip`}
          disabled={loading}
          whileHover={loading ? undefined : { y: -1 }}
          whileTap={loading ? undefined : { scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {loading ? (
            <>
              <span
                className="mr-2 inline-block h-[0.85em] w-[0.85em] animate-auth-spin rounded-full border-2 border-bg/30 border-t-bg align-[-0.1em]"
                aria-hidden
              />
              กำลังสมัคร...
            </>
          ) : (
            "สมัครสมาชิก"
          )}
        </motion.button>
      </form>

      <AuthDivider />

      <GoogleSignInButton label="สมัครด้วย Google" />

      <p className="mt-5 text-[0.85rem] text-muted">
        มีบัญชีแล้ว?{" "}
        <Link href="/login" className="text-cyan no-underline transition-[text-shadow] hover:text-glow-cyan-link">
          เข้าสู่ระบบ
        </Link>
      </p>
    </AuthShell>
  );
}
