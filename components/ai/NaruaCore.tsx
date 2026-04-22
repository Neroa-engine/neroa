"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import AgentAvatar from "@/components/ai/AgentAvatar";
import { AGENTS, type AgentId } from "@/lib/ai/agents";

type NaruaCoreProps = {
  className?: string;
  href?: string;
  ctaLabel?: string;
  description?: string;
  supportingAgentIds?: AgentId[];
};

const narua = AGENTS.narua;

const ORBIT_POSITIONS = [
  "left-[8%] top-[18%]",
  "right-[9%] top-[14%]",
  "left-[6%] bottom-[20%]",
  "right-[8%] bottom-[18%]",
  "left-[26%] bottom-[8%]",
  "right-[24%] bottom-[6%]"
];

export default function NaruaCore({
  className = "",
  href,
  ctaLabel,
  description = "Neroa is Neroa's core orchestrator. It frames the Engine, guides decision flow, selects the right specialist systems, and keeps execution aligned across strategy, build, launch, and operations.",
  supportingAgentIds = []
}: NaruaCoreProps) {
  const prefersReducedMotion = useReducedMotion();
  const interactive = Boolean(href);

  const content = (
    <motion.section
      className={`floating-plane relative isolate overflow-hidden rounded-[40px] p-6 sm:p-8 ${
        interactive
          ? "cursor-pointer transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_30px_90px_rgba(59,130,246,0.18)]"
          : ""
      } ${className}`}
      animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
      transition={{
        duration: 6.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="floating-wash" />
      <motion.div
        className="pointer-events-none absolute inset-[10%] rounded-full border"
        style={{ borderColor: `${narua.color}20` }}
        animate={prefersReducedMotion ? { opacity: 0.38 } : { rotate: 360, opacity: [0.28, 0.48, 0.28] }}
        transition={{
          rotate: { duration: 28, repeat: Infinity, ease: "linear" },
          opacity: { duration: 5.4, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-[18%] rounded-full border"
        style={{ borderColor: "rgba(139,92,246,0.16)" }}
        animate={prefersReducedMotion ? { opacity: 0.22 } : { rotate: -360, opacity: [0.18, 0.34, 0.18] }}
        transition={{
          rotate: { duration: 36, repeat: Infinity, ease: "linear" },
          opacity: { duration: 6.2, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      <div className="relative flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/78 px-4 py-2 text-sm text-slate-700">
            <Image
              src="/logo/neroa.png"
              alt="Neroa"
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
            />
            Neroa Core
          </div>

          <span className="rounded-full border border-cyan-300/28 bg-cyan-300/12 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-700">
            Neroa Active
          </span>
        </div>

        <div className="relative flex items-center justify-center py-6 sm:py-8">
          {supportingAgentIds.map((id, index) => (
            <div
              key={id}
              className={`absolute hidden rounded-full bg-white/84 p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 lg:flex ${ORBIT_POSITIONS[index % ORBIT_POSITIONS.length]}`}
            >
              <AgentAvatar id={id} active size={52} showLabel={false} />
            </div>
          ))}

          <AgentAvatar
            id="narua"
            active
            size={344}
            showLabel={false}
            className="max-w-full"
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
            {narua.role}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Neroa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            {description}
          </p>

          {supportingAgentIds.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {supportingAgentIds.map((id) => (
                <span
                  key={id}
                  className="premium-pill border-slate-200/80 bg-white/78 text-slate-600"
                >
                  {AGENTS[id].name}
                </span>
              ))}
            </div>
          ) : null}

          {ctaLabel ? (
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition group-hover:gap-3">
              {ctaLabel}
              <span aria-hidden="true">-&gt;</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
    >
      {content}
    </Link>
  );
}
