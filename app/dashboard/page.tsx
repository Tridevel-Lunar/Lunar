"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearSession, getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await clearSession();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "4rem" }}>
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 80% 20%, rgba(29,233,182,0.06) 0%, transparent 50%), var(--bg)",
        color: "var(--text)",
        padding: "6rem 4rem 4rem",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <Link
          href="/"
          className="font-en"
          style={{
            fontWeight: 800,
            letterSpacing: "0.35em",
            color: "var(--cyan)",
            textDecoration: "none",
          }}
        >
          LUNAR
        </Link>
        <button
          type="button"
          className="font-mono btn-clip"
          onClick={handleLogout}
          style={{
            padding: "0.6rem 1.4rem",
            border: "1px solid var(--cyan)",
            background: "transparent",
            color: "var(--cyan)",
            cursor: "pointer",
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
          }}
        >
          ออกจากระบบ
        </button>
      </header>

      <main style={{ maxWidth: "720px" }}>
        <p className="font-mono" style={{ fontSize: "0.72rem", letterSpacing: "0.15em", color: "var(--teal)", marginBottom: "0.75rem" }}>
          DASHBOARD
        </p>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          ยินดีต้อนรับ{user?.display_name ? `, ${user.display_name}` : ""}
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>{user?.email}</p>

        <div
          style={{
            padding: "1.5rem",
            border: "1px solid rgba(0,229,255,0.15)",
            background: "rgba(6,14,28,0.6)",
          }}
        >
          <p style={{ marginBottom: "0.75rem" }}>
            พื้นที่นี้จะเป็นจุดเริ่มต้นสำหรับ Space · Arena · Studio ในอนาคต
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            ตอนนี้คุณเข้าสู่ระบบสำเร็จแล้ว — พร้อมสำหรับการเรียนรู้และสะสม Point
          </p>
        </div>
      </main>
    </div>
  );
}
