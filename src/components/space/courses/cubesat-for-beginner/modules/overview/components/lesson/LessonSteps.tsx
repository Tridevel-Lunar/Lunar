import { useState } from "react";
import {
  DAILY_HOOKS,
  MODULE1_TYPE_CARDS,
  SAT_PARTS,
} from "../../lib/tour";
import { MissionType } from "../../lib/missions";

export function IntroStep({
  onHookOpened,
}: {
  onHookOpened?: () => void;
}) {
  const [hook, setHook] = useState<string | null>(null);
  const [part, setPart] = useState<string | null>(null);
  const activeHook = DAILY_HOOKS.find((h) => h.id === hook);
  const activePart = SAT_PARTS.find((p) => p.id === part);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {DAILY_HOOKS.map((h) => {
          const on = hook === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => {
                setHook(h.id);
                onHookOpened?.();
              }}
              className={`cursor-pointer rounded-2xl px-2 py-4 text-center transition-all duration-300 ${
                on
                  ? "scale-[1.02] bg-cyan-400 text-[#041018] shadow-[0_0_28px_rgba(34,211,238,0.35)]"
                  : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
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
            ? "border border-cyan-400/35 bg-cyan-500/15 text-cyan-50"
            : "border border-dashed border-white/10 bg-white/[0.02] text-white/30"
        }`}
      >
        <div className="text-[12px] leading-snug">
          {activeHook ? activeHook.reveal : "เลือกด้านบนเพื่อเปิดคำตอบ"}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[10px] tracking-[0.14em] text-white/30 uppercase">
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
                className={`cursor-pointer rounded-xl px-1 py-2.5 text-[11px] font-medium transition-colors ${
                  on
                    ? "bg-white text-[#0a1220]"
                    : "border border-white/10 bg-white/[0.04] text-white/55 hover:text-white/80"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        {activePart && (
          <p className="mt-2 px-0.5 text-[12px] text-white/50">
            {activePart.hint}
            {activePart.id === "payload" ? " · เจาะลึกในโมดูล 2" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export function TypesStep({
  onCardsOpenedCount,
  onFocusBand,
}: {
  onCardsOpenedCount?: (count: number) => void;
  onFocusBand?: (band: "GEO" | "MEO" | "LEO") => void;
}) {
  const [opened, setOpened] = useState<Set<MissionType>>(new Set());
  const [picked, setPicked] = useState<MissionType | null>(null);
  const card = MODULE1_TYPE_CARDS.find((c) => c.mission === picked);

  function pick(mission: MissionType) {
    setPicked(mission);
    setOpened((prev) => {
      if (prev.has(mission)) return prev;
      const next = new Set(prev);
      next.add(mission);
      onCardsOpenedCount?.(next.size);
      return next;
    });
    const c = MODULE1_TYPE_CARDS.find((x) => x.mission === mission);
    if (c && onFocusBand) {
      onFocusBand(c.orbit as "GEO" | "MEO" | "LEO");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {MODULE1_TYPE_CARDS.map((c) => {
          const on = picked === c.mission;
          const visited = opened.has(c.mission);
          return (
            <button
              key={c.mission}
              type="button"
              onClick={() => pick(c.mission)}
              className={`cursor-pointer rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                on
                  ? "bg-white text-[#0a1220] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                  : visited
                    ? "border border-cyan-400/25 bg-cyan-500/10 text-white/85"
                    : "border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.07]"
              }`}
            >
              <div className="text-[13px] font-semibold">{c.short}</div>
              <div
                className={`mt-1 text-[10px] font-medium ${
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
        className={`min-h-[72px] rounded-2xl px-3.5 py-3 transition-all ${
          card
            ? "border border-white/15 bg-white/[0.06]"
            : "border border-dashed border-white/10"
        }`}
      >
        {card ? (
          <div className="text-[12px] text-white/75">{card.everyday}</div>
        ) : (
          <div className="text-[12px] text-white/30">กดการ์ดเพื่อเปิดตัวอย่าง</div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3.5 py-3">
        <div className="text-[11px] leading-snug text-amber-100/80">
          มักคิดว่าราคาแพงขนาดรถบัส ความจริงหลายดวงเล็กเท่ากล่องรองเท้า
        </div>
      </div>
    </div>
  );
}
