import { getAccessibleWorkspace } from "@/lib/platform/foundation";
import { buildDescriptionWithMetadata } from "@/app/workspace/workspace-action-helpers";
import {
  createPersistedPlanningThreadState,
  type PlanningThreadState
} from "@/lib/start/planning-thread";
import type { ServerSupabaseClient } from "@/lib/platform/foundation";

export async function persistProjectPlanningThreadState(args: {
  supabase: ServerSupabaseClient;
  userId: string;
  workspaceId: string;
  projectId: string;
  threadState: PlanningThreadState;
}) {
  if (args.projectId !== args.workspaceId) {
    return false;
  }

  const workspace = await getAccessibleWorkspace({
    supabase: args.supabase,
    userId: args.userId,
    workspaceId: args.workspaceId
  });

  if (!workspace) {
    return false;
  }

  const description = buildDescriptionWithMetadata({
    workspace,
    conversationState: args.threadState.conversationState ?? null,
    strategyState: {
      planningThreadState: createPersistedPlanningThreadState(args.threadState)
    }
  });
  const { data, error } = await args.supabase
    .from("workspaces")
    .update({
      description
    })
    .eq("id", args.workspaceId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return true;
}
