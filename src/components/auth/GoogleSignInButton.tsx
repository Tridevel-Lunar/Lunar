import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { signInWithGoogleCredential } from "@/lib/auth";
import {
  ensureGoogleIdentityInitialized,
  isGoogleSignInConfigured,
  renderGoogleSignInButton,
  type GoogleSignInButtonText,
} from "@/lib/googleIdentity";

type GoogleSignInButtonProps = {
  redirectTo?: string;
  onError?: (message: string) => void;
  /** Google-rendered button label variant */
  buttonText?: GoogleSignInButtonText;
  /**
   * Custom credential handler (e.g. link account).
   * When set, skips default sign-in + navigate.
   */
  onCredential?: (credential: string) => Promise<void>;
};

export default function GoogleSignInButton({
  redirectTo = "/space",
  onError,
  buttonText = "signin_with",
  onCredential,
}: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const redirectToRef = useRef(redirectTo);
  const [loading, setLoading] = useState(false);
  const [initFailed, setInitFailed] = useState(false);

  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;
  redirectToRef.current = redirectTo;

  useEffect(() => {
    if (!isGoogleSignInConfigured() || !containerRef.current) {
      return;
    }

    const parent = containerRef.current;
    let cancelled = false;

    async function setup() {
      try {
        await ensureGoogleIdentityInitialized(async (response) => {
          if (cancelled) {
            return;
          }

          setLoading(true);
          try {
            const custom = onCredentialRef.current;
            if (custom) {
              await custom(response.credential);
            } else {
              await signInWithGoogleCredential(response.credential);
              navigate(redirectToRef.current);
            }
          } catch (err) {
            onErrorRef.current?.(
              err instanceof Error ? err.message : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ",
            );
          } finally {
            setLoading(false);
          }
        });

        if (cancelled) {
          return;
        }

        await renderGoogleSignInButton(parent, {
          text: buttonText,
          width: parent.clientWidth,
        });
        setInitFailed(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "ไม่สามารถโหลดปุ่ม Google Sign-In ได้";
        setInitFailed(true);
        onErrorRef.current?.(message);
      }
    }

    void setup();

    return () => {
      cancelled = true;
      parent.replaceChildren();
    };
  }, [buttonText, navigate]);

  if (!isGoogleSignInConfigured()) {
    return null;
  }

  return (
    <div className="relative w-full">
      {loading ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded bg-bg/70 text-sm text-text-muted"
          aria-live="polite"
        >
          กำลังเชื่อมต่อ Google...
        </div>
      ) : null}
      {initFailed ? (
        <p className="text-center text-sm text-red-400" role="alert">
          ไม่สามารถโหลดปุ่ม Google Sign-In ได้ — ตรวจสอบการตั้งค่า OAuth
        </p>
      ) : null}
      <div
        ref={containerRef}
        className="flex w-full justify-center overflow-hidden rounded"
        aria-label="Sign in with Google"
      />
    </div>
  );
}
