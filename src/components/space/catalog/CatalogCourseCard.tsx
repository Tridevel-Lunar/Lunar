import { Link, useLocation } from "react-router-dom";
import { IoArrowForward } from "react-icons/io5";

import { spaceCourseLinkState, spaceCoursePath, spaceExplorePath } from "@/components/space/core/routes";

import type { CatalogCourse } from "./types";
import { isEnterable, statusLabel } from "./types";

type Props = {
  course: CatalogCourse;
  accent?: string;
  progressPercent?: number | null;
};

export default function CatalogCourseCard({
  course,
  accent = "#00e5ff",
  progressPercent,
}: Props) {
  const location = useLocation();
  const enterable = isEnterable(course);
  const from = location.pathname.startsWith("/space") ? location.pathname : spaceExplorePath();

  const body = (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(500px circle at 15% 0%, ${accent}22, transparent 55%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-50 transition group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex h-full flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`font-mono rounded-md border px-2 py-0.5 text-[0.52rem] tracking-wider ${
              enterable
                ? "border-cyan/35 bg-cyan/10 text-cyan"
                : course.status === "coming_soon"
                  ? "border-amber/30 bg-amber/10 text-amber"
                  : "border-white/15 bg-white/[0.04] text-text/45"
            }`}
          >
            {statusLabel(course.status)}
          </span>
        </div>
        <h3
          className={`font-thai text-[1.05rem] font-semibold tracking-wide ${
            enterable ? "text-text" : "text-text/70"
          }`}
        >
          {course.title}
        </h3>
        <p className="font-thai mt-1 text-[0.92rem] font-medium text-text/65">{course.titleTh}</p>
        <p className="font-section-thai mt-2 line-clamp-2 flex-1 text-[0.76rem] leading-relaxed text-text/45">
          {course.summary}
        </p>
        {enterable && progressPercent != null ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-teal"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono shrink-0 text-[0.6rem] tracking-wider text-cyan">
              {progressPercent}%
            </span>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-end gap-1">
          <span
            className={`font-section-thai inline-flex items-center gap-1 text-[0.78rem] transition ${
              enterable ? "group-hover:translate-x-0.5" : ""
            }`}
            style={{ color: enterable ? accent : "rgba(255,255,255,0.25)" }}
          >
            {enterable ? "เข้าเรียน" : "เร็ว ๆ นี้"}
            {enterable ? <IoArrowForward className="text-sm" /> : null}
          </span>
        </div>
      </div>
    </>
  );

  const className = `group relative flex min-h-[168px] w-full flex-col overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition ${
    enterable
      ? "border-white/[0.12] hover:border-white/25"
      : "cursor-default border-white/[0.08] opacity-90"
  }`;

  const style = {
    background: `linear-gradient(145deg, ${accent}18 0%, rgba(6,14,28,0.72) 48%, rgba(3,8,18,0.78) 100%)`,
  };

  if (enterable) {
    return (
      <Link
        to={spaceCoursePath(course.id)}
        state={spaceCourseLinkState(from)}
        className={`${className} no-underline`}
        style={style}
      >
        {body}
      </Link>
    );
  }

  return (
    <div className={className} style={style} aria-disabled title="คอร์สนี้ยังไม่เปิดเรียน">
      {body}
    </div>
  );
}
