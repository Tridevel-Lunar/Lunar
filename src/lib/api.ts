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

  if (response.status === 204) {
    return undefined as T;
  }

  return data as T;
}

export type LaikaSource = {
  source_id: string;
  title: string;
  page: number | null;
  topic: string | null;
  snippet: string;
};


/** Lean request for streaming — backend fetches entry_type/entry_content/messages from DB. */
export type StreamAssistRequest = {
  collection_id: string;
  content: string;
  intent: string;
  mode: "new" | "follow_up" | "edit" | "retry" | "branch";
  node_id?: string;
  parent_node_id?: string;
  web_search?: boolean;
  laika_mode?: "standard" | "extra";
  learning_context?: LaikaLearningContext;
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
  course_title?: string;
  completed_topics?: string[];
  completed_modules?: string[];
  pending_modules?: string[];
  pending_topics?: string[];
  space_progress_percent?: number;
  arena_missions?: string[];
};

export function getLaikaLearningContext(): Promise<LaikaLearningContext> {
  return apiFetch<LaikaLearningContext>("/laika/learning-context");
}

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  picture: string | null;
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

export type StudioConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  updated_at?: string;
  parent_id: string | null;
  laika_intent: string | null;
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
  updated_at?: string;
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


export type LaikaStreamDone = {
  sources: LaikaSource[];
  response?: string;
  finishReason?: string | null;
  truncated?: boolean;
};

export type LaikaStreamMeta = {
  user_node_id: string;
  assistant_node_id: string;
};

export type LaikaStreamHandlers = {
  onMeta?: (meta: LaikaStreamMeta) => void;
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
): "meta" | "done" | "error" | null {
  const payload = JSON.parse(data) as Record<string, unknown>;

  if (event === "meta" && typeof payload.user_node_id === "string" && typeof payload.assistant_node_id === "string") {
    handlers.onMeta?.({
      user_node_id: payload.user_node_id,
      assistant_node_id: payload.assistant_node_id,
    });
    return "meta";
  }
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

export async function streamLaikaAssist(
  body: StreamAssistRequest,
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

/* ── Arena missions (Blockly attempt save/load) ── */

export type ArenaMissionPack = {
  id: string;
  version: number;
  toolboxId: string;
  title: string;
  code: string;
  level: string;
  playable: boolean;
  allowedOps: string[];
  limits: {
    maxBlocks: number;
    maxDepth: number;
    maxSteps: number;
    wallMs: number;
  };
  enabledLibs?: string[];
  payloadModuleId?: string | null;
  commLibVisible?: boolean;
  setupPresets?: {
    eps?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    comm?: Record<string, unknown>;
  } | null;
  orbitPeriodSec?: number | null;
  eclipseFraction?: number | null;
};

export type ArenaAttempt = {
  mission_id: string;
  mission_version: number | null;
  ast: Record<string, unknown> | null;
  workspace: Record<string, unknown> | null;
};

export type ArenaRunResult = {
  grade: "perfect" | "risky" | "fail" | string;
  comms: "full" | "partial" | "missed" | string;
  payload_data: "full" | "partial" | "none" | string;
  longevity_impact: "none" | "minor" | "major" | string;
  satellite_survived: boolean;
  sent_to_earth: boolean;
};

export type ArenaOrbitTraceEntry = {
  simSec: number;
  phase: number;
  isSunlit: boolean;
  battery: number;
  temperature: number;
  heaterOn: boolean;
  payloadOn: boolean;
  safeMode: boolean;
};

export type ArenaOrbitSummary = {
  eclipseEnterSec: number;
  eclipseExitSec: number;
  minBattery: number;
  minBatteryDuringEclipse: number;
};

export type ArenaRunTiming = {
  overrunCount: number;
  usedSecPerWindowSample?: number[] | null;
};

export type ArenaRunResponse = {
  mission_id: string;
  mission_version: number;
  orbitPeriodSec: number;
  simSecPerWindow: number;
  trace: ArenaOrbitTraceEntry[];
  orbitSummary: ArenaOrbitSummary;
  final_battery: number;
  final_temperature: number;
  timing?: ArenaRunTiming | null;
  result: ArenaRunResult;
};

export type ArenaEpsSetup = {
  battery_threshold_low?: number;
  battery_threshold_high?: number;
  temp_min?: number;
  temp_max?: number;
  heater_power?: number;
};

export type ArenaPayloadSetup = {
  payload_module?: string;
  default_on?: boolean;
};

export type ArenaCommSetup = {
  pass_sim_sec?: number;
  downlink_policy?: string;
};

export type ArenaRunRequest = {
  ast: Record<string, unknown>;
  epsSetup?: ArenaEpsSetup;
  payloadSetup?: ArenaPayloadSetup;
  commSetup?: ArenaCommSetup;
};

export function getArenaMission(missionId: string): Promise<ArenaMissionPack> {
  return apiFetch<ArenaMissionPack>(`/arena/missions/${missionId}`);
}

export function getArenaAttempt(missionId: string): Promise<ArenaAttempt> {
  return apiFetch<ArenaAttempt>(`/arena/missions/${missionId}/attempt`);
}

export function saveArenaAttempt(
  missionId: string,
  ast: Record<string, unknown>,
  workspace?: Record<string, unknown> | null,
): Promise<ArenaAttempt> {
  return apiFetch<ArenaAttempt>(`/arena/missions/${missionId}/attempt`, {
    method: "PUT",
    body: JSON.stringify({
      ast,
      ...(workspace !== undefined ? { workspace } : {}),
    }),
  });
}

export function runArenaMission(
  missionId: string,
  payload: ArenaRunRequest | Record<string, unknown>,
): Promise<ArenaRunResponse> {
  const body =
    "ast" in payload
      ? payload
      : { ast: payload };
  return apiFetch<ArenaRunResponse>(`/arena/missions/${missionId}/runs`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ── Space module progress ── */

export type SpaceModuleCompletion = {
  course_id: string;
  module_id: string;
  completed_at: string;
};

export type SpaceProgress = {
  completed: SpaceModuleCompletion[];
};

export function getSpaceProgress(): Promise<SpaceProgress> {
  return apiFetch<SpaceProgress>("/space/progress");
}

export function completeSpaceModule(
  courseId: string,
  moduleId: string,
): Promise<SpaceModuleCompletion> {
  return apiFetch<SpaceModuleCompletion>(
    `/space/courses/${courseId}/modules/${moduleId}/complete`,
    { method: "PUT" },
  );
}

/* ── Space Technology catalog ── */

export type SpaceCatalogOutlineItem = {
  id: string;
  title: string;
  summary: string;
};

export type SpaceCatalogCourseStatus = "published" | "coming_soon" | "later";

export type SpaceCatalogCourse = {
  kind: "course";
  id: string;
  title: string;
  titleTh: string;
  summary: string;
  status: SpaceCatalogCourseStatus;
  level: string;
  tags: string[];
  teaches: string[];
  audience: string;
  intentHints: string[];
  prerequisites: string[];
  relatedCourseIds: string[];
  recommendWhen: string[];
  doNotConfuseWith: string[];
  arenaHooks: string[];
  outline: SpaceCatalogOutlineItem[] | null;
};

export type SpaceCatalogFolder = {
  kind: "folder";
  id: string;
  title: string;
  titleTh: string;
  summary: string;
  children: SpaceCatalogNode[];
};

export type SpaceCatalogNode = SpaceCatalogFolder | SpaceCatalogCourse;

export type SpaceCatalog = {
  domainId: string;
  title: string;
  titleTh: string;
  summary: string;
  nodes: SpaceCatalogNode[];
};

export function getSpaceCatalog(): Promise<SpaceCatalog> {
  return apiFetch<SpaceCatalog>("/space/catalog");
}

export type LearningPathStatus = "none" | "skipped" | "active" | "draft";

export type LearningPathStep = {
  courseId: string;
  note?: string | null;
};

export type PathEdge = {
  from: string;
  to: string;
};

export type LearningPathChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LearningPath = {
  status: LearningPathStatus;
  intentText: string | null;
  intentTags: string[];
  steps: LearningPathStep[];
  edges: PathEdge[];
  chatTranscript: LearningPathChatMessage[];
  generatedBy: "laika" | "skipped" | null;
  skippedAt: string | null;
  updatedAt: string | null;
};

export type PathProposal = {
  intentTags: string[];
  steps: LearningPathStep[];
  edges: PathEdge[];
  final: boolean;
};

export function getLearningPath(): Promise<LearningPath> {
  return apiFetch<LearningPath>("/space/learning-path");
}

export function putLearningPath(body: {
  status: "skipped" | "active" | "draft";
  intentText?: string | null;
  intentTags?: string[];
  steps?: LearningPathStep[];
  edges?: PathEdge[];
  chatTranscript?: LearningPathChatMessage[];
}): Promise<LearningPath> {
  return apiFetch<LearningPath>("/space/learning-path", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteLearningPath(): Promise<void> {
  return apiFetch<void>("/space/learning-path", { method: "DELETE" });
}

export type PathStreamHandlers = {
  onStatus?: (phase: string, message: string) => void;
  onToken: (delta: string) => void;
  onPlanDelta?: (plan: PathProposal) => void;
  onPlan?: (plan: PathProposal) => void;
  onDone: (response: string) => void;
  onError?: (message: string) => void;
};

export async function streamSpacePathAssist(
  body: {
    content: string;
    messages: LearningPathChatMessage[];
    currentPlan?: PathProposal | null;
  },
  handlers: PathStreamHandlers,
  signal?: AbortSignal,
  retried = false,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/space/laika/path/stream`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: body.content,
      messages: body.messages,
      ...(body.currentPlan && body.currentPlan.steps.length > 0
        ? { currentPlan: body.currentPlan }
        : {}),
    }),
    signal,
  });

  if (response.status === 401 && !retried) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return streamSpacePathAssist(body, handlers, signal, true);
    }
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    const detail = typeof data.detail === "string" ? data.detail : "Request failed";
    throw new ApiError(response.status, detail);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("LAIKA path stream has no body");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;

  const handle = (event: string, data: string): "done" | "error" | null => {
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
    if ((event === "plan" || event === "plan_delta") && Array.isArray(payload.steps)) {
      const plan: PathProposal = {
        intentTags: Array.isArray(payload.intentTags)
          ? (payload.intentTags as string[])
          : [],
        steps: payload.steps as LearningPathStep[],
        edges: Array.isArray(payload.edges) ? (payload.edges as PathEdge[]) : [],
        final: payload.final === true || event === "plan",
      };
      if (event === "plan" || plan.final) handlers.onPlan?.(plan);
      else handlers.onPlanDelta?.(plan);
      return null;
    }
    if (event === "done") {
      handlers.onDone(typeof payload.response === "string" ? payload.response : "");
      return "done";
    }
    if (event === "error" && typeof payload.detail === "string") {
      handlers.onError?.(payload.detail);
      throw new ApiError(503, payload.detail);
    }
    return null;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        if (block.trim()) {
          const parsed = parseSseBlock(block);
          if (parsed) {
            const outcome = handle(parsed.event, parsed.data);
            if (outcome === "done") completed = true;
          }
        }
        boundary = buffer.indexOf("\n\n");
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) {
      const parsed = parseSseBlock(buffer);
      if (parsed) {
        const outcome = handle(parsed.event, parsed.data);
        if (outcome === "done") completed = true;
      }
    }
  } catch (err) {
    if (!completed && !isAbortError(err)) throw err;
    if (isAbortError(err)) return false;
  } finally {
    reader.releaseLock();
  }

  return completed;
}
