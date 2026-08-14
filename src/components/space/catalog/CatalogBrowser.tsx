import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { getSpaceCatalog, type SpaceCatalog } from "@/lib/api";
import { getCourse } from "@/components/space/core/registry";
import { useSpaceProgress } from "@/components/space/hooks/useSpaceProgress";

import CatalogCourseCard from "./CatalogCourseCard";
import CatalogFolderTile from "./CatalogFolderTile";
import { sectorAccent } from "./sectorAccent";
import {
  breadcrumbTo,
  findNode,
  isCatalogCourse,
  isCatalogFolder,
  type CatalogFolder,
  type CatalogNode,
} from "./types";

/** `null` = catalog root (shows top-level sectors). */
type CurrentId = string | null;

export default function CatalogBrowser() {
  const [catalog, setCatalog] = useState<SpaceCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<CurrentId>(null);
  const { courseProgressPercent } = useSpaceProgress();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getSpaceCatalog()
      .then((data) => {
        if (cancelled) return;
        setCatalog(data);
        setCurrentId(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "โหลดคลังคอร์สไม่สำเร็จ");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentFolder = useMemo((): CatalogFolder | null => {
    if (!catalog || currentId == null) return null;
    const node = findNode(catalog.nodes, currentId);
    return node && isCatalogFolder(node) ? node : null;
  }, [catalog, currentId]);

  const children = useMemo((): CatalogNode[] => {
    if (!catalog) return [];
    if (currentId == null) return catalog.nodes;
    return currentFolder?.children ?? [];
  }, [catalog, currentId, currentFolder]);

  const crumbs = useMemo((): CatalogFolder[] => {
    if (!catalog || currentId == null) return [];
    return breadcrumbTo(catalog.nodes, currentId) ?? [];
  }, [catalog, currentId]);

  const trailIds = useMemo(() => crumbs.map((c) => c.id), [crumbs]);

  const parentId: CurrentId = useMemo(() => {
    if (crumbs.length <= 1) return null;
    return crumbs[crumbs.length - 2]?.id ?? null;
  }, [crumbs]);

  const accent = currentFolder
    ? sectorAccent(currentFolder.id, trailIds)
    : "#00e5ff";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="font-mono text-[0.72rem] tracking-wider text-muted">กำลังโหลด…</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6">
        <p className="font-section-thai text-[0.9rem] text-red-400/90">{error ?? "ไม่พบคลังคอร์ส"}</p>
      </div>
    );
  }

  const atRoot = currentId == null;
  const folders = children.filter(isCatalogFolder);
  const courses = children.filter(isCatalogCourse);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col px-5 lg:px-8">
        <header className="shrink-0 border-b border-white/[0.06] py-4">
          {!atRoot ? (
            <nav className="font-mono mb-3 flex flex-wrap items-center gap-1 text-[0.58rem] tracking-wider">
              <button
                type="button"
                onClick={() => setCurrentId(null)}
                className="cursor-pointer text-text/45 transition hover:text-cyan"
              >
                สำรวจ
              </button>
              {crumbs.map((folder) => (
                <span key={folder.id} className="inline-flex items-center gap-1">
                  <span className="text-text/20">/</span>
                  <button
                    type="button"
                    onClick={() => setCurrentId(folder.id)}
                    className={`cursor-pointer transition hover:text-cyan ${
                      folder.id === currentId ? "text-cyan" : "text-text/45"
                    }`}
                  >
                    {folder.titleTh}
                  </button>
                </span>
              ))}
            </nav>
          ) : null}

          <div className="min-w-0 max-w-2xl">
            {!atRoot ? (
              <button
                type="button"
                onClick={() => setCurrentId(parentId)}
                className="font-mono mb-2 cursor-pointer text-[0.62rem] tracking-wider text-text/40 transition hover:text-cyan"
              >
                ← กลับ
              </button>
            ) : null}
            <h2
              className="font-display text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[0.1em] text-text"
              style={atRoot ? undefined : { color: accent }}
            >
              {atRoot ? "สำรวจ" : currentFolder!.title}
            </h2>
            <p className="font-section-thai mt-1 text-[0.9rem] text-text/55">
              {atRoot ? "เลือกหัวข้อที่อยากเรียนรู้" : currentFolder!.titleTh}
            </p>
            {!atRoot && currentFolder?.summary ? (
              <p className="font-section-thai mt-2 max-w-xl text-[0.84rem] leading-relaxed text-text/50">
                {currentFolder.summary}
              </p>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto py-6 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentId ?? "root"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {folders.length > 0 ? (
                <section>
                  <div
                    className={
                      atRoot
                        ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                        : "grid gap-3 sm:grid-cols-2"
                    }
                  >
                    {folders.map((folder, i) => (
                      <CatalogFolderTile
                        key={folder.id}
                        folder={folder}
                        index={i}
                        trailIds={trailIds}
                        size={atRoot ? "sector" : "folder"}
                        onOpen={() => setCurrentId(folder.id)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {courses.length > 0 ? (
                <section>
                  <ul className="mx-auto max-w-3xl space-y-3">
                    {courses.map((course) => (
                      <li key={course.id}>
                        <CatalogCourseCard
                          course={course}
                          progressPercent={pilotProgress(course.id, courseProgressPercent)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {folders.length === 0 && courses.length === 0 ? (
                <p className="font-section-thai text-[0.85rem] text-text/45">
                  ยังไม่มีรายการในโฟลเดอร์นี้
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function pilotProgress(
  courseId: string,
  courseProgressPercent: (courseId: string, moduleIds: string[]) => number,
): number | null {
  const course = getCourse(courseId);
  if (!course) return null;
  return courseProgressPercent(
    course.id,
    course.modules.map((m) => m.id),
  );
}
