"use client";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "WHY SPACE", href: "#why-space" },
  { label: "RESEARCH", href: "#research" },
  { label: "PLATFORM", href: "#platform" },
  { label: "JOIN US", href: "#join-us" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        padding: "1.2rem 4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(3,8,18,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,229,255,0.1)" : "1px solid transparent",
      }}
    >
      <span
        className="font-en"
        style={{
          fontWeight: 800,
          fontSize: "1.25rem",
          letterSpacing: "0.35em",
          color: "#00e5ff",
          textShadow: "0 0 20px rgba(0,229,255,0.5)",
        }}
      >
        LUNAR
      </span>

      <ul style={{ display: "flex", gap: "2.5rem", listStyle: "none" }}>
        {NAV_LINKS.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="font-mono"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                color: "rgba(232,237,245,0.5)",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#00e5ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,237,245,0.5)")}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <button
        className="font-mono btn-clip"
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.12em",
          padding: "0.6rem 1.6rem",
          border: "1px solid #00e5ff",
          color: "#00e5ff",
          background: "transparent",
          cursor: "pointer",
          transition: "all 0.3s",
          textTransform: "uppercase",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#00e5ff";
          e.currentTarget.style.color = "#030812";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#00e5ff";
        }}
      >
        ENROLL NOW
      </button>
    </nav>
  );
}
