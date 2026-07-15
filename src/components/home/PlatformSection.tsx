import { useEffect, useRef, useState, type CSSProperties } from "react";

type ModuleId = "space" | "arena" | "studio";

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
    id: "space",
    step: "01",
    title: "SPACE",
    titleTh: "เรียนรู้",
    tagline: "Interactive Learning",
    description:
      "ปูพื้นฐานวิศวกรรมอวกาศแบบ interactive จำลองโครงสร้าง CubeSat 3 มิติ เชื่อมต่อระบบฝังตัว คำนวณฟิสิกส์วงโคจร และเขียนโปรแกรมควบคุม autopilot",
    bullets: ["3D Model — CubeSat 101", "Embedded System — OBC/EPS", "Physics — Orbit & Power Budget", "Programming — Autopilot Logic"],
    accent: "#00e5ff",
  },
  {
    id: "arena",
    step: "02",
    title: "ARENA",
    titleTh: "ลงมือปฏิบัติ",
    tagline: "Build & Mission Simulation",
    description:
      "หลังจากเข้าใจ concept พื้นฐานแล้ว มาลองสร้างตรรกะควบคุมดาวเทียมด้วย Blockly และทดสอบภารกิจในสภาพแวดล้อมจำลองที่ทำงานร่วมกับ Physics Engine",
    bullets: ["Visual Coding — Blockly drag & drop", "Simulation — Digital twin sandbox"],
    accent: "#7dd3fc",
  },
  {
    id: "studio",
    step: "03",
    title: "STUDIO",
    titleTh: "สร้างสรรค์ต่อ",
    tagline: "Launch, Portfolio & LAIKA",
    description:
      "เก็บผลงาน วางแผนพัฒนา และต่อยอดไอเดียกับ LAIKA ผู้ช่วย AI ที่ให้คำปรึกษา วิเคราะห์แนวคิด และเชื่อมโยงคุณค่าสู่นวัตกรรมอวกาศ",
    bullets: ["LAIKA — AI mentor with RAG", "Conversation tree & idea vault", "Portfolio & career pathway"],
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
      style={
        {
          "--accent": mod.accent,
        } as CSSProperties
      }
      className={`relative cursor-default rounded-sm p-8 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isActive
          ? "-translate-y-1 border-[color:color-mix(in_srgb,var(--accent)_33%,transparent)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_0_60px_-20px_color-mix(in_srgb,var(--accent)_20%,transparent)]"
          : "translate-y-0 border-text/8 bg-white/[0.015]"
      } border`}
    >
      <div
        className={`absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent transition-opacity ${isActive ? "opacity-100" : "opacity-25"}`}
      />

      <div className="font-ui-mono mb-6 text-[0.7rem] tracking-[0.25em] text-[var(--accent)] opacity-85">
        {mod.step} — MODULE
      </div>

      <div className="mb-5">
        <h3 className="font-platform m-0 text-[2.4rem] leading-none font-semibold tracking-tight text-text">
          {mod.title}
        </h3>
        <div className="font-section-thai mt-1.5 text-[0.95rem] font-light text-text/45">
          {mod.titleTh}
        </div>
      </div>

      <div className="mb-4 text-[0.82rem] tracking-wide text-text/70 uppercase">
        {mod.tagline}
      </div>

      <p className="font-section-thai m-0 mb-7 text-[0.95rem] leading-relaxed font-light text-text/55">
        {mod.description}
      </p>

      <ul className="m-0 list-none p-0">
        {mod.bullets.map((b) => (
          <li
            key={b}
            className="font-ui-mono flex items-center gap-3 py-1.5 text-[0.82rem] tracking-wide text-text/65"
          >
            <span
              className="h-1 w-1 rounded-full opacity-90"
              style={{ background: mod.accent }}
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
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="platform"
      className="relative min-h-screen overflow-hidden bg-bg px-6 py-32 text-text"
    >
      <div className="relative mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <div className="font-ui-mono mb-7 inline-flex items-center gap-2.5 text-[0.72rem] tracking-[0.3em] text-cyan/85">
            <span className="glow-dot-cyan h-1.5 w-1.5 rounded-full bg-cyan" />
            PLATFORM
          </div>
          <h2 className="font-section-thai m-0 mb-5 text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.15] font-light tracking-tight text-text">
            แพลตฟอร์ม LUNAR
          </h2>
          <p className="font-section-thai mx-auto m-0 max-w-[560px] text-[1.05rem] leading-relaxed font-light text-text/50">
            ตั้งแต่เรียนรู้ทฤษฎี ลงมือทดสอบ ไปจนถึงการต่อยอดไอเดียด้วย AI ทุกอย่างในที่เดียว
          </p>
        </div>

        <div className="mb-16 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {MODULES.map((m) => (
            <ModuleCard
              key={m.id}
              mod={m}
              isActive={activeId === m.id}
              onEnter={() => setActiveId(m.id)}
            />
          ))}
        </div>

        <div className="font-ui-mono flex items-center justify-center gap-3 text-[0.7rem] tracking-[0.25em] text-text/30">
          <span className="h-px w-8 bg-text/20" />
          LUNAR PLATFORM
          <span className="h-px w-8 bg-text/20" />
        </div>
      </div>
    </section>
  );
}
