import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlinePlus } from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import CollectionGrid from "@/components/studio/landing/CollectionGrid";
import LaikaHeroGreeting from "@/components/studio/landing/LaikaHeroGreeting";
import StarField from "@/components/studio/landing/StarField";
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
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 relative overflow-clip">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06)_0%,transparent_60%)]" aria-hidden />
            <StarField />
            <LaikaHeroGreeting
              collectionsReady={!loading}
              hasCollections={collections.length > 0}
            />
          </div>

          <section className="shrink-0 border-t border-white/[0.06] px-5 py-5">
            <div className="mx-auto max-w-[960px]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-mono text-[0.72rem] tracking-[0.18em] text-muted">
                  COLLECTION ({loading ? "…" : collections.length})
                </h2>
                <Link
                  to="/studio/new"
                  className="font-mono inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber/35 bg-amber/[0.08] px-2.5 py-1 text-[0.62rem] tracking-[0.14em] text-amber no-underline transition hover:border-amber/55 hover:bg-amber/[0.14]"
                >
                  <HiOutlinePlus className="text-sm" />
                  NEW
                </Link>
              </div>
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
