import { useRef, useState } from "react";
import { HiOutlineArrowUpTray } from "react-icons/hi2";

import BackofficeModal from "@/components/backoffice/BackofficeModal";
import { ApiError, uploadKnowledgeDocument } from "@/lib/api";

const ACCEPTED_TYPES = ".md,.markdown,.txt,.pdf";

type KnowledgeUploadModalProps = {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function KnowledgeUploadModal({
  onClose,
  onSuccess,
  onError,
}: KnowledgeUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("th");

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const result = await uploadKnowledgeDocument(selectedFile, {
        title: title.trim() || undefined,
        topic: topic.trim() || undefined,
        language,
      });
      onSuccess(`อัปโหลด "${result.title}" สำเร็จ — ingest ${result.chunks_ingested} chunks`);
      onClose();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  return (
    <BackofficeModal
      title="อัปโหลดเอกสาร"
      subtitle="Ad-hoc upload — ไม่ผ่าน manifest · ingest ทันทีหลังอัปโหลด"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="font-mono cursor-pointer rounded-lg border border-white/15 px-4 py-2 text-[0.62rem] tracking-wider text-text/70 transition hover:border-white/25"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-clip font-mono flex cursor-pointer items-center gap-2 border border-teal/50 bg-teal/15 px-4 py-2 text-[0.62rem] tracking-[0.12em] text-teal transition hover:bg-teal hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineArrowUpTray className={uploading ? "animate-pulse" : ""} />
            {uploading ? "กำลังอัปโหลด…" : "อัปโหลด + Ingest"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="font-section-thai block text-[0.8rem] text-muted">
          ชื่อเอกสาร (ไม่บังคับ)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น LUNAR CubeSat Basics"
            className="mt-1 w-full rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-3 py-2 font-section-thai text-[0.88rem] text-text outline-none focus:border-teal/40"
          />
        </label>

        <label className="font-section-thai block text-[0.8rem] text-muted">
          Topic (ไม่บังคับ)
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="เช่น power-budget"
            className="mt-1 w-full rounded-lg border border-white/10 bg-[rgba(3,8,18,0.5)] px-3 py-2 font-section-thai text-[0.88rem] text-text outline-none focus:border-teal/40"
          />
        </label>

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

        <label className="font-mono block text-[0.62rem] tracking-wider text-muted">
          ไฟล์ (.md, .txt, .pdf)
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 py-2 text-[0.75rem] text-text/80 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-teal/20 file:px-2 file:py-1 file:text-teal"
          />
        </label>
      </div>
    </BackofficeModal>
  );
}
