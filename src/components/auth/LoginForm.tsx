import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import AuthDivider from "@/components/auth/AuthDivider";
import AuthErrorMessage from "@/components/auth/AuthErrorMessage";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthShell from "@/components/AuthShell";
import { apiFetch } from "@/lib/api";

const labelClass = "mb-1.5 block text-[0.85rem]";

const inputClass =
  "mb-4 w-full border border-cyan/20 bg-[rgba(3,8,18,0.6)] px-4 py-3 text-[0.95rem] text-text outline-none transition-[border-color,box-shadow,background] focus:border-cyan/55 focus:bg-[rgba(3,8,18,0.85)] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.12),0_0_20px_rgba(0,229,255,0.08)]";

const submitClass =
  "auth-btn-shine relative w-full overflow-hidden border border-cyan bg-cyan px-4 py-3 font-mono text-[0.72rem] tracking-[0.12em] text-bg uppercase transition-[transform,box-shadow,opacity] not-disabled:hover:-translate-y-px not-disabled:hover:shadow-[0_4px_24px_rgba(0,229,255,0.35)] disabled:cursor-wait disabled:opacity-70";

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/space";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      navigate(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="เข้าสู่ระบบ" subtitle="เริ่มต้นการเรียนรู้เทคโนโลยีอวกาศกับ LUNAR">
      <form onSubmit={handleSubmit}>
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
          รหัสผ่าน
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
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
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </motion.button>
      </form>

      <AuthDivider />

      <GoogleSignInButton />

      <p className="mt-5 text-[0.85rem] text-muted">
        ยังไม่มีบัญชี?{" "}
        <Link to="/register" className="text-cyan no-underline transition-[text-shadow] hover:text-glow-cyan-link">
          สมัครสมาชิก
        </Link>
      </p>
    </AuthShell>
  );
}
