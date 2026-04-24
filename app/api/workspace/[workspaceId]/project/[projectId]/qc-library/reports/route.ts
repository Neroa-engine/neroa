import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  listProjectQcReports,
  projectQcReportWriteSchema,
  registerProjectQcAssetInMetadata,
  writeProjectQcReport
} from "@/lib/workspace/project-qc-library";
import { requireProjectQcRouteContext } from "../route-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProjectQcReportRouteProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
};

export async function GET(_: Request, { params }: ProjectQcReportRouteProps) {
  const access = await requireProjectQcRouteContext({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    message: "Sign in before reading QC reports."
  });

  if (!access.ok) {
    return access.response;
  }

  const reports = await listProjectQcReports({
    workspaceId: params.workspaceId,
    projectId: params.projectId
  });

  return NextResponse.json({
    reports
  });
}

export async function POST(request: Request, { params }: ProjectQcReportRouteProps) {
  const access = await requireProjectQcRouteContext({
    workspaceId: params.workspaceId,
    projectId: params.projectId,
    message: "Sign in before writing QC reports.",
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

  const parsed = projectQcReportWriteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid QC report payload.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const { report, asset } = await writeProjectQcReport({
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
      report,
      asset,
      metadataRegistration
    },
    { status: parsed.data.id ? 200 : 201 }
  );
}
