"use client";

import { motion, useReducedMotion } from "framer-motion";
import AgentAvatar from "@/components/ai/AgentAvatar";
import type { GuideDockPosition } from "@/lib/marketing/naroa-guide";

type NaroaGuideLauncherProps = {
  visible: boolean;
  active: boolean;
  onClick: () => void;
  position: GuideDockPosition | null;
  label?: string;
};

export function NaroaGuideLauncher({
  visible,
  active,
  onClick,
  position,
  label
}: NaroaGuideLauncherProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        position
          ? {
              top: position.avatarTop,
              left: position.avatarLeft
            }
          : {
              top: "auto",
              left: "auto",
              right: 24,
              bottom: 24
            }
      }
      initial={false}
      transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed z-[112] transition duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Open Neroa guided homepage walkthrough"
        className={`naroa-guide-launcher group ${
          active ? "ring-2 ring-cyan-300/45 ring-offset-4 ring-offset-white/40" : ""
        }`}
      >
        <AgentAvatar id="narua" active size={54} showLabel={false} className="pointer-events-none" />
        <span className="sr-only">Open Neroa guided homepage walkthrough</span>
      </button>
      <div className="pointer-events-none mt-2 hidden justify-end md:flex">
        <span className="rounded-full border border-slate-200/70 bg-white/78 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          {label ?? (active ? "Guide active" : "Neroa guide")}
        </span>
      </div>
    </motion.div>
  );
}
