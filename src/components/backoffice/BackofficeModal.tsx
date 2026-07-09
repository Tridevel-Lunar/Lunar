import { useEffect, type ReactNode } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

type BackofficeModalProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export default function BackofficeModal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: BackofficeModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-teal/25 bg-[linear-gradient(135deg,#060e1a_0%,#0a1628_50%,#060e1a_100%)] shadow-[0_0_60px_rgba(29,233,182,0.12)] ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[0.58rem] tracking-[0.18em] text-teal">BACKOFFICE</p>
            <h2 className="font-display mt-0.5 text-[1.1rem] font-bold tracking-[0.12em] text-text">
              {title}
            </h2>
            {subtitle && (
              <p className="font-section-thai mt-1 text-[0.82rem] text-muted">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text/70 transition hover:border-white/20 hover:text-text"
          >
            <HiOutlineXMark />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-white/10 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
