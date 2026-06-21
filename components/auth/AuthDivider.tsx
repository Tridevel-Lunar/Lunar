type AuthDividerProps = {
  label?: string;
};

export default function AuthDivider({ label = "หรือ" }: AuthDividerProps) {
  return (
    <div className="auth-divider" role="separator">
      <span className="auth-divider-line" aria-hidden />
      <span className="auth-divider-text">{label}</span>
      <span className="auth-divider-line" aria-hidden />
    </div>
  );
}
