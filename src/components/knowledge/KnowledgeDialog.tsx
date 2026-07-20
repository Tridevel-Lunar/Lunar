import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getKnowledge } from "@/lib/knowledge/entries";
import { getKnowledgeVisual } from "./visuals";
import { useKnowledge } from "./KnowledgeProvider";
import KnowledgeText from "./KnowledgeText";

function VisualSkeleton() {
  return (
    <div className="h-[220px] w-full animate-pulse rounded-lg border border-white/10 bg-white/[0.03]" />
  );
}

function KnowledgeBreadcrumbs() {
  const { history, goBack, goToHistory } = useKnowledge();
  if (history.length === 0) return null;

  const canGoBack = history.length > 1;

  return (
    <div className="flex items-center gap-2 pr-8">
      <button
        type="button"
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="ย้อนกลับ"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/10 text-muted-foreground transition hover:border-white/20 hover:bg-white/5 hover:text-foreground disabled:cursor-default disabled:opacity-25"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <nav aria-label="ประวัติความรู้" className="min-w-0 flex-1">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 font-section-thai text-[0.72rem] text-muted-foreground">
          {history.map((id, index) => {
            const crumb = getKnowledge(id);
            const label = crumb?.title ?? id;
            const isLast = index === history.length - 1;

            return (
              <li key={`${id}-${index}`} className="flex min-w-0 items-center gap-1">
                {index > 0 && <span className="text-white/25" aria-hidden>/</span>}
                {isLast ? (
                  <span className="truncate text-foreground/80" aria-current="page">
                    {label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => goToHistory(index)}
                    className="cursor-pointer truncate transition hover:text-cyan"
                  >
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

export default function KnowledgeDialog() {
  const { entry, openId, closeKnowledge } = useKnowledge();

  const Visual = entry?.visual ? getKnowledgeVisual(entry.visual) : null;

  return (
    <Dialog open={openId !== null} onOpenChange={(open) => !open && closeKnowledge()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover text-popover-foreground sm:max-w-lg">
        {entry && (
          <>
            <KnowledgeBreadcrumbs />

            <DialogHeader className="text-left">
              <DialogTitle className="font-thai text-lg font-bold text-foreground">
                {entry.title}{" "}
                <span className="font-mono text-[0.72rem] font-normal text-muted-foreground">
                  ({entry.english})
                </span>
              </DialogTitle>
              {entry.summary && (
                <DialogDescription asChild>
                  <div className="font-section-thai text-[0.85rem] leading-relaxed text-muted-foreground">
                    <KnowledgeText text={entry.summary} />
                  </div>
                </DialogDescription>
              )}
            </DialogHeader>

            {Visual && (
              <Suspense fallback={<VisualSkeleton />}>
                <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
                  <Visual entryId={entry.id} />
                </div>
              </Suspense>
            )}

            <ul className="space-y-2 border-t border-white/10 pt-3">
              {entry.body.map((line) => (
                <li
                  key={line}
                  className="font-section-thai text-[0.82rem] leading-relaxed text-foreground/80 before:mr-2 before:text-cyan/60 before:content-['•']"
                >
                  <KnowledgeText text={line} />
                </li>
              ))}
            </ul>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
