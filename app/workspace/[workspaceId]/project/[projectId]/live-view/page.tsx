import { headers } from "next/headers";
import Link from "next/link";
import { DashboardBoardShell } from "@/components/layout/page-shells";
import { LiveViewDashboard } from "@/components/live-view/live-view-dashboard";
import {
  buildLiveViewConnectionPayload,
  getOrCreateProjectLiveViewSession,
  listLiveViewSessionsForProject,
  mapLiveViewSessionSummaries
} from "@/lib/live-view/store";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type LiveViewPageProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
};

function resolveRequestOrigin() {
  const headerStore = headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function LiveViewPage({ params }: LiveViewPageProps) {
  const { user, workspace, project } = await getWorkspaceProjectContext(
    params.workspaceId,
    params.projectId
  );
  const bridgeOrigin = resolveRequestOrigin();
  const activeSession = await getOrCreateProjectLiveViewSession({
    workspaceId: workspace.id,
    projectId: project.id,
    projectTitle: project.title,
    bridgeOrigin,
    createdByUserId: user.id,
    createdByEmail: user.email ?? null
  });
  const sessions = await listLiveViewSessionsForProject({
    workspaceId: workspace.id,
    projectId: project.id
  });

  return (
    <DashboardBoardShell
      userEmail={user.email ?? undefined}
      ctaHref={`/workspace/${workspace.id}/project/${project.id}`}
      ctaLabel="Back to project"
    >
      <section className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Live visibility
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {project.title} Live View
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Use the local Neroa Live View extension to inspect live localhost pages, surface
            runtime errors, guardrails, dead paths, and walkthrough blockers in real time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/workspace/${workspace.id}/project/${project.id}`}
            className="button-secondary"
          >
            Return to project
          </Link>
          <a
            href="https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked"
            target="_blank"
            rel="noreferrer"
            className="button-quiet px-4 py-3 text-sm"
          >
            Load unpacked extension
          </a>
        </div>
      </section>

      <LiveViewDashboard
        connection={buildLiveViewConnectionPayload(activeSession)}
        initialActiveSession={activeSession}
        initialSessions={mapLiveViewSessionSummaries(sessions)}
      />
    </DashboardBoardShell>
  );
}
