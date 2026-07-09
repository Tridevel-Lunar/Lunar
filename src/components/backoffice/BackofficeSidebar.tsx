import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlineUsers,
} from "react-icons/hi2";
import { IoLogOutOutline } from "react-icons/io5";

import type { User } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user";

export type BackofficeSection = "users" | "knowledge";

function SidebarNavItem({
  active,
  icon,
  label,
  href,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[0.68rem] tracking-[0.12em] no-underline transition-all ${
        active
          ? "border-teal/50 bg-teal/10 text-teal shadow-[0_0_24px_rgba(29,233,182,0.12)]"
          : "border-transparent text-text/55 hover:border-white/10 hover:bg-white/[0.03] hover:text-text/80"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-display font-semibold">{label}</span>
    </Link>
  );
}

type BackofficeSidebarProps = {
  user: User;
  activeSection?: BackofficeSection;
};

export default function BackofficeSidebar({
  user,
  activeSection = "knowledge",
}: BackofficeSidebarProps) {
  const navigate = useNavigate();
  const displayName = getUserDisplayName(user);

  async function handleLogout() {
    await clearSession();
    navigate("/login");
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-teal/10 bg-[#020a0d]/95 px-4 py-5 backdrop-blur-md">
      <div className="mb-6 shrink-0">
        <Link to="/" className="font-en text-[1.15rem] font-extrabold tracking-[0.24em] text-text no-underline">
          LUNAR
        </Link>
        <p className="font-mono mt-0.5 text-[0.52rem] tracking-[0.18em] text-teal/80">
          BACKOFFICE
        </p>
      </div>

      <div className="mb-5 flex shrink-0 items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-teal/30">
          <img
            src={DEFAULT_AVATAR_URL}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </div>
        <div>
          <p className="text-[0.75rem] text-text/90">{displayName}</p>
          <span className="font-mono mt-0.5 inline-block rounded-full border border-teal/30 bg-teal/10 px-1.5 py-px text-[0.58rem] tracking-wider text-teal">
            Admin
          </span>
        </div>
      </div>

      <p className="font-mono mb-2 shrink-0 text-[0.52rem] tracking-[0.16em] text-muted">
        ADMIN
      </p>
      <nav className="flex shrink-0 flex-col gap-1.5">
        <SidebarNavItem
          active={activeSection === "users"}
          icon={<HiOutlineUsers />}
          label="USERS"
          href="/backoffice/users"
        />
        <SidebarNavItem
          active={activeSection === "knowledge"}
          icon={<HiOutlineDocumentText />}
          label="KNOWLEDGE"
          href="/backoffice/knowledge"
        />
      </nav>

      <div className="mt-auto shrink-0 space-y-0.5 pt-6">
        <Link
          to="/studio"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.62rem] tracking-[0.1em] text-text/45 no-underline transition-colors hover:bg-white/[0.03] hover:text-text/75"
        >
          <span className="text-sm">
            <HiOutlineArrowLeft />
          </span>
          กลับไป Studio
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.62rem] tracking-[0.1em] text-text/45 transition-colors hover:bg-white/[0.03] hover:text-text/75"
        >
          <span className="text-sm">
            <IoLogOutOutline />
          </span>
          LOG OUT
        </button>
      </div>
    </aside>
  );
}
