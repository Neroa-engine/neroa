import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { buildRoomTaskPatchSchema } from "@/lib/build-room/contracts";
import {
  buildBuildRoomApiErrorResponse,
  buildBuildRoomApiSuccess,
  revalidateBuildRoomPaths
} from "@/lib/build-room/http";
import { loadBuildRoomTaskDetailOrThrow, updateBuildRoomTask } from "@/lib/build-room/service";

type BuildRoomTaskRouteProps = {
  params: {
    taskId: string;
  };
};

export async function GET(_: NextRequest, { params }: BuildRoomTaskRouteProps) {
  const auth = await requireApiUser({
    message: "Sign in before loading this Build Room task."
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const detail = await loadBuildRoomTaskDetailOrThrow({
      supabase: auth.supabase,
      taskId: params.taskId
    });

    return buildBuildRoomApiSuccess({
      detail
    });
  } catch (error) {
    return buildBuildRoomApiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: BuildRoomTaskRouteProps) {
  const auth = await requireApiUser({
    message: "Sign in before updating a Build Room task."
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const patch = buildRoomTaskPatchSchema.parse(await request.json());
    const detail = await updateBuildRoomTask({
      supabase: auth.supabase,
      userId: auth.user.id,
      taskId: params.taskId,
      patch
    });

    revalidateBuildRoomPaths(detail.task.workspaceId);

    return buildBuildRoomApiSuccess({
      detail
    });
  } catch (error) {
    return buildBuildRoomApiErrorResponse(error);
  }
}
