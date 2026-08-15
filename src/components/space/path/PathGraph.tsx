import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { spaceCoursePath } from "@/components/space/core/routes";
import { findCourse, type CatalogCourse, type SpaceCatalog } from "@/components/space/catalog/types";
import type { LearningPathStep, PathEdge } from "@/lib/api";

import {
  PATH_NODE_HEIGHT,
  PATH_NODE_WIDTH,
  PATH_ARROW_LEN,
  PATH_ARROW_H,
  connectorPath,
  layoutPathMap,
} from "./layoutPathMap";
import { CourseWatermark } from "./courseIcon";

type Props = {
  steps: LearningPathStep[];
  edges?: PathEdge[];
  catalog: SpaceCatalog | null;
  saved: boolean;
};

type Transform = {
  x: number;
  y: number;
  scale: number;
};

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.2;
const DRAG_THRESHOLD = 6;

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function isPathNodeTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("[data-path-node]"));
}

export default function PathGraph({ steps, edges, catalog, saved }: Props) {
  const uid = useId().replace(/:/g, "");
  const markerId = `path-map-arrow-${uid}`;
  const markerHotId = `${markerId}-hot`;
  const layout = useMemo(() => layoutPathMap(steps, edges), [steps, edges]);
  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout.nodes]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const outgoingKeys = useMemo(() => {
    if (!hoverId) return new Set<string>();
    return new Set(
      layout.edges.filter((edge) => edge.from === hoverId).map((edge) => `${edge.from}->${edge.to}`),
    );
  }, [hoverId, layout.edges]);
  const targetIds = useMemo(() => {
    if (!hoverId) return new Set<string>();
    return new Set(layout.edges.filter((edge) => edge.from === hoverId).map((edge) => edge.to));
  }, [hoverId, layout.edges]);
  const layoutKey = useMemo(
    () =>
      `${steps.map((s) => s.courseId).join("|")}::${layout.edges.map((e) => `${e.from}->${e.to}`).join("|")}`,
    [layout.edges, steps],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => setViewport({ w: container.clientWidth, h: container.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (viewport.w === 0 || viewport.h === 0 || layout.nodes.length === 0) return;
    const pad = 64;
    const sx = (viewport.w - pad * 2) / Math.max(layout.width, 1);
    const sy = (viewport.h - pad * 2) / Math.max(layout.height, 1);
    const scale = clampScale(Math.min(sx, sy, 1));
    setTransform({
      scale,
      x: (viewport.w - layout.width * scale) / 2,
      y: (viewport.h - layout.height * scale) / 2,
    });
  }, [layout.height, layout.nodes.length, layout.width, layoutKey, viewport.h, viewport.w]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

      setTransform((current) => {
        const nextScale = clampScale(current.scale * zoomFactor);
        const worldX = (mouseX - current.x) / current.scale;
        const worldY = (mouseY - current.y) / current.scale;
        return {
          scale: nextScale,
          x: mouseX - worldX * nextScale,
          y: mouseY - worldY * nextScale,
        };
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || isPathNodeTarget(event.target)) return;
    panRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.x,
      originY: transform.y,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!panRef.current.active || event.pointerId !== panRef.current.pointerId) return;
    const dx = event.clientX - panRef.current.startX;
    const dy = event.clientY - panRef.current.startY;
    if (!panRef.current.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      panRef.current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setTransform((current) => ({
      scale: current.scale,
      x: panRef.current.originX + dx,
      y: panRef.current.originY + dy,
    }));
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (!panRef.current.active || event.pointerId !== panRef.current.pointerId) return;
    panRef.current.active = false;
    panRef.current.moved = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="relative h-full min-h-0">
      {steps.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-8">
          <p className="font-section-thai max-w-sm text-center text-[0.9rem] leading-relaxed text-text/45">
            เล่าให้ LAIKA ฟัง แล้วผังเส้นทางจะโผล่ที่นี่ ลากและซูมได้
          </p>
        </div>
      ) : (
        <div className="pointer-events-none absolute left-5 top-4 z-[2]">
          <p className="font-mono text-[0.58rem] tracking-[0.16em] text-cyan/70">YOUR MAP</p>
          <p className="font-section-thai mt-1 text-[0.72rem] text-text/40">ลากเพื่อเลื่อน · เลื่อนล้อเพื่อซูม</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full touch-none cursor-grab overflow-hidden active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        role="presentation"
      >
        <div
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: "0 0",
            position: "relative",
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            aria-hidden
          >
            <defs>
              <marker
                id={markerId}
                markerUnits="userSpaceOnUse"
                markerWidth={PATH_ARROW_LEN}
                markerHeight={PATH_ARROW_H}
                viewBox={`0 0 ${PATH_ARROW_LEN} ${PATH_ARROW_H}`}
                refX="0"
                refY={PATH_ARROW_H / 2}
                orient="auto"
              >
                <path
                  d={`M0,0 L${PATH_ARROW_LEN},${PATH_ARROW_H / 2} L0,${PATH_ARROW_H} z`}
                  fill="rgba(94,234,212,0.45)"
                />
              </marker>
              <marker
                id={markerHotId}
                markerUnits="userSpaceOnUse"
                markerWidth={PATH_ARROW_LEN}
                markerHeight={PATH_ARROW_H}
                viewBox={`0 0 ${PATH_ARROW_LEN} ${PATH_ARROW_H}`}
                refX="0"
                refY={PATH_ARROW_H / 2}
                orient="auto"
              >
                <path
                  d={`M0,0 L${PATH_ARROW_LEN},${PATH_ARROW_H / 2} L0,${PATH_ARROW_H} z`}
                  fill="rgba(94,234,212,0.95)"
                />
              </marker>
            </defs>
            {layout.edges.map((edge) => {
              const from = nodeById.get(edge.from);
              const to = nodeById.get(edge.to);
              if (!from || !to) return null;
              const key = `${edge.from}->${edge.to}`;
              const hot = outgoingKeys.has(key);
              const dim = hoverId != null && !hot;
              return (
                <g key={key}>
                  {hot ? (
                    <path
                      d={connectorPath(from, to)}
                      fill="none"
                      stroke="rgba(94,234,212,0.28)"
                      strokeWidth={7}
                      strokeLinecap="round"
                    />
                  ) : null}
                  <path
                    d={connectorPath(from, to)}
                    fill="none"
                    stroke={
                      hot
                        ? "rgba(94,234,212,0.95)"
                        : dim
                          ? "rgba(94,234,212,0.12)"
                          : "rgba(94,234,212,0.35)"
                    }
                    strokeWidth={hot ? 2.4 : 1.5}
                    strokeLinecap="round"
                    markerEnd={`url(#${hot ? markerHotId : markerId})`}
                  />
                </g>
              );
            })}
          </svg>
          {layout.nodes.map((node) => {
            const course = catalog ? findCourse(catalog.nodes, node.id) : undefined;
            return (
              <div
                key={node.id}
                data-path-node
                className="absolute"
                style={{
                  left: node.x,
                  top: node.y,
                  width: PATH_NODE_WIDTH,
                  height: PATH_NODE_HEIGHT,
                }}
                onPointerEnter={() => setHoverId(node.id)}
                onPointerLeave={() => setHoverId((current) => (current === node.id ? null : current))}
              >
                <PathMapCard
                  course={course}
                  step={node.step}
                  saved={saved}
                  focused={hoverId === node.id}
                  linked={targetIds.has(node.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PathMapCard({
  step,
  course,
  saved,
  focused,
  linked,
}: {
  step: LearningPathStep;
  course: CatalogCourse | undefined;
  saved: boolean;
  focused: boolean;
  linked: boolean;
}) {
  const title = course?.title ?? step.courseId;
  const titleTh = course?.titleTh ?? "";
  const note = step.note;

  const inner = (
    <>
      <CourseWatermark courseId={step.courseId} tags={course?.tags} />
      <div className="relative z-[1] min-w-0 pr-8">
        <p className="font-thai min-w-0 text-[0.95rem] font-semibold leading-snug tracking-wide text-text line-clamp-2">
          {title}
        </p>
        {titleTh ? (
          <p className="font-thai mt-0.5 truncate text-[0.9rem] font-medium leading-snug text-text/60">
            {titleTh}
          </p>
        ) : null}
        {note ? (
          <p className="font-section-thai mt-1 truncate text-[0.72rem] leading-snug text-text/40">
            {note}
          </p>
        ) : null}
      </div>
    </>
  );

  const shell = `relative flex h-full min-h-0 flex-col justify-center overflow-hidden rounded-xl border bg-bg/70 p-3 backdrop-blur-md transition ${
    focused
      ? "border-cyan/70 shadow-[0_0_18px_rgba(94,234,212,0.22)]"
      : linked
        ? "border-cyan/45"
        : saved
          ? "border-white/10 hover:border-cyan/30"
          : "border-white/10"
  }`;

  if (saved) {
    return (
      <Link to={spaceCoursePath(step.courseId)} className={`${shell} no-underline`} data-path-node>
        {inner}
      </Link>
    );
  }

  return <div className={shell}>{inner}</div>;
}
