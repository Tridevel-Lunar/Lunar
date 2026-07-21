import { useCallback, useEffect, useMemo, useState } from "react";

import {
  completeSpaceModule,
  getSpaceProgress,
  type SpaceModuleCompletion,
} from "@/lib/api";

export type SpaceProgressState = {
  /** True while the initial progress fetch is in flight. */
  loading: boolean;
  /** Completed modules keyed as `courseId/moduleId`. */
  completedKeys: Set<string>;
  isModuleCompleted: (courseId: string, moduleId: string) => boolean;
  /** Fraction of completed modules in a course (0–100). */
  courseProgressPercent: (courseId: string, moduleIds: string[]) => number;
  /** Mark a module complete (idempotent). Returns true on success. */
  markComplete: (courseId: string, moduleId: string) => Promise<boolean>;
};

function completionKey(courseId: string, moduleId: string): string {
  return `${courseId}/${moduleId}`;
}

function keysFromCompletions(rows: SpaceModuleCompletion[]): Set<string> {
  return new Set(rows.map((row) => completionKey(row.course_id, row.module_id)));
}

/** Fetch and mutate Space module completion for the current user. */
export function useSpaceProgress(): SpaceProgressState {
  const [loading, setLoading] = useState(true);
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSpaceProgress()
      .then((data) => {
        if (!cancelled) setCompletedKeys(keysFromCompletions(data.completed));
      })
      .catch(() => {
        if (!cancelled) setCompletedKeys(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isModuleCompleted = useCallback(
    (courseId: string, moduleId: string) =>
      completedKeys.has(completionKey(courseId, moduleId)),
    [completedKeys],
  );

  const courseProgressPercent = useCallback(
    (courseId: string, moduleIds: string[]) => {
      if (moduleIds.length === 0) return 0;
      const done = moduleIds.filter((id) =>
        completedKeys.has(completionKey(courseId, id)),
      ).length;
      return Math.round((done / moduleIds.length) * 100);
    },
    [completedKeys],
  );

  const markComplete = useCallback(async (courseId: string, moduleId: string) => {
    const key = completionKey(courseId, moduleId);
    try {
      const row = await completeSpaceModule(courseId, moduleId);
      setCompletedKeys((prev) => {
        const next = new Set(prev);
        next.add(completionKey(row.course_id, row.module_id));
        return next;
      });
      return true;
    } catch {
      // Optimistic local mark so UI still updates if the network hiccups mid-lesson.
      setCompletedKeys((prev) => {
        if (prev.has(key)) return prev;
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      return false;
    }
  }, []);

  return useMemo(
    () => ({
      loading,
      completedKeys,
      isModuleCompleted,
      courseProgressPercent,
      markComplete,
    }),
    [loading, completedKeys, isModuleCompleted, courseProgressPercent, markComplete],
  );
}
