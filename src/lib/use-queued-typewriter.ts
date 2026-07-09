import { useCallback, useEffect, useRef, useState } from "react";

const CLEAR = Symbol("CLEAR");

type QueueItem = string | typeof CLEAR;

type Options = {
  /** ms per character removed */
  deleteMs?: number;
  /** ms per character typed */
  typeMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Claude Code-style status line: queue messages, delete the current text char-by-char,
 * then type the next. The next item runs only after the previous animation finishes.
 */
export function useQueuedTypewriter(target: string | null, options?: Options) {
  const deleteMs = options?.deleteMs ?? 18;
  const typeMs = options?.typeMs ?? 30;

  const [display, setDisplay] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const queueRef = useRef<QueueItem[]>([]);
  const runningRef = useRef(false);
  const displayRef = useRef("");
  const targetRef = useRef<string | null>(target);

  const pump = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsAnimating(true);

    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;

      if (next === CLEAR) {
        while (displayRef.current.length > 0) {
          displayRef.current = displayRef.current.slice(0, -1);
          setDisplay(displayRef.current);
          await sleep(deleteMs);
        }
        continue;
      }

      if (next === displayRef.current) {
        continue;
      }

      while (displayRef.current.length > 0) {
        displayRef.current = displayRef.current.slice(0, -1);
        setDisplay(displayRef.current);
        await sleep(deleteMs);
      }

      for (let i = 0; i < next.length; i += 1) {
        displayRef.current = next.slice(0, i + 1);
        setDisplay(displayRef.current);
        await sleep(typeMs);
      }
    }

    runningRef.current = false;

    const tail = queueRef.current[queueRef.current.length - 1];
    const behind =
      targetRef.current !== null &&
      displayRef.current !== targetRef.current &&
      tail !== targetRef.current;

    if (behind && targetRef.current !== null) {
      queueRef.current.push(targetRef.current);
      void pump();
      return;
    }

    if (queueRef.current.length > 0) {
      void pump();
      return;
    }

    setIsAnimating(false);
  }, [deleteMs, typeMs]);

  useEffect(() => {
    targetRef.current = target;

    const enqueue = (item: QueueItem) => {
      if (item !== CLEAR && typeof item === "string") {
        if (item === displayRef.current) return;
        if (queueRef.current.some((queued) => queued === item)) return;
        if (runningRef.current && targetRef.current === item) return;
      }

      const tail = queueRef.current[queueRef.current.length - 1];
      if (item === tail) return;

      queueRef.current.push(item);
      void pump();
    };

    if (target === null) {
      if (displayRef.current.length > 0 || queueRef.current.length > 0) {
        queueRef.current = queueRef.current.filter((item) => item !== CLEAR);
        enqueue(CLEAR);
      }
      return;
    }

    enqueue(target);
  }, [target, pump]);

  const active = isAnimating || display.length > 0;

  return { display, active };
}
