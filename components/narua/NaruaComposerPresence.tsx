"use client";

import AgentAvatar from "@/components/ai/AgentAvatar";

type NaruaComposerPresenceProps = {
  title?: string;
  subtitle?: string;
  speaking?: boolean;
  className?: string;
};

export default function NaruaComposerPresence({
  title = "Naroa",
  subtitle = "Core orchestrator active in this thread",
  speaking = false,
  className = ""
}: NaruaComposerPresenceProps) {
  return (
    <div
      className={`floating-plane rounded-[24px] p-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="flex items-center gap-3">
        <AgentAvatar id="narua" size={60} showLabel={false} active speaking={speaking} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
