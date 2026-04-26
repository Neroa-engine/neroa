import type { ReactNode } from "react";
import {
  approveStrategyScope,
  saveStrategyRevision
} from "@/app/workspace/[workspaceId]/strategy-room/actions";
import {
  architectureInputIdSchema,
  type ArchitectureBlueprint,
  type ArchitectureInputId
} from "@/lib/intelligence/architecture";
import type { GovernancePolicy } from "@/lib/intelligence/governance";
import type { ProjectBrief } from "@/lib/intelligence/project-brief";
import type { RoadmapPlan } from "@/lib/intelligence/roadmap";
import type { ProjectRecord } from "@/lib/workspace/project-lanes";
import type { StoredProjectMetadata } from "@/lib/workspace/project-metadata";

type StrategyRoomSavebackPanelProps = {
  project: ProjectRecord;
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
  governancePolicy: GovernancePolicy;
};

type StrategyQuestionRow = {
  inputId: ArchitectureInputId;
  label: string;
  question: string;
  value: string;
};

function joinLines(values: readonly string[]) {
  return values.join("\n");
}

function buildQuestionRows(args: {
  projectMetadata?: StoredProjectMetadata | null;
  projectBrief: ProjectBrief;
  architectureBlueprint: ArchitectureBlueprint;
  roadmapPlan: RoadmapPlan;
}) {
  const seen = new Set<string>();
  const currentAnswers = new Map(
    (args.projectMetadata?.strategyState?.overrideState?.answeredInputs ?? []).map((item) => [
      item.inputId,
      item.value
    ])
  );
  const rows: StrategyQuestionRow[] = [];

  const addQuestion = (inputId: ArchitectureInputId, label: string, question: string) => {
    if (!inputId || seen.has(inputId)) {
      return;
    }

    seen.add(inputId);
    rows.push({
      inputId,
      label,
      question,
      value: currentAnswers.get(inputId) ?? ""
    });
  };

  for (const question of args.roadmapPlan.openQuestions) {
    addQuestion(question.inputId, question.label, question.question);
  }

  for (const question of args.architectureBlueprint.openQuestions) {
    addQuestion(question.inputId, question.label, question.question);
  }

  for (const question of args.projectBrief.openQuestions) {
    const parsedInputId = architectureInputIdSchema.safeParse(question.slotId);

    if (!parsedInputId.success) {
      continue;
    }

    addQuestion(parsedInputId.data, question.label, question.question);
  }

  return rows;
}

function FieldShell({
  label,
  children,
  description
}: {
  label: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {description ? (
        <span className="block text-sm leading-7 text-slate-400">{description}</span>
      ) : null}
      {children}
    </label>
  );
}

function SurfaceInput(props: {
  name: string;
  defaultValue?: string | number | readonly string[];
}) {
  return (
    <input
      name={props.name}
      defaultValue={props.defaultValue}
      className="w-full rounded-2xl border border-white/10 bg-slate-950/68 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20"
    />
  );
}

function SurfaceTextarea(props: {
  name: string;
  defaultValue?: string | number | readonly string[];
  rows: number;
}) {
  return (
    <textarea
      name={props.name}
      defaultValue={props.defaultValue}
      rows={props.rows}
      className="w-full rounded-2xl border border-white/10 bg-slate-950/68 px-4 py-3 text-sm leading-7 text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20"
    />
  );
}

function RevisionSurface({
  title,
  description,
  meta,
  defaultOpen = false,
  children
}: {
  title: string;
  description: string;
  meta?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[22px] border border-white/10 bg-white/4 p-4 shadow-[0_16px_40px_rgba(2,6,23,0.2)]"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-[-0.02em] text-white">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium text-slate-300">
              {meta}
            </span>
          ) : null}
          <span className="text-lg text-slate-500 transition group-open:rotate-45 group-open:text-cyan-200">
            +
          </span>
        </div>
      </summary>
      <div className="mt-4 border-t border-white/10 pt-4">{children}</div>
    </details>
  );
}

function CompactStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/4 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-7 text-slate-100">{value}</p>
    </div>
  );
}

function formatRevisionMateriality(value: string) {
  return value.replace(/_/g, " ");
}

function StrategyRoomSavebackPanel({
  project,
  projectMetadata,
  projectBrief,
  architectureBlueprint,
  roadmapPlan,
  governancePolicy
}: StrategyRoomSavebackPanelProps) {
  const strategyState = projectMetadata?.strategyState ?? null;
  const currentOverrideState = strategyState?.overrideState ?? null;
  const revisions = strategyState?.revisionRecords ?? [];
  const latestRevision = revisions[revisions.length - 1] ?? null;
  const recentRevisions = revisions.slice(-3).reverse();
  const questionRows = buildQuestionRows({
    projectMetadata,
    projectBrief,
    architectureBlueprint,
    roadmapPlan
  });
  const unresolvedChecklist = governancePolicy.approvalChecklist.filter(
    (item) => item.status !== "satisfied"
  );
  const answeredInputCount = currentOverrideState?.answeredInputs.length ?? 0;
  const explicitBoundaryCount = currentOverrideState?.roadmap?.explicitNotInScope?.length ?? 0;

  return (
    <section className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/6 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
            Revisions
          </p>
          <h2 className="mt-2 text-base font-semibold tracking-[-0.03em] text-white">
            Structured save-back
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Tighten the brief, answer blockers, and save revision-backed changes without opening a
            massive worksheet.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium text-slate-300">
          {revisions.length} saved
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <CompactStat
          label="Open questions"
          value={
            questionRows.length > 0
              ? `${questionRows.length} still need answers`
              : "No open architecture or roadmap questions"
          }
        />
        <CompactStat
          label="Boundaries"
          value={
            explicitBoundaryCount > 0
              ? `${explicitBoundaryCount} explicit exclusions recorded`
              : "MVP boundaries still rely on defaults"
          }
        />
        <CompactStat
          label="Approval blockers"
          value={
            unresolvedChecklist.length > 0
              ? `${unresolvedChecklist.length} checklist items unresolved`
              : "Approval checklist is currently clear"
          }
        />
      </div>

      <form id="strategy-saveback-form" action={saveStrategyRevision} className="mt-5 space-y-3">
        <input type="hidden" name="workspaceId" value={project.workspaceId} />
        <input
          type="hidden"
          name="returnTo"
          value={`/workspace/${project.workspaceId}/strategy-room`}
        />

        {latestRevision ? (
          <div className="rounded-[20px] border border-white/10 bg-slate-950/52 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-white">Latest revision</p>
            <p className="mt-2 leading-7">{latestRevision.summary}</p>
          </div>
        ) : null}

        <RevisionSurface
          title="Open questions"
          description="Capture the answers that tighten architecture, roadmap, and governance immediately after save."
          meta={questionRows.length > 0 ? `${questionRows.length} open` : "Clear"}
          defaultOpen={questionRows.length > 0}
        >
          {questionRows.length > 0 ? (
            <div className="grid gap-4">
              {questionRows.map((question) => (
                <FieldShell
                  key={question.inputId}
                  label={question.label}
                  description={question.question}
                >
                  <SurfaceTextarea
                    name={`strategyAnswer:${question.inputId}`}
                    defaultValue={question.value}
                    rows={3}
                  />
                </FieldShell>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-3 text-sm leading-7 text-slate-400">
              The current shared intelligence does not have unanswered architecture or roadmap
              questions right now.
            </p>
          )}
        </RevisionSurface>

        <RevisionSurface
          title="Brief and positioning"
          description="Update the core product framing, audience, and outcome without leaving the planning room."
          meta="Core brief"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <FieldShell label="Project name">
              <SurfaceInput
                name="projectName"
                defaultValue={projectBrief.projectName ?? project.title}
              />
            </FieldShell>
            <FieldShell label="Product category">
              <SurfaceInput
                name="productCategory"
                defaultValue={projectBrief.productCategory ?? ""}
              />
            </FieldShell>
            <FieldShell label="Problem statement" description="What problem should Neroa keep centered?">
              <SurfaceTextarea
                name="problemStatement"
                defaultValue={projectBrief.problemStatement ?? ""}
                rows={3}
              />
            </FieldShell>
            <FieldShell label="Outcome promise" description="What outcome should version one deliver?">
              <SurfaceTextarea
                name="outcomePromise"
                defaultValue={projectBrief.outcomePromise ?? ""}
                rows={3}
              />
            </FieldShell>
            <FieldShell label="Buyer personas">
              <SurfaceTextarea
                name="buyerPersonas"
                defaultValue={joinLines(projectBrief.buyerPersonas)}
                rows={4}
              />
            </FieldShell>
            <FieldShell label="Operator personas">
              <SurfaceTextarea
                name="operatorPersonas"
                defaultValue={joinLines(projectBrief.operatorPersonas)}
                rows={4}
              />
            </FieldShell>
          </div>
        </RevisionSurface>

        <RevisionSurface
          title="Scope boundaries"
          description="Tighten the MVP by clarifying what must ship, what can wait, and what is explicitly out."
          meta={answeredInputCount > 0 ? `${answeredInputCount} answers saved` : "Scope"}
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <FieldShell label="Must-have features">
              <SurfaceTextarea
                name="mustHaveFeatures"
                defaultValue={joinLines(projectBrief.mustHaveFeatures)}
                rows={5}
              />
            </FieldShell>
            <FieldShell label="Nice-to-have features">
              <SurfaceTextarea
                name="niceToHaveFeatures"
                defaultValue={joinLines(projectBrief.niceToHaveFeatures)}
                rows={5}
              />
            </FieldShell>
            <FieldShell label="Explicit exclusions">
              <SurfaceTextarea
                name="excludedFeatures"
                defaultValue={joinLines(projectBrief.excludedFeatures)}
                rows={5}
              />
            </FieldShell>
            <FieldShell label="MVP explicit not in scope">
              <SurfaceTextarea
                name="explicitNotInScope"
                defaultValue={joinLines(currentOverrideState?.roadmap?.explicitNotInScope ?? [])}
                rows={5}
              />
            </FieldShell>
            <FieldShell label="MVP summary override">
              <SurfaceTextarea
                name="mvpSummary"
                defaultValue={
                  currentOverrideState?.roadmap?.mvpSummary ?? roadmapPlan.mvpDefinition.summary
                }
                rows={4}
              />
            </FieldShell>
          </div>
        </RevisionSurface>

        <RevisionSurface
          title="Signals, integrations, and risks"
          description="Keep the structural inputs visible so downstream architecture, roadmap, and governance stay aligned."
          meta="Inputs"
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <FieldShell label="Launch surfaces">
              <SurfaceTextarea
                name="surfaces"
                defaultValue={joinLines(projectBrief.surfaces)}
                rows={4}
              />
            </FieldShell>
            <FieldShell label="Integrations">
              <SurfaceTextarea
                name="integrations"
                defaultValue={joinLines(projectBrief.integrations)}
                rows={4}
              />
            </FieldShell>
            <FieldShell label="Data sources">
              <SurfaceTextarea
                name="dataSources"
                defaultValue={joinLines(projectBrief.dataSources)}
                rows={4}
              />
            </FieldShell>
            <FieldShell label="Constraints">
              <SurfaceTextarea
                name="constraints"
                defaultValue={joinLines(projectBrief.constraints)}
                rows={4}
              />
            </FieldShell>
            <FieldShell label="Compliance flags">
              <SurfaceTextarea
                name="complianceFlags"
                defaultValue={joinLines(projectBrief.complianceFlags)}
                rows={4}
              />
            </FieldShell>
            <FieldShell label="Trust risks">
              <SurfaceTextarea
                name="trustRisks"
                defaultValue={joinLines(projectBrief.trustRisks)}
                rows={4}
              />
            </FieldShell>
          </div>
        </RevisionSurface>

        <RevisionSurface
          title="Architecture and roadmap notes"
          description="Record assumptions and short phase clarifications without turning this room into a full editor."
          meta={`${roadmapPlan.phases.length} phases`}
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <FieldShell label="Architecture assumptions">
              <SurfaceTextarea
                name="architectureAssumptions"
                defaultValue={joinLines(currentOverrideState?.architecture?.assumptions ?? [])}
                rows={4}
              />
            </FieldShell>
            <FieldShell label="Roadmap assumptions">
              <SurfaceTextarea
                name="roadmapAssumptions"
                defaultValue={joinLines(currentOverrideState?.roadmap?.assumptions ?? [])}
                rows={4}
              />
            </FieldShell>
          </div>

          {roadmapPlan.phases.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {roadmapPlan.phases.map((phase) => (
                <FieldShell key={phase.phaseId} label={phase.name}>
                  <SurfaceTextarea
                    name={`phaseNote:${phase.phaseId}`}
                    defaultValue={
                      currentOverrideState?.roadmap?.phaseNotesById?.[phase.phaseId] ?? ""
                    }
                    rows={3}
                  />
                </FieldShell>
              ))}
            </div>
          ) : null}
        </RevisionSurface>

        <RevisionSurface
          title="Approval evidence"
          description="Record the short evidence notes that support checklist closure and approval readiness."
          meta={unresolvedChecklist.length > 0 ? `${unresolvedChecklist.length} open` : "Clear"}
          defaultOpen={unresolvedChecklist.length > 0}
        >
          {unresolvedChecklist.length > 0 ? (
            <div className="grid gap-4">
              {unresolvedChecklist.map((item) => (
                <FieldShell key={item.id} label={item.label} description={item.reason}>
                  <SurfaceTextarea
                    name={`evidence:${item.id}`}
                    defaultValue={
                      currentOverrideState?.governance?.approvalEvidenceByChecklistId?.[item.id] ??
                      ""
                    }
                    rows={3}
                  />
                </FieldShell>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-3 text-sm leading-7 text-slate-400">
              The checklist is currently clear. If you save more scope changes later, new evidence
              fields can reappear here automatically.
            </p>
          )}
        </RevisionSurface>

        {recentRevisions.length > 0 ? (
          <RevisionSurface
            title="Revision history"
            description="The latest saved strategy changes remain part of the shared project spine."
            meta={`${recentRevisions.length} recent`}
          >
            <div className="space-y-3">
              {recentRevisions.map((revision) => (
                <div
                  key={revision.revisionId}
                  className="rounded-[18px] border border-white/8 bg-slate-950/52 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{revision.summary}</p>
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
                      {formatRevisionMateriality(revision.materiality)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Status: {revision.status.replace(/_/g, " ")}
                    {revision.requiresApprovalReset ? " - approval reset required" : ""}
                  </p>
                </div>
              ))}
            </div>
          </RevisionSurface>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="max-w-[28rem] text-sm leading-7 text-slate-300">
            Saving here writes back into the shared intelligence spine and immediately updates the
            Strategy Room, Command Center, and downstream approval state.
          </p>
          <button
            type="submit"
            className="rounded-full border border-white/10 bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:border-cyan-300/40 hover:bg-white/12"
          >
            Save strategy revision
          </button>
        </div>
      </form>

      <form
        id="strategy-approve-form"
        action={approveStrategyScope}
        className="mt-4 rounded-[22px] border border-cyan-400/20 bg-slate-950/56 px-4 py-4"
      >
        <input type="hidden" name="workspaceId" value={project.workspaceId} />
        <input
          type="hidden"
          name="returnTo"
          value={`/workspace/${project.workspaceId}/strategy-room`}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-[26rem]">
            <p className="text-sm font-medium text-white">Approval state</p>
            <p className="mt-1 text-sm leading-7 text-slate-300">
              {governancePolicy.currentApprovalState.roadmapScopeApproved
                ? "Scope is currently approved."
                : governancePolicy.approvalReadiness.approvalAllowed
                  ? "Scope is ready for approval."
                  : "Scope is not ready for approval yet."}
            </p>
          </div>
          <button
            type="submit"
            disabled={!governancePolicy.approvalReadiness.approvalAllowed}
            className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Approve roadmap scope
          </button>
        </div>
      </form>
    </section>
  );
}

export { StrategyRoomSavebackPanel };
