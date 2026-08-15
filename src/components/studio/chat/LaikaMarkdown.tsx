import { memo } from "react";
import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import React from "react";

import KnowledgeTerm from "@/components/knowledge/KnowledgeTerm";
import { knowledgeMarkersToMarkdown } from "@/lib/knowledge/parseKnowledgeText";

import MermaidBlock from "./MermaidBlock";

/** Renders LAIKA assistant bubbles (GFM + `[[id|label]]` knowledge markers). */

type LaikaMarkdownProps = {
  content: string;
  size?: "default" | "chat";
};

function childrenToLabel(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToLabel).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return childrenToLabel(children.props.children);
  }
  return "";
}

/** Keep `knowledge:` links — defaultUrlTransform only allows http(s)/mailto/… */
function laikaUrlTransform(url: string): string {
  if (url.startsWith("knowledge:")) return url;
  return defaultUrlTransform(url);
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-2 mt-3 text-[1.02em] font-semibold text-text/95 first:mt-0">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-1.5 mt-2.5 text-[0.98em] font-medium text-text/90">{children}</h3>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-text/95">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-text/80">{children}</em>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    if (href?.startsWith("knowledge:")) {
      const id = href.slice("knowledge:".length);
      const label = childrenToLabel(children) || undefined;
      return <KnowledgeTerm id={id} label={label} />;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-cyan underline-offset-2 hover:underline"
      >
        {children}
      </a>
    );
  },
  code: ({
    className,
    children,
    ...props
  }: {
    className?: string;
    children?: React.ReactNode;
  }) => {
    const language = className?.replace("language-", "");
    if (language === "mermaid") {
      return <MermaidBlock chart={String(children)} />;
    }
    const isBlock = Boolean(language);
    if (isBlock) {
      return (
        <pre className="mb-3 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04] p-3 last:mb-0">
          <code className="block font-mono text-[0.82em] text-cyan" {...props}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code
        className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.82em] text-cyan"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => {
    if (
      React.isValidElement(children) &&
      typeof children.type !== "string" &&
      (children.type as React.ComponentType & { displayName?: string }).displayName ===
        "MermaidBlock"
    ) {
      return <>{children}</>;
    }
    return (
      <pre className="mb-3 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04] p-3 last:mb-0">
        {children}
      </pre>
    );
  },
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="mb-3 border-l-2 border-cyan/40 pl-3 text-text/75">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="laika-table-wrap mb-3 overflow-x-auto last:mb-0">
      <table className="laika-table w-full border-collapse text-[0.82rem]">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="border-b border-white/15">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-white/[0.06] last:border-0">{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-3 py-2 text-left font-semibold text-text/90">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 text-text/80">{children}</td>
  ),
};

function LaikaMarkdown({ content, size = "default" }: LaikaMarkdownProps) {
  if (!content) {
    return null;
  }

  const textClass =
    size === "chat"
      ? "text-[0.88rem] leading-relaxed text-text/85"
      : "text-[0.9rem] leading-relaxed text-text/85";

  return (
    <div className={`laika-markdown font-section-thai ${textClass}`}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        urlTransform={laikaUrlTransform}
        components={MARKDOWN_COMPONENTS}
      >
        {knowledgeMarkersToMarkdown(content)}
      </Markdown>
    </div>
  );
}

export default memo(LaikaMarkdown);
