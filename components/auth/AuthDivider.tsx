type AuthDividerProps = {
  label?: string;
};

export default function AuthDivider({ label = "หรือ" }: AuthDividerProps) {
  return (
    <div className="my-5 flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-cyan/15" aria-hidden />
      <span className="shrink-0 text-[0.85rem] leading-none whitespace-nowrap text-muted">
        {label}
      </span>
      <span className="h-px flex-1 bg-cyan/15" aria-hidden />
    </div>
  );
}
