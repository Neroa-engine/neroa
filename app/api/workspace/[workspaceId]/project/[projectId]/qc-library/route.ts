import { NextResponse } from "next/server";
import { getProjectQcLibrarySnapshot } from "@/lib/workspace/project-qc-library";
import { requireProjectQcRouteContext } from "./route-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProjectQcLibraryRouteProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
};

export async function GET(_: Request, { params }: ProjectQcLibraryRouteProps) {
  const access = await requireProjectQcRouteContext({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    message: "Sign in before reading QC assets."
  });

  if (!access.ok) {
    return access.response;
  }

  const snapshot = await getProjectQcLibrarySnapshot({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    projectMetadata: access.context.projectMetadata
  });

  return NextResponse.json(snapshot);
}
