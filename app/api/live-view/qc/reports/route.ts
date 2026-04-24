import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  liveViewQcReportMutationSchema,
  writeLiveViewQcReport
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

  const parsed = liveViewQcReportMutationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid Live View QC report payload.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const result = await writeLiveViewQcReport({
      session: access.session,
      input: parsed.data
    });

    revalidatePath(`/workspace/${access.session.workspaceId}/project/${access.session.projectId}`);
    revalidatePath(
      `/workspace/${access.session.workspaceId}/project/${access.session.projectId}/library`
    );

    return NextResponse.json(
      {
        report: result.report,
        asset: result.asset,
        metadataRegistration: result.metadataRegistration
      },
      { status: parsed.data.id ? 200 : 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to write the Live View QC report."
      },
      { status: resolveLocalRuntimeStorageStatusCode(error, 400) }
    );
  }
}
