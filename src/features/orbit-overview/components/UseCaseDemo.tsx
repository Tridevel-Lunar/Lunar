import { useEffect, useMemo, useRef, useState } from "react";
import { UseCaseDef, UseCaseDemoKind } from "@/features/orbit-overview/lib/useCases";

interface UseCaseDemoProps {
  useCase: UseCaseDef | null;
  playing: boolean;
  onDone: () => void;
}

export default function UseCaseDemo({
  useCase,
  playing,
  onDone,
}: UseCaseDemoProps) {
  const [phase, setPhase] = useState<"idle" | "run" | "result">("idle");

  useEffect(() => {
    if (!useCase) {
      setPhase("idle");
      return;
    }
    if (!playing) return;
    setPhase("run");
    const t = window.setTimeout(() => {
      setPhase("result");
      onDone();
    }, 2200);
    return () => clearTimeout(t);
  }, [playing, useCase, onDone]);

  // New use case selected without autoplay → show idle stage
  useEffect(() => {
    if (useCase && !playing) {
      setPhase((p) => (p === "result" ? "result" : "idle"));
    }
  }, [useCase, playing]);

  if (!useCase) {
    return (
      <div className="h-36 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[11px] text-white/30">
        เลือก use case เพื่อทดลอง
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-[#050810]">
      <div className="h-44 relative">
        {useCase.demo === "starlink_mesh" && (
          <StarlinkMeshDemo active={phase !== "idle"} />
        )}
        {useCase.demo === "earth_photo" && (
          <EarthPhotoDemo active={phase !== "idle"} done={phase === "result"} />
        )}
        {useCase.demo === "gps_fix" && (
          <GpsFixDemo active={phase !== "idle"} done={phase === "result"} />
        )}
        {useCase.demo === "geo_beam" && (
          <GeoBeamDemo active={phase !== "idle"} done={phase === "result"} />
        )}
        {useCase.demo === "heo_polar" && (
          <HeoPolarDemo active={phase !== "idle"} done={phase === "result"} />
        )}
        {useCase.demo === "tv_dish" && (
          <TvDishDemo active={phase !== "idle"} done={phase === "result"} />
        )}

        {phase === "run" && (
          <div className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 animate-pulse">
            กำลังจำลอง…
          </div>
        )}
      </div>

      {phase === "result" && (
        <div className="px-3 py-2.5 border-t border-emerald-500/25 bg-emerald-500/10">
          <div className="text-[12px] font-semibold text-emerald-300">
            ✓ {useCase.resultTitle}
          </div>
          <div className="text-[11px] text-emerald-100/70 mt-0.5 leading-snug">
            {useCase.resultBody}
          </div>
        </div>
      )}
    </div>
  );
}

function StarlinkMeshDemo({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nodes = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 38 + (i % 3) * 18;
      pts.push({
        x: 50 + Math.cos(a) * r * 0.9,
        y: 50 + Math.sin(a) * r * 0.55,
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Earth glow
      const g = ctx.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, 70);
      g.addColorStop(0, "rgba(59,130,246,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 28, 0, Math.PI * 2);
      ctx.fillStyle = "#12355a";
      ctx.fill();
      ctx.strokeStyle = "rgba(110,180,255,0.4)";
      ctx.stroke();

      const progress = active ? Math.min(1, t / 1.6) : 0;

      // Laser links
      ctx.lineWidth = 1.2;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const b = nodes[(i + 3) % nodes.length];
        const edgeProg = Math.max(0, Math.min(1, progress * nodes.length - i));
        if (edgeProg <= 0) continue;
        const x2 = a.x + (b.x - a.x) * edgeProg;
        const y2 = a.y + (b.y - a.y) * edgeProg;
        const grad = ctx.createLinearGradient(
          (a.x / 100) * w,
          (a.y / 100) * h,
          (x2 / 100) * w,
          (y2 / 100) * h
        );
        grad.addColorStop(0, "rgba(34,211,238,0.05)");
        grad.addColorStop(0.5, "rgba(125,255,255,0.95)");
        grad.addColorStop(1, "rgba(34,211,238,0.05)");
        ctx.strokeStyle = grad;
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo((a.x / 100) * w, (a.y / 100) * h);
        ctx.lineTo((x2 / 100) * w, (y2 / 100) * h);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Sats
      for (let i = 0; i < nodes.length; i++) {
        if (i / nodes.length > progress && active) continue;
        if (!active && i > 0) continue;
        const n = nodes[i];
        const x = (n.x / 100) * w;
        const y = (n.y / 100) * h;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "#e0f7ff";
        ctx.fill();
      }

      // WiFi success pulse
      if (progress > 0.85) {
        const pulse = 0.5 + Math.sin(t * 6) * 0.5;
        ctx.strokeStyle = `rgba(52,211,153,${0.35 + pulse * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 34 + pulse * 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, nodes]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={280}
      className="w-full h-full"
    />
  );
}

function EarthPhotoDemo({
  active,
  done,
}: {
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#071018]">
      {/* Fake Earth surface viewport */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ${
          active ? "scale-110" : "scale-100"
        }`}
        style={{
          background:
            "radial-gradient(circle at 40% 35%, #2a6b3f 0%, #1a4a70 35%, #0c2640 60%, #050810 100%)",
        }}
      >
        <div className="absolute left-[18%] top-[30%] w-[28%] h-[18%] rounded-[40%] bg-emerald-700/50 blur-[1px]" />
        <div className="absolute left-[48%] top-[42%] w-[22%] h-[14%] rounded-[40%] bg-amber-800/40" />
        <div className="absolute left-[30%] top-[55%] w-[40%] h-[12%] rounded-full bg-sky-600/30 blur-sm" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(white 0.5px, transparent 0.5px)", backgroundSize: "18px 18px" }} />
      </div>

      {/* Camera viewfinder */}
      <div className="absolute inset-4 border border-white/25 rounded-lg pointer-events-none">
        <div className="absolute top-2 left-2 text-[10px] text-white/60 font-mono">
          LEO CAM · 0.5 m/px
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/40" />
      </div>

      {/* Shutter flash */}
      {active && !done && (
        <div className="absolute inset-0 bg-white animate-[pulse_0.4s_ease-out]" />
      )}

      {done && (
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 text-[10px] text-emerald-300 border border-emerald-500/30">
          CAPTURED ✓
        </div>
      )}
    </div>
  );
}

function GpsFixDemo({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="w-full h-full relative bg-[#050810] overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        {/* Ground */}
        <ellipse cx="100" cy="95" rx="70" ry="10" fill="#1a2a3a" />
        <circle cx="100" cy="88" r="4" fill="#fbbf24" />
        <text x="100" y="108" textAnchor="middle" fill="#94a3b8" fontSize="6">
          receiver
        </text>

        {/* Satellites */}
        {[
          [40, 28],
          [100, 18],
          [160, 30],
          [55, 50],
        ].map(([x, y], i) => {
          const show = !active || i / 4 < 1;
          const beam = active;
          return (
            <g key={i} opacity={show ? 1 : 0.2}>
              {beam && (
                <line
                  x1={x}
                  y1={y}
                  x2="100"
                  y2="88"
                  stroke="#a78bfa"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity={0.7}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="20"
                    to="0"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </line>
              )}
              <rect
                x={x - 4}
                y={y - 2}
                width="8"
                height="4"
                rx="1"
                fill="#c4b5fd"
              />
            </g>
          );
        })}

        {done && (
          <g>
            <circle
              cx="100"
              cy="88"
              r="12"
              fill="none"
              stroke="#34d399"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <text
              x="100"
              y="70"
              textAnchor="middle"
              fill="#6ee7b7"
              fontSize="7"
              fontFamily="monospace"
            >
              13.7563° N, 100.5018° E
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function GeoBeamDemo({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="w-full h-full relative bg-[#050810] overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <circle cx="100" cy="80" r="28" fill="#12355a" stroke="#3b82f6" strokeWidth="1" />
        {/* GEO sat */}
        <rect x="92" y="18" width="16" height="8" rx="1" fill="#fbbf24" />
        <line x1="88" y1="22" x2="80" y2="22" stroke="#fde68a" strokeWidth="1.5" />
        <line x1="112" y1="22" x2="120" y2="22" stroke="#fde68a" strokeWidth="1.5" />

        {/* Beam cone */}
        <path
          d="M100 26 L70 78 L130 78 Z"
          fill={active ? "rgba(251,191,36,0.18)" : "rgba(251,191,36,0.05)"}
          stroke="#f59e0b"
          strokeWidth="0.8"
          opacity={active ? 1 : 0.4}
        />

        {/* Coverage disk */}
        <ellipse
          cx="100"
          cy="78"
          rx={active ? 32 : 20}
          ry={active ? 12 : 8}
          fill="rgba(251,191,36,0.25)"
          stroke="#fbbf24"
          strokeWidth="0.8"
        />

        {/* Dish on ground */}
        <path d="M155 90 Q160 80 165 90" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="160" y1="90" x2="160" y2="100" stroke="#64748b" strokeWidth="1.5" />

        {done && (
          <text x="100" y="14" textAnchor="middle" fill="#fde68a" fontSize="7">
            LIVE 24h · STORM TRACK
          </text>
        )}
      </svg>

      {done && (
        <div className="absolute bottom-2 left-2 right-2 h-8 rounded overflow-hidden border border-amber-500/30">
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, #1e3a5f, #3b82f6 30%, #f59e0b 55%, #ef4444 70%, #1e3a5f)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white/90">
            infrared cloud loop
          </div>
        </div>
      )}
    </div>
  );
}

function TvDishDemo({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="w-full h-full relative bg-[#050810] overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <circle
          cx="100"
          cy="78"
          r="26"
          fill="#12355a"
          stroke="#3b82f6"
          strokeWidth="1"
        />
        {/* GEO sat — fixed in sky */}
        <g>
          <rect x="92" y="16" width="16" height="7" rx="1" fill="#fbbf24" />
          <line
            x1="88"
            y1="19.5"
            x2="80"
            y2="19.5"
            stroke="#fde68a"
            strokeWidth="1.5"
          />
          <line
            x1="112"
            y1="19.5"
            x2="120"
            y2="19.5"
            stroke="#fde68a"
            strokeWidth="1.5"
          />
          <text x="100" y="12" textAnchor="middle" fill="#fde68a" fontSize="5">
            GEO · fixed
          </text>
        </g>

        {/* Signal beam */}
        <line
          x1="100"
          y1="23"
          x2="148"
          y2="88"
          stroke={active ? "#67e8f9" : "#334155"}
          strokeWidth="1.2"
          strokeDasharray="4 2"
          opacity={active ? 0.9 : 0.35}
        >
          {active && (
            <animate
              attributeName="stroke-dashoffset"
              from="24"
              to="0"
              dur="0.7s"
              repeatCount="indefinite"
            />
          )}
        </line>

        {/* Home dish — locked, no rotation */}
        <g transform="translate(148, 88)">
          <path
            d="M-10 0 Q0 -14 10 0"
            fill="none"
            stroke={done ? "#34d399" : "#94a3b8"}
            strokeWidth="2.5"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <circle cx="0" cy="-2" r="1.5" fill="#e2e8f0" />
        </g>

        <text x="148" y="110" textAnchor="middle" fill="#94a3b8" fontSize="5.5">
          จานบ้าน · ไม่ต้องหมุน
        </text>

        {done && (
          <text x="55" y="55" fill="#6ee7b7" fontSize="6.5" fontFamily="monospace">
            LOCKED ✓
          </text>
        )}
      </svg>
    </div>
  );
}

function HeoPolarDemo({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="w-full h-full relative bg-[#050810]">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <ellipse
          cx="100"
          cy="60"
          rx="55"
          ry="28"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray={active ? "0" : "4 3"}
          opacity="0.7"
        />
        <circle cx="100" cy="60" r="20" fill="#12355a" stroke="#3b82f6" />
        {/* North pole highlight */}
        <ellipse
          cx="100"
          cy="48"
          rx="10"
          ry="5"
          fill={done ? "rgba(52,211,153,0.55)" : "rgba(52,211,153,0.15)"}
          stroke="#6ee7b7"
          strokeWidth="0.8"
        />
        <text x="100" y="50" textAnchor="middle" fill="#a7f3d0" fontSize="5">
          N
        </text>

        {/* Sat at apogee */}
        <circle
          cx={active ? 100 : 150}
          cy={active ? 32 : 60}
          r="4"
          fill="#34d399"
        >
          {active && (
            <animate
              attributeName="cy"
              values="60;32;32"
              dur="1.5s"
              fill="freeze"
            />
          )}
        </circle>
        {done && (
          <text x="100" y="24" textAnchor="middle" fill="#6ee7b7" fontSize="6">
            long dwell @ apogee
          </text>
        )}
      </svg>
    </div>
  );
}

// silence unused type import if tree-shaken
void (0 as unknown as UseCaseDemoKind);
