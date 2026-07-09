import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { ConversationTree } from "@/components/studio/data/studio-data";
import type { StudioBranchMap } from "@/lib/api";
import { branchMapToGraphInput } from "@/lib/studio-conversation";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  getActiveBranchUserEdgeIds,
  getActiveBranchUserNodeIds,
  buildUserBranchGraph,
  layoutUserBranchMap,
} from "@/lib/studio-tree";

/** SVG branch map: pan/zoom, bezier edges, white active path + cyan scroll-focus node. */

type BranchMapGraphProps = {
  tree?: ConversationTree;
  branchMap?: StudioBranchMap | null;
  open: boolean;
  focusUserId?: string | null;
  onSelectNode: (nodeId: string) => void;
};

type Transform = {
  x: number;
  y: number;
  scale: number;
};

type Viewport = {
  w: number;
  h: number;
};

type LayoutPoint = {
  x: number;
  y: number;
};

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;
const DEFAULT_SCALE = 1;
const DRAG_THRESHOLD = 6;

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function isBranchNodeTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("[data-branch-node]"));
}

/** Smooth bezier: right edge of source → left edge of target, routed through column gap. */
function connectorPath(from: LayoutPoint, to: LayoutPoint): string {
  const x1 = from.x + NODE_WIDTH;
  const y1 = from.y + NODE_HEIGHT / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_HEIGHT / 2;
  const midX = x1 + (x2 - x1) * 0.5;

  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

export default function BranchMapGraph({
  tree,
  branchMap,
  open,
  focusUserId,
  onSelectNode,
}: BranchMapGraphProps) {
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

  const graph = useMemo(() => {
    if (branchMap) {
      const input = branchMapToGraphInput(branchMap);
      return { userNodes: input.userNodes, edges: input.edges };
    }
    if (tree) return buildUserBranchGraph(tree);
    return { userNodes: [], edges: [] };
  }, [branchMap, tree]);
  const layout = useMemo(() => layoutUserBranchMap(graph), [graph]);
  const activeNodes = useMemo(() => {
    if (branchMap) return new Set(branchMap.active_user_node_ids);
    if (tree) return getActiveBranchUserNodeIds(tree);
    return new Set<string>();
  }, [branchMap, tree]);
  const activeEdges = useMemo(() => {
    if (branchMap) return new Set(branchMap.active_edge_keys);
    if (tree) return getActiveBranchUserEdgeIds(tree);
    return new Set<string>();
  }, [branchMap, tree]);
  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout.nodes]);
  const focusedUserId = focusUserId ?? undefined;

  const [viewport, setViewport] = useState<Viewport>({ w: 0, h: 0 });
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: DEFAULT_SCALE,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      setViewport({
        w: container.clientWidth,
        h: container.clientHeight,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const centerOnNode = useCallback(
    (nodeId: string, scale = DEFAULT_SCALE) => {
      const layoutNode = nodeById.get(nodeId);
      if (!layoutNode || viewport.w === 0 || viewport.h === 0) return;

      const clampedScale = clampScale(scale);
      const cx = layoutNode.x + NODE_WIDTH / 2;
      const cy = layoutNode.y + NODE_HEIGHT / 2;

      setTransform({
        x: viewport.w / 2 - cx * clampedScale,
        y: viewport.h / 2 - cy * clampedScale,
        scale: clampedScale,
      });
    },
    [nodeById, viewport.h, viewport.w],
  );

  const centerOnFocusedNode = useCallback(() => {
    if (!focusedUserId) return;
    centerOnNode(focusedUserId, DEFAULT_SCALE);
  }, [centerOnNode, focusedUserId]);

  useLayoutEffect(() => {
    if (!open || viewport.w === 0) return;
    const frame = requestAnimationFrame(centerOnFocusedNode);
    return () => cancelAnimationFrame(frame);
  }, [open, centerOnFocusedNode, viewport.w, viewport.h, focusedUserId]);

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
    if (event.button !== 0 || isBranchNodeTarget(event.target)) return;
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
      ...current,
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

  function handleNodeSelect(nodeId: string, event: React.PointerEvent<SVGGElement>) {
    event.stopPropagation();
    if (panRef.current.moved) return;
    onSelectNode(nodeId);
  }

  const graphTransform = `translate(${transform.x} ${transform.y}) scale(${transform.scale})`;

  const edgeElements = useMemo(() => {
    return layout.edges.map((edge) => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return null;

      const edgeKey = `${edge.from}->${edge.to}`;
      const isActive = activeEdges.has(edgeKey);
      return (
        <path
          key={edgeKey}
          d={connectorPath(from, to)}
          fill="none"
          stroke={isActive ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.15)"}
          strokeWidth={isActive ? 2 : 1}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      );
    });
  }, [activeEdges, layout.edges, nodeById]);

  return (
    <div
      ref={containerRef}
      className="relative h-[min(58vh,520px)] min-h-[280px] w-full touch-none overflow-hidden rounded-xl border border-white/[0.06] bg-[#060b14] cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      role="presentation"
    >
      {viewport.w > 0 && viewport.h > 0 && (
        <svg
          width={viewport.w}
          height={viewport.h}
          className="block select-none"
          role="img"
          aria-label="Branch map"
          shapeRendering="geometricPrecision"
          textRendering="optimizeLegibility"
        >
          <g transform={graphTransform}>
            <g aria-hidden="true">{edgeElements}</g>

            {layout.nodes.map((node) => {
              const onActivePath = activeNodes.has(node.id);
              const isFocused = focusedUserId === node.id;
              const stroke = isFocused
                ? "#5eead4"
                : onActivePath
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(255,255,255,0.18)";
              const strokeWidth = isFocused ? 2 : onActivePath ? 1.5 : 1;
              const fillTint = isFocused
                ? "rgba(45,212,191,0.18)"
                : onActivePath
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.04)";
              const textFill = onActivePath ? "#f1f5f9" : "rgba(226,232,240,0.75)";

              return (
                <g
                  key={node.id}
                  data-branch-node
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onPointerDown={(event) => event.stopPropagation()}
                  onPointerUp={(event) => handleNodeSelect(node.id, event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectNode(node.id);
                    }
                  }}
                >
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={8}
                    fill="#060b14"
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="all"
                  />
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={8}
                    fill={fillTint}
                    stroke="none"
                    pointerEvents="none"
                  />
                  <text
                    x={10}
                    y={NODE_HEIGHT / 2 + 4}
                    fill={textFill}
                    fontSize={11}
                    fontFamily="inherit"
                    pointerEvents="none"
                  >
                    {node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
