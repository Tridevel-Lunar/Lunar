import "katex/dist/katex.min.css";

import { memo } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

/** Renders LAIKA assistant bubbles (GFM, math, tables, syntax highlight). */

type LaikaMarkdownProps = {
  content: string;
  size?: "default" | "chat";
};

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS: Parameters<typeof Markdown>[0]["rehypePlugins"] = [
  [rehypeKatex, { throwOnError: false, strict: false }],
];

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
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="laika-table-wrap mb-3 max-w-full overflow-x-auto rounded-lg border border-white/10 last:mb-0">
      <table className="laika-table min-w-full border-collapse text-left">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-white/[0.06]">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody className="divide-y divide-white/10">{children}</tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-white/10 last:border-b-0">{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="whitespace-nowrap px-3 py-2 font-mono text-[0.72rem] font-medium tracking-wide text-cyan/90">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-3 py-2 align-top text-text/85">{children}</td>
  ),
  code: ({
    className,
    children,
    ...props
  }: {
    className?: string;
    children?: React.ReactNode;
  }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      const lang = className?.replace("language-", "") ?? "";
      const codeString = String(children).replace(/\n$/, "");
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={lang}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            fontSize: "0.82em",
            background: "#0d1117",
          }}
          codeTagProps={{ style: { fontFamily: "inherit" } }}
        >
          {codeString}
        </SyntaxHighlighter>
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
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-3 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04] p-3 last:mb-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="mb-3 border-l-2 border-cyan/40 pl-3 text-text/75">
      {children}
    </blockquote>
  ),
};

function LaikaMarkdown({
  content,
  size = "default",
}: LaikaMarkdownProps) {
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
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      >
        {content}
      </Markdown>
    </div>
  );
}

export default memo(LaikaMarkdown);
