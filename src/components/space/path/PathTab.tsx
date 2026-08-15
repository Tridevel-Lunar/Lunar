import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";

import { findCourse, type SpaceCatalog } from "@/components/space/catalog/types";
import { getCourse } from "@/components/space/core/registry";
import { spaceCourseLinkState, spaceCoursePath, spacePathSessionPath, spacePathTabPath } from "@/components/space/core/routes";
import { useSpaceProgress } from "@/components/space/hooks/useSpaceProgress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { LearningPath, LearningPathStep } from "@/lib/api";

import PathGraph from "./PathGraph";
import { CourseWatermark } from "./courseIcon";

type Props = {
  path: LearningPath | null;
  catalog: SpaceCatalog | null;
  onReplan: () => void;
  onExplore: () => void;
};

function formatUpdated(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

function moduleIdsFor(courseId: string, catalog: SpaceCatalog | null): string[] {
  const fromCatalog = catalog
    ? findCourse(catalog.nodes, courseId)?.outline?.map((item) => item.id)
    : undefined;
  if (fromCatalog && fromCatalog.length > 0) return fromCatalog;
  return getCourse(courseId)?.modules.map((m) => m.id) ?? [];
}

export default function PathTab({ path, catalog, onReplan, onExplore }: Props) {
  const saved = path?.status === "active" && path.steps.length > 0 ? path : null;

  return (
    <div className="relative flex h-full min-h-0">
      <section className="min-h-0 min-w-0 flex-1">
        {saved ? (
          <motion.div
            className="h-full min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <PathGraph
              steps={saved.steps}
              edges={saved.edges ?? []}
              catalog={catalog}
              saved
              fromPath={spacePathTabPath()}
            />
          </motion.div>
        ) : (
          <EmptyPath path={path} onExplore={onExplore} />
        )}
      </section>
      {saved ? (
        <PathInfoPanel path={saved} catalog={catalog} onReplan={onReplan} />
      ) : null}
    </div>
  );
}

function EmptyPath({
  path,
  onExplore,
}: {
  path: LearningPath | null;
  onExplore: () => void;
}) {
  const skipped = path?.status === "skipped";
  const draft = path?.status === "draft";
  return (
    <div className="flex h-full items-center justify-center px-8">
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-mono mb-3 text-[0.62rem] tracking-[0.18em] text-cyan/70">YOUR PATH</p>
        <h2 className="font-thai mb-3 text-[1.35rem] font-semibold tracking-wide text-text">
          {draft ? "คุยกับ LAIKA ค้างไว้" : skipped ? "ยังไม่มีผังส่วนตัว" : "ยังไม่มีเส้นทาง"}
        </h2>
        <p className="font-section-thai mb-6 text-[0.9rem] leading-relaxed text-text/55">
          {draft
            ? "เปิดเซสชันต่อได้เลย ประวัติคุยถูกเก็บไว้แล้ว"
            : skipped
              ? "ตอนนี้เลือกสำรวจคลังเองอยู่ ให้ LAIKA ช่วยวางผังได้ทุกเมื่อ"
              : "คุยกับ LAIKA สักหน่อย แล้วผังการเรียนรู้จะโผล่ที่นี่"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={spacePathSessionPath()}
            className="btn-clip cursor-pointer border border-cyan/50 bg-cyan/10 px-6 py-2.5 font-section-thai text-[0.95rem] font-medium text-cyan no-underline transition hover:bg-cyan hover:text-bg"
          >
            {draft ? "คุยต่อกับ LAIKA" : "ให้ LAIKA ช่วยวางแผน"}
          </Link>
          <button
            type="button"
            onClick={onExplore}
            className="btn-clip cursor-pointer border border-white/20 bg-white/[0.04] px-5 py-2.5 font-section-thai text-[0.95rem] font-medium text-text/75 transition hover:border-cyan/30 hover:text-cyan"
          >
            สำรวจคลัง
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PathInfoPanel({
  path,
  catalog,
  onReplan,
}: {
  path: LearningPath;
  catalog: SpaceCatalog | null;
  onReplan: () => void;
}) {
  const navigate = useNavigate();
  const { courseProgressPercent } = useSpaceProgress();
  const updated = formatUpdated(path.updatedAt);
  const branchCount = (path.edges ?? []).length;
  const hasBranches = branchCount > 0 && branchCount !== Math.max(0, path.steps.length - 1);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.aside
      className="flex w-[min(100%,380px)] shrink-0 flex-col border-l border-white/[0.08] bg-bg/55 backdrop-blur-md"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="shrink-0 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[0.58rem] tracking-[0.16em] text-cyan/70">เส้นทางของฉัน</p>
          <div className="flex items-center gap-1">
            <p className="font-section-thai text-[0.78rem] text-text/50">
              <span className="font-thai font-semibold text-text/85">{path.steps.length}</span>
              {" "}
              คอร์ส
            </p>
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="เมนูเส้นทาง"
                  className="cursor-pointer rounded-md p-1 text-text/45 transition hover:bg-white/[0.06] hover:text-text/80"
                >
                  <HiOutlineEllipsisVertical className="text-lg" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={6}
                className="w-48 border-white/10 bg-bg/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(spacePathSessionPath());
                  }}
                  className="font-section-thai flex w-full cursor-pointer rounded-md px-3 py-2 text-left text-[0.88rem] text-text/85 transition hover:bg-cyan/10 hover:text-cyan"
                >
                  คุยกับ LAIKA ต่อ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onReplan();
                  }}
                  className="font-section-thai flex w-full cursor-pointer rounded-md px-3 py-2 text-left text-[0.88rem] text-text/55 transition hover:bg-white/[0.06] hover:text-text/85"
                >
                  วางแผนใหม่
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {path.intentText ? (
          <p className="font-section-thai mt-2 text-[0.88rem] leading-relaxed text-text/80">
            {path.intentText}
          </p>
        ) : (
          <p className="font-section-thai mt-2 text-[0.88rem] text-text/45">ผังที่วางกับ LAIKA</p>
        )}
        {path.intentTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {path.intentTags.map((tag) => (
              <span
                key={tag}
                className="font-mono rounded border border-white/10 px-1.5 py-0.5 text-[0.52rem] tracking-wider text-text/50"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <p className="font-section-thai mt-3 text-[0.72rem] text-text/35">
          {hasBranches ? "แยกสายได้ ไม่บังคับเรียนทีละขั้น" : "ลำดับเป็นแนวทาง ไม่บังคับ"}
          {updated ? ` · อัปเดต ${updated}` : ""}
        </p>
      </div>
      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {path.steps.map((step, i) => (
          <motion.li
            key={step.courseId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.24,
              delay: 0.08 + 0.04 * i,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <CourseInfoCard
              step={step}
              catalog={catalog}
              progress={courseProgressPercent(step.courseId, moduleIdsFor(step.courseId, catalog))}
            />
          </motion.li>
        ))}
      </ol>
    </motion.aside>
  );
}

function CourseInfoCard({
  step,
  catalog,
  progress,
}: {
  step: LearningPathStep;
  catalog: SpaceCatalog | null;
  progress: number;
}) {
  const course = catalog ? findCourse(catalog.nodes, step.courseId) : undefined;
  const title = course?.title ?? step.courseId;
  const titleTh = course?.titleTh ?? "";
  const summary = course?.summary ?? "";

  const body = (
    <>
      <CourseWatermark courseId={step.courseId} tags={course?.tags} size="sm" fade="none" />
      <div className="relative z-[1] min-w-0 pr-8">
        <p className="font-thai min-w-0 text-[0.92rem] font-semibold leading-snug tracking-wide text-text line-clamp-2">
          {title}
        </p>
        {titleTh ? (
          <p className="font-thai mt-0.5 text-[0.88rem] font-medium text-text/60">{titleTh}</p>
        ) : null}
        {summary ? (
          <p className="font-section-thai mt-1 line-clamp-2 text-[0.72rem] leading-relaxed text-text/40">
            {summary}
          </p>
        ) : null}
        {step.note ? (
          <p className="font-section-thai mt-1.5 text-[0.72rem] leading-relaxed text-cyan/70">{step.note}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-teal"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[0.52rem] tracking-wider text-cyan">{progress}%</span>
        </div>
      </div>
    </>
  );

  return (
    <Link
      to={spaceCoursePath(step.courseId)}
      state={spaceCourseLinkState(spacePathTabPath())}
      className="relative block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 no-underline transition hover:border-cyan/30"
    >
      {body}
    </Link>
  );
}
