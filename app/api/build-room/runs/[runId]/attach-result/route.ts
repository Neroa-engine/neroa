import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { buildRoomWorkerResultAttachSchema } from "@/lib/build-room/contracts";
import {
  buildBuildRoomApiErrorResponse,
  buildBuildRoomApiSuccess,
  revalidateBuildRoomPaths
} from "@/lib/build-room/http";
import { attachBuildRoomWorkerRunResult } from "@/lib/build-room/service";
import { createSupabaseAdminClient, hasSupabaseAdminClientConfig } from "@/lib/supabase/admin";

type BuildRoomAttachResultRouteProps = {
  params: {
    runId: string;
  };
};

function hasValidWorkerCallbackSecret(request: NextRequest) {
  const secret = process.env.BUILD_ROOM_WORKER_CALLBACK_SECRET?.trim();

  if (!secret) {
    return false;
  }

  return request.headers.get("x-build-room-worker-callback-secret") === secret;
}

export async function POST(request: NextRequest, { params }: BuildRoomAttachResultRouteProps) {
  try {
    const result = buildRoomWorkerResultAttachSchema.parse(await request.json());

    if (hasValidWorkerCallbackSecret(request)) {
      if (!hasSupabaseAdminClientConfig()) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "SUPABASE_SERVICE_ROLE_KEY is required before worker callbacks can write Build Room results."
          },
          {
            status: 503
          }
        );
      }

      const detail = await attachBuildRoomWorkerRunResult({
        supabase: createSupabaseAdminClient(),
        runId: params.runId,
        result,
        actorUserId: null
      });

      revalidateBuildRoomPaths(detail.task.workspaceId);

      return buildBuildRoomApiSuccess({
        detail
      });
    }

    const auth = await requireApiUser({
      message: "Sign in before attaching a Build Room worker result."
    });

    if (!auth.ok) {
      return auth.response;
    }

    const detail = await attachBuildRoomWorkerRunResult({
      supabase: auth.supabase,
      runId: params.runId,
      result,
      actorUserId: auth.user.id
    });

    revalidateBuildRoomPaths(detail.task.workspaceId);

    return buildBuildRoomApiSuccess({
      detail
    });
  } catch (error) {
    return buildBuildRoomApiErrorResponse(error);
  }
}
