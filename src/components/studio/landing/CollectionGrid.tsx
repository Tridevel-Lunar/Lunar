import { useNavigate } from "react-router-dom";
import { HiOutlinePlus } from "react-icons/hi2";

import type { CollectionEntry } from "@/components/studio/data/studio-data";
import {
  TypeBadge,
  formatStudioDate,
} from "@/components/studio/shared/studio-shared";
import { collectionHasLaika } from "@/lib/studio-storage";

/** Grid of saved collections on the Studio landing page. */

function CollectionCard({ entry }: { entry: CollectionEntry }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/studio/chat/${entry.id}`)}
      className="flex h-full min-h-[120px] cursor-pointer flex-col rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition hover:border-amber/35 hover:bg-amber/[0.04]"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <TypeBadge type={entry.type} />
        <span className="font-mono text-[0.55rem] text-muted">
          {formatStudioDate(entry.updatedAt)}
        </span>
      </div>
      <p className="font-section-thai mb-1 line-clamp-1 text-[0.92rem] font-medium text-text">
        {entry.title}
      </p>
      <p className="font-section-thai line-clamp-2 flex-1 text-[0.8rem] leading-relaxed text-text/65">
        {entry.content}
      </p>
      <p className="font-mono mt-2 text-[0.55rem] text-muted">
        {collectionHasLaika(entry) ? (
          <span className="text-cyan">✦ LAIKA</span>
        ) : (
          "ยังไม่ถาม LAIKA"
        )}
      </p>
    </button>
  );
}

function NewCollectionCard() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/studio/new")}
      className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-amber/30 bg-amber/[0.03] p-4 text-center transition hover:border-amber/50 hover:bg-amber/[0.06]"
    >
      <HiOutlinePlus className="mb-2 text-2xl text-amber" />
      <p className="font-mono text-[0.62rem] tracking-[0.14em] text-amber">NEW</p>
      <p className="font-section-thai mt-1 text-[0.8rem] text-text/70">สร้าง collection</p>
    </button>
  );
}

type CollectionGridProps = {
  collections: CollectionEntry[];
};

export default function CollectionGrid({ collections }: CollectionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((entry) => (
        <CollectionCard key={entry.id} entry={entry} />
      ))}
      <NewCollectionCard />
    </div>
  );
}
