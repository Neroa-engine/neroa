import { buildWorkspaceProjectIntelligence } from "../intelligence/project-brief-generator";
import {
  createStrategyRevisionPersistenceUpdate,
  hasStrategyRevisionPatchContent,
  type StrategyRevisionPatch
} from "../intelligence/revisions";
import {
  buildBlockerQuestionStateFromRuntime,
  buildBlockerRuntimeState,
  buildRuntimeThreadPrompt,
  createBlockerTransitionResult,
  createOpenAIBlockerExtractionAdapter,
  evaluateBlockerCompletion,
  extractStructuredAnswerForBlocker,
  getActiveBlockerEntry,
  type BlockerRuntimeState,
  type ModelProviderAdapter,
  type StructuredAnswerExtractionResult
} from "../intent-library";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  mergeStoredProjectMetadata,
  type StoredProjectMetadata,
  parseWorkspaceProjectDescription
} from "../workspace/project-metadata";
import {
  createPersistedPlanningThreadState,
  type PlanningThreadState
} from "./planning-thread";
import type { ServerSupabaseClient } from "../platform/foundation";

type WorkspaceProjectIntelligence = ReturnType<typeof buildWorkspaceProjectIntelligence>;

function chooseProviderAdapter() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return createOpenAIBlockerExtractionAdapter({
    modelId: "gpt-5.4-thinking"
  }) satisfies ModelProviderAdapter;
}

function createSafeProjectThreadState(args: {
  threadState: PlanningThreadState;
  previousIntelligence: WorkspaceProjectIntelligence;
  projectMetadata?: StoredProjectMetadata | null;
  preserveConversationState?: boolean;
  runtimeState?: BlockerRuntimeState | null;
}) {
  return {
    ...args.threadState,
    conversationState: args.preserveConversationState
      ? args.projectMetadata?.conversationState ?? args.threadState.conversationState
      : args.threadState.conversationState,
    projectBrief: args.previousIntelligence.projectBrief,
    architectureBlueprint: args.previousIntelligence.architectureBlueprint,
    roadmapPlan: args.previousIntelligence.roadmapPlan,
    governancePolicy: args.previousIntelligence.governancePolicy,
    runtimeState: args.runtimeState ?? args.threadState.runtimeState ?? null
  } satisfies PlanningThreadState;
}

function replaceLastAssistantMessage(args: {
  threadState: PlanningThreadState;
  content: string;
}) {
  const nextMessages = [...args.threadState.messages];
  const lastAssistantIndex = [...nextMessages]
    .map((message, index) => ({ message, index }))
    .reverse()
    .find(({ message }) => message.role === "assistant")?.index;

  if (lastAssistantIndex == null) {
    return {
      ...args.threadState,
      messages: [
        ...nextMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: args.content,
          createdAt: new Date().toISOString()
        }
      ]
    } satisfies PlanningThreadState;
  }

  nextMessages[lastAssistantIndex] = {
    ...nextMessages[lastAssistantIndex],
    content: args.content
  };

  return {
    ...args.threadState,
    messages: nextMessages
  } satisfies PlanningThreadState;
}

function buildRuntimeAssistantMessage(args: {
  runtimeState: BlockerRuntimeState;
  transitionResult?: ReturnType<typeof createBlockerTransitionResult> | null;
}) {
  const runtimePrompt = buildRuntimeThreadPrompt(args.runtimeState.currentQuestionPlan);

  if (runtimePrompt) {
    return runtimePrompt;
  }

  if (
    args.transitionResult?.completionDecision.outcome === "blocker_resolved" &&
    args.runtimeState.unresolvedCount === 0
  ) {
    return "The critical planning blockers are currently covered. Review the approval state and approve the roadmap scope when you're ready.";
  }

  return null;
}

function buildRuntimeProjectMetadata(args: {
  projectName: string;
  projectMetadata?: StoredProjectMetadata | null;
  threadState: PlanningThreadState;
  strategyState?: StoredProjectMetadata["strategyState"] | null;
  governanceState?: StoredProjectMetadata["governanceState"] | null;
}) {
  if (!args.projectMetadata) {
    return buildStoredProjectMetadata({
      title: args.projectName,
      description: null,
      conversationState: args.threadState.conversationState ?? null,
      strategyState: args.strategyState ?? null,
      governanceState: args.governanceState ?? null
    });
  }

  return {
    ...args.projectMetadata,
    conversationState:
      args.threadState.conversationState ?? args.projectMetadata.conversationState ?? null,
    strategyState: args.strategyState ?? args.projectMetadata.strategyState ?? null,
    governanceState: args.governanceState ?? args.projectMetadata.governanceState ?? null
  } satisfies StoredProjectMetadata;
}

function finalizeRuntimeState(args: {
  projectMetadata?: StoredProjectMetadata | null;
  projectName: string;
  projectIntelligence: WorkspaceProjectIntelligence;
  threadState: PlanningThreadState;
  previousRuntimeState?: BlockerRuntimeState | null;
  forceActiveBlockerId?: Parameters<typeof buildBlockerRuntimeState>[0]["forceActiveBlockerId"];
  clarificationPlan?: Parameters<typeof buildBlockerRuntimeState>[0]["clarificationPlan"];
  lastAnsweredBlockerId?: Parameters<typeof buildBlockerRuntimeState>[0]["lastAnsweredBlockerId"];
  lastTransition?: Parameters<typeof buildBlockerRuntimeState>[0]["lastTransition"];
}) {
  const metadataForRuntime = buildRuntimeProjectMetadata({
    projectName: args.projectName,
    projectMetadata: args.projectMetadata,
    threadState: args.threadState,
    strategyState: args.projectMetadata?.strategyState ?? null,
    governanceState: args.projectMetadata?.governanceState ?? null
  });

  return buildBlockerRuntimeState({
    projectMetadata: metadataForRuntime,
    projectBrief: args.projectIntelligence.projectBrief,
    architectureBlueprint: args.projectIntelligence.architectureBlueprint,
    roadmapPlan: args.projectIntelligence.roadmapPlan,
    governancePolicy: args.projectIntelligence.governancePolicy,
    previousRuntimeState: args.previousRuntimeState ?? null,
    forceActiveBlockerId: args.forceActiveBlockerId ?? null,
    clarificationPlan: args.clarificationPlan ?? null,
    lastAnsweredBlockerId: args.lastAnsweredBlockerId ?? null,
    lastTransition: args.lastTransition ?? null
  });
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
  const providerAdapter = args.providerAdapter ?? chooseProviderAdapter();
  const previousRuntimeState = buildBlockerRuntimeState({
    projectMetadata: args.projectMetadata ?? null,
    projectBrief: args.previousIntelligence.projectBrief,
    architectureBlueprint: args.previousIntelligence.architectureBlueprint,
    roadmapPlan: args.previousIntelligence.roadmapPlan,
    governancePolicy: args.previousIntelligence.governancePolicy,
    previousRuntimeState:
      args.threadState.runtimeState ??
      args.projectMetadata?.strategyState?.planningThreadState?.runtimeState ??
      null
  });
  const activeEntry = getActiveBlockerEntry(previousRuntimeState);
  const blockerState = buildBlockerQuestionStateFromRuntime(previousRuntimeState);
  const safeBaseThreadState = createSafeProjectThreadState({
    threadState: args.threadState,
    previousIntelligence: args.previousIntelligence,
    projectMetadata: args.projectMetadata,
    preserveConversationState: blockerState != null,
    runtimeState: previousRuntimeState
  });

  let patch: StrategyRevisionPatch = {};
  let intentResult: StructuredAnswerExtractionResult | null = null;

  if (blockerState && activeEntry) {
    intentResult = await extractStructuredAnswerForBlocker({
      blockerState,
      rawAnswer: args.latestUserMessage,
      projectBrief: args.previousIntelligence.projectBrief,
      providerAdapter
    });
    patch = intentResult.structuredPatch ?? {};
  }

  const completionEvaluation =
    activeEntry && intentResult
      ? evaluateBlockerCompletion({
          entry: activeEntry,
          extractionResult: intentResult
        })
      : null;
  const needsClarification = completionEvaluation?.decision.needsClarification ?? false;
  const shouldHoldActiveBlocker =
    completionEvaluation?.decision.shouldReask ?? false;

  if (!hasStrategyRevisionPatchContent(patch)) {
    const afterRuntimeState = finalizeRuntimeState({
      projectMetadata: args.projectMetadata ?? null,
      projectName: args.projectName,
      projectIntelligence: args.previousIntelligence,
      threadState: safeBaseThreadState,
      previousRuntimeState,
      forceActiveBlockerId: shouldHoldActiveBlocker ? activeEntry?.blockerId ?? null : null,
      clarificationPlan: needsClarification ? completionEvaluation?.clarificationPlan ?? null : null,
      lastAnsweredBlockerId: activeEntry?.blockerId ?? null
    });
    const transitionResult =
      activeEntry && intentResult
        ? createBlockerTransitionResult({
            beforeRuntimeState: previousRuntimeState,
            activeEntry,
            extractionResult: intentResult,
            afterRuntimeState
          })
        : null;
    const finalRuntimeState = buildBlockerRuntimeState({
      projectMetadata: args.projectMetadata ?? null,
      projectBrief: args.previousIntelligence.projectBrief,
      architectureBlueprint: args.previousIntelligence.architectureBlueprint,
      roadmapPlan: args.previousIntelligence.roadmapPlan,
      governancePolicy: args.previousIntelligence.governancePolicy,
      previousRuntimeState: afterRuntimeState,
      forceActiveBlockerId: shouldHoldActiveBlocker ? activeEntry?.blockerId ?? null : null,
      clarificationPlan: needsClarification ? completionEvaluation?.clarificationPlan ?? null : null,
      lastAnsweredBlockerId: activeEntry?.blockerId ?? null,
      lastTransition: transitionResult
    });
    const runtimeAssistantMessage = buildRuntimeAssistantMessage({
      runtimeState: finalRuntimeState,
      transitionResult
    });
    const updatedThreadState = runtimeAssistantMessage
      ? replaceLastAssistantMessage({
          threadState: {
            ...safeBaseThreadState,
            runtimeState: finalRuntimeState
          },
          content: runtimeAssistantMessage
        })
      : {
          ...safeBaseThreadState,
          runtimeState: finalRuntimeState
        };

    return {
      patch,
      blockerState,
      intentResult,
      runtimeState: finalRuntimeState,
      transitionResult,
      updatedThreadState,
      strategyState:
        args.projectMetadata?.strategyState
          ? {
              ...args.projectMetadata.strategyState,
              planningThreadState: createPersistedPlanningThreadState(updatedThreadState)
            }
          : {
              planningThreadState: createPersistedPlanningThreadState(updatedThreadState)
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
  const revisedThreadState: PlanningThreadState = {
    ...safeBaseThreadState,
    projectBrief: strategyUpdate.revisedLayers.projectBrief,
    architectureBlueprint: strategyUpdate.revisedLayers.architectureBlueprint,
    roadmapPlan: strategyUpdate.revisedLayers.roadmapPlan,
    governancePolicy: strategyUpdate.revisedLayers.governancePolicy
  };
  const revisedProjectMetadata = buildRuntimeProjectMetadata({
    projectName: args.projectName,
    projectMetadata: args.projectMetadata ?? null,
    threadState: revisedThreadState,
    strategyState: strategyUpdate.strategyState,
    governanceState: strategyUpdate.governanceState
  });
  const afterRuntimeState = buildBlockerRuntimeState({
    projectMetadata: revisedProjectMetadata,
    projectBrief: strategyUpdate.revisedLayers.projectBrief,
    architectureBlueprint: strategyUpdate.revisedLayers.architectureBlueprint,
    roadmapPlan: strategyUpdate.revisedLayers.roadmapPlan,
    governancePolicy: strategyUpdate.revisedLayers.governancePolicy,
    previousRuntimeState,
    forceActiveBlockerId: shouldHoldActiveBlocker ? activeEntry?.blockerId ?? null : null,
    clarificationPlan: needsClarification ? completionEvaluation?.clarificationPlan ?? null : null,
    lastAnsweredBlockerId: activeEntry?.blockerId ?? null
  });
  const transitionResult =
    activeEntry && intentResult
      ? createBlockerTransitionResult({
          beforeRuntimeState: previousRuntimeState,
          activeEntry,
          extractionResult: intentResult,
          afterRuntimeState
        })
      : null;
  const finalRuntimeState = buildBlockerRuntimeState({
    projectMetadata: revisedProjectMetadata,
    projectBrief: strategyUpdate.revisedLayers.projectBrief,
    architectureBlueprint: strategyUpdate.revisedLayers.architectureBlueprint,
    roadmapPlan: strategyUpdate.revisedLayers.roadmapPlan,
    governancePolicy: strategyUpdate.revisedLayers.governancePolicy,
    previousRuntimeState: afterRuntimeState,
    forceActiveBlockerId: shouldHoldActiveBlocker ? activeEntry?.blockerId ?? null : null,
    clarificationPlan: needsClarification ? completionEvaluation?.clarificationPlan ?? null : null,
    lastAnsweredBlockerId: activeEntry?.blockerId ?? null,
    lastTransition: transitionResult
  });
  const runtimeAssistantMessage = buildRuntimeAssistantMessage({
    runtimeState: finalRuntimeState,
    transitionResult
  });
  const updatedThreadState = runtimeAssistantMessage
    ? replaceLastAssistantMessage({
        threadState: {
          ...revisedThreadState,
          runtimeState: finalRuntimeState
        },
        content: runtimeAssistantMessage
      })
    : {
        ...revisedThreadState,
        runtimeState: finalRuntimeState
      };

  return {
    patch,
    blockerState,
    intentResult,
    runtimeState: finalRuntimeState,
    transitionResult,
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
