import type {
  CollectionEntry,
  ConversationTree,
  EntryType,
  LaikaIntent,
} from "@/components/studio/data/studio-data";
import {
  createStudioCollection,
  getStudioCollection,
  listStudioCollections,
  updateStudioCollection,
  type StudioCollectionEntry,
  type StudioCollectionSummary,
} from "@/lib/api";
import { hasLaikaInTree } from "@/lib/studio-tree";

/** Studio collections — persisted via `/studio/collections` API. */

const EMPTY_TREE: ConversationTree = {
  nodes: {},
  rootIds: [],
  selectedChildByParent: {},
};

function toCollectionEntry(
  api: StudioCollectionSummary | StudioCollectionEntry,
): CollectionEntry {
  const full = api as StudioCollectionEntry;
  return {
    id: api.id,
    type: api.type,
    title: api.title,
    content: api.content,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
    tree: "tree" in full && full.tree ? (full.tree as ConversationTree) : EMPTY_TREE,
    laikaIntent: "laika_intent" in full && full.laika_intent
      ? (full.laika_intent as LaikaIntent)
      : undefined,
    hasLaika: api.has_laika,
  };
}

function stripForSave(entry: CollectionEntry) {
  return {
    title: entry.title,
    content: entry.content,
    tree: entry.tree,
    laika_intent: entry.laikaIntent ?? null,
  };
}

export async function listCollections(): Promise<CollectionEntry[]> {
  const { items } = await listStudioCollections();
  return items.map(toCollectionEntry);
}

export async function getCollection(id: string): Promise<CollectionEntry | null> {
  try {
    const entry = await getStudioCollection(id);
    return toCollectionEntry(entry);
  } catch {
    return null;
  }
}

export async function saveCollection(entry: CollectionEntry): Promise<void> {
  const updated = await updateStudioCollection(entry.id, stripForSave(entry));
  return void updated;
}

export async function createCollection(
  type: EntryType,
  content: string,
): Promise<CollectionEntry> {
  const entry = await createStudioCollection(type, content);
  return toCollectionEntry(entry);
}

export function collectionHasLaika(entry: CollectionEntry): boolean {
  if (entry.hasLaika !== undefined) return entry.hasLaika;
  if (entry.laikaStreaming) return true;
  return hasLaikaInTree(entry.tree);
}
