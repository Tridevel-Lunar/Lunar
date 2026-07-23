import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import * as Blockly from "blockly";
import "blockly/blocks";

import type { ProgramAst } from "@/ast/types";
import { compileProgram } from "./compileProgram";
import { astToWorkspace } from "./fromAst";
import { buildToolbox, registerArenaBlocks, type RegistryOptions } from "./registry";
import "./blockly-toolbox.css";

export type BlocklyWorkspaceState = Record<string, unknown>;

export type BlocklyEditorHandle = {
  toAst: () => ProgramAst;
  toWorkspaceState: () => BlocklyWorkspaceState | null;
  clear: () => void;
  seedStart: () => void;
  loadAst: (ast: ProgramAst | Record<string, unknown> | null) => void;
  loadWorkspace: (state: BlocklyWorkspaceState | null) => void;
  getWorkspace: () => Blockly.WorkspaceSvg | null;
};

type Props = {
  initialAst?: ProgramAst | Record<string, unknown> | null;
  /** Prefer over AST when restoring layout (positions, scroll). */
  initialWorkspace?: BlocklyWorkspaceState | null;
  className?: string;
  registryOptions?: RegistryOptions;
};

const DarkTheme = Blockly.Theme.defineTheme("lunarArenaDark", {
  name: "lunarArenaDark",
  base: Blockly.Themes.Classic,
  fontStyle: {
    family: '"Sarabun", "Noto Sans Thai", sans-serif',
    weight: "600",
    size: 12,
  },
  componentStyles: {
    workspaceBackgroundColour: "#070d18",
    toolboxBackgroundColour: "#02060f",
    toolboxForegroundColour: "rgba(232, 237, 245, 0.55)",
    flyoutBackgroundColour: "#070d18",
    flyoutForegroundColour: "rgba(232, 237, 245, 0.7)",
    flyoutOpacity: 0.98,
    scrollbarColour: "#1a2a40",
    insertionMarkerColour: "#00e5ff",
    insertionMarkerOpacity: 0.35,
    scrollbarOpacity: 0.45,
    cursorColour: "#00e5ff",
  },
  categoryStyles: {
    lunar_obc_category: { colour: "#38bdf8" },
    lunar_eps_category: { colour: "#f59e0b" },
    lunar_payload_category: { colour: "#a855f7" },
    lunar_comm_category: { colour: "#10b981" },
    lunar_start_category: { colour: "#1a2740" },
    lunar_power_category: { colour: "#1a2740" },
    lunar_sensor_category: { colour: "#1a2740" },
    lunar_orbit_category: { colour: "#1a2740" },
    lunar_logic_category: { colour: "#1a2740" },
    lunar_safety_category: { colour: "#1a2740" },
  },
});

function seedEmptyWorkspace(ws: Blockly.WorkspaceSvg): void {
  const start = ws.newBlock("obc_on_start");
  start.initSvg();
  start.render();
  start.moveBy(60, 40);
  const repeat = ws.newBlock("obc_repeat_orbit");
  repeat.initSvg();
  repeat.render();
  const body = start.getInput("BODY")?.connection;
  if (body && repeat.previousConnection) {
    body.connect(repeat.previousConnection);
  }
}

function restoreWorkspace(
  workspace: Blockly.WorkspaceSvg,
  initialWorkspace: BlocklyWorkspaceState | null | undefined,
  initialAst: ProgramAst | Record<string, unknown> | null | undefined,
): void {
  // Prefer AST when present — seeded demos often clear workspace; a stale
  // workspace JSON would otherwise hide the Perfect solution.
  if (initialAst && typeof initialAst === "object") {
    const body = (initialAst as ProgramAst).body;
    if (Array.isArray(body) && body.length > 0) {
      astToWorkspace(workspace, initialAst);
      return;
    }
  }
  if (initialWorkspace && typeof initialWorkspace === "object") {
    Blockly.serialization.workspaces.load(initialWorkspace, workspace);
    return;
  }
  seedEmptyWorkspace(workspace);
}

const DEFAULT_REGISTRY: RegistryOptions = {
  enabledLibs: ["obc", "eps", "payload"],
  payloadModuleId: "generic",
  commLibVisible: false,
};

const BlocklyEditor = forwardRef<BlocklyEditorHandle, Props>(function BlocklyEditor(
  { initialAst = null, initialWorkspace = null, className, registryOptions },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const initialAstRef = useRef(initialAst);
  const initialWorkspaceRef = useRef(initialWorkspace);
  const registryRef = useRef({ ...DEFAULT_REGISTRY, ...registryOptions });

  useImperativeHandle(ref, () => ({
    toAst: () => {
      const ws = workspaceRef.current;
      if (!ws) return { type: "program", body: [] };
      return compileProgram(ws);
    },
    toWorkspaceState: () => {
      const ws = workspaceRef.current;
      if (!ws) return null;
      return Blockly.serialization.workspaces.save(ws) as BlocklyWorkspaceState;
    },
    clear: () => {
      workspaceRef.current?.clear();
    },
    seedStart: () => {
      const ws = workspaceRef.current;
      if (!ws) return;
      seedEmptyWorkspace(ws);
    },
    loadAst: (ast) => {
      const ws = workspaceRef.current;
      if (!ws) return;
      astToWorkspace(ws, ast);
    },
    loadWorkspace: (state) => {
      const ws = workspaceRef.current;
      if (!ws || !state) return;
      Blockly.serialization.workspaces.load(state, ws);
    },
    getWorkspace: () => workspaceRef.current,
  }));

  useEffect(() => {
    if (!containerRef.current || workspaceRef.current) return;

    const opts = registryRef.current;
    registerArenaBlocks(opts);

    const workspace = Blockly.inject(containerRef.current, {
      toolbox: buildToolbox(opts),
      theme: DarkTheme,
      media: "/blockly/media/",
      trashcan: true,
      scrollbars: true,
      move: { scrollbars: true, drag: true, wheel: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 1.4,
        minScale: 0.5,
        scaleSpeed: 1.1,
      },
      grid: {
        spacing: 24,
        length: 1,
        colour: "#1a2740",
        snap: true,
      },
      renderer: "geras",
    });

    workspaceRef.current = workspace;
    restoreWorkspace(workspace, initialWorkspaceRef.current, initialAstRef.current);

    const resize = () => {
      Blockly.svgResize(workspace);
      workspace.resize();
      const toolbox = workspace.getToolbox?.();
      if (toolbox && "getWidth" in toolbox) {
        workspace.resizeContents?.();
      }
      const flyout = workspace.getFlyout();
      if (flyout && "reflow" in flyout && typeof flyout.reflow === "function") {
        flyout.reflow();
      }
    };
    resize();
    requestAnimationFrame(() => {
      resize();
      requestAnimationFrame(resize);
    });

    const onToolboxChange = (event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
        requestAnimationFrame(() => resize());
      }
    };
    workspace.addChangeListener(onToolboxChange);
    window.addEventListener("resize", resize);

    return () => {
      workspace.removeChangeListener(onToolboxChange);
      window.removeEventListener("resize", resize);
      workspace.dispose();
      workspaceRef.current = null;
    };
    // Mount once — drafts reload via remount + initial props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className ?? "h-full w-full min-h-[320px]"}`}
      data-blockly-editor
    />
  );
});

export default BlocklyEditor;
