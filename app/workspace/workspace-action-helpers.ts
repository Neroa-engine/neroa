import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  countActiveEnginesForUser,
  syncActiveEngineUsage
} from "@/lib/account/plan-usage-server";
import { requireUser } from "@/lib/auth";
import {
  buildStoredProjectMetadata,
  encodeWorkspaceProjectDescription,
  parseWorkspaceProjectDescription,
  type StoredGovernanceState,
  type StoredStrategyState,
  type StoredCommandCenterBrandSystem,
  type StoredProjectAsset
} from "@/lib/workspace/project-metadata";
import type { ConversationSessionState } from "@/lib/intelligence/conversation";
import type { PlatformContext } from "@/lib/intelligence/platform-context";
import type { StoredCommandCenterDecision } from "@/lib/workspace/command-center-decisions";
import type { StoredCommandCenterChangeReview } from "@/lib/workspace/command-center-change-impact";
import type {
  StoredCommandCenterApprovedDesignPackage,
  StoredCommandCenterPreviewState
} from "@/lib/workspace/command-center-design-preview";
import type { StoredCommandCenterTask } from "@/lib/workspace/command-center-tasks";

export function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function getReturnTo(formData: FormData, fallback: string) {
  return safeString(formData.get("returnTo")) || fallback;
}

export function redirectWithError(returnTo: string, message: string): never {
  const join = returnTo.includes("?") ? "&" : "?";
  redirect(`${returnTo}${join}error=${encodeURIComponent(message)}`);
}

function normalizeAsset(value: unknown): StoredProjectAsset | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const kind = typeof record.kind === "string" ? record.kind.trim() : "";
  const sizeLabel =
    typeof record.sizeLabel === "string" && record.sizeLabel.trim()
      ? record.sizeLabel.trim()
      : null;
  const addedAt = typeof record.addedAt === "string" ? record.addedAt : new Date().toISOString();

  if (!id || !name || !kind) {
    return null;
  }

  return {
    id,
    name,
    kind,
    sizeLabel,
    addedAt
  };
}

export function parseAssetsPayload(value: string) {
  if (!value.trim()) {
    return [] as StoredProjectAsset[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeAsset(item))
      .filter((item): item is StoredProjectAsset => Boolean(item));
  } catch {
    return [];
  }
}

export function uniqueAssets(items: StoredProjectAsset[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export async function getOwnedWorkspace(workspaceId: string) {
  const { supabase, user } = await requireUser();
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, name, description")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !workspace) {
    throw new Error(error?.message ?? "Engine not found.");
  }

  return { supabase, user, workspace };
}

export type OwnedWorkspaceContext = Awaited<ReturnType<typeof getOwnedWorkspace>>;

export function buildDescriptionWithMetadata(args: {
  workspace: {
    name: string;
    description: string | null;
  };
  title?: string;
  platformContext?: PlatformContext | null;
  conversationState?: ConversationSessionState | null;
  governanceState?: StoredGovernanceState | null;
  strategyState?: StoredStrategyState | null;
  archived?: boolean;
  assets?: StoredProjectAsset[];
  commandCenterBrandSystem?: StoredCommandCenterBrandSystem | null;
  commandCenterDecisions?: StoredCommandCenterDecision[];
  commandCenterChangeReviews?: StoredCommandCenterChangeReview[];
  commandCenterTasks?: StoredCommandCenterTask[];
  commandCenterPreviewState?: StoredCommandCenterPreviewState | null;
  commandCenterApprovedDesignPackage?: StoredCommandCenterApprovedDesignPackage | null;
}) {
  const parsed = parseWorkspaceProjectDescription(args.workspace.description);

  return encodeWorkspaceProjectDescription(
    parsed.visibleDescription,
    buildStoredProjectMetadata({
      title: args.title ?? args.workspace.name,
      description: parsed.visibleDescription,
      templateId: parsed.metadata?.templateId ?? null,
      customLanes: parsed.metadata?.customLanes ?? [],
      platformContext: args.platformContext ?? parsed.metadata?.platformContext ?? null,
      conversationState: args.conversationState ?? parsed.metadata?.conversationState ?? null,
      governanceState: args.governanceState ?? parsed.metadata?.governanceState ?? null,
      strategyState: args.strategyState ?? parsed.metadata?.strategyState ?? null,
      archived: args.archived ?? parsed.metadata?.archived ?? false,
      assets: args.assets ?? parsed.metadata?.assets ?? [],
      commandCenterBrandSystem:
        args.commandCenterBrandSystem ?? parsed.metadata?.commandCenterBrandSystem ?? null,
      commandCenterDecisions:
        args.commandCenterDecisions ?? parsed.metadata?.commandCenterDecisions ?? [],
      commandCenterChangeReviews:
        args.commandCenterChangeReviews ?? parsed.metadata?.commandCenterChangeReviews ?? [],
      commandCenterTasks: args.commandCenterTasks ?? parsed.metadata?.commandCenterTasks ?? [],
      commandCenterPreviewState:
        args.commandCenterPreviewState ?? parsed.metadata?.commandCenterPreviewState ?? null,
      commandCenterApprovedDesignPackage:
        args.commandCenterApprovedDesignPackage ??
        parsed.metadata?.commandCenterApprovedDesignPackage ??
        null,
      guidedFlowPreset: parsed.metadata?.guidedFlowPreset,
      guidedEntryContext: parsed.metadata?.guidedEntryContext ?? null,
      buildSession: parsed.metadata?.buildSession ?? null,
      saasIntake: parsed.metadata?.saasIntake ?? null,
      mobileAppIntake: parsed.metadata?.mobileAppIntake ?? null
    })
  );
}

export async function syncWorkspaceUsageSnapshot(ownedWorkspace: OwnedWorkspaceContext) {
  await syncActiveEngineUsage({
    supabase: ownedWorkspace.supabase,
    user: ownedWorkspace.user,
    activeEnginesUsed: await countActiveEnginesForUser(
      ownedWorkspace.supabase,
      ownedWorkspace.user.id
    )
  }).catch(() => {
    // Keep the action successful even if usage metadata refresh fails.
  });
}

export function revalidateWorkspacePaths(paths: string[]) {
  for (const path of Array.from(new Set(paths))) {
    revalidatePath(path);
  }
}
