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
      className="flex w-full items-center justify-center gap-3 rounded border border-white/14 bg-white/5 px-4 py-3 text-[0.9rem] font-medium text-text no-underline transition-[border-color,background,box-shadow] hover:border-white/28 hover:bg-white/[0.09] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className="inline-flex shrink-0 leading-none [&_svg]:block">
        <GoogleLogo size={20} />
      </span>
      <span>{label}</span>
    </motion.a>
  );
}
