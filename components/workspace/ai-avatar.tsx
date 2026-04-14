"use client";

import AgentAvatar from "@/components/ai/AgentAvatar";
import type { AgentId } from "@/lib/ai/agents";

type LegacyProvider = "chatgpt" | "claude" | "codex" | "github";

type AiAvatarProps = {
  provider: LegacyProvider | AgentId;
  displayName: string;
  avatarSeed: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  emphasis?: "default" | "hero";
  showLabel?: boolean;
  className?: string;
  isSpeaking?: boolean;
  isActive?: boolean;
};

const sizeMap: Record<NonNullable<AiAvatarProps["size"]>, number> = {
  sm: 64,
  md: 84,
  lg: 112,
  xl: 144,
  "2xl": 180
};

function normalizeAgentId(provider: AiAvatarProps["provider"], displayName: string): AgentId {
  const normalizedName = displayName.trim().toLowerCase();

  if (
    normalizedName === "narua" ||
    normalizedName === "forge" ||
    normalizedName === "atlas" ||
    normalizedName === "repolink" ||
    normalizedName === "nova" ||
    normalizedName === "pulse" ||
    normalizedName === "ops"
  ) {
    return normalizedName;
  }

  if (
    provider === "narua" ||
    provider === "forge" ||
    provider === "atlas" ||
    provider === "repolink" ||
    provider === "nova" ||
    provider === "pulse" ||
    provider === "ops"
  ) {
    return provider;
  }

  switch (provider) {
    case "claude":
      return "atlas";
    case "codex":
      return "forge";
    case "github":
      return "repolink";
    case "chatgpt":
    default:
      return "narua";
  }
}

export default function AiAvatar({
  provider,
  displayName,
  avatarSeed,
  size = "sm",
  emphasis = "default",
  showLabel = false,
  className,
  isSpeaking = false,
  isActive = false
}: AiAvatarProps) {
  const agentId = normalizeAgentId(provider, displayName);
  const baseSize = sizeMap[size];
  const resolvedSize = emphasis === "hero" ? baseSize + 20 : baseSize;

  return (
    <AgentAvatar
      id={agentId}
      size={resolvedSize}
      showLabel={showLabel}
      className={className}
      speaking={isSpeaking}
      active={isActive || avatarSeed.length % 2 === 0}
    />
  );
}
