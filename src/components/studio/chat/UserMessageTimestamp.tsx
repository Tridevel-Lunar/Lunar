import type { ChatNode } from "@/components/studio/data/studio-data";
import { HintTooltip } from "@/components/ui/tooltip";
import {
  formatChatBubbleTime,
  formatChatBubbleTimeFull,
  userBubbleActionLabel,
} from "@/lib/chat-timestamp";

type UserMessageTimestampProps = {
  node: ChatNode;
  siblings: ChatNode[];
};

/** พิมพ์/แก้ไขเมื่อ — short text with native tooltip for full datetime (Discord-style). */
export default function UserMessageTimestamp({ node, siblings }: UserMessageTimestampProps) {
  const action = userBubbleActionLabel(node.id, siblings);
  const short = formatChatBubbleTime(node.createdAt);
  const full = formatChatBubbleTimeFull(node.createdAt);

  return (
    <HintTooltip content={action + "เมื่อ " + full}>
      <time
        dateTime={node.createdAt}
        className="text-nowrap h-fit mb-0.5 cursor-default font-mono text-[0.7rem] tracking-wide text-muted/65"
      >
        {short}
      </time>
    </HintTooltip>
  );
}
