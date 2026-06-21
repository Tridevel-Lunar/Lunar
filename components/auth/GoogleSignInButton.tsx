"use client";

import { motion } from "framer-motion";

import GoogleLogo from "@/components/auth/GoogleLogo";
import { API_URL } from "@/lib/constants";

type GoogleSignInButtonProps = {
  label?: string;
};

export default function GoogleSignInButton({
  label = "เข้าสู่ระบบด้วย Google",
}: GoogleSignInButtonProps) {
  return (
    <motion.a
      href={`${API_URL}/auth/google`}
      className="auth-btn-google"
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className="auth-btn-google-icon">
        <GoogleLogo size={20} />
      </span>
      <span>{label}</span>
    </motion.a>
  );
}
