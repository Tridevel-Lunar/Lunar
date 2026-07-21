import { useEffect } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

import { ApiError } from "@/lib/api";

type MissionRunErrorDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

const BLOCK_CODE_ERROR_HINTS: Record<string, string> = {
  "Program must include setup and main_loop blocks":
    "โปรแกรมต้องมีบล็อก Setup และ Main Loop — อย่าวางบล็อกไว้นอกโครงสร้างนี้",
  "All blocks must be inside setup or main_loop":
    "บล็อกทุกตัวต้องอยู่ภายใน Setup หรือ Main Loop เท่านั้น",
  "main_loop must include at least one control block":
    "Main Loop ต้องมีบล็อกควบคุมอย่างน้อย 1 บล็อก (เช่น if, turn payload, turn heater)",
  "Invalid AST program root": "โครงสร้างโปรแกรมไม่ถูกต้อง ลองล้างโค้ดแล้วเริ่มใหม่",
};

function formatBlockCodeErrorMessage(detail: string): string {
  const hint = BLOCK_CODE_ERROR_HINTS[detail];
  return hint ?? detail;
}

export function runErrorPresentation(err: unknown): { title: string; message: string } {
  if (err instanceof ApiError) {
    const isValidation = err.status === 422;
    return {
      title: isValidation ? "โค้ดบล็อกไม่ถูกต้อง" : "ส่งภารกิจไม่สำเร็จ",
      message: formatBlockCodeErrorMessage(err.message),
    };
  }
  return {
    title: "ส่งภารกิจไม่สำเร็จ",
    message: "ประมวลผลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  };
}

/** Modal for block-code validation / run errors (above Blockly toolbox z-index). */
export default function MissionRunErrorDialog({
  open,
  title,
  message,
  onClose,
}: MissionRunErrorDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-run-error-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-label="ปิด"
      />
      <div className="relative w-full max-w-md rounded-lg border border-orange-500/35 bg-[#0a1220] p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <HiOutlineExclamationTriangle
            className="mt-0.5 shrink-0 text-2xl text-orange-400"
            aria-hidden
          />
          <div className="min-w-0">
            <h2
              id="mission-run-error-title"
              className="font-section-thai text-lg font-medium text-orange-200"
            >
              {title}
            </h2>
            <p className="font-section-thai mt-2 text-[0.88rem] leading-relaxed text-text/75">
              {message}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-section-thai mt-5 w-full rounded-md border border-orange-500/50 bg-orange-500/15 px-4 py-2.5 text-[0.9rem] text-orange-100 transition hover:bg-orange-500/25"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
