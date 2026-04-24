import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  linkLiveViewQcArtifacts,
  liveViewQcLinkMutationSchema
} from "@/lib/live-view/qc-library-bridge";
import { resolveLocalRuntimeStorageStatusCode } from "@/lib/runtime/local-runtime-storage";
import { requireLiveViewQcRouteSession } from "../route-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const access = await requireLiveViewQcRouteSession(request);

  if (!access.ok) {
    return access.response;
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const parsed = liveViewQcLinkMutationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid QC asset linkage payload.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const result = await linkLiveViewQcArtifacts({
      session: access.session,
      reportId: parsed.data.reportId,
      recordingId: parsed.data.recordingId
    });

    revalidatePath(`/workspace/${access.session.workspaceId}/project/${access.session.projectId}`);
    revalidatePath(
      `/workspace/${access.session.workspaceId}/project/${access.session.projectId}/library`
    );

    return NextResponse.json({
      report: result.report,
      recording: result.recording,
      metadataRegistration: result.metadataRegistration
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to link the Live View QC artifacts."
      },
      { status: resolveLocalRuntimeStorageStatusCode(error, 400) }
    );
  }
}
