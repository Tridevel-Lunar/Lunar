import { useMemo, useState } from "react";
import {
  CUBESAT_EMOTION,
  CUBESAT_SIZES,
  CUBESAT_THAI,
  CUBESAT_WHYS,
  CubeSatSize,
  MODULE1_CLOSING,
} from "../lib/tour";

interface CubeSatSizeBuilderProps {
  onSelectKnacksat?: () => void;
  /** Fires when the learner changes size away from the initial 1U. */
  onSizeChanged?: () => void;
}

export default function CubeSatSizeBuilder({
  onSelectKnacksat,
  onSizeChanged,
}: CubeSatSizeBuilderProps) {
  const [sizeId, setSizeId] = useState<CubeSatSize>("1U");
  const [why, setWhy] = useState<string | null>(null);
  const size = useMemo(
    () => CUBESAT_SIZES.find((s) => s.id === sizeId) ?? CUBESAT_SIZES[0],
    [sizeId]
  );
  const whyCard = CUBESAT_WHYS.find((w) => w.id === why);

  const cell = 26;
  const gap = 4;
  const pad = 20;
  const cols = size.widthU;
  const rows = size.depthU;
  const stack = size.unitsAlong;
  const stackH = stack * cell + (stack - 1) * gap;
  const faceW = cols * cell + (cols - 1) * gap;
  const faceD = rows * cell + (rows - 1) * gap;
  const svgW = faceW + faceD * 0.45 + pad * 2 + 24;
  const svgH = stackH + faceD * 0.35 + pad * 2 + 20;

  const blocks: { x: number; y: number; z: number }[] = [];
  for (let z = 0; z < stack; z++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        blocks.push({ x, y, z });
      }
    }
  }
  const sorted = [...blocks].sort(
    (a, b) => a.y + a.z - (b.y + b.z) || a.x - b.x
  );

  const project = (x: number, y: number, z: number) => ({
    px: pad + x * (cell + gap) + y * (cell * 0.4),
    py: pad + 8 + (stack - 1 - z) * (cell + gap) + y * (cell * 0.28),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-2 px-0.5">
        <div>
          <div className="text-[15px] font-semibold text-white tracking-tight">
            Build Your Size
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">
            มาตรฐาน U · เหมือนเลโก้
          </div>
        </div>
        {onSelectKnacksat && (
          <button
            type="button"
            onClick={onSelectKnacksat}
            className="text-[11px] font-medium text-emerald-300/90 hover:text-emerald-200"
          >
            KNACKSAT-2 ↗
          </button>
        )}
      </div>

      <div className="flex gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
        {CUBESAT_SIZES.map((s) => {
          const on = s.id === sizeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id === sizeId) return;
                setSizeId(s.id);
                if (s.id !== "1U") onSizeChanged?.();
              }}
              className={`flex-1 cursor-pointer rounded-xl py-2.5 text-[13px] font-bold transition-all duration-300 ${
                on
                  ? "bg-emerald-400 text-[#042016] shadow-[0_0_24px_rgba(52,211,153,0.4)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {s.id}
            </button>
          );
        })}
      </div>

      <div className="relative h-48 rounded-2xl bg-[#03060c] border border-white/10 overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 70%, rgba(52,211,153,0.2), transparent 55%)",
          }}
        />
        <svg
          key={sizeId}
          width={svgW}
          height={svgH}
          className="relative transition-all duration-500 ease-out"
          style={{ maxHeight: "92%", maxWidth: "92%" }}
        >
          {sorted.map((b, i) => {
            const { px, py } = project(b.x, b.y, b.z);
            const shade = 0.55 + b.y * 0.12 + b.z * 0.04;
            return (
              <g
                key={`${b.x}-${b.y}-${b.z}`}
                style={{
                  animation: `cubePop 0.4s cubic-bezier(.2,.8,.2,1) ${i * 0.045}s both`,
                }}
              >
                <path
                  d={`M${px} ${py} L${px + cell} ${py} L${px + cell + cell * 0.4} ${py + cell * 0.28} L${px + cell * 0.4} ${py + cell * 0.28} Z`}
                  fill={`rgba(110,231,183,${0.4 * shade})`}
                  stroke="rgba(167,243,208,0.75)"
                  strokeWidth="0.8"
                />
                <rect
                  x={px}
                  y={py + cell * 0.28}
                  width={cell}
                  height={cell}
                  rx={3}
                  fill={`rgba(52,211,153,${0.62 * shade})`}
                  stroke="rgba(167,243,208,0.9)"
                  strokeWidth="1"
                />
                <path
                  d={`M${px + cell} ${py + cell * 0.28} L${px + cell + cell * 0.4} ${py} L${px + cell + cell * 0.4} ${py + cell} L${px + cell} ${py + cell + cell * 0.28} Z`}
                  fill={`rgba(16,185,129,${0.45 * shade})`}
                  stroke="rgba(110,231,183,0.55)"
                  strokeWidth="0.7"
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-2.5 left-3 right-3 flex justify-between text-[11px] font-mono text-emerald-200/70">
          <span>{size.dimsCm} ซม.</span>
          <span>{size.mass}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2.5">
          <div className="text-[9px] uppercase tracking-wider text-white/30">
            เทียบ
          </div>
          <div className="text-[13px] text-white/85 mt-0.5">{size.analogy}</div>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2.5">
          <div className="text-[9px] uppercase tracking-wider text-white/30">
            ได้อะไรเพิ่ม
          </div>
          <div className="text-[13px] text-white/85 mt-0.5">
            {size.capability}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-white/35 px-0.5 leading-snug">
        ยิ่ง U เยอะ ยิ่งมีที่ว่าง — แต่ต้นทุนสูงขึ้น · deployer ยังตัวเดิม
      </p>

      <div className="flex gap-1.5">
        {CUBESAT_WHYS.map((w) => {
          const on = why === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setWhy(on ? null : w.id)}
              className={`flex-1 rounded-xl py-2 text-[11px] font-semibold transition-colors ${
                on
                  ? "bg-white text-[#0a1220]"
                  : "bg-white/[0.04] border border-white/10 text-white/50"
              }`}
            >
              {w.title}
            </button>
          );
        })}
      </div>
      {whyCard && (
        <div className="rounded-xl px-3 py-2.5 bg-white/[0.05] border border-white/10 text-[12px] text-white/65">
          {whyCard.body}
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {CUBESAT_THAI.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={onSelectKnacksat}
            className="shrink-0 rounded-xl px-3 py-2 bg-emerald-500/10 border border-emerald-400/20 text-left"
          >
            <div className="text-[12px] font-semibold text-emerald-300">
              {t.name}
            </div>
            <div className="text-[10px] text-white/40 mt-0.5">{t.note}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl px-3.5 py-3.5 bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 border border-cyan-400/25">
        <p className="text-[12px] text-white/80 leading-relaxed italic">
          “{CUBESAT_EMOTION}”
        </p>
        <p className="text-[11px] text-cyan-200/70 mt-2 font-medium">
          {MODULE1_CLOSING}
        </p>
      </div>

      <style>{`
        @keyframes cubePop {
          from { opacity: 0; transform: translateY(10px) scale(0.88); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
