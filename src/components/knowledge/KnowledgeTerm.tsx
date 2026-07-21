import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getKnowledge } from "@/lib/knowledge/entries";

import { useKnowledge } from "./KnowledgeProvider";

type KnowledgeTermProps = {
  id: string;
  /** Override display label; defaults to entry.title */
  label?: string;
  className?: string;
};

export default function KnowledgeTerm({ id, label, className = "" }: KnowledgeTermProps) {
  const { openKnowledge, openId } = useKnowledge();
  const entry = getKnowledge(id);
  const [tipOpen, setTipOpen] = useState(false);

  // Close tip when switching / opening a knowledge entry.
  useEffect(() => {
    setTipOpen(false);
  }, [openId]);

  if (!entry) {
    return <span className={className}>{label ?? id}</span>;
  }

  const display = label ?? entry.title;
  const tooltipLabel = `${entry.title} (${entry.english})`;

  return (
    <Tooltip
      open={tipOpen}
      // Ignore focus-driven opens (dialog autofocus) — only allow close from Radix.
      onOpenChange={(next) => {
        if (!next) setTipOpen(false);
      }}
    >
      <TooltipTrigger asChild>
        <button
          type="button"
          onPointerEnter={() => setTipOpen(true)}
          onPointerLeave={() => setTipOpen(false)}
          onPointerDown={() => setTipOpen(false)}
          onClick={() => {
            setTipOpen(false);
            openKnowledge(id);
          }}
          className={`cursor-pointer border-b border-dotted border-cyan/50 text-inherit underline-offset-2 transition hover:border-cyan hover:text-cyan/90 ${className}`}
        >
          {display}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="pointer-events-none z-[100]">
        {tooltipLabel}
      </TooltipContent>
    </Tooltip>
  );
}
