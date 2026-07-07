import { AnimatePresence, motion } from "framer-motion";

import { useMotionReady } from "@/lib/useMotionReady";

type AuthErrorMessageProps = {
  message: string;
};

export default function AuthErrorMessage({ message }: AuthErrorMessageProps) {
  const { reduceMotion } = useMotionReady();

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={message}
        className="mb-4 text-[0.85rem] text-[#ff6b6b]"
        role="alert"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {message}
      </motion.p>
    </AnimatePresence>
  );
}
