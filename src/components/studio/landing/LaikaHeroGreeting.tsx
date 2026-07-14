import { useEffect, useState } from "react";

import {
  STUDIO_HERO_GREETING_FIRST_TIME,
  STUDIO_HERO_GREETINGS_AWAY,
  STUDIO_HERO_GREETINGS_CASUAL,
} from "@/components/studio/data/studio-data";
import { LaikaAvatar } from "@/components/studio/shared/studio-shared";
import { useQueuedTypewriter } from "@/lib/use-queued-typewriter";
import { isStudioReturnAfterAway, recordStudioVisit } from "@/lib/studio-visit";

/** LAIKA greeting card on Studio landing — typewriter reveal, hold, then rotate. */

const HOLD_MS = 15_000;

type LaikaHeroGreetingProps = {
  collectionsReady: boolean;
  hasCollections: boolean;
};

type GreetingPool = readonly string[];

function pickRandomGreeting(
  pool: GreetingPool,
  exclude?: string,
): string {
  if (pool.length === 1) return pool[0];
  let candidate = pool[Math.floor(Math.random() * pool.length)];
  while (candidate === exclude) {
    candidate = pool[Math.floor(Math.random() * pool.length)];
  }
  return candidate;
}

function longestGreeting(...pools: GreetingPool[]): string {
  return pools
    .flat()
    .reduce((longest, line) => (line.length > longest.length ? line : longest), "");
}

export default function LaikaHeroGreeting({
  collectionsReady,
  hasCollections,
}: LaikaHeroGreetingProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [rotatePool, setRotatePool] = useState<GreetingPool>(STUDIO_HERO_GREETINGS_CASUAL);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!collectionsReady) {
      setGreeting(null);
      return;
    }

    if (!hasCollections) {
      setGreeting(STUDIO_HERO_GREETING_FIRST_TIME);
      setRotatePool(STUDIO_HERO_GREETINGS_CASUAL);
      recordStudioVisit();
      return;
    }

    const away = isStudioReturnAfterAway();
    const initialPool = away ? STUDIO_HERO_GREETINGS_AWAY : STUDIO_HERO_GREETINGS_CASUAL;
    setRotatePool(STUDIO_HERO_GREETINGS_CASUAL);
    setGreeting(pickRandomGreeting(initialPool));
    recordStudioVisit();
  }, [collectionsReady, hasCollections]);

  const { display } = useQueuedTypewriter(reduceMotion ? null : greeting, {
    typeMs: 32,
    deleteMs: 14,
  });

  useEffect(() => {
    if (!collectionsReady || !hasCollections || !greeting) return;
    if (!reduceMotion && display !== greeting) return;

    const id = window.setTimeout(() => {
      setGreeting((prev) => pickRandomGreeting(rotatePool, prev ?? undefined));
    }, HOLD_MS);

    return () => window.clearTimeout(id);
  }, [collectionsReady, hasCollections, greeting, display, reduceMotion, rotatePool]);

  const shown = reduceMotion && greeting ? greeting : display;

  const layoutGreeting =
    greeting &&
    (hasCollections
      ? longestGreeting(STUDIO_HERO_GREETINGS_CASUAL, STUDIO_HERO_GREETINGS_AWAY)
      : greeting);

  return (
    <div className="flex flex-col items-center px-4 text-center">
      <LaikaAvatar size="lg" />
      <p className="font-mono mt-4 text-[0.68rem] tracking-[0.22em] text-amber">LAIKA</p>

      {!greeting ? (
        <div className="mt-5 space-y-2.5">
          <div className="mx-auto h-3.5 w-52 animate-pulse rounded bg-white/10" />
          <div className="mx-auto h-3.5 w-72 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <div className="relative mt-5 w-full max-w-xl text-center">
          <p
            aria-hidden
            className="invisible font-section-thai text-[1.15rem] leading-[1.75] sm:text-[1.22rem]"
          >
            {layoutGreeting}
          </p>
          <p
            className="font-section-thai absolute inset-0 text-center text-[1.15rem] leading-[1.75] text-text/92 sm:text-[1.22rem]"
            aria-live="polite"
          >
            {shown}
          </p>
        </div>
      )}
    </div>
  );
}
