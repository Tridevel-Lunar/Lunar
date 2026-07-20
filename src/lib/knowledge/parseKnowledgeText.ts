/** Token from parsing [[id]] or [[id|label]] markers in lesson text. */
export type KnowledgeTextPart =
  | { type: "text"; value: string }
  | { type: "term"; id: string; label?: string };

const MARKER_RE = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

export function parseKnowledgeText(text: string): KnowledgeTextPart[] {
  if (!text) return [];

  const parts: KnowledgeTextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MARKER_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({
      type: "term",
      id: match[1],
      label: match[2],
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}
