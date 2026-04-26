import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { buildRoomTaskInputSchema } from "@/lib/build-room/contracts";
import {
  buildBuildRoomApiErrorResponse,
  buildBuildRoomApiSuccess,
  revalidateBuildRoomPaths
} from "@/lib/build-room/http";
import { listBuildRoomTasks } from "@/lib/build-room/data";
import { loadBuildRoomProjectContext } from "@/lib/build-room/project-context";
import { createBuildRoomTask } from "@/lib/build-room/service";

const buildRoomTaskListQuerySchema = z.object({
  workspaceId: z.string().uuid(),
  projectId: z.string().min(1)
});

export async function GET(request: NextRequest) {
  const auth = await requireApiUser({
    message: "Sign in before loading Build Room tasks."
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const query = buildRoomTaskListQuerySchema.parse({
      workspaceId: request.nextUrl.searchParams.get("workspaceId"),
      projectId: request.nextUrl.searchParams.get("projectId")
    });

    await loadBuildRoomProjectContext({
      supabase: auth.supabase,
      userId: auth.user.id,
      workspaceId: query.workspaceId,
      projectId: query.projectId
    });

    const tasks = await listBuildRoomTasks({
      supabase: auth.supabase,
      workspaceId: query.workspaceId,
      projectId: query.projectId
    });

    return buildBuildRoomApiSuccess({
      tasks
    });
  } catch (error) {
    return buildBuildRoomApiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser({
    message: "Sign in before creating a Build Room task."
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const input = buildRoomTaskInputSchema.parse(await request.json());
    const detail = await createBuildRoomTask({
      supabase: auth.supabase,
      userId: auth.user.id,
      taskInput: input
    });

    revalidateBuildRoomPaths(detail.task.workspaceId);

    return buildBuildRoomApiSuccess({
      detail
    });
  } catch (error) {
    return buildBuildRoomApiErrorResponse(error);
  }
}
