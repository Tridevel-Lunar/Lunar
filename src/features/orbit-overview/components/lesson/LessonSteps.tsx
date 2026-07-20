import { useState } from "react";
import { BAND_META } from "@/features/orbit-overview/lib/types";
import {
  DAILY_HOOKS,
  MODULE1_TYPE_CARDS,
  SAT_PARTS,
} from "@/features/orbit-overview/lib/tour";
import { MissionType } from "@/features/orbit-overview/lib/missions";

export function IntroStep({
  onNext,
  onJumpBand,
}: {
  onNext: () => void;
  onJumpBand: (b: "GEO" | "MEO" | "LEO") => void;
}) {
  const [hook, setHook] = useState<string | null>(null);
  const [part, setPart] = useState<string | null>(null);
  const activeHook = DAILY_HOOKS.find((h) => h.id === hook);
  const activePart = SAT_PARTS.find((p) => p.id === part);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-white/55 leading-relaxed">
        กดสิ่งที่คุณทำทุกวัน — แล้วดูว่าดาวเทียมซ่อนอยู่ตรงไหน
      </p>

      <div className="grid grid-cols-3 gap-2">
        {DAILY_HOOKS.map((h) => {
          const on = hook === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setHook(h.id)}
              className={`rounded-2xl px-2 py-4 text-center transition-all duration-300 ${
                on
                  ? "bg-cyan-400 text-[#041018] scale-[1.02] shadow-[0_0_28px_rgba(34,211,238,0.35)]"
                  : "bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08]"
              }`}
            >
              <div className="text-[13px] font-semibold leading-tight">
                {h.label}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className={`min-h-[52px] rounded-2xl px-3.5 py-3 transition-all duration-300 ${
          activeHook
            ? "bg-cyan-500/15 border border-cyan-400/35 text-cyan-50"
            : "bg-white/[0.02] border border-dashed border-white/10 text-white/30"
        }`}
      >
        <div className="text-[12px] leading-snug">
          {activeHook ? activeHook.reveal : "เลือกด้านบนเพื่อเปิดคำตอบ"}
        </div>
      </div>

      <div>
        <div className="text-[10px] tracking-[0.14em] uppercase text-white/30 mb-2">
          ทุกดวงมีครบ 4 ส่วน
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SAT_PARTS.map((p) => {
            const on = part === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPart(p.id)}
                className={`rounded-xl py-2.5 px-1 text-[11px] font-medium transition-colors ${
                  on
                    ? "bg-white text-[#0a1220]"
                    : "bg-white/[0.04] border border-white/10 text-white/55 hover:text-white/80"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        {activePart && (
          <p className="text-[12px] text-white/50 mt-2 px-0.5">
            {activePart.hint}
            {activePart.id === "payload" ? " · เจาะลึกในโมดูล 2" : ""}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-1 w-full rounded-2xl py-3.5 text-[13px] font-semibold bg-cyan-400 text-[#041018] hover:bg-cyan-300 transition-colors"
      >
        รู้จักประเภทภารกิจ →
      </button>

      <div className="flex gap-1.5">
        {(["GEO", "MEO", "LEO"] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onJumpBand(b)}
            className="flex-1 rounded-xl py-2 text-[11px] font-semibold border border-white/10 text-white/40 hover:text-white/70"
            style={{ color: undefined }}
          >
            <span style={{ color: BAND_META[b].defaultColor }}>{b}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TypesStep({
  onGoPlayground,
}: {
  onGoPlayground: (band: "GEO" | "MEO" | "LEO") => void;
}) {
  const [picked, setPicked] = useState<MissionType | null>(null);
  const card = MODULE1_TYPE_CARDS.find((c) => c.mission === picked);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {MODULE1_TYPE_CARDS.map((c) => {
          const on = picked === c.mission;
          return (
            <button
              key={c.mission}
              type="button"
              onClick={() => setPicked(c.mission)}
              className={`text-left rounded-2xl px-3 py-3 transition-all duration-200 ${
                on
                  ? "bg-white text-[#0a1220] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                  : "bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.07]"
              }`}
            >
              <div className="text-[13px] font-semibold">{c.short}</div>
              <div
                className={`text-[10px] mt-1 font-medium ${
                  on ? "text-black/45" : "text-white/35"
                }`}
              >
                → {c.orbit}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className={`rounded-2xl px-3.5 py-3 min-h-[72px] transition-all ${
          card
            ? "bg-white/[0.06] border border-white/15"
            : "border border-dashed border-white/10"
        }`}
      >
        {card ? (
          <>
            <div className="text-[12px] text-white/75">{card.everyday}</div>
            <button
              type="button"
              onClick={() => onGoPlayground(card.orbit as "GEO" | "MEO" | "LEO")}
              className="mt-2 text-[12px] font-semibold"
              style={{ color: BAND_META[card.orbit].defaultColor }}
            >
              ลองในวง {card.orbit} →
            </button>
          </>
        ) : (
          <div className="text-[12px] text-white/30">กดการ์ดเพื่อเปิดตัวอย่าง</div>
        )}
      </div>

      <div className="rounded-2xl px-3.5 py-3 bg-amber-500/10 border border-amber-400/20">
        <div className="text-[11px] text-amber-100/80 leading-snug">
          มักคิดว่าราคาแพงขนาดรถบัส — ความจริงหลายดวงเล็กเท่ากล่องรองเท้า
        </div>
      </div>
    </div>
  );
}
