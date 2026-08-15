import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

import ModuleSidebar from "@/components/app/ModuleSidebar";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import {
  changeMyPassword,
  deleteMyPicture,
  linkGoogleAccount,
  unlinkGoogleAccount,
  updateMe,
  uploadMyPicture,
  type User,
} from "@/lib/api";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user";
import { useAuthSession } from "@/routes/AuthUserContext";

type Props = {
  user: User;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2.5 font-section-thai text-[0.92rem] text-text outline-none transition focus:border-cyan/40";

export default function SettingsView({ user }: Props) {
  const { setUser, refreshUser } = useAuthSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user.display_name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pictureBust, setPictureBust] = useState(0);

  const googleLinked = Boolean(user.google_linked);
  const hasPassword = Boolean(user.has_password);
  const pictureSrc = user.picture
    ? `${user.picture}${user.picture.includes("?") ? "&" : "?"}v=${pictureBust}`
    : DEFAULT_AVATAR_URL;

  async function applyUser(next: User) {
    setUser(next);
    setPictureBust(Date.now());
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setError(null);
    setMessage(null);
    try {
      const next = await updateMe({ display_name: displayName.trim() || null });
      await applyUser(next);
      setMessage("บันทึกชื่อแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกชื่อไม่สำเร็จ");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (newPassword.length < 8) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    setSavingPassword(true);
    try {
      const next = await changeMyPassword({
        current_password: hasPassword ? currentPassword : null,
        new_password: newPassword,
      });
      await applyUser(next);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(hasPassword ? "เปลี่ยนรหัสผ่านแล้ว" : "ตั้งรหัสผ่านแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกรหัสผ่านไม่สำเร็จ");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handlePickFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const next = await uploadMyPicture(file);
      await applyUser(next);
      setMessage("อัปโหลดรูปแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeletePicture() {
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const next = await deleteMyPicture();
      await applyUser(next);
      setMessage("ลบรูปแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  async function handleLinkGoogle(credential: string) {
    setBusyGoogle(true);
    setError(null);
    setMessage(null);
    try {
      const next = await linkGoogleAccount(credential);
      await applyUser(next);
      setMessage("เชื่อม Google แล้ว");
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เชื่อม Google ไม่สำเร็จ");
      throw err;
    } finally {
      setBusyGoogle(false);
    }
  }

  async function handleUnlinkGoogle() {
    if (!window.confirm("ยกเลิกการเชื่อม Google จากบัญชีนี้?")) return;
    setBusyGoogle(true);
    setError(null);
    setMessage(null);
    try {
      const next = await unlinkGoogleAccount();
      await applyUser(next);
      setMessage("ยกเลิกการเชื่อม Google แล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ยกเลิกการเชื่อมไม่สำเร็จ");
    } finally {
      setBusyGoogle(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <ModuleSidebar user={user} activeModule="space" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5 py-3">
          <HiOutlineCog6Tooth className="text-xl text-cyan" />
          <h1 className="font-display text-[1.35rem] font-bold tracking-[0.18em] text-text">
            SETTINGS
          </h1>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            {error ? (
              <p
                className="font-section-thai rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[0.85rem] text-red-300"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {message ? (
              <p
                className="font-section-thai rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2 text-[0.85rem] text-cyan"
                role="status"
              >
                {message}
              </p>
            ) : null}

            <section className="space-y-4">
              <h2 className="font-thai text-[1.25rem] font-semibold tracking-wide text-text">
                โปรไฟล์
              </h2>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-cyan/30">
                  <img
                    src={pictureSrc}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => void handlePickFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-2 font-section-thai text-[0.82rem] text-cyan transition hover:bg-cyan/15 disabled:opacity-50"
                  >
                    {uploading ? "กำลังอัปโหลด…" : "เปลี่ยนรูป"}
                  </button>
                  {user.picture ? (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => void handleDeletePicture()}
                      className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 font-section-thai text-[0.82rem] text-text/70 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
                    >
                      ลบรูป
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">EMAIL</p>
                <p className="font-section-thai mt-1 text-[0.92rem] text-text/80">{user.email}</p>
              </div>

              <form onSubmit={(e) => void handleSaveName(e)} className="space-y-3">
                <label className="block">
                  <span className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">
                    DISPLAY NAME
                  </span>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={255}
                    placeholder={getUserDisplayName({ ...user, display_name: null })}
                    className={inputClass}
                  />
                </label>
                <button
                  type="submit"
                  disabled={savingName}
                  className="cursor-pointer rounded-lg border border-cyan/50 bg-cyan/10 px-4 py-2.5 font-section-thai text-[0.88rem] font-medium text-cyan transition hover:bg-cyan hover:text-bg disabled:opacity-50"
                >
                  {savingName ? "กำลังบันทึก…" : "บันทึกชื่อ"}
                </button>
              </form>
            </section>

            <section className="space-y-4 border-t border-white/[0.06] pt-8">
              <h2 className="font-thai text-[1.25rem] font-semibold tracking-wide text-text">
                รหัสผ่าน
              </h2>

              <form onSubmit={(e) => void handleSavePassword(e)} className="space-y-3">
                {hasPassword ? (
                  <label className="block">
                    <span className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">
                      CURRENT PASSWORD
                    </span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </label>
                ) : null}
                <label className="block">
                  <span className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">
                    NEW PASSWORD
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[0.58rem] tracking-[0.14em] text-muted">
                    CONFIRM PASSWORD
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                    className={inputClass}
                  />
                </label>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="cursor-pointer rounded-lg border border-cyan/50 bg-cyan/10 px-4 py-2.5 font-section-thai text-[0.88rem] font-medium text-cyan transition hover:bg-cyan hover:text-bg disabled:opacity-50"
                >
                  {savingPassword
                    ? "กำลังบันทึก…"
                    : hasPassword
                      ? "เปลี่ยนรหัสผ่าน"
                      : "ตั้งรหัสผ่าน"}
                </button>
              </form>
            </section>

            <section className="space-y-4 border-t border-white/[0.06] pt-8">
              <h2 className="font-thai text-[1.25rem] font-semibold tracking-wide text-text">
                เชื่อมกับระบบอื่น
              </h2>

              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[1.35rem]"
                      aria-hidden
                    >
                      <FcGoogle />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[0.78rem] font-semibold tracking-[0.14em] text-text">
                        GOOGLE
                      </p>
                      <p className="font-mono mt-1.5 text-[0.58rem] tracking-[0.14em]">
                        {googleLinked ? (
                          <span className="text-teal">CONNECTED</span>
                        ) : (
                          <span className="text-text/45">NOT CONNECTED</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {googleLinked ? (
                    <button
                      type="button"
                      disabled={busyGoogle || !hasPassword}
                      onClick={() => void handleUnlinkGoogle()}
                      title={
                        hasPassword
                          ? undefined
                          : "ตั้งรหัสผ่านก่อนจึงจะยกเลิกการเชื่อม Google ได้"
                      }
                      className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 font-section-thai text-[0.82rem] text-text/75 transition hover:border-red-400/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ยกเลิกการเชื่อม
                    </button>
                  ) : (
                    <div
                      className={`w-full max-w-[240px] ${busyGoogle ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <GoogleSignInButton
                        buttonText="continue_with"
                        onCredential={handleLinkGoogle}
                        onError={(msg) => setError(msg)}
                      />
                    </div>
                  )}
                </div>

                {googleLinked && !hasPassword ? (
                  <p className="font-section-thai mt-3 text-[0.78rem] text-text/45">
                    ต้องมีรหัสผ่านก่อนจึงจะยกเลิกการเชื่อมได้
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
