import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { clearSession, getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/api";

const NAV_LINKS = [
  { label: "WHY SPACE", href: "/#why-space" },
  { label: "RESEARCH", href: "/#research" },
  { label: "PLATFORM", href: "/#platform" },
  { label: "JOIN US", href: "/#join-us" },
] as const;

const navLinkClass =
  "font-mono text-[0.72rem] tracking-[0.12em] text-text/50 no-underline transition-colors hover:text-cyan";

const outlineBtnClass =
  "btn-clip font-mono px-5 py-2.5 text-[0.72rem] tracking-[0.12em] uppercase no-underline transition-colors";

export default function Navbar() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isLanding) return;
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [isLanding]);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await clearSession();
    setUser(null);
    window.location.href = "/login";
  }

  const showSolidNav = !isLanding || scrolled;

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-16 py-5 transition-all duration-500 ${
        showSolidNav
          ? "border-b border-cyan/10 bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Link
        to="/"
        className="font-en text-glow-cyan text-[1.25rem] font-extrabold tracking-[0.35em] text-cyan no-underline"
      >
        LUNAR
      </Link>

      <ul className="flex list-none gap-10">
        {NAV_LINKS.map((item) => (
          <li key={item.href}>
            <Link to={item.href} className={navLinkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {user ? (
        <div className="flex items-center gap-3">
          <Link
            to="/space"
            className={`${outlineBtnClass} border border-teal text-teal`}
          >
            Space
          </Link>
          <button
            type="button"
            className={`${outlineBtnClass} cursor-pointer border border-text/30 text-text/70`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          to="/register"
          className={`${outlineBtnClass} border border-cyan text-cyan transition-all hover:bg-cyan hover:text-bg`}
        >
          ENROLL NOW
        </Link>
      )}
    </nav>
  );
}
