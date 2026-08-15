import { Link, useLocation } from "react-router-dom";
import { IoPlanetOutline } from "react-icons/io5";

import { spaceCourseLinkState, spaceCoursePath, spaceExplorePath } from "@/components/space/core/routes";

import type { CatalogCourse } from "./types";
import { isEnterable, statusLabel } from "./types";

type Props = {
  course: CatalogCourse;
  progressPercent?: number | null;
};

export default function CatalogCourseCard({ course, progressPercent }: Props) {
  const location = useLocation();
  const enterable = isEnterable(course);
  const from = location.pathname.startsWith("/space") ? location.pathname : spaceExplorePath();

  const body = (
    <>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${
          enterable
            ? "border-cyan/30 bg-cyan/10 text-cyan"
            : "border-white/10 bg-white/[0.03] text-text/35"
        }`}
      >
        <IoPlanetOutline className="text-xl" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`font-thai text-[1rem] font-semibold tracking-wide ${
              enterable ? "text-text" : "text-text/70"
            }`}
          >
            {course.title}
          </p>
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
        <p className="font-thai mt-0.5 text-[0.92rem] font-medium text-text/65">{course.titleTh}</p>
        <p className="font-section-thai mt-1.5 line-clamp-2 text-[0.76rem] leading-relaxed text-text/42">
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
      </div>

      <span
        className={`shrink-0 text-xl transition ${
          enterable ? "text-text/25 group-hover:text-cyan/70" : "text-text/15"
        }`}
      >
        {enterable ? "→" : "·"}
      </span>
    </>
  );

  const className =
    "group flex w-full items-start gap-4 rounded-xl border border-white/[0.1] bg-bg/45 p-4 backdrop-blur-md transition";

  if (enterable) {
    return (
      <Link
        to={spaceCoursePath(course.id)}
        state={spaceCourseLinkState(from)}
        className={`${className} no-underline hover:border-cyan/30 hover:bg-cyan/[0.06]`}
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      className={`${className} cursor-default opacity-85`}
      aria-disabled
      title="คอร์สนี้ยังไม่เปิดเรียน"
    >
      {body}
    </div>
  );
}
