import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { IoPlanetOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import CatalogBrowser from "@/components/space/catalog/CatalogBrowser";
import PathTab from "@/components/space/path/PathTab";
import SpaceLoadingState from "@/components/space/SpaceLoadingState";
import { listCourses } from "@/components/space/core/registry";
import {
  spaceCoursePath,
  spacePathForTab,
  spacePathSessionPath,
  spaceTabFromPath,
  type SpaceShellTab,
} from "@/components/space/core/routes";
import { useSpaceProgress } from "@/components/space/hooks/useSpaceProgress";
import {
  deleteLearningPath,
  getLearningPath,
  getSpaceCatalog,
  type LearningPath,
  type SpaceCatalog,
  type User,
} from "@/lib/api";

function SpaceEarthBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src="/earth-center.jpg"
        alt=""
        className="h-full w-full scale-105 object-cover object-center brightness-[0.8] saturate-90"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,8,18,0.72) 0%, rgba(3,8,18,0.55) 40%, rgba(3,8,18,0.78) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(3,8,18,0.55) 0%, rgba(3,8,18,0.2) 35%, transparent 70%)",
        }}
      />
    </div>
  );
}

export default function SpaceHome({ user }: { user: User }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = spaceTabFromPath(location.pathname);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [catalog, setCatalog] = useState<SpaceCatalog | null>(null);
  const [shellLoading, setShellLoading] = useState(true);
  const [replanning, setReplanning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getLearningPath(), getSpaceCatalog().catch(() => null)])
      .then(([learningPath, cat]) => {
        if (cancelled) return;
        setPath(learningPath);
        setCatalog(cat);
        // First visit with no path: open LAIKA — but not when already browsing a tab URL.
        if (learningPath.status === "none" && tab === "home") {
          navigate(spacePathSessionPath(), { replace: true });
          return;
        }
        setShellLoading(false);
      })
      .catch(() => {
        if (!cancelled) setShellLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // first landing only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTab(next: SpaceShellTab) {
    if (shellLoading || replanning) return;
    const to = spacePathForTab(next);
    if (to !== location.pathname) navigate(to);
  }

  async function handleReplan() {
    if (shellLoading || replanning) return;
    if (!window.confirm("ล้างเส้นทางนี้แล้วคุยกับ LAIKA ใหม่?")) return;
    setReplanning(true);
    try {
      await deleteLearningPath();
      navigate(spacePathSessionPath());
    } catch {
      setReplanning(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="space" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5 py-3">
          <IoPlanetOutline className="text-xl text-cyan" />
          <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">SPACE</h1>
        </header>

        <div className="flex gap-6 border-b border-white/[0.06] px-5">
          {(
            [
              { id: "home" as const, label: "Home" },
              { id: "path" as const, label: "Path" },
              { id: "explore" as const, label: "Explore" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => goTab(t.id)}
              disabled={shellLoading || replanning}
              className={`border-b-2 pb-2 pt-3 font-mono text-[0.72rem] tracking-[0.15em] uppercase transition ${
                tab === t.id
                  ? "border-cyan text-cyan"
                  : "border-transparent text-text/40 hover:text-text/70"
              } ${
                shellLoading || replanning
                  ? "cursor-default opacity-40"
                  : "cursor-pointer"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <SpaceEarthBackdrop />
          <div className="relative z-[1] h-full min-h-0">
            {shellLoading || replanning ? (
              <SpaceLoadingState
                label={replanning ? "กำลังเปิดเซสชันใหม่…" : "กำลังโหลด…"}
              />
            ) : tab === "home" ? (
              <HomeView
                onGoToExplore={() => goTab("explore")}
                onGoToPath={() => goTab("path")}
                path={path}
                onAskLaika={() => navigate(spacePathSessionPath())}
              />
            ) : tab === "path" ? (
              <PathTab
                path={path}
                catalog={catalog}
                onReplan={() => void handleReplan()}
                onExplore={() => goTab("explore")}
              />
            ) : (
              <CatalogBrowser />
            )}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function HomeView({
  onGoToExplore,
  onGoToPath,
  path,
  onAskLaika,
}: {
  onGoToExplore: () => void;
  onGoToPath: () => void;
  path: LearningPath | null;
  onAskLaika: () => void;
}) {
  const courses = listCourses();
  const { courseProgressPercent } = useSpaceProgress();

  return (
    <div className="flex h-full max-w-xl flex-col justify-center px-8 py-10">
      <p className="font-mono mb-3 text-[0.7rem] tracking-[0.3em] text-cyan/70 uppercase">
        SPACE MODULE
      </p>
      <h2 className="font-thai mb-4 text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-wide text-text">
        เรียนรู้เทคโนโลยีอวกาศ
      </h2>
      <p className="font-section-thai mb-6 max-w-[480px] text-[0.92rem] leading-relaxed text-text/65">
        สำรวจคลังหัวข้อ Space Technology จากอวกาศรอบตัว การใช้บนโลก ไปจนถึงคอร์ส
        CubeSat ที่เรียนได้จริงวันนี้
      </p>
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={path?.status === "active" ? onGoToPath : onAskLaika}
          className="btn-clip cursor-pointer border border-cyan/50 bg-cyan/10 px-8 py-3 font-section-thai text-[0.95rem] font-medium text-cyan transition hover:bg-cyan hover:text-bg"
        >
          เส้นทางเรียนของฉัน →
        </button>
        <button
          type="button"
          onClick={onGoToExplore}
          className="btn-clip cursor-pointer border border-white/20 bg-white/[0.04] px-6 py-3 font-section-thai text-[0.95rem] font-medium text-text/80 transition hover:border-cyan/30 hover:text-cyan"
        >
          สำรวจคลัง
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-3">
          <p className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">CONTINUE</p>
          {courses.map((course) => {
            const progress = courseProgressPercent(
              course.id,
              course.modules.map((m) => m.id),
            );
            return (
              <Link
                key={course.id}
                to={spaceCoursePath(course.id)}
                className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 no-underline backdrop-blur-2xl transition hover:border-cyan/25 hover:bg-white/[0.05]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/5">
                  <IoPlanetOutline className="text-xl text-cyan" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[0.9rem] font-semibold tracking-wide text-text">
                    {course.title}
                  </p>
                  <p className="font-section-thai mt-0.5 text-[0.78rem] text-text/50">
                    {course.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan to-teal"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="font-mono shrink-0 text-[0.6rem] tracking-wider text-cyan">
                      {progress}%
                    </span>
                  </div>
                </div>
                <span className="text-xl text-text/25 transition group-hover:text-cyan/70">→</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
