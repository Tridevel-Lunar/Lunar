import * as Blockly from "blockly";

const PAYLOAD = "#c084fc";

/** Core payload blocks shared by all modules. */
export function registerPayloadCoreBlocks(): void {
  if ((registerPayloadCoreBlocks as { done?: boolean }).done) return;
  (registerPayloadCoreBlocks as { done?: boolean }).done = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "payload_turn",
      message0: "turn payload %1",
      args0: [
        {
          type: "field_dropdown",
          name: "ON",
          options: [
            ["ON", "true"],
            ["OFF", "false"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: PAYLOAD,
      tooltip: "Turn payload on/off",
    },
    {
      type: "payload_is_on",
      message0: "payload is on?",
      output: "Boolean",
      colour: PAYLOAD,
      tooltip: "Payload on/off state",
    },
  ]);
}

export function registerPayloadCameraBlocks(): void {
  if ((registerPayloadCameraBlocks as { done?: boolean }).done) return;
  (registerPayloadCameraBlocks as { done?: boolean }).done = true;

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "payload_capture",
      message0: "capture image",
      previousStatement: null,
      nextStatement: null,
      colour: PAYLOAD,
      tooltip: "Capture an image (M02+)",
    },
  ]);
}
