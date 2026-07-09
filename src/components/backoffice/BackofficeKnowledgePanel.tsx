import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineArrowPath,
  HiOutlineArrowUpTray,
  HiOutlineCircleStack,
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { IoRocketOutline } from "react-icons/io5";

import BackofficeSidebar from "@/components/backoffice/BackofficeSidebar";
import KnowledgeEditModal from "@/components/backoffice/KnowledgeEditModal";
import KnowledgeUploadModal from "@/components/backoffice/KnowledgeUploadModal";
import {
  ApiError,
  deleteKnowledgeSource,
  getKnowledgeCatalog,
  postKnowledgeIngest,
  postKnowledgeSyncManifest,
  type KnowledgeCatalog,
  type KnowledgeCatalogItem,
  type KnowledgeSource,
  type User,
} from "@/lib/api";

const MODULE_META: Record<string, { label: string; description: string }> = {
  space: {
    label: "SPACE",
    description: "บทเรียน CubeSat 101 และหลักสูตรอวกาศ",
  },
  arena: {
    label: "ARENA",
    description: "Mission briefs และ hints สำหรับภารกิจ",
  },
  studio: {
    label: "STUDIO",
    description: "เอกสารอ้างอิงสำหรับ LAIKA และ career path",
  },
};

const MODULE_TABS = ["space", "arena", "studio"] as const;
type ModuleTab = (typeof MODULE_TABS)[number];
type KnowledgeTab = ModuleTab | "uploads";

function matchesSearch(query: string, ...fields: (string | null | undefined)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

function tabActiveClass(tab: KnowledgeTab) {
  if (tab === "space") return "border-cyan/50 bg-cyan/10 text-cyan";
  if (tab === "arena") return "border-amber/50 bg-amber/10 text-amber";
  if (tab === "studio") return "border-teal/50 bg-teal/10 text-teal";
  return "border-white/20 bg-white/[0.05] text-text/85";
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_6px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function moduleHeaderClass(module: string) {
  if (module === "space") return "text-cyan";
  if (module === "arena") return "text-amber";
  if (module === "studio") return "text-teal";
  return "text-muted";
}

function groupByStage(sources: KnowledgeCatalogItem[]) {
  const stages: { stage: string | null; items: KnowledgeCatalogItem[] }[] = [];
  const map = new Map<string | null, KnowledgeCatalogItem[]>();

  for (const source of sources) {
    const key = source.stage;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(source);
  }

  for (const [stage, items] of map) {
    stages.push({ stage, items });
  }

  return stages;
}

type BackofficeKnowledgePanelProps = {
  user: User;
};

export default function BackofficeKnowledgePanel({ user }: BackofficeKnowledgePanelProps) {
  const [catalog, setCatalog] = useState<KnowledgeCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncingManifest, setSyncingManifest] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editSourceId, setEditSourceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<KnowledgeTab>("space");
  const [searchQuery, setSearchQuery] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getKnowledgeCatalog();
      setCatalog(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("คุณไม่มีสิทธิ์เข้า backoffice — ต้องมี role admin");
      } else {
        setError(err instanceof ApiError ? err.message : "โหลดข้อมูลไม่สำเร็จ");
      }
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  async function handleSyncManifest(sourceId = "all") {
    if (sourceId === "all") setSyncingManifest(true);
    else setSyncingId(sourceId);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await postKnowledgeSyncManifest(sourceId);
      const label = sourceId === "all" ? "manifest ทั้งหมด" : sourceId;
      setSuccessMessage(`Sync ${label} สำเร็จ — ${result.total_chunks} chunks`);
      await loadCatalog();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sync manifest ไม่สำเร็จ");
    } finally {
      setSyncingManifest(false);
      setSyncingId(null);
    }
  }

  async function handleIngest(sourceId: string) {
    setIngestingId(sourceId);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await postKnowledgeIngest(sourceId);
      setSuccessMessage(`Re-ingest สำเร็จ — ${result.total_chunks} chunks`);
      await loadCatalog();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ingest ไม่สำเร็จ");
    } finally {
      setIngestingId(null);
    }
  }

  async function handleDelete(source: KnowledgeSource) {
    if (!window.confirm(`ลบเอกสาร "${source.title}" และ chunks ที่เกี่ยวข้อง?`)) return;

    setDeletingId(source.id);
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteKnowledgeSource(source.id);
      setSuccessMessage(`ลบ "${source.title}" แล้ว`);
      await loadCatalog();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ลบไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  }

  function renderManifestRow(item: KnowledgeCatalogItem) {
    const ingestKey = item.manifest_id;
    const isSyncing = syncingId === item.manifest_id;
    const isIngesting = ingestingId === ingestKey || ingestingId === item.id;

    return (
      <div
        key={item.manifest_id}
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <HiOutlineDocumentText className="shrink-0 text-teal/80" />
            <p className="font-section-thai text-[0.9rem] text-text">{item.title}</p>
            <span
              className={`font-mono rounded-full border px-2 py-0.5 text-[0.5rem] tracking-wider ${
                item.synced
                  ? "border-teal/30 bg-teal/10 text-teal"
                  : "border-amber/30 bg-amber/10 text-amber"
              }`}
            >
              {item.synced ? "SYNCED" : "NOT SYNCED"}
            </span>
          </div>
          <p className="font-mono mt-1 truncate text-[0.58rem] text-muted">{item.path}</p>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <span className="font-mono text-[0.55rem] text-muted">chunks: {item.chunk_count}</span>
            <span className="font-mono text-[0.55rem] text-muted">
              ingest: {formatDate(item.last_ingested_at)}
            </span>
            {item.topic && (
              <span className="font-mono text-[0.55rem] text-muted">topic: {item.topic}</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {!item.synced ? (
            <button
              type="button"
              onClick={() => handleSyncManifest(item.manifest_id)}
              disabled={!!syncingId || syncingManifest}
              className="font-mono flex cursor-pointer items-center gap-1.5 rounded-lg border border-teal/40 bg-teal/10 px-3 py-1.5 text-[0.58rem] tracking-wider text-teal transition hover:bg-teal/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiOutlineArrowPath className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Sync…" : "Sync"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditSourceId(item.id!)}
                className="font-mono flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[0.58rem] tracking-wider text-text/80 transition hover:border-teal/40 hover:text-teal"
              >
                <HiOutlinePencilSquare />
                แก้ไข
              </button>
              <button
                type="button"
                onClick={() => handleIngest(ingestKey)}
                disabled={!!ingestingId}
                className="font-mono flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[0.58rem] tracking-wider text-text/80 transition hover:border-teal/40 hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
              >
                <HiOutlineCircleStack />
                {isIngesting ? "Ingest…" : "Re-ingest"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  function renderUploadRow(source: KnowledgeSource) {
    const isIngesting = ingestingId === source.id;
    const isDeleting = deletingId === source.id;

    return (
      <div
        key={source.id}
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <HiOutlineDocumentText className="shrink-0 text-teal/80" />
            <p className="font-section-thai text-[0.9rem] text-text">{source.title}</p>
            <span className="font-mono rounded-full border border-white/15 px-2 py-0.5 text-[0.5rem] tracking-wider text-muted">
              {source.type}
            </span>
          </div>
          <p className="font-mono mt-1 text-[0.58rem] text-muted">{source.filename}</p>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <span className="font-mono text-[0.55rem] text-muted">chunks: {source.chunk_count}</span>
            <span className="font-mono text-[0.55rem] text-muted">
              upload: {formatDate(source.created_at)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditSourceId(source.id)}
            className="font-mono flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[0.58rem] tracking-wider text-text/80 transition hover:border-teal/40 hover:text-teal"
          >
            <HiOutlinePencilSquare />
            แก้ไข
          </button>
          <button
            type="button"
            onClick={() => handleIngest(source.id)}
            disabled={!!ingestingId}
            className="font-mono flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[0.58rem] tracking-wider text-text/80 transition hover:border-teal/40 hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineCircleStack />
            {isIngesting ? "Ingest…" : "Re-ingest"}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(source)}
            disabled={!!deletingId}
            className="font-mono flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-3 py-1.5 text-[0.58rem] tracking-wider text-red-400 transition hover:border-red-500/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineTrash />
            {isDeleting ? "ลบ…" : "ลบ"}
          </button>
        </div>
      </div>
    );
  }

  const manifestCount =
    catalog?.modules.reduce((sum, m) => sum + m.sources.length, 0) ?? 0;

  const activeModuleGroup = catalog?.modules.find((m) => m.module === activeTab);

  const filteredManifestSources = useMemo(() => {
    if (!activeModuleGroup || activeTab === "uploads") return [];
    return activeModuleGroup.sources.filter((item) =>
      matchesSearch(
        searchQuery,
        item.title,
        item.manifest_id,
        item.path,
        item.stage,
        item.topic,
        item.filename,
        item.language,
      ),
    );
  }, [activeModuleGroup, activeTab, searchQuery]);

  const filteredUploads = useMemo(() => {
    if (!catalog || activeTab !== "uploads") return [];
    return catalog.uploads.filter((source) =>
      matchesSearch(
        searchQuery,
        source.title,
        source.filename,
        source.topic,
        source.type,
        source.manifest_id,
      ),
    );
  }, [catalog, activeTab, searchQuery]);

  const tabCounts = useMemo(() => {
    const counts: Record<KnowledgeTab, number> = {
      space: 0,
      arena: 0,
      studio: 0,
      uploads: catalog?.uploads.length ?? 0,
    };
    for (const group of catalog?.modules ?? []) {
      if (group.module in counts) {
        counts[group.module as ModuleTab] = group.sources.length;
      }
    }
    return counts;
  }, [catalog]);

  const activeMeta =
    activeTab === "uploads"
      ? {
          label: "UPLOADS",
          description: "เอกสาร ad-hoc ที่อัปโหลดจาก backoffice (ไม่ผ่าน manifest)",
        }
      : (MODULE_META[activeTab] ?? { label: activeTab.toUpperCase(), description: "" });

  const visibleCount = activeTab === "uploads" ? filteredUploads.length : filteredManifestSources.length;
  const totalInTab = activeTab === "uploads" ? tabCounts.uploads : tabCounts[activeTab];

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <BackofficeSidebar user={user} activeSection="knowledge" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <IoRocketOutline className="text-xl text-teal" />
            <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">
              BACKOFFICE
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="btn-clip font-mono flex cursor-pointer items-center gap-2 border border-teal/50 bg-teal/15 px-3 py-2 text-[0.62rem] tracking-[0.12em] text-teal transition hover:bg-teal hover:text-bg"
            >
              <HiOutlineArrowUpTray />
              อัปโหลดเอกสาร
            </button>
            <button
              type="button"
              onClick={() => handleSyncManifest("all")}
              disabled={syncingManifest || loading}
              className="font-mono flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[0.62rem] tracking-wider text-text/80 transition hover:border-teal/40 hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiOutlineArrowPath className={syncingManifest ? "animate-spin" : ""} />
              {syncingManifest ? "Sync…" : "Sync manifest"}
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto max-w-[960px] space-y-5">
            {catalog && (
              <div className="grid gap-3 sm:grid-cols-3">
                <GlassCard className="p-4">
                  <p className="font-mono mb-1 text-[0.55rem] tracking-wider text-muted">MANIFEST</p>
                  <p className="font-display text-2xl text-teal">{manifestCount}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="font-mono mb-1 text-[0.55rem] tracking-wider text-muted">CHUNKS</p>
                  <p className="font-display text-2xl text-teal">{catalog.total_chunks}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="font-mono mb-1 text-[0.55rem] tracking-wider text-muted">EMBEDDING</p>
                  <p
                    className={`font-mono text-[0.72rem] ${catalog.embedding_enabled ? "text-teal" : "text-amber"}`}
                  >
                    {catalog.embedding_enabled ? catalog.embedding_provider : "ยังไม่ตั้งค่า"}
                  </p>
                </GlassCard>
              </div>
            )}

            {loading && (
              <p className="font-section-thai text-[0.9rem] text-muted">กำลังโหลด…</p>
            )}

            {error && (
              <GlassCard className="border-red-500/30 p-4">
                <p className="font-section-thai text-[0.88rem] text-red-400">{error}</p>
              </GlassCard>
            )}

            {successMessage && (
              <GlassCard className="border-teal/30 p-4">
                <p className="font-section-thai text-[0.88rem] text-teal">{successMessage}</p>
              </GlassCard>
            )}

            {catalog && (
              <GlassCard className="overflow-hidden p-0">
                <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {MODULE_TABS.map((tab) => {
                      const meta = MODULE_META[tab];
                      const isActive = activeTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`font-mono cursor-pointer rounded-lg border px-3 py-2 text-[0.62rem] tracking-[0.14em] transition ${
                            isActive
                              ? tabActiveClass(tab)
                              : "border-transparent text-text/45 hover:border-white/10 hover:bg-white/[0.03] hover:text-text/75"
                          }`}
                        >
                          {meta.label}
                          <span className="ml-1.5 opacity-70">({tabCounts[tab]})</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setActiveTab("uploads")}
                      className={`font-mono cursor-pointer rounded-lg border px-3 py-2 text-[0.62rem] tracking-[0.14em] transition ${
                        activeTab === "uploads"
                          ? tabActiveClass("uploads")
                          : "border-transparent text-text/45 hover:border-white/10 hover:bg-white/[0.03] hover:text-text/75"
                      }`}
                    >
                      UPLOADS
                      <span className="ml-1.5 opacity-70">({tabCounts.uploads})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text/35" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาชื่อ, stage, topic, path…"
                      className="w-full rounded-lg border border-white/10 bg-[rgba(3,8,18,0.45)] py-2.5 pl-9 pr-3 font-section-thai text-[0.88rem] text-text outline-none placeholder:text-muted/70 focus:border-teal/35"
                    />
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p
                        className={`font-display text-[0.95rem] font-bold tracking-[0.16em] ${activeTab === "uploads" ? "text-text/85" : moduleHeaderClass(activeTab)}`}
                      >
                        {activeMeta.label}
                      </p>
                      <p className="font-section-thai mt-0.5 text-[0.82rem] text-text/65">
                        {activeMeta.description}
                      </p>
                    </div>
                    <p className="font-mono text-[0.55rem] tracking-wider text-muted">
                      {searchQuery.trim()
                        ? `แสดง ${visibleCount} / ${totalInTab}`
                        : `${totalInTab} รายการ`}
                    </p>
                  </div>
                </div>

                {activeTab === "uploads" ? (
                  filteredUploads.length === 0 ? (
                    <p className="font-section-thai px-4 py-8 text-center text-[0.88rem] text-muted">
                      {searchQuery.trim()
                        ? "ไม่พบเอกสารที่ตรงกับคำค้นหา"
                        : "ยังไม่มีเอกสาร ad-hoc — กด อัปโหลดเอกสาร"}
                    </p>
                  ) : (
                    <div className="divide-y divide-white/[0.06]">
                      {filteredUploads.map((source) => renderUploadRow(source))}
                    </div>
                  )
                ) : filteredManifestSources.length === 0 ? (
                  <p className="font-section-thai px-4 py-8 text-center text-[0.88rem] text-muted">
                    {searchQuery.trim()
                      ? "ไม่พบรายการที่ตรงกับคำค้นหา"
                      : "ไม่มีรายการใน module นี้"}
                  </p>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {groupByStage(filteredManifestSources).map(({ stage, items }) => (
                      <div key={stage ?? "__none__"}>
                        {stage && (
                          <p className="font-mono border-b border-white/[0.04] bg-white/[0.015] px-4 py-2 text-[0.58rem] tracking-[0.14em] text-muted">
                            STAGE · {stage}
                          </p>
                        )}
                        <div className="divide-y divide-white/[0.04]">
                          {items.map((item) => renderManifestRow(item))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            )}

            <p className="font-section-thai text-[0.8rem] text-muted">
              รายการ manifest อ่านจาก{" "}
              <code className="text-teal">backend/data/knowledge/manifest.yaml</code> — เอกสารที่
              sync แล้วใช้โดย{" "}
              <Link to="/studio" className="text-teal hover:underline">
                Studio (LAIKA)
              </Link>
            </p>
          </div>
        </main>
      </div>

      {uploadOpen && (
        <KnowledgeUploadModal
          onClose={() => setUploadOpen(false)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            loadCatalog();
          }}
          onError={setError}
        />
      )}

      {editSourceId && (
        <KnowledgeEditModal
          sourceId={editSourceId}
          onClose={() => setEditSourceId(null)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            loadCatalog();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}
