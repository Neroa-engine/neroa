"use client";

import { motion, useReducedMotion } from "framer-motion";

type LogoProps = {
  variant?: "default" | "prominent";
};

const APPROVED_PUBLIC_LOGO_SRC = "/logo/neroa.png?v=approved-blue-lockup-20260412";

export function Logo({ variant = "default" }: LogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const prominent = variant === "prominent";

  return (
    <motion.div
      className="relative shrink-0"
      animate={
        prefersReducedMotion
          ? undefined
          : {
              y: [0, -1.25, 0]
            }
      }
      transition={{
        duration: 5.6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.1),rgba(139,92,246,0.07),transparent_70%)] blur-2xl ${
          prominent ? "scale-[1.04]" : "scale-[1.01]"
        }`}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [0.24, 0.42, 0.24]
              }
        }
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.img
        src={APPROVED_PUBLIC_LOGO_SRC}
        alt="Neroa"
        className={`relative block h-auto w-auto select-none ${
          prominent ? "max-h-[54px] sm:max-h-[60px] lg:max-h-[64px]" : "max-h-[42px] sm:max-h-[48px]"
        }`}
        draggable={false}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                filter: [
                  "drop-shadow(0 8px 18px rgba(59,130,246,0.08))",
                  "drop-shadow(0 10px 24px rgba(99,102,241,0.12))",
                  "drop-shadow(0 8px 18px rgba(59,130,246,0.08))"
                ]
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
