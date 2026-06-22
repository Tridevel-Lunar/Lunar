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
      <div className="min-h-screen bg-bg p-16 text-text">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_80%_20%,rgba(29,233,182,0.06)_0%,transparent_50%)] bg-bg px-16 pt-24 pb-16 text-text">
      <header className="mb-12 flex items-center justify-between">
        <Link
          href="/"
          className="font-en text-cyan font-extrabold tracking-[0.35em] no-underline"
        >
          LUNAR
        </Link>
        <button
          type="button"
          className="btn-clip cursor-pointer border border-cyan bg-transparent px-5 py-2.5 font-mono text-[0.72rem] tracking-[0.12em] text-cyan"
          onClick={handleLogout}
        >
          ออกจากระบบ
        </button>
      </header>

      <main className="max-w-[720px]">
        <p className="font-mono mb-3 text-[0.72rem] tracking-[0.15em] text-teal">
          DASHBOARD
        </p>
        <h1 className="mb-2 text-[2rem]">
          ยินดีต้อนรับ{user?.display_name ? `, ${user.display_name}` : ""}
        </h1>
        <p className="mb-8 text-muted">{user?.email}</p>

        <div className="border border-cyan/15 bg-[rgba(6,14,28,0.6)] p-6">
          <p className="mb-3">
            พื้นที่นี้จะเป็นจุดเริ่มต้นสำหรับ Space · Arena · Studio ในอนาคต
          </p>
          <p className="text-[0.9rem] text-muted">
            ตอนนี้คุณเข้าสู่ระบบสำเร็จแล้ว — พร้อมสำหรับการเรียนรู้และสะสม Point
          </p>
        </div>
      </main>
    </div>
  );
}
