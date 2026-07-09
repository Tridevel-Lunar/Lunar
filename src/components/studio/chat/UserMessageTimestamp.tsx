import type { ChatNode } from "@/components/studio/data/studio-data";
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
    <time
      dateTime={node.createdAt}
      title={full}
      className="mb-0.5 cursor-default font-mono text-[0.7rem] tracking-wide text-muted/65"
    >
      {action}เมื่อ {short}
    </time>
  );
}
