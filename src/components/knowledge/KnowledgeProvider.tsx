import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { getKnowledge } from "@/lib/knowledge/entries";
import type { KnowledgeEntry } from "@/lib/knowledge/types";

type KnowledgeContextValue = {
  openId: string | null;
  /** Visited entry ids — last item is the current page. Cleared on close. */
  history: string[];
  entry: KnowledgeEntry | null;
  openKnowledge: (id: string) => void;
  goBack: () => void;
  /** Jump to a crumb index (truncates history after it). */
  goToHistory: (index: number) => void;
  closeKnowledge: () => void;
};

const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);

  const openId = history[history.length - 1] ?? null;
  const entry = openId ? (getKnowledge(openId) ?? null) : null;

  const openKnowledge = useCallback((id: string) => {
    if (!getKnowledge(id)) return;
    setHistory((prev) => {
      if (prev[prev.length - 1] === id) return prev;
      return [...prev, id];
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  }, []);

  const goToHistory = useCallback((index: number) => {
    setHistory((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev;
      return prev.slice(0, index + 1);
    });
  }, []);

  const closeKnowledge = useCallback(() => setHistory([]), []);

  const value = useMemo(
    () => ({
      openId,
      history,
      entry,
      openKnowledge,
      goBack,
      goToHistory,
      closeKnowledge,
    }),
    [openId, history, entry, openKnowledge, goBack, goToHistory, closeKnowledge],
  );

  return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>;
}

export function useKnowledge() {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) {
    throw new Error("useKnowledge must be used within KnowledgeProvider");
  }
  return ctx;
}

/** Safe variant for optional contexts (e.g. outside provider). */
export function useKnowledgeOptional() {
  return useContext(KnowledgeContext);
}
