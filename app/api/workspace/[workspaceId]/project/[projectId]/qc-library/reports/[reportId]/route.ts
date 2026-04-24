import { NextResponse } from "next/server";
import { listProjectQcReports } from "@/lib/workspace/project-qc-library";
import { requireProjectQcRouteContext } from "../../route-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProjectQcReportDetailRouteProps = {
  params: {
    workspaceId: string;
    projectId: string;
    reportId: string;
  };
};

export async function GET(_: Request, { params }: ProjectQcReportDetailRouteProps) {
  const access = await requireProjectQcRouteContext({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    message: "Sign in before reading QC reports."
  });

  if (!access.ok) {
    return access.response;
  }

  const report = (
    await listProjectQcReports({
      workspaceId: params.workspaceId,
      projectId: params.projectId
    })
  ).find((item) => item.id === params.reportId);

  if (!report) {
    return NextResponse.json({ error: "QC report not found." }, { status: 404 });
  }

  return NextResponse.json({
    report
  });
}
