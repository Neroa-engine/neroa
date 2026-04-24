import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NeroaAtmosphere } from "@/components/layout/neroa-atmosphere";
import { LiveViewDashboard } from "@/components/live-view/live-view-dashboard";
import { Logo } from "@/components/logo";
import {
  buildLiveViewConnectionPayload,
  getLiveViewSessionByToken,
  getLiveViewSessionById,
  getOrCreateProjectLiveViewSession,
  listLiveViewSessionsForProject,
  mapLiveViewSessionToRuntimeTarget,
  mapLiveViewSessionSummaries
} from "@/lib/live-view/store";
import { isLocalRuntimeStorageEnabled } from "@/lib/runtime/local-runtime-storage";
import { resolveBrowserRuntimeRequestOrigin } from "@/lib/browser-runtime-v2/runtime-target";
import { APP_ROUTES } from "@/lib/routes";
import { getWorkspaceProjectContext } from "@/lib/workspace/server";

type LiveViewPageProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
  searchParams?: {
    sessionId?: string;
    liveViewToken?: string;
  };
};

function renderLiveViewUnsupportedState(args: {
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  workspaceName: string;
  userEmail?: string | null;
}) {
  return (
    <main className="front-door-theme relative isolate min-h-screen overflow-x-hidden pb-16">
      <NeroaAtmosphere />

      <header className="relative z-40 mx-auto w-full max-w-[1880px] px-4 pb-0 pt-4 sm:px-6 xl:px-8">
        <div className="neroa-header-row">
          <Link href={APP_ROUTES.projects} className="neroa-brand-link" aria-label="NEROA projects">
            <Logo tone="dark" presentation="header" />
          </Link>

          <div className="floating-nav neroa-nav-pane flex flex-wrap items-center justify-between gap-4 rounded-[30px] px-4 py-4 sm:px-5 lg:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Live visibility
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {args.projectTitle} Live View
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Browser-bound Live View session storage is disabled in this deployed environment.
                Use localhost or another persistent runtime when you need Live View, inspection,
                walkthrough, recording, or QC artifact capture.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {args.userEmail ? <span className="text-xs text-slate-500">{args.userEmail}</span> : null}
              <Link
                href={`/workspace/${args.workspaceId}/project/${args.projectId}`}
                className="button-secondary"
              >
                Return to project
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-[1880px] px-4 py-4 sm:px-6 xl:px-8">
        <section className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Localhost runtime only
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Neroa keeps `.neroa-live-view`, Browser Runtime V2 output, and local QC storage off
              of serverless filesystems so production deployments do not crash on Vercel.
            </p>
          </div>
        </section>

        <section className="floating-plane overflow-hidden rounded-[34px] p-6 xl:p-7">
          <div className="floating-wash rounded-[34px]" />
          <div className="relative max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Safe production fallback
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Live View is available on localhost, not on this deployment.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {args.workspaceName} can still use Command Center and project planning here, but
              Browser, Inspect, Record, Walkthrough, SOP output, and QC artifact capture now stop
              cleanly instead of attempting local disk writes in production.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/workspace/${args.workspaceId}/project/${args.projectId}`}
                className="button-secondary"
              >
                Return to project
              </Link>
              <Link href={APP_ROUTES.projects} className="button-quiet px-4 py-3 text-sm">
                Open projects
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default async function LiveViewPage({ params, searchParams }: LiveViewPageProps) {
  const requestedSessionId = searchParams?.sessionId?.trim() || null;
  const requestedLaunchToken = searchParams?.liveViewToken?.trim() || null;
  const bridgeOrigin = resolveBrowserRuntimeRequestOrigin(headers());

  if (!isLocalRuntimeStorageEnabled()) {
    const { user, workspace, project } = await getWorkspaceProjectContext(
      params.workspaceId,
      params.projectId
    );

    return renderLiveViewUnsupportedState({
      workspaceId: workspace.id,
      projectId: project.id,
      projectTitle: project.title,
      workspaceName: workspace.name ?? project.title,
      userEmail: user.email ?? null
    });
  }

  const tokenSession =
    requestedSessionId && requestedLaunchToken
      ? await getLiveViewSessionByToken(requestedLaunchToken).then((session) =>
          session &&
          session.id === requestedSessionId &&
          session.workspaceId === params.workspaceId &&
          session.projectId === params.projectId
            ? session
            : null
        )
      : null;

  if (requestedSessionId && requestedLaunchToken && !tokenSession) {
    redirect(
      `/auth?next=${encodeURIComponent(
        `/workspace/${params.workspaceId}/project/${params.projectId}/live-view?sessionId=${requestedSessionId}`
      )}`
    );
  }

  if (tokenSession) {
    const runtimeTargetSession = mapLiveViewSessionToRuntimeTarget(tokenSession, bridgeOrigin);
    const sessions = [runtimeTargetSession];

    return (
      <main className="front-door-theme relative isolate min-h-screen overflow-x-hidden pb-16">
        <NeroaAtmosphere />

        <header className="relative z-40 mx-auto w-full max-w-[1880px] px-4 pb-0 pt-4 sm:px-6 xl:px-8">
          <div className="neroa-header-row">
            <Link href={APP_ROUTES.projects} className="neroa-brand-link" aria-label="NEROA projects">
              <Logo tone="dark" presentation="header" />
            </Link>

            <div className="floating-nav neroa-nav-pane flex flex-wrap items-center justify-between gap-4 rounded-[30px] px-4 py-4 sm:px-5 lg:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Live visibility
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  {tokenSession.projectTitle} Live View
                </h1>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Opened from an authorized Browser launch. Keep this page open while the Live View
                  extension inspects the current runtime target.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-500">Launch-authenticated session</span>
                <Link
                  href={`/workspace/${tokenSession.workspaceId}/project/${tokenSession.projectId}`}
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
            </div>
          </div>
        </header>

        <section className="relative mx-auto w-full max-w-[1880px] px-4 py-4 sm:px-6 xl:px-8">
          <section className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Live session
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                This Browser launch is authorized by the active Neroa live session. Use the local
                Neroa Live View extension to inspect live local, preview, or production app pages,
                surface runtime errors, guardrails, dead paths, and walkthrough blockers in real time.
              </p>
            </div>
          </section>

          <LiveViewDashboard
            connection={buildLiveViewConnectionPayload(runtimeTargetSession)}
            initialActiveSession={runtimeTargetSession}
            initialSessions={mapLiveViewSessionSummaries(sessions)}
          />
        </section>
      </main>
    );
  }

  const { user, workspace, project } = await getWorkspaceProjectContext(
    params.workspaceId,
    params.projectId
  );
  const reusedSession =
    requestedSessionId
      ? await getLiveViewSessionById(requestedSessionId).then((session) =>
          session &&
          session.workspaceId === workspace.id &&
          session.projectId === project.id
            ? session
            : null
        )
      : null;
  const activeSession =
    reusedSession ??
    (await getOrCreateProjectLiveViewSession({
      workspaceId: workspace.id,
      projectId: project.id,
      projectTitle: project.title,
      bridgeOrigin,
      preferredOrigin: bridgeOrigin,
      createdByUserId: user.id,
      createdByEmail: user.email ?? null
    }));
  const sessions = await listLiveViewSessionsForProject({
    workspaceId: workspace.id,
    projectId: project.id,
    preferredOrigin: bridgeOrigin
  });
  const runtimeTargetSession = mapLiveViewSessionToRuntimeTarget(activeSession, bridgeOrigin);
  const runtimeTargetSessions = sessions.map((session) =>
    mapLiveViewSessionToRuntimeTarget(session, bridgeOrigin)
  );

  return (
    <main className="front-door-theme relative isolate min-h-screen overflow-x-hidden pb-16">
      <NeroaAtmosphere />

      <header className="relative z-40 mx-auto w-full max-w-[1880px] px-4 pb-0 pt-4 sm:px-6 xl:px-8">
        <div className="neroa-header-row">
          <Link href={APP_ROUTES.projects} className="neroa-brand-link" aria-label="NEROA projects">
            <Logo tone="dark" presentation="header" />
          </Link>

          <div className="floating-nav neroa-nav-pane flex flex-wrap items-center justify-between gap-4 rounded-[30px] px-4 py-4 sm:px-5 lg:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Live visibility
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {project.title} Live View
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Bound to {workspace.name ?? project.title}. Keep this page open while the Live View
                extension inspects the current runtime target.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user.email ? <span className="text-xs text-slate-500">{user.email}</span> : null}
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
          </div>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-[1880px] px-4 py-4 sm:px-6 xl:px-8">
        <section className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Live session
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Use the local Neroa Live View extension to inspect live local, preview, or
              production pages, surface runtime errors, guardrails, dead paths, and walkthrough
              blockers in real time.
            </p>
          </div>
        </section>

        <LiveViewDashboard
          connection={buildLiveViewConnectionPayload(runtimeTargetSession)}
          initialActiveSession={runtimeTargetSession}
          initialSessions={mapLiveViewSessionSummaries(runtimeTargetSessions)}
        />
      </section>
    </main>
  );
}
