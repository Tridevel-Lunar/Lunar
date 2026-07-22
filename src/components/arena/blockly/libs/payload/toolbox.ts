import type * as Blockly from "blockly";

export function buildPayloadToolbox(
  moduleId: string,
): Blockly.utils.toolbox.CategoryInfo {
  const contents: Blockly.utils.toolbox.BlockInfo[] = [
    { kind: "block", type: "payload_turn" },
  ];
  if (moduleId === "camera") {
    contents.push({ kind: "block", type: "payload_capture" });
  }
  return {
    kind: "category",
    name: "Payload",
    categorystyle: "lunar_payload_category",
    contents,
  };
}
