import { resolveKnowledgeId } from "@/lib/knowledge/entries";

/** Token from parsing [[id]] or [[id|label]] markers in lesson / LAIKA text. */
export type KnowledgeTextPart =
  | { type: "text"; value: string }
  | { type: "term"; id: string; label?: string };

/** Allows kebab ids and free-form titles from the model (spaces, caps, Thai). */
const MARKER_RE = /\[\[([^\]|\n]+)(?:\|([^\]\n]+))?\]\]/g;

export function parseKnowledgeText(text: string): KnowledgeTextPart[] {
  if (!text) return [];

  const parts: KnowledgeTextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MARKER_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    const rawId = match[1]?.trim() ?? "";
    const label = match[2]?.trim();
    const resolved = resolveKnowledgeId(rawId);

    if (resolved) {
      parts.push({ type: "term", id: resolved, label: label || undefined });
    } else {
      // Unknown marker — show human label only, drop brackets.
      parts.push({ type: "text", value: label || rawId });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

function escapeMdLinkLabel(label: string): string {
  return label.replace(/([\\\[\]()])/g, "\\$1");
}

/**
 * Rewrite `[[id|label]]` into markdown links `[](knowledge:id)` for react-markdown.
 * Unresolved markers become plain label text.
 */
export function knowledgeMarkersToMarkdown(text: string): string {
  if (!text.includes("[[")) return text;
  return text.replace(MARKER_RE, (_full, rawId: string, label?: string) => {
    const display = (label ?? rawId).trim();
    const resolved = resolveKnowledgeId(rawId);
    if (!resolved) return display;
    return `[${escapeMdLinkLabel(display)}](knowledge:${resolved})`;
  });
}

/** For streaming HTML: drop markers to visible labels (interactive after stream ends). */
export function knowledgeMarkersToPlainLabels(text: string): string {
  if (!text.includes("[[")) return text;
  return text.replace(MARKER_RE, (_full, rawId: string, label?: string) =>
    (label ?? rawId).trim(),
  );
}
