import Link from "next/link";
import AgentAvatar from "@/components/ai/AgentAvatar";
import { AGENTS, type AgentId } from "@/lib/ai/agents";

type AiCardProps = {
  id: AgentId;
  description: string;
  href: string;
  featured?: boolean;
};

export function AiCard({ id, description, href, featured = false }: AiCardProps) {
  const agent = AGENTS[id];

  return (
    <Link
      href={href}
      className={`micro-glow floating-plane group relative overflow-hidden rounded-[30px] p-5 sm:p-6 ${
        featured ? "lg:col-span-2 lg:grid lg:grid-cols-[0.82fr_1.18fr] lg:items-center" : ""
      }`}
    >
      <div className="floating-wash" />
      <div className="relative flex items-start gap-5">
        <AgentAvatar
          id={id}
          active
          size={featured ? 154 : 108}
          showLabel={false}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="premium-pill border-cyan-300/18 bg-cyan-300/12 text-cyan-700">
              {agent.role}
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
              AI System
            </span>
          </div>

          <h3
            className={`mt-4 font-semibold tracking-tight text-slate-950 ${
              featured ? "text-3xl sm:text-[2.15rem]" : "text-2xl"
            }`}
          >
            {agent.name}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            {description}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 transition group-hover:gap-3">
            Explore {agent.name}
            <span aria-hidden="true">-&gt;</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
