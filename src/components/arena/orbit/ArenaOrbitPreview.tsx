import { Canvas } from "@react-three/fiber";

import ArenaOrbitScene from "./ArenaOrbitScene";
import OrbitPreviewErrorBoundary from "./OrbitPreviewErrorBoundary";
import type { ArenaOrbitPreviewSample } from "./types";

export type { ArenaOrbitPreviewSample } from "./types";

export type ArenaOrbitPreviewProps = {
  sample: ArenaOrbitPreviewSample | null;
  /** Visual tilt only. Not used for grading. */
  inclinationDeg?: number;
  className?: string;
};

function Fallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md border border-white/[0.06] bg-[#02060f] font-section-thai text-[0.72rem] text-text/45 ${className ?? ""}`}
    >
      แสดงภาพ 3 มิติไม่ได้ — ใช้แถบวงโคจรด้านบนแทน
    </div>
  );
}

/** Replay-only 3D orbit view. Driven by a sample; does not run physics or grade. */
export default function ArenaOrbitPreview({
  sample,
  inclinationDeg = 51,
  className,
}: ArenaOrbitPreviewProps) {
  if (!sample) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border border-white/[0.06] bg-[#02060f] font-section-thai text-[0.72rem] text-text/45 ${className ?? ""}`}
      >
        ไม่มีข้อมูลวงโคจร
      </div>
    );
  }

  return (
    <OrbitPreviewErrorBoundary fallback={<Fallback className={className} />}>
      <div className={`relative h-full min-h-[160px] overflow-hidden rounded-md border border-white/[0.06] ${className ?? ""}`}>
        <Canvas
          frameloop="demand"
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
          camera={{ position: [2.8, 2.2, 4.4], fov: 38, near: 0.1, far: 40 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.setClearColor("#02060f");
          }}
          aria-label="ภาพวงโคจรสามมิติ"
        >
          <ArenaOrbitScene sample={sample} inclinationDeg={inclinationDeg} />
        </Canvas>
      </div>
    </OrbitPreviewErrorBoundary>
  );
}
