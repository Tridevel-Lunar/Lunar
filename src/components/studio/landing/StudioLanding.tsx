import { useEffect, useState } from "react";
import { IoRocketOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import CollectionGrid from "@/components/studio/landing/CollectionGrid";
import LaikaHeroGreeting from "@/components/studio/landing/LaikaHeroGreeting";
import type { CollectionEntry } from "@/components/studio/data/studio-data";
import { ApiError } from "@/lib/api";
import { listCollections } from "@/lib/studio-storage";
import type { User } from "@/lib/api";

/** Studio home — collection list and LAIKA greeting hero. */

type StudioLandingProps = {
  user: User;
};

export default function StudioLanding({ user }: StudioLandingProps) {
  const [collections, setCollections] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const items = await listCollections();
        if (!cancelled) setCollections(items);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "โหลด collections ไม่สำเร็จ",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="studio" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5 py-3">
          <IoRocketOutline className="text-xl text-amber" />
          <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">
            STUDIO
          </h1>
        </header>

        <main className="flex min-h-0 flex-1 flex-col justify-center-safe overflow-auto">
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
            <LaikaHeroGreeting
              collectionsReady={!loading}
              hasCollections={collections.length > 0}
            />
          </div>

          <section className="shrink-0 border-t border-white/[0.06] px-5 py-5">
            <div className="mx-auto max-w-[960px]">
              <h2 className="font-mono mb-3 text-[0.72rem] tracking-[0.18em] text-muted">
                COLLECTION ({loading ? "…" : collections.length})
              </h2>
              {error ? (
                <p className="font-section-thai text-[0.85rem] text-red-400/90">{error}</p>
              ) : loading ? (
                <p className="font-mono text-[0.62rem] tracking-wider text-muted">กำลังโหลด…</p>
              ) : (
                <CollectionGrid collections={collections} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
