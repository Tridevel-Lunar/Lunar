import type { ChatNode } from "@/components/studio/data/studio-data";
import { HintTooltip } from "@/components/ui/tooltip";
import {
  formatChatBubbleTime,
  formatChatBubbleTimeFull,
  userBubbleActionLabel,
} from "@/lib/chat-timestamp";

type UserMessageTimestampProps = {
  node: ChatNode;
};

/** พิมพ์/แก้ไขเมื่อ — short text with native tooltip for full datetime (Discord-style). */
export default function UserMessageTimestamp({ node }: UserMessageTimestampProps) {
  const action = userBubbleActionLabel(node);
  const displayTime = node.updatedAt && node.updatedAt !== node.createdAt ? node.updatedAt : node.createdAt;
  const short = formatChatBubbleTime(displayTime);
  const full = formatChatBubbleTimeFull(displayTime);

  return (
    <HintTooltip content={action + "เมื่อ " + full}>
      <time
        dateTime={displayTime}
        className="text-nowrap h-fit mb-0.5 cursor-default font-mono text-[0.7rem] tracking-wide text-muted/65"
      >
        {short}
      </time>
    </HintTooltip>
  );
}
