import { buildWorkspaceProjectIntelligence } from "../intelligence/project-brief-generator";
import {
  architectureInputIdSchema,
  type ArchitectureInputId
} from "../intelligence/architecture/types";
import {
  createStrategyRevisionPersistenceUpdate,
  hasStrategyRevisionPatchContent,
  type StrategyRevisionPatch
} from "../intelligence/revisions";
import {
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

const DOMAIN_SPECIFIC_CHAT_INPUT_IDS = new Set<ArchitectureInputId>([
  "chainsInScope",
  "walletConnectionMvp",
  "adviceAdjacency",
  "riskSignalSources",
  "launchLocationModel",
  "firstPosConnector",
  "analyticsVsStaffWorkflows",
  "launchReports"
]);

function cleanText(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSearchText(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
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

function buildOpenInputIdSet(args: {
  projectBrief: WorkspaceProjectIntelligence["projectBrief"];
  architectureBlueprint: WorkspaceProjectIntelligence["architectureBlueprint"];
  roadmapPlan: WorkspaceProjectIntelligence["roadmapPlan"];
}) {
  const openInputIds = new Set<ArchitectureInputId>();

  for (const question of args.architectureBlueprint.openQuestions) {
    openInputIds.add(question.inputId);
  }

  for (const question of args.roadmapPlan.openQuestions) {
    openInputIds.add(question.inputId);
  }

  for (const question of args.projectBrief.openQuestions) {
    const parsedInputId = architectureInputIdSchema.safeParse(question.slotId);

    if (parsedInputId.success) {
      openInputIds.add(parsedInputId.data);
    }
  }

  return openInputIds;
}

function humanizeList(values: readonly string[]) {
  if (values.length <= 1) {
    return values[0] ?? "";
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function extractLaunchChainsValue(message: string) {
  const chainPatterns = [
    { label: "Ethereum", pattern: /\beth(?:ereum)?\b/i },
    { label: "Solana", pattern: /\bsol(?:ana)?\b/i },
    { label: "Base", pattern: /\bbase\b/i },
    { label: "Arbitrum", pattern: /\barbitrum\b/i },
    { label: "Optimism", pattern: /\boptimism\b/i },
    { label: "Polygon", pattern: /\bpolygon\b|\bmatic\b/i },
    { label: "Avalanche", pattern: /\bavalanche\b|\bavax\b/i },
    { label: "BNB Chain", pattern: /\bbnb\b|\bbsc\b|\bbinance smart chain\b/i },
    { label: "Bitcoin", pattern: /\bbtc\b|\bbitcoin\b/i },
    { label: "Tron", pattern: /\btron\b/i },
    { label: "Aptos", pattern: /\baptos\b/i },
    { label: "Sui", pattern: /\bsui\b/i }
  ];
  const matches = chainPatterns
    .filter((item) => item.pattern.test(message))
    .map((item) => item.label);

  return matches.length > 0 ? humanizeList(matches) : null;
}

function extractPosConnectorValue(message: string) {
  const connectorPatterns = [
    { label: "Toast", pattern: /\btoast\b/i },
    { label: "Square", pattern: /\bsquare\b/i },
    { label: "Clover", pattern: /\bclover\b/i },
    { label: "Lightspeed", pattern: /\blightspeed\b/i },
    { label: "SpotOn", pattern: /\bspoton\b/i }
  ];
  const matches = connectorPatterns
    .filter((item) => item.pattern.test(message))
    .map((item) => item.label);

  return matches.length > 0 ? humanizeList(matches) : null;
}

function inferAnsweredInputValue(inputId: ArchitectureInputId, message: string) {
  const cleanMessage = cleanText(message);

  if (!cleanMessage) {
    return null;
  }

  const normalized = normalizeSearchText(cleanMessage);

  switch (inputId) {
    case "chainsInScope":
      return extractLaunchChainsValue(cleanMessage);
    case "walletConnectionMvp":
      return /\bwallet\b/.test(normalized) ? cleanMessage : null;
    case "adviceAdjacency":
      return /\badvice\b|\badvisory\b|\banalytics only\b|\bnot financial advice\b/i.test(
        cleanMessage
      )
        ? cleanMessage
        : null;
    case "riskSignalSources":
      return /\bsignal\b|\bsource\b|\bsources\b|\bvendor\b|\bdata\b|\bfeeds?\b|\bonchain\b|\bliquidity\b|\baudit\b/i.test(
        cleanMessage
      )
        ? cleanMessage
        : null;
    case "launchLocationModel":
      return /\bsingle[- ]location\b|\bmulti[- ]location\b/i.test(cleanMessage)
        ? cleanMessage
        : null;
    case "firstPosConnector":
      return extractPosConnectorValue(cleanMessage);
    case "analyticsVsStaffWorkflows":
      return /\banalytics only\b|\bstaff workflow\b|\bstaff workflows\b|\bworkflow\b|\bworkflows\b/i.test(
        cleanMessage
      )
        ? cleanMessage
        : null;
    case "launchReports":
      return /\breport\b|\breports\b|\bdashboard\b|\bmenu item\b|\blocation reporting\b/i.test(
        cleanMessage
      )
        ? cleanMessage
        : null;
    default:
      return null;
  }
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
  maybeSetList("niceToHaveFeatures", args.previous.niceToHaveFeatures, nextBrief.niceToHaveFeatures);
  maybeSetList("excludedFeatures", args.previous.excludedFeatures, nextBrief.excludedFeatures);
  maybeSetList("surfaces", args.previous.surfaces, nextBrief.surfaces);
  maybeSetList("integrations", args.previous.integrations, nextBrief.integrations);
  maybeSetList("dataSources", args.previous.dataSources, nextBrief.dataSources);
  maybeSetList("constraints", args.previous.constraints, nextBrief.constraints);
  maybeSetList("complianceFlags", args.previous.complianceFlags, nextBrief.complianceFlags);
  maybeSetList("trustRisks", args.previous.trustRisks, nextBrief.trustRisks);

  return Object.keys(patch).length > 0 ? patch : undefined;
}

function buildAnsweredInputsFromChat(args: {
  previousIntelligence: WorkspaceProjectIntelligence;
  nextThreadState: PlanningThreadState;
  latestUserMessage: string;
  projectMetadata?: StoredProjectMetadata | null;
}) {
  const latestUserMessage = cleanText(args.latestUserMessage);

  if (!latestUserMessage || !args.nextThreadState.projectBrief || !args.nextThreadState.roadmapPlan || !args.nextThreadState.architectureBlueprint) {
    return [] as NonNullable<StrategyRevisionPatch["answeredInputs"]>;
  }

  const previousOpen = buildOpenInputIdSet({
    projectBrief: args.previousIntelligence.projectBrief,
    architectureBlueprint: args.previousIntelligence.architectureBlueprint,
    roadmapPlan: args.previousIntelligence.roadmapPlan
  });
  const nextOpen = buildOpenInputIdSet({
    projectBrief: args.nextThreadState.projectBrief,
    architectureBlueprint: args.nextThreadState.architectureBlueprint,
    roadmapPlan: args.nextThreadState.roadmapPlan
  });
  const currentAnswers = new Map(
    (args.projectMetadata?.strategyState?.overrideState?.answeredInputs ?? []).map((item) => [
      item.inputId,
      item.value
    ])
  );
  const answers = new Map<ArchitectureInputId, string>();

  for (const inputId of Array.from(previousOpen)) {
    if (!DOMAIN_SPECIFIC_CHAT_INPUT_IDS.has(inputId)) {
      continue;
    }

    const inferredValue = inferAnsweredInputValue(inputId, latestUserMessage);

    if (!nextOpen.has(inputId)) {
      const value = inferredValue ?? latestUserMessage;

      if (!sameText(currentAnswers.get(inputId), value)) {
        answers.set(inputId, value);
      }

      continue;
    }

    if (inferredValue && !sameText(currentAnswers.get(inputId), inferredValue)) {
      answers.set(inputId, inferredValue);
    }
  }

  return Array.from(answers.entries()).map(([inputId, value]) => ({
    inputId,
    value
  }));
}

export function createPlanningChatPersistenceUpdate(args: {
  workspaceId: string;
  projectId: string;
  projectName: string;
  projectMetadata?: StoredProjectMetadata | null;
  previousIntelligence: WorkspaceProjectIntelligence;
  threadState: PlanningThreadState;
  latestUserMessage: string;
  createdAt: string;
  createdBy?: string | null;
}) {
  const patch: StrategyRevisionPatch = {};
  const projectBriefPatch = buildProjectBriefPatchFromChat({
    previous: args.previousIntelligence.projectBrief,
    next: args.threadState.projectBrief
  });
  const answeredInputs = buildAnsweredInputsFromChat({
    previousIntelligence: args.previousIntelligence,
    nextThreadState: args.threadState,
    latestUserMessage: args.latestUserMessage,
    projectMetadata: args.projectMetadata
  });

  if (projectBriefPatch) {
    patch.projectBrief = projectBriefPatch;
  }

  if (answeredInputs.length > 0) {
    patch.answeredInputs = answeredInputs;
  }

  if (!hasStrategyRevisionPatchContent(patch)) {
    return {
      patch,
      updatedThreadState: args.threadState,
      strategyState:
        args.projectMetadata?.strategyState
          ? {
              ...args.projectMetadata.strategyState,
              planningThreadState: createPersistedPlanningThreadState(args.threadState)
            }
          : {
              planningThreadState: createPersistedPlanningThreadState(args.threadState)
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
    ...args.threadState,
    projectBrief: strategyUpdate.revisedLayers.projectBrief,
    architectureBlueprint: strategyUpdate.revisedLayers.architectureBlueprint,
    roadmapPlan: strategyUpdate.revisedLayers.roadmapPlan,
    governancePolicy: strategyUpdate.revisedLayers.governancePolicy
  };

  return {
    patch,
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
      threadState: args.threadState
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
      threadState: args.threadState
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
  const persistenceUpdate = createPlanningChatPersistenceUpdate({
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
      threadState: args.threadState
    };
  }

  return {
    persisted: true,
    threadState: persistenceUpdate.updatedThreadState,
    strategyUpdate: persistenceUpdate.strategyUpdate
  };
}
