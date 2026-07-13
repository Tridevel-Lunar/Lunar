import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  HiOutlineBell,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import {
  IoGameControllerOutline,
  IoLogOutOutline,
  IoPlanetOutline,
  IoRocketOutline,
  IoServerOutline,
} from "react-icons/io5";

import type { User } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user";
import { isAdmin } from "@/lib/rbac";

export type AppModule = "space" | "arena" | "studio";

const DEFAULT_LEVEL = 1;

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
          ? "border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_24px_rgba(0,229,255,0.12)]"
          : "border-transparent text-text/55 hover:border-white/10 hover:bg-white/[0.03] hover:text-text/80"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-display font-semibold">{label}</span>
    </Link>
  );
}

type ModuleSidebarProps = {
  user: User;
  activeModule: AppModule;
};

export default function ModuleSidebar({ user, activeModule }: ModuleSidebarProps) {
  const navigate = useNavigate();
  const displayName = getUserDisplayName(user);
  const backofficeAllowed = isAdmin(user);

  async function handleLogout() {
    await clearSession();
    navigate("/login");
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#02060f]/95 px-4 py-5 backdrop-blur-md">
      <div className="mb-6 shrink-0">
        <Link to="/" className="font-en text-[1.15rem] font-extrabold tracking-[0.24em] text-text no-underline">
          LUNAR
        </Link>
        <p className="font-mono mt-0.5 text-[0.52rem] tracking-[0.18em] text-muted">
          SPACE EDUTECH PLATFORM
        </p>
      </div>

      <div className="mb-5 flex shrink-0 items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-cyan/30">
          <img
            src={DEFAULT_AVATAR_URL}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </div>
        <div>
          <p className="text-[0.75rem] text-text/90">Hello, {displayName}</p>
          <span className="font-mono mt-0.5 inline-block rounded-full border border-teal/30 bg-teal/10 px-1.5 py-px text-[0.58rem] tracking-wider text-teal">
            Level {DEFAULT_LEVEL}
          </span>
        </div>
      </div>

      <nav className="flex shrink-0 flex-col gap-1.5">
        <SidebarNavItem
          active={activeModule === "space"}
          icon={<IoPlanetOutline />}
          label="SPACE"
          href="/space"
        />
        <SidebarNavItem
          active={activeModule === "arena"}
          icon={<IoGameControllerOutline />}
          label="ARENA"
          href="/arena"
        />
        <SidebarNavItem
          active={activeModule === "studio"}
          icon={<IoRocketOutline />}
          label="STUDIO"
          href="/studio"
        />
      </nav>

      <div className="mt-auto shrink-0 space-y-0.5 pt-6">
        {backofficeAllowed && (
          <Link
            to="/backoffice/users"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.62rem] tracking-[0.1em] text-teal/80 no-underline transition-colors hover:bg-teal/[0.06] hover:text-teal"
          >
            <span className="text-sm">
              <IoServerOutline />
            </span>
            BACKOFFICE
          </Link>
        )}
        {[
          { icon: <HiOutlineBell />, label: "NOTIFICATIONS" },
          { icon: <HiOutlineCog6Tooth />, label: "SETTINGS" },
          { icon: <IoLogOutOutline />, label: "LOG OUT", onClick: handleLogout },
        ].map((item) =>
          "onClick" in item ? (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.62rem] tracking-[0.1em] text-text/45 transition-colors hover:bg-white/[0.03] hover:text-text/75"
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          ) : (
            <Link
              key={item.label}
              to="#"
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.62rem] tracking-[0.1em] text-text/45 no-underline transition-colors hover:bg-white/[0.03] hover:text-text/75"
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </Link>
          ),
        )}
      </div>
    </aside>
  );
}
