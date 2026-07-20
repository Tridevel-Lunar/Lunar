import { useNavigate } from "react-router-dom";
import { IoPlanetOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import type { SpaceModulePageProps } from "@/components/space/core/types";
import { spaceCoursePath } from "@/components/space/core/routes";

/** Placeholder until a teammate implements this module page. */
export default function PlaceholderModule({
  user,
  course,
  module,
}: SpaceModulePageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="space" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 px-6">
        <button
          type="button"
          onClick={() => navigate(spaceCoursePath(course.id))}
          className="cursor-pointer self-start text-lg text-text/40 transition hover:text-cyan"
        >
          ←
        </button>
        <IoPlanetOutline className="text-4xl text-cyan/50" />
        <h1 className="font-display text-center text-[1.2rem] font-bold tracking-wide text-text">
          {module.title}
        </h1>
        <p className="font-section-thai max-w-md text-center text-[0.9rem] text-text/55">
          {module.description}
        </p>
        <p className="font-mono mt-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.65rem] tracking-wider text-muted">
          Coming soon — replace this placeholder with your custom page
        </p>
      </div>
    </div>
  );
}
