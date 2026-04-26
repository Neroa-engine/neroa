import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  buildBuildRoomApiErrorResponse,
  buildBuildRoomApiSuccess,
  revalidateBuildRoomPaths
} from "@/lib/build-room/http";
import { approveBuildRoomTaskForWorker } from "@/lib/build-room/service";

type BuildRoomApproveRouteProps = {
  params: {
    taskId: string;
  };
};

export async function POST(_: NextRequest, { params }: BuildRoomApproveRouteProps) {
  const auth = await requireApiUser({
    message: "Sign in before approving a Build Room worker run."
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const detail = await approveBuildRoomTaskForWorker({
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
