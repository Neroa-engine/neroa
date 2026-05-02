import {
  analyzeTaskWithNeroaOne,
  buildNeroaOneTaskAnalysisRequestFromSpaceContext
} from "../neroa-one/index.ts";
import type {
  CommandCenterCustomerRequestType,
  CommandCenterTaskSourceType,
  CommandCenterWorkflowLane
} from "./command-center-tasks.ts";
import type { StoredProjectMetadata } from "./project-metadata";

type CommandCenterAnalyzerProjectMetadata = {
  archived: boolean;
  strategyState: {
    revisionRecords: unknown[];
    planningThreadState: {
      messages: unknown[];
    } | null;
  } | null;
  executionState: {
    pendingExecutions: unknown[];
    executionPackets: unknown[];
  } | null;
  assets: unknown[];
  commandCenterDecisions: unknown[];
  commandCenterChangeReviews: unknown[];
  commandCenterTasks: unknown[];
  commandCenterPreviewState: {
    status: string | null;
  } | null;
  commandCenterApprovedDesignPackage: {
    status: string | null;
  } | null;
  buildSession: {
    scope: Record<string, unknown> | undefined;
  } | null;
  saasIntake: unknown;
  mobileAppIntake: unknown;
} | null;

export type CommandCenterTaskIntakeClassificationInput = {
  workspaceId: string;
  workspaceName: string;
  visibleDescription?: string | null;
  projectMetadata?: StoredProjectMetadata | null;
  taskId: string;
  title: string;
  request: string;
  normalizedRequest?: string | null;
  roadmapArea?: string | null;
  requestType: CommandCenterCustomerRequestType;
  workflowLane?: CommandCenterWorkflowLane | null;
  sourceType?: CommandCenterTaskSourceType;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function buildAnalyzerProjectMetadata(
  projectMetadata?: StoredProjectMetadata | null
): CommandCenterAnalyzerProjectMetadata {
  if (!projectMetadata) {
    return null;
  }

  return {
    archived: projectMetadata.archived ?? false,
    strategyState: projectMetadata.strategyState
      ? {
          revisionRecords: projectMetadata.strategyState.revisionRecords ?? [],
          planningThreadState: projectMetadata.strategyState.planningThreadState
            ? {
                messages: projectMetadata.strategyState.planningThreadState.messages ?? []
              }
            : null
        }
      : null,
    executionState: projectMetadata.executionState
      ? {
          pendingExecutions: projectMetadata.executionState.pendingExecutions ?? [],
          executionPackets: projectMetadata.executionState.executionPackets ?? []
        }
      : null,
    assets: projectMetadata.assets ?? [],
    commandCenterDecisions: projectMetadata.commandCenterDecisions ?? [],
    commandCenterChangeReviews: projectMetadata.commandCenterChangeReviews ?? [],
    commandCenterTasks: projectMetadata.commandCenterTasks ?? [],
    commandCenterPreviewState: projectMetadata.commandCenterPreviewState
      ? {
          status: projectMetadata.commandCenterPreviewState.state ?? null
        }
      : null,
    commandCenterApprovedDesignPackage: projectMetadata.commandCenterApprovedDesignPackage
      ? {
          status: projectMetadata.commandCenterApprovedDesignPackage.status ?? null
        }
      : null,
    buildSession: projectMetadata.buildSession
      ? {
          scope:
            projectMetadata.buildSession.scope &&
            typeof projectMetadata.buildSession.scope === "object"
              ? (projectMetadata.buildSession.scope as Record<string, unknown>)
              : undefined
        }
      : null,
    saasIntake: projectMetadata.saasIntake ?? null,
    mobileAppIntake: projectMetadata.mobileAppIntake ?? null
  };
}

export async function classifyCommandCenterTaskIntake(
  args: CommandCenterTaskIntakeClassificationInput
) {
  const projectMetadataForAnalyzer = buildAnalyzerProjectMetadata(args.projectMetadata);

  try {
    return await analyzeTaskWithNeroaOne(
      buildNeroaOneTaskAnalysisRequestFromSpaceContext({
        workspaceId: args.workspaceId,
        projectId: args.workspaceId,
        projectContext: {
          workspaceId: args.workspaceId,
          projectId: args.workspaceId,
          projectTitle: args.workspaceName,
          projectDescription: args.visibleDescription ?? null,
          projectMetadata: projectMetadataForAnalyzer
        },
        task: {
          taskId: args.taskId,
          title: args.title,
          request: args.request,
          normalizedRequest: args.normalizedRequest ?? null,
          roadmapArea: args.roadmapArea ?? null,
          requestType: args.requestType ?? null,
          workflowLane: args.workflowLane ?? null,
          sourceType: args.sourceType ?? null,
          createdAt: args.createdAt ?? null,
          updatedAt: args.updatedAt ?? null
        },
        caller: "command_center_task_intake"
      })
    );
  } catch {
    return null;
  }
}
