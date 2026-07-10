import type { ChatNode } from "@/components/studio/data/studio-data";

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Whether two ISO timestamps fall on the same local calendar day. */
export function isSameChatCalendarDay(aIso: string, bIso: string): boolean {
  return isSameCalendarDay(new Date(aIso), new Date(bIso));
}

/** Center label for Discord-style date dividers in chat. */
export function formatChatDateDivider(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameCalendarDay(date, now)) return "วันนี้";
  if (isSameCalendarDay(date, yesterday)) return "เมื่อวาน";

  return date.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/** Short label for chat bubbles — วันนี้ / เมื่อวาน / 9 ก.ค. + เวลา (Discord-style). */
export function formatChatBubbleTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isSameCalendarDay(date, now)) return `วันนี้ ${time}`;
  if (isSameCalendarDay(date, yesterday)) return `เมื่อวาน ${time}`;

  const datePart = date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
  return `${datePart} ${time}`;
}

/** Full datetime for tooltip — weekday, date, time with seconds. */
export function formatChatBubbleTimeFull(iso: string): string {
  return new Date(iso).toLocaleString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Original sibling = พิมพ์; later variants from edit/branch = แก้ไข. */
export function userBubbleActionLabel(nodeId: string, siblings: ChatNode[]): "พิมพ์" | "แก้ไข" {
  if (siblings.length <= 1) return "พิมพ์";
  const oldest = [...siblings].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  return oldest?.id === nodeId ? "พิมพ์" : "แก้ไข";
}
