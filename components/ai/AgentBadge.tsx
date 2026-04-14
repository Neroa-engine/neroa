"use client";

import { motion } from "framer-motion";
import AgentAvatar from "@/components/ai/AgentAvatar";
import { AGENTS, type AgentId } from "@/lib/ai/agents";

type AgentBadgeProps = {
  id: AgentId;
  active?: boolean;
  featured?: boolean;
  className?: string;
};

function rotates(id: AgentId) {
  return AGENTS[id].motion === "orbit" || AGENTS[id].motion === "loop";
}

export default function AgentBadge({
  id,
  active = false,
  featured = false,
  className = ""
}: AgentBadgeProps) {
  const agent = AGENTS[id];
  const avatarSize = featured ? 132 : 88;

  return (
    <motion.article
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(12,18,34,0.9))] ${featured ? "p-5 sm:p-6" : "p-4"} backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${className}`}
      animate={{
        y: [0, -4, 0],
        boxShadow: active
          ? [
              `0 24px 60px rgba(0,0,0,0.28), 0 0 0 rgba(0,0,0,0)`,
              `0 28px 70px rgba(0,0,0,0.34), 0 0 28px ${agent.color}22`,
              `0 24px 60px rgba(0,0,0,0.28), 0 0 0 rgba(0,0,0,0)`
            ]
          : [
              `0 18px 46px rgba(0,0,0,0.24), 0 0 0 rgba(0,0,0,0)`,
              `0 22px 54px rgba(0,0,0,0.28), 0 0 18px ${agent.color}18`,
              `0 18px 46px rgba(0,0,0,0.24), 0 0 0 rgba(0,0,0,0)`
            ]
      }}
      transition={{
        duration: active ? 3.4 : 4.6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at top left, ${agent.color}18 0%, transparent 38%), radial-gradient(circle at bottom right, ${agent.color}12 0%, transparent 34%)`
        }}
        animate={{
          opacity: active ? [0.55, 0.9, 0.55] : [0.34, 0.58, 0.34]
        }}
        transition={{
          duration: active ? 2.8 : 4.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-3 rounded-[24px] border"
        style={{
          borderColor: `${agent.color}20`
        }}
        animate={{
          rotate: rotates(id) ? 360 : 0,
          opacity: active ? [0.42, 0.7, 0.42] : [0.24, 0.4, 0.24]
        }}
        transition={{
          rotate: {
            duration: 16,
            repeat: Infinity,
            ease: "linear"
          },
          opacity: {
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      <div className={`relative flex items-center ${featured ? "gap-5" : "gap-4"}`}>
        <AgentAvatar
          id={id}
          active={active}
          size={avatarSize}
          showLabel={false}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: agent.color,
                boxShadow: `0 0 18px ${agent.color}`
              }}
            />
            <p className={`${featured ? "text-xl" : "text-base"} font-semibold text-white`}>
              {agent.name}
            </p>
          </div>
          <p className={`mt-1 ${featured ? "text-base" : "text-sm"} text-white/58`}>
            {agent.role}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
