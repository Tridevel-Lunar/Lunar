"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

const StarField = dynamic(() => import("@/components/StarField"), { ssr: false });

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
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : containerVariants;

  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : itemVariants;

  return (
    <div className="auth-shell">
      <StarField />
      <div className="auth-orb auth-orb-cyan" aria-hidden />
      <div className="auth-orb auth-orb-teal" aria-hidden />

      <motion.div
        className="auth-card-wrap"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Link href="/" className="font-en auth-logo" style={logoStyle}>
            LUNAR
          </Link>
        </motion.div>

        <motion.div className="auth-card" variants={item}>
          <motion.h1
            className="auth-title"
            variants={item}
            style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="auth-subtitle"
            variants={item}
            style={{ color: "var(--muted)", marginBottom: "1.75rem", fontSize: "0.95rem" }}
          >
            {subtitle}
          </motion.p>
          <motion.div className="auth-form-body" variants={item}>
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const logoStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: "2rem",
  fontWeight: 800,
  fontSize: "1rem",
  letterSpacing: "0.35em",
  color: "var(--cyan)",
  textDecoration: "none",
};
