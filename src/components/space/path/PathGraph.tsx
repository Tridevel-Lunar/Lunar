import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { spaceCourseLinkState, spaceCoursePath } from "@/components/space/core/routes";
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
  /** Where course Back should return (e.g. /space/path). */
  fromPath?: string;
};

type Transform = {
  x: number;
  y: number;
  scale: number;
};

type Velocity = {
  vx: number;
  vy: number;
};

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.2;
const DRAG_THRESHOLD = 6;
const PAN_FRICTION = 0.85;
const MIN_PAN_SPEED = 0.35;
const ZOOM_FACTOR = 1.1;

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function zoomAtPoint(current: Transform, nextScale: number, focusX: number, focusY: number): Transform {
  const scale = clampScale(nextScale);
  const worldX = (focusX - current.x) / current.scale;
  const worldY = (focusY - current.y) / current.scale;
  return {
    scale,
    x: focusX - worldX * scale,
    y: focusY - worldY * scale,
  };
}

export default function PathGraph({ steps, edges, catalog, saved, fromPath }: Props) {
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
  const transformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const velocityRef = useRef<Velocity>({ vx: 0, vy: 0 });
  const rafRef = useRef(0);
  const zoomTransitionTimerRef = useRef(0);
  const sampleRef = useRef({ t: 0, x: 0, y: 0 });
  const panRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  /** Suppress card link navigation after a pan gesture that started on a card. */
  const suppressCardClickRef = useRef(false);

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [zoomTransition, setZoomTransition] = useState(false);

  function commitTransform(next: Transform) {
    transformRef.current = next;
    setTransform(next);
  }

  function stopInertia() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    velocityRef.current = { vx: 0, vy: 0 };
  }

  function clearZoomTransition() {
    if (zoomTransitionTimerRef.current) {
      window.clearTimeout(zoomTransitionTimerRef.current);
      zoomTransitionTimerRef.current = 0;
    }
    setZoomTransition(false);
  }

  function kickInertia() {
    if (rafRef.current) return;

    const tick = () => {
      const velocity = velocityRef.current;
      let next = transformRef.current;
      let moving = false;

      if (Math.hypot(velocity.vx, velocity.vy) > MIN_PAN_SPEED) {
        next = {
          ...next,
          x: next.x + velocity.vx,
          y: next.y + velocity.vy,
        };
        velocity.vx *= PAN_FRICTION;
        velocity.vy *= PAN_FRICTION;
        if (Math.hypot(velocity.vx, velocity.vy) <= MIN_PAN_SPEED) {
          velocity.vx = 0;
          velocity.vy = 0;
        } else {
          moving = true;
        }
      }

      commitTransform(next);
      if (moving) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }

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
    stopInertia();
    clearZoomTransition();
    const pad = 64;
    const sx = (viewport.w - pad * 2) / Math.max(layout.width, 1);
    const sy = (viewport.h - pad * 2) / Math.max(layout.height, 1);
    const scale = clampScale(Math.min(sx, sy, 1));
    commitTransform({
      scale,
      x: (viewport.w - layout.width * scale) / 2,
      y: (viewport.h - layout.height * scale) / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fit once per layout/viewport change
  }, [layout.height, layout.nodes.length, layout.width, layoutKey, viewport.h, viewport.w]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const focusX = event.clientX - rect.left;
      const focusY = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      setZoomTransition(true);
      if (zoomTransitionTimerRef.current) {
        window.clearTimeout(zoomTransitionTimerRef.current);
      }
      zoomTransitionTimerRef.current = window.setTimeout(() => {
        setZoomTransition(false);
        zoomTransitionTimerRef.current = 0;
      }, 220);
      commitTransform(
        zoomAtPoint(transformRef.current, transformRef.current.scale * factor, focusX, focusY),
      );
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      stopInertia();
      if (zoomTransitionTimerRef.current) {
        window.clearTimeout(zoomTransitionTimerRef.current);
      }
    };
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    stopInertia();
    clearZoomTransition();
    suppressCardClickRef.current = false;
    const now = performance.now();
    sampleRef.current = { t: now, x: event.clientX, y: event.clientY };
    panRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: transformRef.current.x,
      originY: transformRef.current.y,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!panRef.current.active || event.pointerId !== panRef.current.pointerId) return;
    const dx = event.clientX - panRef.current.startX;
    const dy = event.clientY - panRef.current.startY;
    if (!panRef.current.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      panRef.current.moved = true;
      suppressCardClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const now = performance.now();
    const sample = sampleRef.current;
    const dt = now - sample.t;
    if (dt > 0 && dt < 64) {
      velocityRef.current.vx = ((event.clientX - sample.x) / dt) * 16.67;
      velocityRef.current.vy = ((event.clientY - sample.y) / dt) * 16.67;
    }
    sampleRef.current = { t: now, x: event.clientX, y: event.clientY };

    commitTransform({
      scale: transformRef.current.scale,
      x: panRef.current.originX + dx,
      y: panRef.current.originY + dy,
    });
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (!panRef.current.active || event.pointerId !== panRef.current.pointerId) return;
    const moved = panRef.current.moved;
    panRef.current.active = false;
    panRef.current.moved = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!moved) {
      velocityRef.current.vx = 0;
      velocityRef.current.vy = 0;
      return;
    }
    // Drop stale velocity if the pointer paused before release.
    if (performance.now() - sampleRef.current.t > 48) {
      velocityRef.current.vx = 0;
      velocityRef.current.vy = 0;
      return;
    }
    kickInertia();
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
            willChange: "transform",
            transition: zoomTransition
              ? "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
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
                  shouldSuppressClick={() => suppressCardClickRef.current}
                  fromPath={fromPath}
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
  shouldSuppressClick,
  fromPath,
}: {
  step: LearningPathStep;
  course: CatalogCourse | undefined;
  saved: boolean;
  focused: boolean;
  linked: boolean;
  shouldSuppressClick: () => boolean;
  fromPath?: string;
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

  const shell = `relative flex h-full min-h-0 cursor-grab flex-col justify-center overflow-hidden rounded-xl border bg-bg/70 p-3 backdrop-blur-md transition select-none [-webkit-user-drag:none] active:cursor-grabbing ${
    focused
      ? "border-cyan/70 shadow-[0_0_18px_rgba(94,234,212,0.22)]"
      : linked
        ? "border-cyan/45"
        : saved
          ? "border-white/10 hover:border-cyan/30"
          : "border-white/10"
  }`;

  function handleClick(event: React.MouseEvent) {
    if (!shouldSuppressClick()) return;
    event.preventDefault();
    event.stopPropagation();
  }

  if (saved) {
    return (
      <Link
        to={spaceCoursePath(step.courseId)}
        state={fromPath ? spaceCourseLinkState(fromPath) : undefined}
        className={`${shell} no-underline`}
        data-path-node
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
        onClick={handleClick}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      className={shell}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      onClick={handleClick}
    >
      {inner}
    </div>
  );
}
