import type * as Blockly from "blockly";

import { registerCommBlocks } from "./libs/comm/blocks";
import { COMM_TOOLBOX_CATEGORY } from "./libs/comm/toolbox";
import { registerEpsBlocks } from "./libs/eps/blocks";
import { EPS_TOOLBOX_CATEGORY } from "./libs/eps/toolbox";
import { registerObcBlocks } from "./libs/obc/blocks";
import { OBC_TOOLBOX_CATEGORY } from "./libs/obc/toolbox";
import {
  registerPayloadCameraBlocks,
  registerPayloadCoreBlocks,
} from "./libs/payload/blocks";
import { buildPayloadToolbox } from "./libs/payload/toolbox";

export type ArenaLibId = "obc" | "eps" | "payload" | "comm";

export type RegistryOptions = {
  enabledLibs?: ArenaLibId[];
  payloadModuleId?: string;
  commLibVisible?: boolean;
};

/** Register all Blockly block defs used by Arena libs. */
export function registerArenaBlocks(options: RegistryOptions = {}): void {
  const libs = new Set(options.enabledLibs ?? ["obc", "eps", "payload"]);
  if (libs.has("obc")) registerObcBlocks();
  if (libs.has("eps")) registerEpsBlocks();
  if (libs.has("payload")) {
    registerPayloadCoreBlocks();
    if ((options.payloadModuleId ?? "generic") === "camera") {
      registerPayloadCameraBlocks();
    }
  }
  if (libs.has("comm") || options.commLibVisible) registerCommBlocks();
}

/** Build category toolbox from enabled libs. */
export function buildToolbox(
  options: RegistryOptions = {},
): Blockly.utils.toolbox.ToolboxDefinition {
  const libs = new Set(options.enabledLibs ?? ["obc", "eps", "payload"]);
  const contents: Blockly.utils.toolbox.ToolboxItemInfo[] = [];
  if (libs.has("obc")) contents.push(OBC_TOOLBOX_CATEGORY);
  if (libs.has("eps")) contents.push(EPS_TOOLBOX_CATEGORY);
  if (libs.has("payload")) {
    contents.push(buildPayloadToolbox(options.payloadModuleId ?? "generic"));
  }
  if ((libs.has("comm") || options.commLibVisible) && options.commLibVisible !== false) {
    contents.push(COMM_TOOLBOX_CATEGORY);
  }
  return { kind: "categoryToolbox", contents };
}
