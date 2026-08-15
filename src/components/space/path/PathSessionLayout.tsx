import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoPlanetOutline } from "react-icons/io5";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import SpaceLoadingState from "@/components/space/SpaceLoadingState";
import {
  getLearningPath,
  getSpaceCatalog,
  type LearningPathChatMessage,
  type PathProposal,
  type SpaceCatalog,
  type User,
} from "@/lib/api";
import { spacePathSessionPath, spacePathTabPath } from "@/components/space/core/routes";

import PathGraph from "./PathGraph";
import PathOnboardingChat from "./PathOnboardingChat";
import { SPACE_PATH_OPENING } from "./copy";

export default function PathSessionLayout({ user }: { user: User }) {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<SpaceCatalog | null>(null);
  const [draft, setDraft] = useState<PathProposal | null>(null);
  const [initialMessages, setInitialMessages] = useState<LearningPathChatMessage[] | null>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const handleStarted = useCallback(() => setStarted(true), []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getSpaceCatalog().catch(() => null), getLearningPath().catch(() => null)])
      .then(([cat, path]) => {
        if (cancelled) return;
        setCatalog(cat);
        if (path?.chatTranscript && path.chatTranscript.length > 0) {
          setInitialMessages(path.chatTranscript);
          if (path.chatTranscript.some((m) => m.role === "user")) {
            setStarted(true);
          }
        } else {
          setInitialMessages([{ role: "assistant", content: SPACE_PATH_OPENING }]);
        }
        if (path?.status === "active" && path.steps.length > 0) {
          setDraft({
            intentTags: path.intentTags,
            steps: path.steps,
            edges: path.edges ?? [],
            final: true,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = !loading && initialMessages !== null;

  return (
    <div className="relative flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="space" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <button
            type="button"
            onClick={() => navigate(spacePathTabPath())}
            disabled={!ready}
            className={`text-lg transition ${
              ready
                ? "cursor-pointer text-text/40 hover:text-cyan"
                : "cursor-default text-text/20"
            }`}
          >
            ←
          </button>
          <IoPlanetOutline className="text-xl text-cyan" />
          <h1 className="font-display text-[1.1rem] font-bold tracking-[0.16em] text-text">
            เส้นทางกับ LAIKA
          </h1>
        </header>

        {!ready ? (
          <div className="relative min-h-0 flex-1">
            <EarthBackdrop />
            <div className="relative z-[1] h-full">
              <SpaceLoadingState label="กำลังโหลดบทสนทนา…" />
            </div>
          </div>
        ) : (
          <div className={`relative min-h-0 flex-1 ${started ? "flex" : ""}`}>
            {started ? (
              <section className="relative min-h-0 min-w-0 flex-1">
                <EarthBackdrop />
                <div className="relative z-[1] h-full">
                  <PathGraph
                    steps={draft?.steps ?? []}
                    edges={draft?.edges ?? []}
                    catalog={catalog}
                    saved={false}
                    fromPath={spacePathSessionPath()}
                  />
                </div>
              </section>
            ) : null}

            <section
              className={
                started
                  ? "relative z-[1] flex min-h-0 w-[42%] min-w-[360px] max-w-[520px] flex-col border-l border-white/[0.06] bg-bg/80"
                  : "fixed inset-0 z-50 flex min-h-0 w-full flex-col"
              }
            >
              {!started ? <EarthBackdrop /> : null}
              {!started ? (
                <button
                  type="button"
                  onClick={() => navigate(spacePathTabPath())}
                  className="absolute left-5 top-5 z-[2] cursor-pointer text-lg text-text/45 transition hover:text-cyan"
                  aria-label="กลับ"
                >
                  ←
                </button>
              ) : null}
              <div className="relative z-[1] flex h-full min-h-0 flex-col">
                <PathOnboardingChat
                  draft={draft}
                  onPlan={setDraft}
                  onStarted={handleStarted}
                  fullBleed={!started}
                  initialMessages={initialMessages}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function EarthBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src="/earth-center.jpg"
        alt=""
        className="h-full w-full object-cover brightness-[0.55] saturate-90"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,8,18,0.78) 0%, rgba(3,8,18,0.62) 45%, rgba(3,8,18,0.88) 100%)",
        }}
      />
    </div>
  );
}
