"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildWorkspaceProjectIntelligence } from "@/lib/intelligence/project-brief-generator";
import {
  architectureInputIdSchema
} from "@/lib/intelligence/architecture/types.ts";
import {
  createStrategyRevisionPersistenceUpdate,
  hasStrategyRevisionPatchContent,
  type StrategyRevisionPatch
} from "@/lib/intelligence/revisions";
import { scopeApprovalRecordSchema } from "@/lib/intelligence/governance/types.ts";
import {
  buildDescriptionWithMetadata,
  getOwnedWorkspace,
  getReturnTo,
  redirectWithError,
  safeString
} from "@/app/workspace/workspace-action-helpers";
import { parseWorkspaceProjectDescription } from "@/lib/workspace/project-metadata";

function parseTextareaLines(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    )
  );
}

function normalizeTextValue(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeTextList(values: readonly string[]) {
  return values.map((item) => item.trim()).filter(Boolean);
}

function sameText(left: string | null | undefined, right: string | null | undefined) {
  return (left ?? "").trim() === (right ?? "").trim();
}

function sameList(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
}

function revalidateStrategyRoomPaths(workspaceId: string) {
  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/strategy-room`);
  revalidatePath(`/workspace/${workspaceId}/command-center`);
  revalidatePath(`/workspace/${workspaceId}/build-room`);
}

function buildStrategyPatchFromFormData(args: {
  formData: FormData;
  currentIntelligence: ReturnType<typeof buildWorkspaceProjectIntelligence>;
}) {
  const currentOverrideState = args.currentIntelligence.strategyState?.overrideState ?? null;
  const projectBriefPatch: NonNullable<StrategyRevisionPatch["projectBrief"]> = {};
  const architecturePatch: NonNullable<StrategyRevisionPatch["architecture"]> = {};
  const roadmapPatch: NonNullable<StrategyRevisionPatch["roadmap"]> = {};
  const governancePatch: NonNullable<StrategyRevisionPatch["governance"]> = {};
  const answeredInputs: NonNullable<StrategyRevisionPatch["answeredInputs"]> = [];

  const setTextField = <K extends keyof NonNullable<StrategyRevisionPatch["projectBrief"]>>(
    key: K,
    currentValue: string | null | undefined,
    formKey = key
  ) => {
    const nextValue = normalizeTextValue(args.formData.get(formKey));

    if (nextValue && !sameText(currentValue, nextValue)) {
      projectBriefPatch[key] = nextValue as never;
    }
  };

  const setListField = <K extends keyof NonNullable<StrategyRevisionPatch["projectBrief"]>>(
    key: K,
    currentValue: readonly string[],
    formKey = key
  ) => {
    const nextValue = parseTextareaLines(args.formData.get(formKey));

    if (nextValue.length > 0 && !sameList(normalizeTextList(currentValue), nextValue)) {
      projectBriefPatch[key] = nextValue as never;
    }
  };

  setTextField("founderName", args.currentIntelligence.projectBrief.founderName);
  setTextField("projectName", args.currentIntelligence.projectBrief.projectName);
  setTextField("productCategory", args.currentIntelligence.projectBrief.productCategory);
  setTextField("problemStatement", args.currentIntelligence.projectBrief.problemStatement);
  setTextField("outcomePromise", args.currentIntelligence.projectBrief.outcomePromise);
  setListField("buyerPersonas", args.currentIntelligence.projectBrief.buyerPersonas);
  setListField("operatorPersonas", args.currentIntelligence.projectBrief.operatorPersonas);
  setListField("endCustomerPersonas", args.currentIntelligence.projectBrief.endCustomerPersonas);
  setListField("adminPersonas", args.currentIntelligence.projectBrief.adminPersonas);
  setListField("mustHaveFeatures", args.currentIntelligence.projectBrief.mustHaveFeatures);
  setListField("niceToHaveFeatures", args.currentIntelligence.projectBrief.niceToHaveFeatures);
  setListField("excludedFeatures", args.currentIntelligence.projectBrief.excludedFeatures);
  setListField("surfaces", args.currentIntelligence.projectBrief.surfaces);
  setListField("integrations", args.currentIntelligence.projectBrief.integrations);
  setListField("dataSources", args.currentIntelligence.projectBrief.dataSources);
  setListField("constraints", args.currentIntelligence.projectBrief.constraints);
  setListField("complianceFlags", args.currentIntelligence.projectBrief.complianceFlags);
  setListField("trustRisks", args.currentIntelligence.projectBrief.trustRisks);

  const currentAnswers = new Map(
    (currentOverrideState?.answeredInputs ?? []).map((item) => [item.inputId, item.value])
  );

  for (const [entryKey, entryValue] of args.formData.entries()) {
    if (typeof entryValue !== "string") {
      continue;
    }

    if (entryKey.startsWith("strategyAnswer:")) {
      const inputId = entryKey.slice("strategyAnswer:".length).trim();
      const parsedInputId = architectureInputIdSchema.safeParse(inputId);

      if (!parsedInputId.success) {
        continue;
      }

      const nextValue = entryValue.trim();

      if (!nextValue || sameText(currentAnswers.get(parsedInputId.data), nextValue)) {
        continue;
      }

      answeredInputs.push({
        inputId: parsedInputId.data,
        value: nextValue
      });
    }

    if (entryKey.startsWith("phaseNote:")) {
      const phaseId = entryKey.slice("phaseNote:".length).trim();
      const nextValue = entryValue.trim();

      if (!phaseId || !nextValue) {
        continue;
      }

      const currentValue = currentOverrideState?.roadmap?.phaseNotesById?.[phaseId] ?? null;

      if (!sameText(currentValue, nextValue)) {
        roadmapPatch.phaseNotesById = {
          ...(roadmapPatch.phaseNotesById ?? {}),
          [phaseId]: nextValue
        };
      }
    }

    if (entryKey.startsWith("evidence:")) {
      const checklistId = entryKey.slice("evidence:".length).trim();
      const nextValue = entryValue.trim();

      if (!checklistId || !nextValue) {
        continue;
      }

      const currentValue =
        currentOverrideState?.governance?.approvalEvidenceByChecklistId?.[checklistId] ?? null;

      if (!sameText(currentValue, nextValue)) {
        governancePatch.approvalEvidenceByChecklistId = {
          ...(governancePatch.approvalEvidenceByChecklistId ?? {}),
          [checklistId]: nextValue
        };
      }
    }
  }

  const architectureAssumptions = parseTextareaLines(args.formData.get("architectureAssumptions"));
  const roadmapAssumptions = parseTextareaLines(args.formData.get("roadmapAssumptions"));
  const explicitNotInScope = parseTextareaLines(args.formData.get("explicitNotInScope"));
  const mvpSummary = normalizeTextValue(args.formData.get("mvpSummary"));

  if (
    architectureAssumptions.length > 0 &&
    !sameList(currentOverrideState?.architecture?.assumptions ?? [], architectureAssumptions)
  ) {
    architecturePatch.assumptions = architectureAssumptions;
  }

  if (
    roadmapAssumptions.length > 0 &&
    !sameList(currentOverrideState?.roadmap?.assumptions ?? [], roadmapAssumptions)
  ) {
    roadmapPatch.assumptions = roadmapAssumptions;
  }

  if (
    explicitNotInScope.length > 0 &&
    !sameList(currentOverrideState?.roadmap?.explicitNotInScope ?? [], explicitNotInScope)
  ) {
    roadmapPatch.explicitNotInScope = explicitNotInScope;
  }

  if (mvpSummary && !sameText(currentOverrideState?.roadmap?.mvpSummary, mvpSummary)) {
    roadmapPatch.mvpSummary = mvpSummary;
  }

  const patch: StrategyRevisionPatch = {};

  if (Object.keys(projectBriefPatch).length > 0) {
    patch.projectBrief = projectBriefPatch;
  }

  if (Object.keys(architecturePatch).length > 0) {
    patch.architecture = architecturePatch;
  }

  if (Object.keys(roadmapPatch).length > 0) {
    patch.roadmap = roadmapPatch;
  }

  if (Object.keys(governancePatch).length > 0) {
    patch.governance = governancePatch;
  }

  if (answeredInputs.length > 0) {
    patch.answeredInputs = answeredInputs;
  }

  return patch;
}

export async function saveStrategyRevision(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/strategy-room`);
  const saveMode = safeString(formData.get("saveMode"));

  if (!workspaceId) {
    redirectWithError(returnTo, "Strategy save requires a workspace id.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Project not found."
    )
  );
  const { supabase, user, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const currentIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId,
    projectId: workspaceId,
    projectTitle: workspace.name,
    projectDescription: parsed.visibleDescription,
    projectMetadata: parsed.metadata
  });
  const patch = buildStrategyPatchFromFormData({
    formData,
    currentIntelligence
  });

  if (!hasStrategyRevisionPatchContent(patch)) {
    const notice =
      saveMode === "chat_checkpoint"
        ? "Chat answers save into the shared project automatically. No extra side-panel changes were pending."
        : "No structured strategy changes were detected.";
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}notice=${encodeURIComponent(notice)}`);
  }

  const update = createStrategyRevisionPersistenceUpdate({
    workspaceId,
    projectId: workspaceId,
    projectName: workspace.name,
    projectMetadata: parsed.metadata,
    projectBrief: currentIntelligence.projectBrief,
    architectureBlueprint: currentIntelligence.architectureBlueprint,
    roadmapPlan: currentIntelligence.roadmapPlan,
    governancePolicy: currentIntelligence.governancePolicy,
    patch,
    createdAt: new Date().toISOString(),
    createdBy: user.email ?? user.id
  });
  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        strategyState: update.strategyState,
        governanceState: update.governanceState
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Strategy save could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateStrategyRoomPaths(workspaceId);
  redirect(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}notice=${encodeURIComponent(
      update.applicationResult.summary
    )}`
  );
}

export async function approveStrategyScope(formData: FormData) {
  const workspaceId = safeString(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData, `/workspace/${workspaceId}/strategy-room`);

  if (!workspaceId) {
    redirectWithError(returnTo, "Scope approval requires a workspace id.");
  }

  const ownedWorkspace = await getOwnedWorkspace(workspaceId).catch((error) =>
    redirectWithError(
      returnTo,
      error instanceof Error ? error.message : "Project not found."
    )
  );
  const { supabase, user, workspace } = ownedWorkspace;
  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const currentIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId,
    projectId: workspaceId,
    projectTitle: workspace.name,
    projectDescription: parsed.visibleDescription,
    projectMetadata: parsed.metadata
  });

  if (!currentIntelligence.governancePolicy.approvalReadiness.approvalAllowed) {
    redirectWithError(
      returnTo,
      "Scope approval is still blocked. Resolve the remaining Strategy Room blockers first."
    );
  }

  const now = new Date().toISOString();
  const scopeApprovalRecord = scopeApprovalRecordSchema.parse({
    approvalRecordId:
      currentIntelligence.governancePolicy.scopeApprovalRecord?.approvalRecordId ??
      `${currentIntelligence.governancePolicy.governanceId}:scope-approval-record`,
    sourceRoadmapPlanId: currentIntelligence.roadmapPlan.roadmapId,
    sourceGovernancePolicyId: currentIntelligence.governancePolicy.governanceId,
    status: "approved",
    approvedAt: now,
    approvedBy: user.email ?? user.id,
    unresolvedBlockerIds: [],
    supersededByRevisionId: null
  });
  const governanceState = {
    scopeApprovalRecord,
    roadmapRevisionRecords: parsed.metadata?.governanceState?.roadmapRevisionRecords ?? []
  };
  const { data, error } = await supabase
    .from("workspaces")
    .update({
      description: buildDescriptionWithMetadata({
        workspace,
        governanceState
      })
    })
    .eq("id", workspaceId)
    .select("id")
    .maybeSingle();

  if (error) {
    redirectWithError(returnTo, error.message);
  }

  if (!data) {
    redirectWithError(
      returnTo,
      "Scope approval could not be confirmed. Workspace write verification is still pending."
    );
  }

  revalidateStrategyRoomPaths(workspaceId);
  redirect(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}notice=${encodeURIComponent(
      "Roadmap scope was approved in Strategy Room."
    )}`
  );
}
