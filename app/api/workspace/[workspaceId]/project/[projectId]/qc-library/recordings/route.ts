import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  listProjectQcRecordings,
  projectQcRecordingWriteSchema,
  registerProjectQcAssetInMetadata,
  writeProjectQcRecording
} from "@/lib/workspace/project-qc-library";
import { resolveLocalRuntimeStorageStatusCode } from "@/lib/runtime/local-runtime-storage";
import { requireProjectQcRouteContext } from "../route-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProjectQcRecordingRouteProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
};

export async function GET(_: Request, { params }: ProjectQcRecordingRouteProps) {
  const access = await requireProjectQcRouteContext({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    message: "Sign in before reading QC recordings."
  });

  if (!access.ok) {
    return access.response;
  }

  const recordings = await listProjectQcRecordings({
    workspaceId: params.workspaceId,
    projectId: params.projectId
  });

  return NextResponse.json({
    recordings
  });
}

export async function POST(request: Request, { params }: ProjectQcRecordingRouteProps) {
  const access = await requireProjectQcRouteContext({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    message: "Sign in before writing QC recordings.",
    requireOwner: true
  });

  if (!access.ok) {
    return access.response;
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = projectQcRecordingWriteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid QC recording payload.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const { recording, asset } = await writeProjectQcRecording({
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      input: parsed.data
    });

    const metadataRegistration = await registerProjectQcAssetInMetadata({
      supabase: access.context.supabase,
      userId: access.context.user.id,
      workspaceId: params.workspaceId,
      asset
    });

    revalidatePath(`/workspace/${params.workspaceId}/project/${params.projectId}`);
    revalidatePath(`/workspace/${params.workspaceId}/project/${params.projectId}/library`);

    return NextResponse.json(
      {
        recording,
        asset,
        metadataRegistration
      },
      { status: parsed.data.id ? 200 : 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to write the QC recording."
      },
      { status: resolveLocalRuntimeStorageStatusCode(error, 400) }
    );
  }
}
