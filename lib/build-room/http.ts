import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isBuildRoomStorageUnavailableError } from "@/lib/build-room/service";

export function buildBuildRoomApiSuccess<T extends Record<string, unknown>>(body: T) {
  return NextResponse.json({
    ok: true,
    ...body
  });
}

export function buildBuildRoomApiErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.issues[0]?.message ?? "Invalid Build Room request."
      },
      {
        status: 400
      }
    );
  }

  if (isBuildRoomStorageUnavailableError(error)) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message
      },
      {
        status: 503
      }
    );
  }

  if (error instanceof Error) {
    const message = error.message || "Unexpected Build Room error.";
    const lowered = message.toLowerCase();
    const status = lowered.includes("not found")
      ? 404
      : lowered.includes("only the workspace owner")
        ? 403
        : lowered.includes("before")
          ? 400
          : 500;

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      {
        status
      }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Unexpected Build Room error."
    },
    {
      status: 500
    }
  );
}

export function revalidateBuildRoomPaths(workspaceId: string) {
  revalidatePath(`/workspace/${workspaceId}`);
  revalidatePath(`/workspace/${workspaceId}/command-center`);
  revalidatePath(`/workspace/${workspaceId}/build-room`);
}
