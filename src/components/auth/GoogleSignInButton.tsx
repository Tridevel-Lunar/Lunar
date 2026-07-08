import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import GoogleLogo from "@/components/auth/GoogleLogo";
import { signInWithGoogleCredential } from "@/lib/auth";
import {
  ensureGoogleIdentityInitialized,
  isGoogleSignInConfigured,
  promptGoogleSignIn,
} from "@/lib/googleIdentity";

type GoogleSignInButtonProps = {
  label?: string;
  redirectTo?: string;
  onError?: (message: string) => void;
};

export default function GoogleSignInButton({
  label = "เข้าสู่ระบบด้วย Google",
  redirectTo = "/space",
  onError,
}: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isGoogleSignInConfigured()) {
    return null;
  }

  async function handleClick() {
    setLoading(true);

    try {
      await ensureGoogleIdentityInitialized(async (response) => {
        try {
          await signInWithGoogleCredential(response.credential);
          navigate(redirectTo);
        } catch (err) {
          onError?.(err instanceof Error ? err.message : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
        } finally {
          setLoading(false);
        }
      });
      await promptGoogleSignIn((notification) => {
        if (
          notification.isNotDisplayed() ||
          notification.isSkippedMoment() ||
          notification.isDismissedMoment()
        ) {
          setLoading(false);
        }
      });
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      setLoading(false);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded border border-white/14 bg-white/5 px-4 py-3 text-[0.9rem] font-medium text-text transition-[border-color,background,box-shadow] hover:border-white/28 hover:bg-white/[0.09] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)] disabled:cursor-wait disabled:opacity-70"
      whileHover={loading ? undefined : { scale: 1.02, y: -1 }}
      whileTap={loading ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className="inline-flex shrink-0 leading-none [&_svg]:block">
        <GoogleLogo size={20} />
      </span>
      <span>{loading ? "กำลังเชื่อมต่อ Google..." : label}</span>
    </motion.button>
  );
}
