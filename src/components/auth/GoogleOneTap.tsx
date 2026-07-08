import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { signInWithGoogleCredential } from "@/lib/auth";
import {
  ensureGoogleIdentityInitialized,
  isGoogleSignInConfigured,
  promptGoogleOneTap,
} from "@/lib/googleIdentity";

type GoogleOneTapProps = {
  redirectTo?: string;
  onError?: (message: string) => void;
};

export default function GoogleOneTap({ redirectTo = "/space", onError }: GoogleOneTapProps) {
  const navigate = useNavigate();
  const promptedRef = useRef(false);

  const handleCredential = useCallback(
    async (response: google.accounts.id.CredentialResponse) => {
      try {
        await signInWithGoogleCredential(response.credential);
        navigate(redirectTo);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      }
    },
    [navigate, onError, redirectTo],
  );

  useEffect(() => {
    if (!isGoogleSignInConfigured() || promptedRef.current) {
      return;
    }

    let cancelled = false;

    async function setup() {
      try {
        await ensureGoogleIdentityInitialized(handleCredential);
        if (cancelled || promptedRef.current) {
          return;
        }
        promptedRef.current = true;
        await promptGoogleOneTap();
      } catch {
        // One Tap is optional — the manual Google button remains available.
      }
    }

    void setup();

    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel();
    };
  }, [handleCredential]);

  return null;
}
