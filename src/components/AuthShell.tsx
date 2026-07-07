import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useMotionReady } from "@/lib/useMotionReady";

const StarField = lazy(() => import("@/components/StarField"));

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const spring = { type: "spring" as const, stiffness: 130, damping: 20 };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: spring },
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const { hydrated, reduceMotion } = useMotionReady();

  const container = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : containerVariants;

  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : itemVariants;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg p-8">
      <Suspense fallback={null}>
        <StarField />
      </Suspense>
      <div
        className="pointer-events-none absolute top-[-120px] left-1/2 -ml-[210px] h-[420px] w-[420px] animate-auth-orb-drift rounded-full bg-cyan/[0.07] blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-60px] bottom-[-80px] h-[280px] w-[280px] animate-auth-orb-drift rounded-full bg-teal/[0.05] blur-[80px] [animation-delay:-5s]"
        aria-hidden
      />

      <motion.div
        className="relative z-[1] w-full max-w-[420px]"
        variants={container}
        initial="hidden"
        animate={hydrated ? "show" : "hidden"}
      >
        <motion.div variants={item}>
          <Link
            to="/"
            className="font-en mb-8 inline-block animate-auth-glow-pulse text-base font-extrabold tracking-[0.35em] text-cyan no-underline"
          >
            LUNAR
          </Link>
        </motion.div>

        <motion.div
          className="auth-card-scanned relative overflow-hidden bg-[rgba(6,14,28,0.82)] p-8 backdrop-blur-xl"
          variants={item}
        >
          <motion.h1 className="mb-2 text-2xl" variants={item}>
            {title}
          </motion.h1>
          <motion.p className="mb-7 text-[0.95rem] text-muted" variants={item}>
            {subtitle}
          </motion.p>
          <motion.div variants={item}>{children}</motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
