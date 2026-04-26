import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  buildBuildRoomApiErrorResponse,
  buildBuildRoomApiSuccess,
  revalidateBuildRoomPaths
} from "@/lib/build-room/http";
import { submitBuildRoomTaskToCodex } from "@/lib/build-room/service";

type BuildRoomSubmitRouteProps = {
  params: {
    taskId: string;
  };
};

export async function POST(_: NextRequest, { params }: BuildRoomSubmitRouteProps) {
  const auth = await requireApiUser({
    message: "Sign in before sending a task to the Build Room Codex relay."
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const detail = await submitBuildRoomTaskToCodex({
      supabase: auth.supabase,
      userId: auth.user.id,
      taskId: params.taskId
    });

    revalidateBuildRoomPaths(detail.task.workspaceId);

    return buildBuildRoomApiSuccess({
      detail
    });
  } catch (error) {
    return buildBuildRoomApiErrorResponse(error);
  }
}
