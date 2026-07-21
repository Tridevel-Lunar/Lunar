import { Html, useProgress } from "@react-three/drei";

import { hudPanel } from "../lib/hudStyles";

export type OverviewSceneVariant = "orbit" | "museum";

type OverviewSceneLoaderProps = {
  variant?: OverviewSceneVariant;
  progress?: number;
  className?: string;
};

export default function OverviewSceneLoader({
  variant = "orbit",
  progress,
  className = "",
}: OverviewSceneLoaderProps) {
  const isMuseum = variant === "museum";
  const accent = isMuseum ? "#ffb870" : "#22d3ee";
  const title = isMuseum ? "พิพิธภัณฑ์ดาวเทียม" : "วงโคจรและโลก";

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-4 ${
        isMuseum ? "bg-[#050508]" : "bg-[#05070d]"
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`กำลังโหลด${title}`}
    >
      <div className="relative h-11 w-11" aria-hidden>
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: accent,
            borderRightColor: `${accent}99`,
          }}
        />
      </div>

      <div className={`max-w-[260px] text-center ${hudPanel}`}>
        <p
          className="font-mono text-[0.62rem] tracking-wider uppercase"
          style={{ color: accent }}
        >
          {isMuseum ? "Museum" : "Orbit view"}
        </p>
        <p className="mt-1 font-section-thai text-[0.78rem] leading-snug text-white/70">
          กำลังโหลด{title}…
        </p>
        {progress !== undefined && (
          <>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  backgroundColor: accent,
                }}
              />
            </div>
            <p className="mt-1 font-mono text-[0.58rem] text-white/40">
              {Math.round(progress)}%
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** In-canvas overlay while GLB / texture assets stream in. */
export function CanvasLoadOverlay({
  variant = "orbit",
}: {
  variant?: OverviewSceneVariant;
}) {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <Html
      fullscreen
      zIndexRange={[100, 0]}
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <OverviewSceneLoader variant={variant} progress={progress} />
    </Html>
  );
}
