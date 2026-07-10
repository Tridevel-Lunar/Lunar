import { useCallback, useEffect, useState } from "react";
import { HiOutlineUsers } from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

import BackofficeSidebar from "@/components/backoffice/BackofficeSidebar";
import { HintTooltip } from "@/components/ui/tooltip";
import {
  ApiError,
  getBackofficeUsers,
  patchBackofficeUserRole,
  type BackofficeUser,
  type User,
} from "@/lib/api";
import { getUserDisplayName } from "@/lib/user";

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_6px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleBadgeClass(role: string) {
  if (role === "admin") return "border-teal/40 bg-teal/10 text-teal";
  return "border-white/15 text-muted";
}

type BackofficeUsersPanelProps = {
  user: User;
};

export default function BackofficeUsersPanel({ user }: BackofficeUsersPanelProps) {
  const [users, setUsers] = useState<BackofficeUser[]>([]);
  const [adminCount, setAdminCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBackofficeUsers();
      setUsers(data.users);
      setAdminCount(data.admin_count);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("คุณไม่มีสิทธิ์เข้า backoffice — ต้องมี role admin");
      } else {
        setError(err instanceof ApiError ? err.message : "โหลดข้อมูลไม่สำเร็จ");
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(target: BackofficeUser, newRole: "learner" | "admin") {
    if (target.role === newRole) return;

    const label = newRole === "admin" ? "แต่งตั้งเป็น admin" : "เปลี่ยนเป็น learner";
    const name = target.display_name || target.email;
    if (!window.confirm(`${label} สำหรับ "${name}"?`)) return;

    setUpdatingId(target.id);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await patchBackofficeUserRole(target.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setAdminCount((prev) => {
        if (target.role === "admin" && newRole === "learner") return prev - 1;
        if (target.role === "learner" && newRole === "admin") return prev + 1;
        return prev;
      });
      setSuccessMessage(`อัปเดต role ของ ${name} แล้ว`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "อัปเดต role ไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <BackofficeSidebar user={user} activeSection="users" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <IoRocketOutline className="text-xl text-teal" />
            <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">
              BACKOFFICE
            </h1>
          </div>
          <p className="font-mono text-[0.58rem] tracking-wider text-muted">
            User Management
          </p>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto max-w-[960px] space-y-5">
            <GlassCard className="border-teal/20 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono mb-1 text-[0.62rem] tracking-[0.2em] text-teal">
                    USERS
                  </p>
                  <p className="font-section-thai text-[0.9rem] leading-relaxed text-text/85">
                    จัดการบัญชีผู้ใช้และ role — admin เข้า backoffice ได้ · learner เข้าได้เฉพาะ
                    Space / Arena / Studio
                  </p>
                  <p className="font-mono mt-2 text-[0.55rem] tracking-wider text-muted">
                    Admin ทั้งหมด: {adminCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal/30 bg-teal/10 text-teal">
                  <HiOutlineUsers className="text-xl" />
                </div>
              </div>
            </GlassCard>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 font-section-thai text-[0.88rem] text-red-300">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-lg border border-teal/30 bg-teal/10 px-4 py-3 font-section-thai text-[0.88rem] text-teal">
                {successMessage}
              </div>
            )}

            <GlassCard className="overflow-hidden">
              {loading ? (
                <p className="p-5 font-section-thai text-[0.9rem] text-muted">กำลังโหลด…</p>
              ) : users.length === 0 ? (
                <p className="p-5 font-section-thai text-[0.9rem] text-muted">ไม่มีผู้ใช้</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 font-mono text-[0.55rem] tracking-[0.14em] text-muted">
                        <th className="px-4 py-3 font-semibold">EMAIL</th>
                        <th className="px-4 py-3 font-semibold">NAME</th>
                        <th className="px-4 py-3 font-semibold">ROLE</th>
                        <th className="px-4 py-3 font-semibold">JOINED</th>
                        <th className="px-4 py-3 font-semibold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((row) => {
                        const isSelf = row.id === user.id;
                        const displayName = row.display_name || "—";
                        const isUpdating = updatingId === row.id;

                        return (
                          <tr
                            key={row.id}
                            className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3 font-mono text-[0.72rem] text-text/90">
                              {row.email}
                              {isSelf && (
                                <span className="ml-2 text-[0.58rem] text-teal/80">(คุณ)</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-section-thai text-[0.85rem] text-text/85">
                              {displayName}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-mono inline-block rounded-full border px-2 py-0.5 text-[0.55rem] tracking-wider ${roleBadgeClass(row.role)}`}
                              >
                                {row.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[0.65rem] text-muted">
                              {formatDate(row.created_at)}
                            </td>
                            <td className="px-4 py-3">
                              {isSelf ? (
                                <span className="font-mono text-[0.58rem] text-muted">—</span>
                              ) : row.role === "admin" ? (
                                <HintTooltip
                                  content={
                                    adminCount <= 1
                                      ? "ต้องมี admin อย่างน้อย 1 คน"
                                      : "Demote to learner"
                                  }
                                >
                                  <button
                                    type="button"
                                    disabled={isUpdating || adminCount <= 1}
                                    onClick={() => handleRoleChange(row, "learner")}
                                    className="font-mono cursor-pointer rounded border border-white/15 px-2.5 py-1 text-[0.58rem] tracking-wider text-text/70 transition hover:border-white/25 hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {isUpdating ? "…" : "→ LEARNER"}
                                  </button>
                                </HintTooltip>
                              ) : (
                                <HintTooltip content="Promote to admin">
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleRoleChange(row, "admin")}
                                    className="font-mono cursor-pointer rounded border border-teal/40 bg-teal/10 px-2.5 py-1 text-[0.58rem] tracking-wider text-teal transition hover:bg-teal/20 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {isUpdating ? "…" : "→ ADMIN"}
                                  </button>
                                </HintTooltip>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>

            <p className="font-section-thai text-center text-[0.78rem] text-muted/80">
              คุณ: {getUserDisplayName(user)} · ไม่สามารถเปลี่ยน role ของตัวเองได้
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
