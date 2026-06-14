"use client";

import { useEffect, useState } from "react";
import StarField from "./StarField";
type ModuleId = "learn" | "build" | "launch";
interface ModuleData {
  id: ModuleId;
  step: string;
  title: string;
  titleTh: string;
  tagline: string;
  description: string;
  bullets: string[];
  accent: string;
}
const MODULES: ModuleData[] = [
  {
    id: "learn",
    step: "01",
    title: "LEARN",
    titleTh: "เรียนรู้",
    tagline: "Space Technology Fundamentals",
    description:
      "ปูพื้นฐานผ่านบทเรียน interactive ตั้งแต่ฟิสิกส์วงโคจร โครงสร้างดาวเทียม จนถึงระบบสื่อสาร",
    bullets: ["Interactive lessons", "Visual simulations", "Structured path"],
    accent: "#00e5ff",
  },
  {
    id: "build",
    step: "02",
    title: "BUILD",
    titleTh: "สร้าง",
    tagline: "Design Your Own Satellite",
    description:
      "ลงมือออกแบบระบบดาวเทียม วางโครงสร้างภารกิจ และทดสอบการทำงานใน sandbox ก่อนใช้จริง",
    bullets: ["Mission design", "Subsystem builder", "Simulation sandbox"],
    accent: "#7dd3fc",
  },
  {
    id: "launch",
    step: "03",
    title: "LAUNCH",
    titleTh: "ปล่อย",
    tagline: "Share Ideas, Connect Experts",
    description:
      "เก็บไอเดีย พัฒนาต่อยอด และในอนาคตเชื่อมต่อกับผู้เชี่ยวชาญเพื่อสร้างคุณค่าให้กับโปรเจกต์",
    bullets: ["Idea vault", "Community feedback", "Expert connect"],
    accent: "#a78bfa",
  },
];
function ModuleCard({
  mod,
  isActive,
  onEnter,
}: {
  mod: ModuleData;
  isActive: boolean;
  onEnter: () => void;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      style={{
        position: "relative",
        padding: "2.5rem 2rem",
        background: isActive
          ? "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))"
          : "rgba(255,255,255,0.015)",
        border: `1px solid ${isActive ? `${mod.accent}55` : "rgba(232,237,245,0.08)"}`,
        borderRadius: 2,
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
        cursor: "default",
        backdropFilter: "blur(6px)",
        boxShadow: isActive
          ? `0 0 60px -20px ${mod.accent}33, inset 0 1px 0 ${mod.accent}22`
          : "none",
        transform: isActive ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${mod.accent}, transparent)`,
          opacity: isActive ? 1 : 0.25,
          transition: "opacity 0.5s",
        }}
      />
      {/* Step number */}
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          color: mod.accent,
          opacity: 0.85,
          marginBottom: "1.5rem",
        }}
      >
        {mod.step} — MODULE
      </div>
      {/* Title */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h3
          style={{
            fontFamily: "Space Grotesk, system-ui, sans-serif",
            fontSize: "2.4rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#e8edf5",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {mod.title}
        </h3>
        <div
          style={{
            fontFamily: "Sarabun, system-ui, sans-serif",
            fontSize: "0.95rem",
            color: "rgba(232,237,245,0.45)",
            marginTop: "0.4rem",
            fontWeight: 300,
          }}
        >
          {mod.titleTh}
        </div>
      </div>
      {/* Tagline */}
      <div
        style={{
          fontSize: "0.82rem",
          letterSpacing: "0.04em",
          color: "rgba(232,237,245,0.7)",
          marginBottom: "1rem",
          textTransform: "uppercase",
        }}
      >
        {mod.tagline}
      </div>
      {/* Description */}
      <p
        style={{
          fontFamily: "Sarabun, system-ui, sans-serif",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          color: "rgba(232,237,245,0.55)",
          margin: "0 0 1.75rem 0",
          fontWeight: 300,
        }}
      >
        {mod.description}
      </p>
      {/* Bullets */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {mod.bullets.map((b) => (
          <li
            key={b}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              fontSize: "0.82rem",
              color: "rgba(232,237,245,0.65)",
              padding: "0.4rem 0",
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: mod.accent,
                opacity: 0.9,
              }}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default function PlatformSection() {
  const [activeId, setActiveId] = useState<ModuleId>("learn");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section
      style={{
        position: "relative",
        background: "#030812",
        color: "#e8edf5",
        padding: "8rem 1.5rem",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sarabun:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      {/* Star background */}
      {mounted && <StarField />}
      {/* Vignette */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(3,8,18,0.6) 70%, #030812 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.3em",
              color: "rgba(0,229,255,0.85)",
              marginBottom: "1.75rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#00e5ff",
                borderRadius: "50%",
                boxShadow: "0 0 12px #00e5ff",
              }}
            />
            PLATFORM
          </div>
          <h2
            style={{
              fontFamily: "Sarabun, system-ui, sans-serif",
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              color: "#e8edf5",
              margin: "0 0 1.25rem 0",
              lineHeight: 1.15,
            }}
          >
            เส้นทางสู่จักรวาล
          </h2>
          <p
            style={{
              fontFamily: "Sarabun, system-ui, sans-serif",
              fontSize: "1.05rem",
              fontWeight: 300,
              color: "rgba(232,237,245,0.5)",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            สามขั้นตอนที่ออกแบบมาเพื่อพาคุณจากพื้นฐาน สู่การลงมือสร้าง
            และปล่อยไอเดียของตัวเองสู่โลกจริง
          </p>
        </div>
        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "4rem",
          }}
        >
          {MODULES.map((m) => (
            <ModuleCard
              key={m.id}
              mod={m}
              isActive={activeId === m.id}
              onEnter={() => setActiveId(m.id)}
            />
          ))}
        </div>
        {/* Footer line */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.75rem",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            color: "rgba(232,237,245,0.3)",
          }}
        >
          <span
            style={{
              width: 32,
              height: 1,
              background: "rgba(232,237,245,0.2)",
            }}
          />
          LUNAR PLATFORM
          <span
            style={{
              width: 32,
              height: 1,
              background: "rgba(232,237,245,0.2)",
            }}
          />
        </div>
      </div>
    </section>
  );
}