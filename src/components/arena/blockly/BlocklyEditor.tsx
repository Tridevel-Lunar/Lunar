import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import * as Blockly from "blockly";
import "blockly/blocks";

import type { ProgramAst } from "@/ast/types";
import { registerM01Blocks } from "./blocks/m01";
import { astToWorkspace } from "./fromAst";
import { workspaceToAst } from "./toAst";
import { M01_BEGINNER_TOOLBOX } from "./toolboxes/m01-beginner";
import "./blockly-toolbox.css";

export type BlocklyEditorHandle = {
  toAst: () => ProgramAst;
  clear: () => void;
  seedStart: () => void;
  loadAst: (ast: ProgramAst | Record<string, unknown> | null) => void;
  getWorkspace: () => Blockly.WorkspaceSvg | null;
};

type Props = {
  initialAst?: ProgramAst | Record<string, unknown> | null;
  className?: string;
};

const DarkTheme = Blockly.Theme.defineTheme("lunarArenaDark", {
  name: "lunarArenaDark",
  base: Blockly.Themes.Classic,
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
    lunar_start_category: { colour: "#1a2740" },
    lunar_power_category: { colour: "#1a2740" },
    lunar_sensor_category: { colour: "#1a2740" },
    lunar_orbit_category: { colour: "#1a2740" },
    lunar_logic_category: { colour: "#1a2740" },
    lunar_safety_category: { colour: "#1a2740" },
  },
});

const BlocklyEditor = forwardRef<BlocklyEditorHandle, Props>(function BlocklyEditor(
  { initialAst = null, className },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const initialAstRef = useRef(initialAst);

  useImperativeHandle(ref, () => ({
    toAst: () => {
      const ws = workspaceRef.current;
      if (!ws) return { type: "program", body: [] };
      return workspaceToAst(ws);
    },
    clear: () => {
      workspaceRef.current?.clear();
    },
    seedStart: () => {
      const ws = workspaceRef.current;
      if (!ws) return;
      const start = ws.newBlock("m01_on_start");
      start.initSvg();
      start.render();
      start.moveBy(60, 40);
      const mainLoop = ws.newBlock("m01_main_loop");
      mainLoop.initSvg();
      mainLoop.render();
      mainLoop.moveBy(60, 180);
    },
    loadAst: (ast) => {
      const ws = workspaceRef.current;
      if (!ws) return;
      astToWorkspace(ws, ast);
    },
    getWorkspace: () => workspaceRef.current,
  }));

  useEffect(() => {
    if (!containerRef.current || workspaceRef.current) return;

    registerM01Blocks();

    const workspace = Blockly.inject(containerRef.current, {
      toolbox: M01_BEGINNER_TOOLBOX,
      theme: DarkTheme,
      media: "/blockly/media/",
      trashcan: true,
      // Auto-hide when content fits — avoids a sticky grey track
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

    if (initialAstRef.current) {
      astToWorkspace(workspace, initialAstRef.current);
    } else {
      // Seed setup + main loop blocks so beginners start in correct structure
      const start = workspace.newBlock("m01_on_start");
      start.initSvg();
      start.render();
      start.moveBy(60, 40);
      const mainLoop = workspace.newBlock("m01_main_loop");
      mainLoop.initSvg();
      mainLoop.render();
      mainLoop.moveBy(60, 180);
    }

    const resize = () => {
      Blockly.svgResize(workspace);
      workspace.resize();
      // Keep workspace metrics aligned with CSS toolbox width
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
    // Second + third pass: CSS width paint before Blockly measures toolbox
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
    // Mount once — AST reloads go through imperative handle
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
