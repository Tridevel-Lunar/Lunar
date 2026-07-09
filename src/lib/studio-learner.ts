/** Insert learner display name into hero copy when available. */

export function personalizeHeroGreeting(
  text: string,
  displayName?: string | null,
): string {
  const name = displayName?.trim();
  if (!name) return text;
  if (text.startsWith("สวัสดี ")) {
    return `สวัสดี คุณ${name} ${text.slice("สวัสดี ".length)}`;
  }
  return `คุณ${name} ${text}`;
}
