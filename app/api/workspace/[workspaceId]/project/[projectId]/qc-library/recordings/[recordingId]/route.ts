import { NextResponse } from "next/server";
import { listProjectQcRecordings } from "@/lib/workspace/project-qc-library";
import { requireProjectQcRouteContext } from "../../route-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProjectQcRecordingDetailRouteProps = {
  params: {
    workspaceId: string;
    projectId: string;
    recordingId: string;
  };
};

export async function GET(_: Request, { params }: ProjectQcRecordingDetailRouteProps) {
  const access = await requireProjectQcRouteContext({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    message: "Sign in before reading QC recordings."
  });

  if (!access.ok) {
    return access.response;
  }

  const recording = (
    await listProjectQcRecordings({
      workspaceId: params.workspaceId,
      projectId: params.projectId
    })
  ).find((item) => item.id === params.recordingId);

  if (!recording) {
    return NextResponse.json({ error: "QC recording not found." }, { status: 404 });
  }

  return NextResponse.json({
    recording
  });
}
