"use client";

import AgentAvatar from "@/components/ai/AgentAvatar";
import { AGENTS, type AgentId } from "@/lib/ai/agents";

export type AiTeammateCardItem = {
  id: AgentId;
  description?: string;
  badge?: string;
  active?: boolean;
};

type AiTeammateCardsProps = {
  agents?: AiTeammateCardItem[];
  compact?: boolean;
  className?: string;
};

const defaultAgents: AiTeammateCardItem[] = [
  {
    id: "narua",
    badge: "Orchestrator",
    active: true,
    description:
      "Naroa anchors the Engine, guides the user-facing flow, and decides when specialist systems or backend build-review systems should turn on."
  },
  {
    id: "forge",
    badge: "Execution",
    description:
      "Forge shapes implementation structure, build sequencing, and execution planning before repository work moves into delivery."
  },
  {
    id: "atlas",
    badge: "Strategy",
    description:
      "Atlas strengthens strategy, research, architecture reasoning, and product logic before the build widens."
  },
  {
    id: "repolink",
    badge: "GitHub",
    description:
      "RepoLink connects GitHub, repositories, branches, commits, pull requests, and deployment-linked technical context into the Engine."
  },
  {
    id: "nova",
    badge: "Experience",
    description:
      "Nova shapes design direction, UX copy, brand presentation, and customer-facing assets across the build."
  },
  {
    id: "pulse",
    badge: "Quality",
    description:
      "Pulse handles testing, QA, usage signals, performance checks, and feedback loops before and after launch."
  },
  {
    id: "ops",
    badge: "Launch Ops",
    description:
      "Ops keeps deployment, connected services, launch operations, and support workflows structured and visible."
  }
];

function cardClasses(active: boolean) {
  return active
    ? "border-cyan-300/22 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.58))]"
    : "border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.46))]";
}

function badgeClasses(active: boolean) {
  return active
    ? "border-cyan-300/28 bg-cyan-300/12 text-cyan-700"
    : "border-slate-200 bg-white/70 text-slate-600";
}

export default function AiTeammateCards({
  agents = defaultAgents,
  compact = false,
  className = ""
}: AiTeammateCardsProps) {
  return (
    <div
      className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"} ${className}`}
    >
      {agents.map((item) => {
        const agent = AGENTS[item.id];
        const active = item.active ?? item.id === "narua";

        return (
          <article
            key={item.id}
            className={`micro-glow relative overflow-hidden rounded-[26px] border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${cardClasses(
              active
            )}`}
          >
            <div className="floating-wash" />
            <div className="relative flex items-start gap-4">
              <AgentAvatar
                id={item.id}
                size={compact ? 78 : 92}
                showLabel={false}
                active={active}
                className="shrink-0"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-950">{agent.name}</p>
                  {item.badge ? (
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${badgeClasses(
                        active
                      )}`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {agent.role}
                </p>

                {!compact && item.description ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
