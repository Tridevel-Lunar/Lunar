/**
 * Scroll-derived focus for branch map ↔ chat sync.
 * Map cyan highlight follows the deepest visible user bubble, not persisted tree state.
 */

/**
 * Deepest user on the active path whose bottom edge has not passed the scroll
 * container's bottom (may be above the top edge — that is allowed).
 */
export function resolveDeepestVisibleUserNodeId(
  scrollContainer: HTMLElement,
  userNodesOldestToNewest: ReadonlyArray<{ id: string }>,
): string | undefined {
  if (userNodesOldestToNewest.length === 0) return undefined;

  const bottom = scrollContainer.getBoundingClientRect().bottom;

  for (let i = userNodesOldestToNewest.length - 1; i >= 0; i -= 1) {
    const { id } = userNodesOldestToNewest[i];
    const el = scrollContainer.querySelector(`[data-chat-user-node="${CSS.escape(id)}"]`);
    if (!(el instanceof HTMLElement)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.bottom <= bottom + 1) {
      return id;
    }
  }

  return userNodesOldestToNewest[userNodesOldestToNewest.length - 1]?.id;
}

/** Scroll chat container to the bottom (one-shot after send — not stream follow). */
export function scrollChatToBottom(
  container: HTMLElement,
  behavior: ScrollBehavior = "smooth",
): void {
  container.scrollTo({
    top: container.scrollHeight,
    behavior,
  });
}

/** True when the viewport is pinned to (or near) the latest messages. */
export function isChatScrolledToBottom(
  container: HTMLElement,
  thresholdPx = 48,
): boolean {
  return (
    container.scrollHeight - container.scrollTop - container.clientHeight <=
    thresholdPx
  );
}

/** Scroll so a user bubble's top aligns with the chat scroll container top (branch-map / pager nav). */
export function scrollUserBubbleToTop(
  container: HTMLElement,
  userNodeEl: HTMLElement,
): void {
  const containerTop = container.getBoundingClientRect().top;
  const nodeTop = userNodeEl.getBoundingClientRect().top;
  container.scrollTo({
    top: container.scrollTop + (nodeTop - containerTop),
    behavior: "smooth",
  });
}
