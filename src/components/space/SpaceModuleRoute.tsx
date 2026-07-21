import { Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { User } from "@/lib/api";
import { getCourse, getModule } from "@/components/space/core/registry";
import { spaceCoursePath, spaceHomePath } from "@/components/space/core/routes";

/**
 * Resolves /space/course/:courseId/module/:moduleId and renders the
 * custom module Component registered on that course.
 */
export default function SpaceModuleRoute({ user }: { user: User }) {
  const navigate = useNavigate();
  const { courseId = "", moduleId = "" } = useParams<{
    courseId: string;
    moduleId: string;
  }>();

  const course = getCourse(courseId);
  const module = getModule(courseId, moduleId);

  if (!course || !module) {
    return (
      <div className="flex h-screen overflow-hidden bg-bg text-text">
        <ModuleSidebar user={user} activeModule="space" />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
          <p className="font-mono text-[0.72rem] text-muted">Module not found</p>
          <button
            type="button"
            onClick={() =>
              navigate(course ? spaceCoursePath(course.id) : spaceHomePath())
            }
            className="cursor-pointer font-mono text-[0.7rem] tracking-wider text-cyan transition hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const ModulePage = module.Component;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-bg text-text">
          <p className="font-mono text-[0.72rem] text-muted">Loading module…</p>
        </div>
      }
    >
      <ModulePage user={user} course={course} module={module} />
    </Suspense>
  );
}
