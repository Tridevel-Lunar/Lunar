import { useEffect, useState } from "react";

import { getLaikaLearningContext, type LaikaLearningContext } from "@/lib/api";

/** Fetch resolved Space/Arena progress for LAIKA prompts and context estimates. */
export function useLaikaLearningContext() {
  const [learningContext, setLearningContext] = useState<LaikaLearningContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLaikaLearningContext()
      .then((ctx) => {
        if (!cancelled) setLearningContext(ctx);
      })
      .catch(() => {
        if (!cancelled) setLearningContext(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return learningContext;
}
