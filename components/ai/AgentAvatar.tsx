"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { AGENTS, AgentId } from "@/lib/ai/agents";

type AgentAvatarProps = {
  id: AgentId;
  speaking?: boolean;
  active?: boolean;
  size?: number;
  showLabel?: boolean;
  className?: string;
};

export default function AgentAvatar({
  id,
  speaking = false,
  active = false,
  size = 160,
  showLabel = true,
  className = "",
}: AgentAvatarProps) {
  const agent = AGENTS[id];
  const prefersReducedMotion = useReducedMotion();
  const rotate = agent.motion === "orbit" || agent.motion === "loop" ? 360 : 0;
  const floatDistance = id === "narua" ? 8 : 4;
  const pulseScale = id === "narua" ? 1.05 : 1.03;
  const glowOpacity = id === "narua" ? [0.28, 0.55, 0.28] : [0.18, 0.36, 0.18];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: size, height: size }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: [0, -floatDistance, 0],
                scale: speaking ? [1, 1.08, 1] : active ? [1, pulseScale, 1] : [1, 1.01, 1]
              }
        }
        transition={{
          duration: speaking ? 1.1 : id === "narua" ? 4.6 : 5.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${agent.color}66 0%, transparent 70%)`,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: speaking ? [0.45, 1, 0.45] : active ? glowOpacity : [0.16, 0.28, 0.16],
                  scale: speaking ? [1, 1.1, 1] : active ? [1, 1.06, 1] : [1, 1.03, 1]
                }
          }
          transition={{
            duration: speaking ? 1.2 : id === "narua" ? 4.2 : 4.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor: `${agent.color}44`,
            boxShadow: speaking
              ? `0 0 28px ${agent.color}55`
              : active
                ? `0 0 18px ${agent.color}33`
                : `0 0 12px ${agent.color}18`,
          }}
          animate={
            prefersReducedMotion
              ? { opacity: active ? 0.7 : 0.42 }
              : {
                  rotate,
                  opacity: active ? [0.5, 0.8, 0.5] : [0.32, 0.46, 0.32]
                }
          }
          transition={{
            rotate: {
              duration: id === "narua" ? 20 : 16,
              repeat: Infinity,
              ease: "linear",
            },
            opacity: {
              duration: id === "narua" ? 4.8 : 5.6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />

        <Image
          src={agent.src}
          alt={agent.name}
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          className="relative z-10 object-contain drop-shadow-[0_18px_32px_rgba(59,130,246,0.12)]"
          priority={id === "narua"}
        />
      </motion.div>

      {showLabel && (
        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-slate-950">{agent.name}</div>
          <div className="text-xs text-slate-500">{agent.role}</div>
        </div>
      )}
    </div>
  );
}
