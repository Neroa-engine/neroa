"use client";

import { motion, useReducedMotion } from "framer-motion";

export function GuidedOverlayLayer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
      className="pointer-events-none fixed inset-0 z-[96] bg-[linear-gradient(180deg,rgba(15,23,42,0.12),rgba(15,23,42,0.2))] backdrop-blur-[1px]"
      aria-hidden="true"
    />
  );
}
