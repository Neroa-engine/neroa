import { z } from "zod";

export const PLATFORM_CONTEXT_WORKSPACE_PLACEHOLDER = "<workspaceId>";
export const COMMAND_CENTER_PENDING_EXECUTION_TASK_STATUS = "waiting_on_decision" as const;
export const COMMAND_CENTER_PENDING_EXECUTION_TASK_SOURCE_TYPE = "roadmap_follow_up" as const;

export const platformSurfaceIdSchema = z.enum([
  "command_center",
  "build_room",
  "strategy_room",
  "project_workspace"
]);

export type PlatformSurfaceId = z.infer<typeof platformSurfaceIdSchema>;

const platformRouteTemplateSchema = z.string().trim().min(1);
const platformSurfaceSchema = z
  .object({
    id: platformSurfaceIdSchema,
    route: platformRouteTemplateSchema.optional(),
    role: z.string().trim().min(1),
    purpose: z.string().trim().min(1),
    isApprovalAuthority: z.boolean().optional()
  })
  .strict();

const platformBlockedCtaSchema = z
  .object({
    label: z.string().trim().min(1),
    targetRoute: platformRouteTemplateSchema
  })
  .strict();

export const platformContextSchema = z
  .object({
    assistantName: z.string().trim().min(1),
    surfaces: z
      .object({
        commandCenter: platformSurfaceSchema.extend({
          id: z.literal("command_center"),
          route: platformRouteTemplateSchema,
          role: z.literal("primary_intake_surface")
        }),
        buildRoom: platformSurfaceSchema.extend({
          id: z.literal("build_room"),
          role: z.literal("execution_detail_surface")
        }),
        strategyRoom: platformSurfaceSchema.extend({
          id: z.literal("strategy_room"),
          route: platformRouteTemplateSchema,
          role: z.literal("roadmap_scope_approval_surface"),
          isApprovalAuthority: z.boolean()
        }),
        projectWorkspace: platformSurfaceSchema.extend({
          id: z.literal("project_workspace"),
          role: z.literal("context_reference_surface")
        })
      })
      .strict(),
    executionGate: z
      .object({
        requiresApprovedRoadmapScope: z.boolean(),
        whenBlocked: z
          .object({
            saveRequestAs: z.string().trim().min(1),
            execute: z.boolean(),
            showBlockedPanel: z.boolean(),
            messageTitle: z.string().trim().min(1),
            messageBody: z.string().trim().min(1),
            ctas: z.array(platformBlockedCtaSchema).min(1)
          })
          .strict()
      })
      .strict(),
    verification: z
      .object({
        mustConfirm: z.array(z.string().trim().min(1)).min(1),
        referenceCommit: z.string().trim().min(1)
      })
      .strict()
  })
  .strict();

export type PlatformContext = z.infer<typeof platformContextSchema>;

export type PlatformExecutionGateSignalInput = {
  roomStateDataState: "stable" | "partial" | "degraded";
  blockingOpenCount: number;
  activePhaseLabel: string;
};

export type PlatformExecutionGateState = {
  approvalRequired: boolean;
  shouldExecute: boolean;
  saveRequestAs: string;
  blockedPanel: {
    show: boolean;
    statusLabel: string;
    title: string;
    body: string;
    noteLabel: string;
    ctas: Array<{
      label: string;
      href: string;
    }>;
  };
  approvalAuthority: {
    surfaceId: PlatformSurfaceId;
    route: string | null;
    purpose: string;
  };
};

export type PendingExecutionCaptureRecord = {
  saveRequestAs: string;
  execute: boolean;
  commandCenterTask: {
    id: string;
    title: string;
    request: string;
    status: typeof COMMAND_CENTER_PENDING_EXECUTION_TASK_STATUS;
    roadmapArea: string;
    sourceType: typeof COMMAND_CENTER_PENDING_EXECUTION_TASK_SOURCE_TYPE;
    createdAt: string;
    updatedAt: string;
  };
};

const approvalBlockingPhaseLabels = new Set(["Strategy", "Scope Definition"]);

export const DEFAULT_PLATFORM_CONTEXT = platformContextSchema.parse({
  assistantName: "Neroa",
  surfaces: {
    commandCenter: {
      id: "command_center",
      route: "/workspace/<workspaceId>/command-center",
      role: "primary_intake_surface",
      purpose: "Capture requests, classify intent, and gate execution."
    },
    buildRoom: {
      id: "build_room",
      role: "execution_detail_surface",
      purpose: "Execution and detailed implementation work."
    },
    strategyRoom: {
      id: "strategy_room",
      route: "/workspace/<workspaceId>/strategy-room",
      role: "roadmap_scope_approval_surface",
      purpose: "Tighten, approve, and govern roadmap and scope.",
      isApprovalAuthority: true
    },
    projectWorkspace: {
      id: "project_workspace",
      role: "context_reference_surface",
      purpose: "Project context and broader reference before approval."
    }
  },
  executionGate: {
    requiresApprovedRoadmapScope: true,
    whenBlocked: {
      saveRequestAs: "pending_execution",
      execute: false,
      showBlockedPanel: true,
      messageTitle: "Execution blocked",
      messageBody:
        "Your recent task was saved, but it cannot be executed yet because the current roadmap and scope have not been approved. You can continue submitting requests, but execution will remain paused until the roadmap is tightened and approved.",
      ctas: [
        {
          label: "Review and approve roadmap",
          targetRoute: "/workspace/<workspaceId>/strategy-room"
        },
        {
          label: "Open Strategy Room",
          targetRoute: "/workspace/<workspaceId>/strategy-room"
        }
      ]
    }
  },
  verification: {
    mustConfirm: [
      "request_is_saved",
      "request_does_not_execute",
      "blocked_message_appears",
      "user_is_routed_toward_strategy_room_not_dead_end"
    ],
    referenceCommit: "f671e76abcebc21c681a2d57ec23493a365d170e"
  }
});

export function normalizePlatformContext(value: unknown): PlatformContext | null {
  const result = platformContextSchema.safeParse(value);

  return result.success ? result.data : null;
}

export function loadPlatformContext(value: unknown): PlatformContext {
  return normalizePlatformContext(value) ?? DEFAULT_PLATFORM_CONTEXT;
}

export function getPlatformSurface(
  platformContext: PlatformContext,
  surfaceId: PlatformSurfaceId
) {
  return (
    Object.values(platformContext.surfaces).find((surface) => surface.id === surfaceId) ?? null
  );
}

export function isPlatformApprovalAuthority(
  platformContext: PlatformContext,
  surfaceId: PlatformSurfaceId
) {
  return Boolean(getPlatformSurface(platformContext, surfaceId)?.isApprovalAuthority);
}

export function resolvePlatformRouteTemplate(
  routeTemplate: string,
  workspaceId: string
) {
  return routeTemplate.replaceAll(PLATFORM_CONTEXT_WORKSPACE_PLACEHOLDER, workspaceId);
}

export function resolvePlatformSurfaceRoute(
  platformContext: PlatformContext,
  surfaceId: PlatformSurfaceId,
  workspaceId: string
) {
  const routeTemplate = getPlatformSurface(platformContext, surfaceId)?.route;

  return routeTemplate ? resolvePlatformRouteTemplate(routeTemplate, workspaceId) : null;
}

export function resolvePlatformApprovalAuthority(platformContext: PlatformContext) {
  return (
    Object.values(platformContext.surfaces).find((surface) => surface.isApprovalAuthority) ??
    platformContext.surfaces.strategyRoom
  );
}

export function resolvePlatformApprovalRoute(
  platformContext: PlatformContext,
  workspaceId: string
) {
  const approvalAuthority = resolvePlatformApprovalAuthority(platformContext);
  return approvalAuthority.route
    ? resolvePlatformRouteTemplate(approvalAuthority.route, workspaceId)
    : null;
}

export function formatPlatformSavedLabel(saveRequestAs: string) {
  return `Saved as ${saveRequestAs.replace(/_/g, " ")}`;
}

export function resolvePlatformExecutionGateState(args: {
  platformContext: PlatformContext;
  workspaceId: string;
  signals: PlatformExecutionGateSignalInput;
}): PlatformExecutionGateState {
  const { platformContext, workspaceId, signals } = args;
  const approvalAuthority = resolvePlatformApprovalAuthority(platformContext);
  const approvalRoute = resolvePlatformApprovalRoute(platformContext, workspaceId);
  const blockedBehavior = platformContext.executionGate.whenBlocked;
  const approvalRequired =
    platformContext.executionGate.requiresApprovedRoadmapScope &&
    (signals.roomStateDataState === "degraded" ||
      signals.blockingOpenCount > 0 ||
      approvalBlockingPhaseLabels.has(signals.activePhaseLabel));

  return {
    approvalRequired,
    shouldExecute: approvalRequired ? blockedBehavior.execute : true,
    saveRequestAs: blockedBehavior.saveRequestAs,
    blockedPanel: {
      show: approvalRequired && blockedBehavior.showBlockedPanel,
      statusLabel: "Status",
      title: blockedBehavior.messageTitle,
      body: blockedBehavior.messageBody,
      noteLabel: formatPlatformSavedLabel(blockedBehavior.saveRequestAs),
      ctas: blockedBehavior.ctas.map((cta) => ({
        label: cta.label,
        href: resolvePlatformRouteTemplate(cta.targetRoute, workspaceId)
      }))
    },
    approvalAuthority: {
      surfaceId: approvalAuthority.id,
      route: approvalRoute,
      purpose: approvalAuthority.purpose
    }
  };
}

export function buildPendingExecutionCaptureRecord(args: {
  platformContext: PlatformContext;
  id: string;
  title: string;
  request: string;
  roadmapArea: string;
  createdAt: string;
  updatedAt: string;
}): PendingExecutionCaptureRecord {
  return {
    saveRequestAs: args.platformContext.executionGate.whenBlocked.saveRequestAs,
    execute: args.platformContext.executionGate.whenBlocked.execute,
    commandCenterTask: {
      id: args.id,
      title: args.title,
      request: args.request,
      status: COMMAND_CENTER_PENDING_EXECUTION_TASK_STATUS,
      roadmapArea: args.roadmapArea,
      sourceType: COMMAND_CENTER_PENDING_EXECUTION_TASK_SOURCE_TYPE,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt
    }
  };
}
