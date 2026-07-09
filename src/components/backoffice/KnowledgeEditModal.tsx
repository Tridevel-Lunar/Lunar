import { useEffect, useState } from "react";
import { HiOutlineCheck } from "react-icons/hi2";

import BackofficeModal from "@/components/backoffice/BackofficeModal";
import {
  ApiError,
  getKnowledgeSourceDetail,
  patchKnowledgeSource,
  type KnowledgeSourceDetail,
} from "@/lib/api";

type KnowledgeEditModalProps = {
  sourceId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function KnowledgeEditModal({
  sourceId,
  onClose,
  onSuccess,
  onError,
}: KnowledgeEditModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<KnowledgeSourceDetail | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("th");
  const [license, setLicense] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getKnowledgeSourceDetail(sourceId);
        if (cancelled) return;
        setDetail(data);
        setTitle(data.title);
        setTopic(data.topic ?? "");
        setLanguage(data.language);
        setLicense(data.license ?? "");
        setContent(data.content ?? "");
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof ApiError ? err.message : "โหลดเอกสารไม่สำเร็จ");
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceId, onClose, onError]);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await patchKnowledgeSource(sourceId, {
        title: title.trim(),
        topic: topic.trim() || undefined,
        language,
        license: license.trim() || undefined,
        content: detail?.content_editable ? content : undefined,
        auto_reingest: true,
      });
      onSuccess(
        `บันทึก "${result.title}" แล้ว — re-ingest ${result.chunks_ingested} chunks`,
      );
      onClose();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BackofficeModal
      wide
      title="แก้ไขเอกสาร"
      subtitle={detail?.filename ?? "กำลังโหลด…"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="font-mono cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-[0.62rem] tracking-wider text-text/70 transition hover:border-white/25"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving || !title.trim()}
            className="btn-clip font-mono flex cursor-pointer items-center gap-2 border border-teal/50 bg-teal/15 px-4 py-2 text-[0.62rem] tracking-[0.12em] text-teal transition hover:bg-teal hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineCheck className={saving ? "animate-pulse" : ""} />
            {saving ? "กำลังบันทึก…" : "บันทึก + Re-ingest"}
          </button>
        </>
      }
    >
      {loading ? (
        <p className="font-section-thai text-[0.9rem] text-muted">กำลังโหลด…</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="font-section-thai block text-[0.8rem] text-muted">
              ชื่อเอกสาร
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-3 py-2 font-section-thai text-[0.88rem] text-text outline-none focus:border-teal/40"
              />
            </label>
            <label className="font-section-thai block text-[0.8rem] text-muted">
              Topic
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-3 py-2 font-section-thai text-[0.88rem] text-text outline-none focus:border-teal/40"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="font-section-thai block text-[0.8rem] text-muted">
              ภาษา
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-3 py-2 font-section-thai text-[0.88rem] text-text outline-none focus:border-teal/40"
              >
                <option value="th">ไทย</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="font-section-thai block text-[0.8rem] text-muted">
              License
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-3 py-2 font-section-thai text-[0.88rem] text-text outline-none focus:border-teal/40"
              />
            </label>
          </div>

          {detail?.content_editable ? (
            <label className="font-section-thai block text-[0.8rem] text-muted">
              เนื้อหา (Markdown / Text)
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-3 py-2 font-mono text-[0.78rem] leading-relaxed text-text outline-none focus:border-teal/40"
              />
            </label>
          ) : (
            <p className="rounded-lg border border-amber/25 bg-amber/10 px-3 py-2 font-section-thai text-[0.82rem] text-amber">
              ไฟล์ PDF แก้ metadata ได้ แต่แก้เนื้อหาในระบบไม่ได้ — อัปโหลดไฟล์ใหม่แทน
            </p>
          )}

          {detail?.manifest_id && (
            <p className="font-mono text-[0.58rem] text-muted">
              manifest: {detail.manifest_id} · path บน disk ไม่อัปเดตอัตโนมัติ
            </p>
          )}
        </div>
      )}
    </BackofficeModal>
  );
}
