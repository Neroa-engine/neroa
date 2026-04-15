"use client";

import { motion, useReducedMotion } from "framer-motion";

type GuidedSectionHighlighterProps = {
  rect: DOMRect | null;
  label: string;
};

export function GuidedSectionHighlighter({
  rect,
  label
}: GuidedSectionHighlighterProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!rect) {
    return null;
  }

  const top = Math.max(rect.top - 14, 12);
  const left = Math.max(rect.left - 14, 12);
  const width = Math.max(rect.width + 28, 120);
  const height = Math.max(rect.height + 28, 120);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
      className="pointer-events-none fixed inset-0 z-[108]"
      aria-hidden="true"
    >
      <motion.div
        className="naroa-guide-spotlight"
        animate={{ top, left, width, height }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="naroa-guide-spotlight-label">{label}</span>
      </motion.div>
    </motion.div>
  );
}
