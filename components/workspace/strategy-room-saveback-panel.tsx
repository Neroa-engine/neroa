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
  const questionRows = buildQuestionRows({
    projectMetadata,
    projectBrief,
    architectureBlueprint,
    roadmapPlan
  });
  const unresolvedChecklist = governancePolicy.approvalChecklist.filter(
    (item) => item.status !== "satisfied"
  );

  return (
    <section className="floating-plane rounded-[24px] border border-slate-200/70 bg-white/85 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Strategy save-back
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            Persist structured scope refinements
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Save clarified answers, tighten MVP boundaries, and keep one shared project
            intelligence source for Strategy Room and Command Center.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {revisions.length} saved revisions
        </div>
      </div>
      {latestRevision ? (
        <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Latest revision</p>
          <p className="mt-1 leading-7">{latestRevision.summary}</p>
        </div>
      ) : null}
      <form action={saveStrategyRevision} className="mt-5 space-y-5">
        <input type="hidden" name="workspaceId" value={project.workspaceId} />
        <input
          type="hidden"
          name="returnTo"
          value={`/workspace/${project.workspaceId}/strategy-room`}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Project name
            </span>
            <input
              name="projectName"
              defaultValue={projectBrief.projectName ?? project.title}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Product category
            </span>
            <input
              name="productCategory"
              defaultValue={projectBrief.productCategory ?? ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Problem statement
            </span>
            <textarea
              name="problemStatement"
              defaultValue={projectBrief.problemStatement ?? ""}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Outcome promise
            </span>
            <textarea
              name="outcomePromise"
              defaultValue={projectBrief.outcomePromise ?? ""}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Buyer personas
            </span>
            <textarea
              name="buyerPersonas"
              defaultValue={joinLines(projectBrief.buyerPersonas)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Operator personas
            </span>
            <textarea
              name="operatorPersonas"
              defaultValue={joinLines(projectBrief.operatorPersonas)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Launch surfaces
            </span>
            <textarea
              name="surfaces"
              defaultValue={joinLines(projectBrief.surfaces)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Integrations
            </span>
            <textarea
              name="integrations"
              defaultValue={joinLines(projectBrief.integrations)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Must-have features
            </span>
            <textarea
              name="mustHaveFeatures"
              defaultValue={joinLines(projectBrief.mustHaveFeatures)}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Nice-to-have features
            </span>
            <textarea
              name="niceToHaveFeatures"
              defaultValue={joinLines(projectBrief.niceToHaveFeatures)}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Explicit exclusions
            </span>
            <textarea
              name="excludedFeatures"
              defaultValue={joinLines(projectBrief.excludedFeatures)}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              MVP explicit not in scope
            </span>
            <textarea
              name="explicitNotInScope"
              defaultValue={joinLines(currentOverrideState?.roadmap?.explicitNotInScope ?? [])}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Data sources
            </span>
            <textarea
              name="dataSources"
              defaultValue={joinLines(projectBrief.dataSources)}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Constraints
            </span>
            <textarea
              name="constraints"
              defaultValue={joinLines(projectBrief.constraints)}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Compliance flags
            </span>
            <textarea
              name="complianceFlags"
              defaultValue={joinLines(projectBrief.complianceFlags)}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Trust risks
            </span>
            <textarea
              name="trustRisks"
              defaultValue={joinLines(projectBrief.trustRisks)}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
        </div>

        {questionRows.length > 0 ? (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Resolve open questions
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Answer the remaining architecture and roadmap questions here so the shared
                project intelligence can tighten immediately after save.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {questionRows.map((question) => (
                <label key={question.inputId} className="space-y-2">
                  <span className="text-sm font-medium text-slate-900">{question.label}</span>
                  <span className="block text-sm leading-7 text-slate-600">{question.question}</span>
                  <textarea
                    name={`strategyAnswer:${question.inputId}`}
                    defaultValue={question.value}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              MVP summary override
            </span>
            <textarea
              name="mvpSummary"
              defaultValue={currentOverrideState?.roadmap?.mvpSummary ?? roadmapPlan.mvpDefinition.summary}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Architecture assumptions
            </span>
            <textarea
              name="architectureAssumptions"
              defaultValue={joinLines(currentOverrideState?.architecture?.assumptions ?? [])}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <label className="space-y-2 xl:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Roadmap assumptions
            </span>
            <textarea
              name="roadmapAssumptions"
              defaultValue={joinLines(currentOverrideState?.roadmap?.assumptions ?? [])}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
        </div>

        {roadmapPlan.phases.length > 0 ? (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Phase clarifications
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Add short scope notes if a phase needs extra tightening without rebuilding the
                roadmap editor.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {roadmapPlan.phases.map((phase) => (
                <label key={phase.phaseId} className="space-y-2">
                  <span className="text-sm font-medium text-slate-900">{phase.name}</span>
                  <textarea
                    name={`phaseNote:${phase.phaseId}`}
                    defaultValue={currentOverrideState?.roadmap?.phaseNotesById?.[phase.phaseId] ?? ""}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {unresolvedChecklist.length > 0 ? (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Approval evidence
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Record short evidence notes for the unresolved checklist items that still need
                explicit review.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {unresolvedChecklist.slice(0, 4).map((item) => (
                <label key={item.id} className="space-y-2">
                  <span className="text-sm font-medium text-slate-900">{item.label}</span>
                  <span className="block text-sm leading-7 text-slate-600">{item.reason}</span>
                  <textarea
                    name={`evidence:${item.id}`}
                    defaultValue={
                      currentOverrideState?.governance?.approvalEvidenceByChecklistId?.[item.id] ?? ""
                    }
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
          <p className="text-sm leading-7 text-slate-600">
            Saving here writes back into the shared project intelligence spine and immediately
            affects the Strategy Room and Command Center views.
          </p>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Save strategy revision
          </button>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-cyan-200/70 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-800">
        <div>
          <p className="font-medium text-cyan-950">Approval state</p>
          <p className="mt-1 leading-7">
            {governancePolicy.currentApprovalState.roadmapScopeApproved
              ? "Scope is currently approved."
              : governancePolicy.approvalReadiness.approvalAllowed
                ? "Scope is ready for approval."
                : "Scope is not ready for approval yet."}
          </p>
        </div>
        <form action={approveStrategyScope}>
          <input type="hidden" name="workspaceId" value={project.workspaceId} />
          <input
            type="hidden"
            name="returnTo"
            value={`/workspace/${project.workspaceId}/strategy-room`}
          />
          <button
            type="submit"
            disabled={!governancePolicy.approvalReadiness.approvalAllowed}
            className="rounded-full border border-cyan-300 bg-white px-5 py-2.5 text-sm font-medium text-cyan-900 transition enabled:hover:border-cyan-400 enabled:hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Approve roadmap scope
          </button>
        </form>
      </div>
    </section>
  );
}

export { StrategyRoomSavebackPanel };
