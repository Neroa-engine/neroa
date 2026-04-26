import { buildWorkspaceProjectIntelligence } from "../intelligence/project-brief-generator";
import {
  createStrategyRevisionPersistenceUpdate,
  hasStrategyRevisionPatchContent,
  type StrategyRevisionPatch
} from "../intelligence/revisions";
import {
  createOpenAIBlockerExtractionAdapter,
  buildBlockerQuestionState,
  buildStrategyThreadClarificationMessage,
  extractStructuredAnswerForBlocker,
  type BlockerQuestionState,
  type ModelProviderAdapter,
  type StructuredAnswerExtractionResult
} from "../intent-library";
import {
  encodeWorkspaceProjectDescription,
  mergeStoredProjectMetadata,
  type StoredProjectMetadata,
  parseWorkspaceProjectDescription
} from "../workspace/project-metadata";
import {
  buildStrategyQuestionRows,
  type StrategyQuestionRow
} from "../workspace/strategy-room-support";
import {
  createPersistedPlanningThreadState,
  type PlanningThreadState
} from "./planning-thread";
import type { ServerSupabaseClient } from "../platform/foundation";

type WorkspaceProjectIntelligence = ReturnType<typeof buildWorkspaceProjectIntelligence>;

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeList(values: readonly string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function sameText(left: string | null | undefined, right: string | null | undefined) {
  return cleanText(left) === cleanText(right);
}

function sameList(left: readonly string[], right: readonly string[]) {
  const normalizedLeft = normalizeList(left);
  const normalizedRight = normalizeList(right);

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((item, index) => item === normalizedRight[index]);
}

function buildProjectBriefPatchFromChat(args: {
  previous: WorkspaceProjectIntelligence["projectBrief"];
  next: PlanningThreadState["projectBrief"];
}) {
  const nextBrief = args.next ?? null;

  if (!nextBrief) {
    return undefined;
  }

  const patch: NonNullable<StrategyRevisionPatch["projectBrief"]> = {};

  const maybeSetText = <K extends keyof NonNullable<StrategyRevisionPatch["projectBrief"]>>(
    key: K,
    previousValue: string | null | undefined,
    nextValue: string | null | undefined
  ) => {
    const cleanedNext = cleanText(nextValue);

    if (!cleanedNext || sameText(previousValue, cleanedNext)) {
      return;
    }

    patch[key] = cleanedNext as never;
  };

  const maybeSetList = <K extends keyof NonNullable<StrategyRevisionPatch["projectBrief"]>>(
    key: K,
    previousValue: readonly string[],
    nextValue: readonly string[]
  ) => {
    const cleanedNext = normalizeList(nextValue);

    if (cleanedNext.length === 0 || sameList(previousValue, cleanedNext)) {
      return;
    }

    patch[key] = cleanedNext as never;
  };

  maybeSetText("founderName", args.previous.founderName, nextBrief.founderName);
  maybeSetText("projectName", args.previous.projectName, nextBrief.projectName);
  maybeSetText("productCategory", args.previous.productCategory, nextBrief.productCategory);
  maybeSetText("problemStatement", args.previous.problemStatement, nextBrief.problemStatement);
  maybeSetText("outcomePromise", args.previous.outcomePromise, nextBrief.outcomePromise);
  maybeSetList("buyerPersonas", args.previous.buyerPersonas, nextBrief.buyerPersonas);
  maybeSetList("operatorPersonas", args.previous.operatorPersonas, nextBrief.operatorPersonas);
  maybeSetList(
    "endCustomerPersonas",
    args.previous.endCustomerPersonas,
    nextBrief.endCustomerPersonas
  );
  maybeSetList("adminPersonas", args.previous.adminPersonas, nextBrief.adminPersonas);
  maybeSetList("mustHaveFeatures", args.previous.mustHaveFeatures, nextBrief.mustHaveFeatures);
  maybeSetList(
    "niceToHaveFeatures",
    args.previous.niceToHaveFeatures,
    nextBrief.niceToHaveFeatures
  );
  maybeSetList("excludedFeatures", args.previous.excludedFeatures, nextBrief.excludedFeatures);
  maybeSetList("surfaces", args.previous.surfaces, nextBrief.surfaces);
  maybeSetList("integrations", args.previous.integrations, nextBrief.integrations);
  maybeSetList("dataSources", args.previous.dataSources, nextBrief.dataSources);
  maybeSetList("constraints", args.previous.constraints, nextBrief.constraints);
  maybeSetList("complianceFlags", args.previous.complianceFlags, nextBrief.complianceFlags);
  maybeSetList("trustRisks", args.previous.trustRisks, nextBrief.trustRisks);

  return Object.keys(patch).length > 0 ? patch : undefined;
}

function resolvePrimaryQuestionRow(args: {
  previousIntelligence: WorkspaceProjectIntelligence;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  return (
    buildStrategyQuestionRows({
      projectMetadata: args.projectMetadata ?? null,
      projectBrief: args.previousIntelligence.projectBrief,
      architectureBlueprint: args.previousIntelligence.architectureBlueprint,
      roadmapPlan: args.previousIntelligence.roadmapPlan
    })[0] ?? null
  );
}

function createBlockerStateFromRow(questionRow: StrategyQuestionRow | null) {
  if (!questionRow) {
    return null;
  }

  return buildBlockerQuestionState({
    blockerId: questionRow.blockerId,
    inputId: questionRow.inputId,
    slotId: questionRow.inputId,
    label: questionRow.label,
    question: questionRow.question,
    source: questionRow.source,
    currentValue: questionRow.value || null
  });
}

function applyClarificationMessage(args: {
  threadState: PlanningThreadState;
  intentResult?: StructuredAnswerExtractionResult | null;
}) {
  const clarificationMessage = args.intentResult
    ? buildStrategyThreadClarificationMessage(args.intentResult)
    : null;

  if (!clarificationMessage) {
    return args.threadState;
  }

  const nextMessages = [...args.threadState.messages];
  const lastAssistantIndex = [...nextMessages]
    .map((message, index) => ({ message, index }))
    .reverse()
    .find(({ message }) => message.role === "assistant")?.index;

  if (lastAssistantIndex == null) {
    return args.threadState;
  }

  nextMessages[lastAssistantIndex] = {
    ...nextMessages[lastAssistantIndex],
    content: clarificationMessage
  };

  return {
    ...args.threadState,
    messages: nextMessages
  };
}

function createSafeProjectThreadState(args: {
  threadState: PlanningThreadState;
  previousIntelligence: WorkspaceProjectIntelligence;
  projectMetadata?: StoredProjectMetadata | null;
  preserveConversationState?: boolean;
}) {
  return {
    ...args.threadState,
    conversationState: args.preserveConversationState
      ? args.projectMetadata?.conversationState ?? args.threadState.conversationState
      : args.threadState.conversationState,
    projectBrief: args.previousIntelligence.projectBrief,
    architectureBlueprint: args.previousIntelligence.architectureBlueprint,
    roadmapPlan: args.previousIntelligence.roadmapPlan,
    governancePolicy: args.previousIntelligence.governancePolicy
  } satisfies PlanningThreadState;
}

function chooseProviderAdapter() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return createOpenAIBlockerExtractionAdapter({
    modelId: "gpt-5.4-thinking"
  }) satisfies ModelProviderAdapter;
}

export async function createPlanningChatPersistenceUpdate(args: {
  workspaceId: string;
  projectId: string;
  projectName: string;
  projectMetadata?: StoredProjectMetadata | null;
  previousIntelligence: WorkspaceProjectIntelligence;
  threadState: PlanningThreadState;
  latestUserMessage: string;
  createdAt: string;
  createdBy?: string | null;
  providerAdapter?: ModelProviderAdapter | null;
}) {
  const questionRow = resolvePrimaryQuestionRow({
    previousIntelligence: args.previousIntelligence,
    projectMetadata: args.projectMetadata
  });
  const blockerState = createBlockerStateFromRow(questionRow);
  const providerAdapter = args.providerAdapter ?? chooseProviderAdapter();
  const safeBaseThreadState = createSafeProjectThreadState({
    threadState: args.threadState,
    previousIntelligence: args.previousIntelligence,
    projectMetadata: args.projectMetadata,
    preserveConversationState: blockerState != null
  });
  let intentResult: StructuredAnswerExtractionResult | null = null;
  let patch: StrategyRevisionPatch = {};

  if (blockerState) {
    intentResult = await extractStructuredAnswerForBlocker({
      blockerState,
      rawAnswer: args.latestUserMessage,
      projectBrief: args.previousIntelligence.projectBrief,
      providerAdapter
    });
    patch = intentResult.structuredPatch ?? {};
  } else {
    const projectBriefPatch = buildProjectBriefPatchFromChat({
      previous: args.previousIntelligence.projectBrief,
      next: args.threadState.projectBrief
    });

    if (projectBriefPatch) {
      patch.projectBrief = projectBriefPatch;
    }
  }

  const clarifiedThreadState = applyClarificationMessage({
    threadState: safeBaseThreadState,
    intentResult
  });

  if (!hasStrategyRevisionPatchContent(patch)) {
    return {
      patch,
      blockerState,
      intentResult,
      updatedThreadState: clarifiedThreadState,
      strategyState:
        args.projectMetadata?.strategyState
          ? {
              ...args.projectMetadata.strategyState,
              planningThreadState: createPersistedPlanningThreadState(clarifiedThreadState)
            }
          : {
              planningThreadState: createPersistedPlanningThreadState(clarifiedThreadState)
            },
      governanceState: args.projectMetadata?.governanceState ?? null,
      strategyUpdate: null
    };
  }

  const strategyUpdate = createStrategyRevisionPersistenceUpdate({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectName: args.projectName,
    projectMetadata: args.projectMetadata,
    projectBrief: args.previousIntelligence.projectBrief,
    architectureBlueprint: args.previousIntelligence.architectureBlueprint,
    roadmapPlan: args.previousIntelligence.roadmapPlan,
    governancePolicy: args.previousIntelligence.governancePolicy,
    patch,
    createdAt: args.createdAt,
    createdBy: args.createdBy ?? null
  });
  const updatedThreadState: PlanningThreadState = {
    ...clarifiedThreadState,
    projectBrief: strategyUpdate.revisedLayers.projectBrief,
    architectureBlueprint: strategyUpdate.revisedLayers.architectureBlueprint,
    roadmapPlan: strategyUpdate.revisedLayers.roadmapPlan,
    governancePolicy: strategyUpdate.revisedLayers.governancePolicy
  };

  return {
    patch,
    blockerState,
    intentResult,
    updatedThreadState,
    strategyState: {
      ...strategyUpdate.strategyState,
      planningThreadState: createPersistedPlanningThreadState(updatedThreadState)
    },
    governanceState: strategyUpdate.governanceState,
    strategyUpdate
  };
}

export async function persistProjectPlanningThreadState(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  workspaceId: string;
  projectId: string;
  threadState: PlanningThreadState;
  latestUserMessage: string;
  createdBy?: string | null;
}) {
  if (args.projectId !== args.workspaceId) {
    return {
      persisted: false,
      threadState: args.threadState,
      error: "Your answer was not saved. Try again."
    };
  }

  const { getAccessibleWorkspace } = await import("../platform/foundation");
  const workspace = await getAccessibleWorkspace({
    supabase: args.supabase,
    userId: args.userId,
    workspaceId: args.workspaceId
  });

  if (!workspace) {
    return {
      persisted: false,
      threadState: args.threadState,
      error: "Your answer was not saved. Reload the project room and try again."
    };
  }

  const parsed = parseWorkspaceProjectDescription(workspace.description);
  const previousIntelligence = buildWorkspaceProjectIntelligence({
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    projectTitle: workspace.name,
    projectDescription: parsed.visibleDescription,
    projectMetadata: parsed.metadata
  });

  let persistenceUpdate;

  try {
    persistenceUpdate = await createPlanningChatPersistenceUpdate({
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      projectName: workspace.name,
      projectMetadata: parsed.metadata,
      previousIntelligence,
      threadState: args.threadState,
      latestUserMessage: args.latestUserMessage,
      createdAt: args.threadState.updatedAt,
      createdBy: args.createdBy ?? args.userId
    });
  } catch {
    return {
      persisted: false,
      threadState: args.threadState,
      error: "Neroa could not apply that answer yet. Please try again or clarify it."
    };
  }

  const description = encodeWorkspaceProjectDescription(
    parsed.visibleDescription,
    mergeStoredProjectMetadata({
      existing: parsed.metadata,
      title: workspace.name,
      description: parsed.visibleDescription,
      conversationState: persistenceUpdate.updatedThreadState.conversationState ?? null,
      strategyState: persistenceUpdate.strategyState,
      governanceState: persistenceUpdate.governanceState
    })
  );
  const { data, error } = await args.supabase
    .from("workspaces")
    .update({
      description
    })
    .eq("id", args.workspaceId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      persisted: false,
      threadState: args.threadState,
      error: "Your answer was not saved. Try again."
    };
  }

  return {
    persisted: true,
    threadState: persistenceUpdate.updatedThreadState,
    strategyUpdate: persistenceUpdate.strategyUpdate,
    intentResult: persistenceUpdate.intentResult
  };
}
