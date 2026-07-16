import { useEffect, useRef, useState } from "react";

type MermaidBlockProps = {
  chart: string;
};

export default function MermaidBlock({ chart }: MermaidBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    // Clear previous content before rendering
    el.innerHTML = "";

    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        if (cancelled) return;

        mermaid.initialize({ startOnLoad: false, theme: "dark" });

        // Validate syntax first — mermaid.render can leak error DOM on failure
        try {
          await mermaid.parse(chart);
        } catch {
          if (!cancelled) setError(true);
          return;
        }
        if (cancelled) return;

        const id = "mermaid-svg-" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && el) {
          el.innerHTML = svg;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <pre className="mb-3 overflow-x-auto rounded-lg border border-red-400/30 bg-red-500/5 p-3 last:mb-0">
        <code className="block font-mono text-[0.82em] text-red-400">
          {chart}
        </code>
      </pre>
    );
  }

  return (
    // <div className="mb-3 flex justify-center last:mb-0">
      <div ref={ref} className="mermaid-block overflow-x-auto rounded-lg border border-white/10 bg-white/[0.02] p-4" />
    // </div>
  );
}

MermaidBlock.displayName = "MermaidBlock";
