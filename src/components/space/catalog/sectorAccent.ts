/** Accent per top-level sector — nested folders inherit via breadcrumb. */
const SECTOR_ACCENTS: Record<string, string> = {
  "around-us": "#00e5ff",
  access: "#ffab00",
  flight: "#1de9b6",
  ground: "#7eb8ff",
  "for-earth": "#5eead4",
  mission: "#fbbf24",
  more: "#94a3b8",
};

const FALLBACK_ACCENTS = ["#00e5ff", "#1de9b6", "#ffab00", "#7eb8ff", "#5eead4", "#fbbf24"];

export function sectorAccent(folderId: string, trailIds: string[] = []): string {
  for (const id of [folderId, ...trailIds]) {
    if (SECTOR_ACCENTS[id]) return SECTOR_ACCENTS[id];
  }
  let hash = 0;
  for (let i = 0; i < folderId.length; i++) hash = (hash + folderId.charCodeAt(i) * (i + 1)) % 997;
  return FALLBACK_ACCENTS[hash % FALLBACK_ACCENTS.length]!;
}
