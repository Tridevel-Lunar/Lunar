"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { clearSession, getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/api";

const NAV_LINKS = [
  { label: "WHY SPACE", href: "/#why-space" },
  { label: "RESEARCH", href: "/#research" },
  { label: "PLATFORM", href: "/#platform" },
  { label: "JOIN US", href: "/#join-us" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
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

  const navBackground = isLanding
    ? scrolled
      ? "rgba(3,8,18,0.85)"
      : "transparent"
    : "rgba(3,8,18,0.85)";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        padding: "1.2rem 4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: navBackground,
        backdropFilter: isLanding && !scrolled ? "none" : "blur(20px)",
        borderBottom:
          isLanding && !scrolled ? "1px solid transparent" : "1px solid rgba(0,229,255,0.1)",
      }}
    >
      <Link
        href="/"
        className="font-en"
        style={{
          fontWeight: 800,
          fontSize: "1.25rem",
          letterSpacing: "0.35em",
          color: "#00e5ff",
          textShadow: "0 0 20px rgba(0,229,255,0.5)",
          textDecoration: "none",
        }}
      >
        LUNAR
      </Link>

      <ul style={{ display: "flex", gap: "2.5rem", listStyle: "none" }}>
        {NAV_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-mono"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: "rgba(232,237,245,0.5)",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00e5ff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,237,245,0.5)")}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {user ? (
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link
            href="/dashboard"
            className="font-mono btn-clip"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              padding: "0.6rem 1.2rem",
              border: "1px solid #1de9b6",
              color: "#1de9b6",
              background: "transparent",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            Dashboard
          </Link>
          <button
            type="button"
            className="font-mono btn-clip"
            onClick={handleLogout}
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              padding: "0.6rem 1.2rem",
              border: "1px solid rgba(232,237,245,0.3)",
              color: "rgba(232,237,245,0.7)",
              background: "transparent",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/register"
          className="font-mono btn-clip"
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            padding: "0.6rem 1.6rem",
            border: "1px solid #00e5ff",
            color: "#00e5ff",
            background: "transparent",
            textDecoration: "none",
            textTransform: "uppercase",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#00e5ff";
            e.currentTarget.style.color = "#030812";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#00e5ff";
          }}
        >
          ENROLL NOW
        </Link>
      )}
    </nav>
  );
}
