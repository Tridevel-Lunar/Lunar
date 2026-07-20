import { BAND_META, ORBIT_BANDS } from "@/features/orbit-overview/lib/types";

/** Optional legend — not overlaid on the sim by default. */
export default function Legend() {
  return (
    <div className="flex items-center gap-6 text-sm flex-wrap">
      {ORBIT_BANDS.map((band) => {
        const meta = BAND_META[band];
        return (
          <div key={band} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: meta.defaultColor }}
            />
            <div className="leading-tight">
              <div className="font-semibold">{meta.label}</div>
              <div className="text-xs text-white/50">{meta.subtitleTh}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
