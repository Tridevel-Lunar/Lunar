import { Fragment } from "react";

import { parseKnowledgeText } from "@/lib/knowledge/parseKnowledgeText";

import KnowledgeTerm from "./KnowledgeTerm";

type KnowledgeTextProps = {
  text: string;
  className?: string;
};

export default function KnowledgeText({ text, className = "" }: KnowledgeTextProps) {
  const parts = parseKnowledgeText(text);

  if (!parts.length) return null;

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <Fragment key={i}>{part.value}</Fragment>
        ) : (
          <KnowledgeTerm key={i} id={part.id} label={part.label} />
        ),
      )}
    </span>
  );
}
