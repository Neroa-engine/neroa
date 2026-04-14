"use client";

import Link from "next/link";
import AiTeammateCards from "@/components/workspace/ai-teammate-cards";
import {
  AmbientWorkspaceBackground,
  LaneHeroHeader,
  LanePageShell,
  PremiumButton,
  PrimaryPanel,
  SecondaryPanel,
  SummaryMetricCard
} from "@/components/workspace/premium-lane-ui";
import { useLaneWorkspaceEngine } from "@/components/workspace/lane-workspace-engine";
import { buildProjectRoute, type ProjectLaneRecord } from "@/lib/workspace/project-lanes";

type GenericLaneWorkspaceProps = {
  workspaceId: string;
  lane: ProjectLaneRecord;
  projectId: string;
};

function ArtifactBlock({
  title,
  summary,
  items,
  onRefine
}: {
  title: string;
  summary: string;
  items: string[];
  onRefine: (title: string) => void;
}) {
  return (
    <section className="premium-surface rounded-[28px] p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Deliverable
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>
        </div>

        <PremiumButton variant="ghost" onClick={() => onRefine(title)}>
          Refine with Naroa
        </PremiumButton>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div
            key={`${title}-${item}`}
            className="rounded-[22px] bg-white/78 px-4 py-4 text-sm leading-7 text-slate-700 shadow-[0_16px_38px_rgba(15,23,42,0.05)]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GenericLaneWorkspace({
  workspaceId,
  lane,
  projectId
}: GenericLaneWorkspaceProps) {
  const engine = useLaneWorkspaceEngine();
  const outputs = engine.outputs;

  return (
    <LanePageShell>
      <AmbientWorkspaceBackground className="p-6 xl:p-8">
        <LaneHeroHeader
        eyebrow="Lane Engine"
          title={lane.title}
          description={
            outputs?.summary ||
            `Describe what should happen in ${lane.title}, and Naroa will generate the first working deliverables, show what changed, and suggest the next move.`
          }
          badge={
            <span className="premium-pill text-slate-600">
              {outputs ? "Live output active" : "Ready for first output"}
            </span>
          }
          actions={
            <Link href={buildProjectRoute(workspaceId, projectId)} className="button-secondary">
              Engine overview
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          <SummaryMetricCard
            title="Current output"
            value={outputs?.title ?? "No deliverable yet"}
            detail={outputs?.summary ?? "Prompt Naroa to generate the first artifact for this lane."}
            emphasized
          />
          <SummaryMetricCard
            title="Artifacts"
            value={String(outputs?.artifacts.length ?? 0)}
            detail="Structured deliverables in the center engine"
          />
          <SummaryMetricCard
            title="What changed"
            value={String(outputs?.whatChanged.length ?? 0)}
            detail="Visible output updates from the latest prompt"
          />
          <SummaryMetricCard
            title="Next move"
            value={outputs ? "Ready" : "Pending"}
            detail={outputs?.nextMove ?? "Naroa will recommend the next best move once the first output exists."}
          />
        </div>
      </AmbientWorkspaceBackground>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.12fr)_420px]">
        <div className="space-y-6">
          <PrimaryPanel
              title="Generated engine"
            subtitle={outputs?.title ?? `Generate the first ${lane.title.toLowerCase()} deliverable`}
            action={
              <span className="premium-pill text-slate-500">
                {outputs ? `${outputs.artifacts.length} artifacts ready` : "Awaiting prompt"}
              </span>
            }
          >
            {outputs ? (
              <div className="space-y-4">
                {outputs.artifacts.map((artifact) => (
                  <ArtifactBlock
                    key={artifact.id}
                    title={artifact.title}
                    summary={artifact.summary}
                    items={artifact.items}
                    onRefine={(title) =>
                      engine.handlePrompt(`Deepen the ${title.toLowerCase()} inside ${lane.title}.`)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {engine.suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => engine.handlePrompt(prompt)}
                    className="micro-glow premium-surface-soft rounded-[24px] p-5 text-left"
                  >
                    <p className="text-sm font-semibold text-slate-950">Generate with Naroa</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{prompt}</p>
                  </button>
                ))}
              </div>
            )}
          </PrimaryPanel>

          <div className="grid gap-6 xl:grid-cols-2">
            <SecondaryPanel title="What changed">
              {outputs ? (
                <div className="space-y-3">
                  {outputs.whatChanged.map((item) => (
                    <div
                      key={item}
                      className="rounded-[20px] bg-white/76 px-4 py-4 text-sm leading-6 text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Output changes will appear here after Naroa builds the first artifact.
                </p>
              )}
            </SecondaryPanel>

            <SecondaryPanel title="Recommended next move">
              {outputs ? (
                <>
                  <p className="text-sm leading-7 text-slate-700">{outputs.nextMove}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <PremiumButton
                      variant="cta"
                      onClick={() => engine.handlePrompt(outputs.nextMove)}
                    >
                      Continue with Naroa
                    </PremiumButton>
                    <PremiumButton
                      variant="ghost"
                      onClick={() =>
                        engine.handlePrompt(`Show the decision risk for the current ${lane.title} output.`)
                      }
                    >
                      Surface risks
                    </PremiumButton>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  Naroa will recommend the next useful move as soon as the first deliverable exists.
                </p>
              )}
            </SecondaryPanel>
          </div>
        </div>

        <div className="space-y-6">
          <SecondaryPanel title="AI collaboration in this lane">
            <p className="mb-4 text-sm leading-7 text-slate-600">
              These systems are collaborating inside {lane.title} right now.
            </p>
            <AiTeammateCards
              agents={engine.collaboration.map((agent) => ({
                id: agent.id,
                badge: agent.badge,
                active: agent.active,
                description: `${agent.roleLabel} - ${agent.description}`
              }))}
              compact
              className="grid-cols-1"
            />
          </SecondaryPanel>

          <SecondaryPanel title="Prompt-to-output engine">
            <div className="space-y-3">
              {engine.suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => engine.handlePrompt(prompt)}
                  className="micro-glow w-full rounded-[20px] bg-white/76 px-4 py-4 text-left text-sm leading-6 text-slate-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </SecondaryPanel>

          {engine.error ? (
            <SecondaryPanel title="Lane status">
              <div className="rounded-[20px] border border-rose-300/40 bg-rose-50/85 px-4 py-4 text-sm leading-6 text-rose-700">
                {engine.error}
              </div>
            </SecondaryPanel>
          ) : null}
        </div>
      </div>
    </LanePageShell>
  );
}
