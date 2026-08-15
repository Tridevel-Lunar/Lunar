import { sectorAccent } from "./sectorAccent";
import type { CatalogFolder } from "./types";

type Props = {
  folder: CatalogFolder;
  index: number;
  /** Top-level sector ids for accent inheritance. */
  trailIds?: string[];
  /** Larger tiles at catalog root. */
  size?: "sector" | "folder";
  onOpen: () => void;
};

export default function CatalogFolderTile({
  folder,
  index,
  trailIds = [],
  size = "folder",
  onOpen,
}: Props) {
  const accent = sectorAccent(folder.id, trailIds);
  const isSector = size === "sector";
  const code = String(index + 1).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative w-full cursor-pointer overflow-hidden text-left backdrop-blur-md transition ${
        isSector
          ? "min-h-[148px] rounded-2xl border border-white/[0.12] p-5"
          : "rounded-xl border border-white/[0.1] p-4"
      }`}
      style={{
        background: `linear-gradient(145deg, ${accent}18 0%, rgba(6,14,28,0.72) 48%, rgba(3,8,18,0.78) 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at 20% 0%, ${accent}22, transparent 55%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-60 transition group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        aria-hidden
      />

      <div className="relative z-[1] flex h-full flex-col">
        <span
          className="font-mono mb-3 text-[0.62rem] tracking-[0.22em]"
          style={{ color: accent }}
        >
          {code}
        </span>

        <h3
          className={`font-thai font-semibold tracking-wide text-text ${
            isSector ? "text-[1.15rem]" : "text-[1rem]"
          }`}
        >
          {folder.title}
        </h3>
        <p className="font-thai mt-1 text-[0.95rem] font-medium text-text/70">{folder.titleTh}</p>
        <p
          className={`font-section-thai mt-2 leading-relaxed text-text/42 ${
            isSector ? "line-clamp-2 text-[0.8rem]" : "line-clamp-2 text-[0.74rem]"
          }`}
        >
          {folder.summary}
        </p>

        <div className="mt-auto flex justify-end pt-4">
          <span
            className="text-xl transition group-hover:translate-x-0.5"
            style={{ color: accent }}
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </button>
  );
}
