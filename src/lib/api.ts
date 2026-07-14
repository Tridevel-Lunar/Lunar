import { API_URL } from "./constants";
import { shouldSkipAuthRefresh, tryRefreshSession, fetchWithAuthRetry } from "./auth";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  retried = false,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (
    response.status === 401 &&
    !retried &&
    !shouldSkipAuthRefresh(path)
  ) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new ApiError(response.status, detail);
  }

  return data as T;
}

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type LaikaSource = {
  source_id: string;
  title: string;
  page: number | null;
  topic: string | null;
  snippet: string;
};

export type LaikaAssistRequest = {
  entry_type: "note" | "idea" | "learn";
  content: string;
  intent: string;
  entry_content?: string;
  messages?: LaikaChatMessage[];
  learning_context?: {
    course?: string;
    completed_topics?: string[];
    arena_missions?: string[];
  };
  /** ISO-8601 client clock for conversation timing hints */
  client_now?: string;
  /** Enable DuckDuckGo web search as additional context */
  web_search?: boolean;
  /** LAIKA mode: standard (pre-fetch) or extra (agentic tool-calling) */
  mode?: "standard" | "extra";
  /** Collection ID for backend auto-save on done/cancel */
  collection_id?: string;
  /** Assistant node ID for backend auto-save on done/cancel */
  assistant_node_id?: string;
};

export type LaikaChatMessage = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type LaikaAssistResponse = {
  response: string;
  sources: LaikaSource[];
};

export type LaikaHealth = {
  status: string;
  llm_provider: string;
  embedding_provider: string;
  llm_model: string;
  embedding_model: string;
  enabled: boolean;
  context_window: number;
  max_history_tokens: number;
  reserved_output_tokens: number;
};

export function getLaikaHealth(): Promise<LaikaHealth> {
  return apiFetch<LaikaHealth>("/laika/health");
}

export type LaikaLearningContext = {
  course?: string;
  completed_topics?: string[];
  arena_missions?: string[];
};

export type StudioGreetingResponse = {
  greeting: string;
};

export function postLaikaStudioGreeting(
  learning_context?: LaikaLearningContext,
): Promise<StudioGreetingResponse> {
  return apiFetch<StudioGreetingResponse>("/laika/studio/greeting", {
    method: "POST",
    body: JSON.stringify({ learning_context }),
  });
}

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
};

export type StudioCollectionSummary = {
  id: string;
  type: "note" | "idea";
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  has_laika: boolean;
};

export type StudioCollectionEntry = StudioCollectionSummary & {
  tree: {
    nodes: Record<string, unknown>;
    rootIds: string[];
    selectedChildByParent: Record<string, string>;
  };
  laika_intent: string | null;
};

export type StudioCollectionListResponse = {
  items: StudioCollectionSummary[];
};

export function listStudioCollections(): Promise<StudioCollectionListResponse> {
  return apiFetch<StudioCollectionListResponse>("/studio/collections");
}

export function getStudioCollection(id: string): Promise<StudioCollectionEntry> {
  return apiFetch<StudioCollectionEntry>(`/studio/collections/${id}`);
}

export function createStudioCollection(
  type: "note" | "idea" | "learn",
  content: string,
): Promise<StudioCollectionEntry> {
  return apiFetch<StudioCollectionEntry>("/studio/collections", {
    method: "POST",
    body: JSON.stringify({ type, content }),
  });
}

export function updateStudioCollection(
  id: string,
  payload: {
    title: string;
    content: string;
    tree: StudioCollectionEntry["tree"];
    laika_intent?: string | null;
  },
): Promise<StudioCollectionEntry> {
  return apiFetch<StudioCollectionEntry>(`/studio/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteStudioCollection(id: string): Promise<void> {
  return apiFetch<void>(`/studio/collections/${id}`, { method: "DELETE" });
}

export type StudioConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  parent_id: string | null;
  laika_intent: string | null;
  laika_sources: LaikaSource[] | null;
};

export type StudioUserSpot = {
  user_node_id: string;
  sibling_index: number;
  sibling_count: number;
  sibling_ids: string[];
  can_create_branch: boolean;
};

export type StudioConversation = {
  collection_id: string;
  type: "note" | "idea";
  title: string;
  content: string;
  laika_intent: string | null;
  created_at: string;
  updated_at: string;
  at_user_node_id: string;
  messages: StudioConversationMessage[];
  user_spots: StudioUserSpot[];
  has_laika: boolean;
};

export function getStudioConversation(
  id: string,
  at?: string,
): Promise<StudioConversation> {
  const query = at ? `?at=${encodeURIComponent(at)}` : "";
  return apiFetch<StudioConversation>(`/studio/collections/${id}/conversation${query}`);
}

export function selectStudioBranch(
  id: string,
  userNodeId: string,
): Promise<StudioConversation> {
  return apiFetch<StudioConversation>(`/studio/collections/${id}/select-branch`, {
    method: "POST",
    body: JSON.stringify({ user_node_id: userNodeId }),
  });
}

export type StudioBranchMapNode = {
  id: string;
  label: string;
  created_at: string;
};

export type StudioBranchMap = {
  collection_id: string;
  user_nodes: StudioBranchMapNode[];
  edges: { from_id: string; to_id: string }[];
  active_user_node_ids: string[];
  active_edge_keys: string[];
};

export function getStudioBranchMap(id: string): Promise<StudioBranchMap> {
  return apiFetch<StudioBranchMap>(`/studio/collections/${id}/branch-map`);
}

export function postLaikaAssist(body: LaikaAssistRequest): Promise<LaikaAssistResponse> {
  return apiFetch<LaikaAssistResponse>("/laika/assist", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type LaikaStreamDone = {
  sources: LaikaSource[];
  response?: string;
  finishReason?: string | null;
  truncated?: boolean;
};

export type LaikaStreamHandlers = {
  onStatus?: (phase: string, message: string) => void;
  onToken: (delta: string) => void;
  onDone: (result: LaikaStreamDone) => void;
  onError?: (message: string) => void;
};

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split("\n");
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return { event, data: dataLines.join("\n") };
}

function handleLaikaSseEvent(
  event: string,
  data: string,
  handlers: LaikaStreamHandlers,
): "done" | "error" | null {
  const payload = JSON.parse(data) as Record<string, unknown>;

  if (event === "status" && typeof payload.message === "string") {
    const phase = typeof payload.phase === "string" ? payload.phase : "generating";
    handlers.onStatus?.(phase, payload.message);
    return null;
  }
  if (event === "token" && typeof payload.delta === "string") {
    handlers.onToken(payload.delta);
    return null;
  }
  if (event === "done" && Array.isArray(payload.sources)) {
    handlers.onDone({
      sources: payload.sources as LaikaSource[],
      response: typeof payload.response === "string" ? payload.response : undefined,
      finishReason:
        typeof payload.finish_reason === "string" ? payload.finish_reason : null,
      truncated: payload.truncated === true,
    });
    return "done";
  }
  if (event === "error" && typeof payload.detail === "string") {
    handlers.onError?.(payload.detail);
    throw new ApiError(503, payload.detail);
  }
  return null;
}

export function shutdownLaikaAssistWs(): void {
  /* SSE uses per-request fetch; nothing to shut down globally. */
}

export async function streamLaikaAssist(
  body: LaikaAssistRequest,
  handlers: LaikaStreamHandlers,
  signal?: AbortSignal,
  retried = false,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/laika/assist/stream`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (response.status === 401 && !retried) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return streamLaikaAssist(body, handlers, signal, true);
    }
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    const detail = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new ApiError(response.status, detail);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("LAIKA stream response has no body");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        if (block.trim()) {
          const parsed = parseSseBlock(block);
          if (parsed) {
            const outcome = handleLaikaSseEvent(parsed.event, parsed.data, handlers);
            if (outcome === "done") {
              completed = true;
            }
          }
        }
        boundary = buffer.indexOf("\n\n");
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      const parsed = parseSseBlock(buffer);
      if (parsed) {
        const outcome = handleLaikaSseEvent(parsed.event, parsed.data, handlers);
        if (outcome === "done") {
          completed = true;
        }
      }
    }
  } catch (err) {
    if (!completed && !isAbortError(err)) {
      throw err;
    }
    if (isAbortError(err)) {
      return false;
    }
  } finally {
    reader.releaseLock();
  }

  return completed;
}

export type BackofficeAccess = {
  allowed: boolean;
  role: string;
};

export type KnowledgeSource = {
  id: string;
  manifest_id: string | null;
  title: string;
  filename: string;
  type: string;
  module: string | null;
  stage: string | null;
  source_origin: string;
  language: string;
  topic: string | null;
  license: string | null;
  chunk_count: number;
  last_ingested_at: string | null;
  created_at: string;
};

export type KnowledgeOverview = {
  total_chunks: number;
  embedding_provider: string;
  embedding_enabled: boolean;
  sources: KnowledgeSource[];
};

export type KnowledgeCatalogItem = {
  manifest_id: string;
  title: string;
  module: string;
  stage: string | null;
  order: number | null;
  path: string;
  type: string;
  language: string;
  topic: string | null;
  synced: boolean;
  id: string | null;
  filename: string | null;
  chunk_count: number;
  last_ingested_at: string | null;
  created_at: string | null;
};

export type KnowledgeModuleGroup = {
  module: string;
  sources: KnowledgeCatalogItem[];
};

export type KnowledgeCatalog = {
  total_chunks: number;
  embedding_provider: string;
  embedding_enabled: boolean;
  modules: KnowledgeModuleGroup[];
  uploads: KnowledgeSource[];
};

export type KnowledgeSourceDetail = {
  id: string;
  manifest_id: string | null;
  title: string;
  filename: string;
  type: string;
  module: string | null;
  stage: string | null;
  source_origin: string;
  language: string;
  topic: string | null;
  license: string | null;
  content: string | null;
  content_editable: boolean;
  chunk_count: number;
  last_ingested_at: string | null;
};

export type UpdateKnowledgeSourcePayload = {
  title?: string;
  topic?: string;
  language?: string;
  license?: string;
  content?: string;
  auto_reingest?: boolean;
};

export type UpdateKnowledgeSourceResult = {
  id: string;
  title: string;
  chunks_ingested: number;
};

export type IngestResult = {
  total_chunks: number;
  results: { source_id: string; chunks_ingested: number }[];
};

export type BackofficeUser = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
};

export type BackofficeUsersList = {
  users: BackofficeUser[];
  admin_count: number;
};

export function getBackofficeAccess(): Promise<BackofficeAccess> {
  return apiFetch<BackofficeAccess>("/backoffice/access");
}

export function getKnowledgeOverview(): Promise<KnowledgeOverview> {
  return apiFetch<KnowledgeOverview>("/backoffice/knowledge");
}

export function getKnowledgeCatalog(): Promise<KnowledgeCatalog> {
  return apiFetch<KnowledgeCatalog>("/backoffice/knowledge/catalog");
}

export function getKnowledgeSourceDetail(sourceId: string): Promise<KnowledgeSourceDetail> {
  return apiFetch<KnowledgeSourceDetail>(`/backoffice/knowledge/sources/${sourceId}`);
}

export function patchKnowledgeSource(
  sourceId: string,
  payload: UpdateKnowledgeSourcePayload,
): Promise<UpdateKnowledgeSourceResult> {
  return apiFetch<UpdateKnowledgeSourceResult>(`/backoffice/knowledge/sources/${sourceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getBackofficeUsers(): Promise<BackofficeUsersList> {
  return apiFetch<BackofficeUsersList>("/backoffice/users");
}

export function patchBackofficeUserRole(
  userId: string,
  role: "learner" | "admin",
): Promise<BackofficeUser> {
  return apiFetch<BackofficeUser>(`/backoffice/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function postKnowledgeIngest(sourceId = "all"): Promise<IngestResult> {
  return apiFetch<IngestResult>("/backoffice/knowledge/ingest", {
    method: "POST",
    body: JSON.stringify({ source_id: sourceId }),
  });
}

export function postKnowledgeSyncManifest(sourceId = "all"): Promise<IngestResult> {
  return apiFetch<IngestResult>("/backoffice/knowledge/sync-manifest", {
    method: "POST",
    body: JSON.stringify({ source_id: sourceId }),
  });
}

export type UploadKnowledgeResult = {
  source_id: string;
  title: string;
  filename: string;
  source_type: string;
  chunks_ingested: number;
};

export type UploadKnowledgeOptions = {
  title?: string;
  topic?: string;
  language?: string;
  license?: string;
  autoIngest?: boolean;
};

export async function uploadKnowledgeDocument(
  file: File,
  options: UploadKnowledgeOptions = {},
): Promise<UploadKnowledgeResult> {
  const form = new FormData();
  form.append("file", file);
  if (options.title) form.append("title", options.title);
  if (options.topic) form.append("topic", options.topic);
  form.append("language", options.language ?? "th");
  if (options.license) form.append("license_value", options.license);
  form.append("auto_ingest", String(options.autoIngest ?? true));

  const response = await fetchWithAuthRetry("/backoffice/knowledge/upload", {
    method: "POST",
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Upload failed";
    throw new ApiError(response.status, detail);
  }

  return data as UploadKnowledgeResult;
}

export async function deleteKnowledgeSource(sourceId: string): Promise<void> {
  const response = await fetchWithAuthRetry(`/backoffice/knowledge/sources/${sourceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const detail = typeof data.detail === "string" ? data.detail : "Delete failed";
    throw new ApiError(response.status, detail);
  }
}
