"use client";

import AgentBadge from "@/components/ai/AgentBadge";
import { type AgentId } from "@/lib/ai/agents";

type AgentBadgeListProps = {
  ids?: AgentId[];
  activeId?: AgentId;
  className?: string;
};

const defaultIds: AgentId[] = [
  "narua",
  "forge",
  "atlas",
  "repolink",
  "nova",
  "pulse",
  "ops"
];

export default function AgentBadgeList({
  ids = defaultIds,
  activeId,
  className = ""
}: AgentBadgeListProps) {
  return (
    <div className={`grid gap-4 lg:grid-cols-2 ${className}`}>
      {ids.map((id) => (
        <AgentBadge key={id} id={id} active={id === activeId} />
      ))}
    </div>
  );
}
