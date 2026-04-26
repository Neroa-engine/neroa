import type { ReactNode } from "react";
import Link from "next/link";
import { NeroaAtmosphere } from "@/components/layout/neroa-atmosphere";
import { Logo } from "@/components/logo";
import { ActiveProjectSelectControl } from "@/components/portal/active-project-select-control";
import { PublicAccountMenu } from "@/components/site/public-account-menu";
import { APP_ROUTES } from "@/lib/routes";
import {
  buildProjectRoomRoute,
  projectPortalRoomRegistry,
  type ProjectPortalRoomId
} from "@/lib/portal/routes";
import {
  listSelectablePortalProjects,
  type PortalProjectSummary
} from "@/lib/portal/server";

type OuterPortalShellProps = {
  currentPath: string;
  userEmail?: string;
  activeProject?: PortalProjectSummary | null;
  availableProjects?: PortalProjectSummary[];
  showActiveProjectPanel?: boolean;
  showActiveProjectChip?: boolean;
  children: ReactNode;
};

type ActiveProjectPortalShellProps = {
  currentRoom: ProjectPortalRoomId;
  userEmail?: string;
  activeProject: PortalProjectSummary;
  availableProjects: PortalProjectSummary[];
  children: ReactNode;
};

function outerPortalNavState(currentPath: string, href: string) {
  if (href === APP_ROUTES.projects) {
    return (
      currentPath === APP_ROUTES.projects ||
      currentPath === APP_ROUTES.projectsResume ||
      currentPath === APP_ROUTES.projectsNew ||
      currentPath === APP_ROUTES.dashboard ||
      currentPath.startsWith(`${APP_ROUTES.projects}/`)
    );
  }

  if (href === APP_ROUTES.billing) {
    return currentPath.startsWith(APP_ROUTES.billing) || currentPath.startsWith(APP_ROUTES.usage);
  }

  return currentPath.startsWith(APP_ROUTES.settings) || currentPath.startsWith(APP_ROUTES.profile);
}

function OuterPortalNav({ currentPath }: { currentPath: string }) {
  const items = [
    {
      href: APP_ROUTES.projects,
      label: "Projects",
      summary: "Portfolio, recent work, and project selection"
    },
    {
      href: APP_ROUTES.billing,
      label: "Billing / Usage",
      summary: "Plans, credits, limits, and account capacity"
    },
    {
      href: APP_ROUTES.settings,
      label: "Settings",
      summary: "Account, team, notifications, and preferences"
    }
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-[24px] border border-[rgba(118,179,232,0.18)] bg-[linear-gradient(180deg,rgba(9,16,28,0.94),rgba(6,11,20,0.9))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Outer Portal
        </p>
        <p className="mt-3 text-sm leading-7 text-[rgba(205,218,236,0.78)]">
          Portfolio, billing, and account controls stay here, separate from the rooms of one active
          project.
        </p>
      </div>

      {items.map((item) => {
        const active = outerPortalNavState(currentPath, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-[24px] border px-4 py-4 transition ${
              active
                ? "border-[rgba(159,214,255,0.24)] bg-[linear-gradient(135deg,rgba(16,28,46,0.98),rgba(10,17,29,0.94))] text-white shadow-[0_22px_48px_rgba(0,0,0,0.28)]"
                : "border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.88)] text-[rgba(233,241,252,0.86)] hover:border-[rgba(150,229,255,0.24)] hover:bg-[rgba(10,19,33,0.94)]"
            }`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p
              className={`mt-1 text-xs leading-6 ${
                active ? "text-[rgba(214,226,241,0.78)]" : "text-[rgba(180,196,218,0.72)]"
              }`}
            >
              {item.summary}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

function ActiveProjectSelector({
  projects,
  activeWorkspaceId,
  destination,
  returnTo,
  label = "Active project",
  roomId,
  presentation = "stacked"
}: {
  projects: PortalProjectSummary[];
  activeWorkspaceId?: string | null;
  destination: string;
  returnTo: string;
  label?: string;
  roomId?: ProjectPortalRoomId;
  presentation?: "stacked" | "inline";
}) {
  return (
    <ActiveProjectSelectControl
      projects={projects}
      activeWorkspaceId={activeWorkspaceId}
      destination={destination}
      returnTo={returnTo}
      label={label}
      roomId={roomId}
      presentation={presentation}
    />
  );
}

function OuterPortalActiveProject({
  activeProject,
  availableProjects = []
}: {
  activeProject?: PortalProjectSummary | null;
  availableProjects?: PortalProjectSummary[];
}) {
  const selectableProjects = listSelectablePortalProjects(availableProjects);

  if (!activeProject && selectableProjects.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-[rgba(118,179,232,0.18)] bg-[linear-gradient(180deg,rgba(9,16,28,0.94),rgba(6,11,20,0.9))] px-4 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(180,196,218,0.72)]">
          Active Project
        </p>
        <p className="mt-3 text-sm leading-7 text-[rgba(205,218,236,0.78)]">
          No project is active yet. Start planning here and Neroa will open the next project from
          Strategy Room.
        </p>
        <Link href={APP_ROUTES.projectsNew} className="button-secondary mt-4 w-full justify-center">
          Start New Project
        </Link>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="rounded-[28px] border border-[rgba(118,179,232,0.18)] bg-[linear-gradient(180deg,rgba(9,16,28,0.96),rgba(6,11,20,0.92))] px-4 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Active Project
        </p>
        <p className="mt-3 text-lg font-semibold text-[rgba(248,250,255,0.98)]">
          Choose a project context
        </p>
        <p className="mt-3 text-sm leading-7 text-[rgba(205,218,236,0.78)]">
          Pick which project should stay active across the signed-in portal.
        </p>
        <ActiveProjectSelector
          projects={selectableProjects}
          destination={APP_ROUTES.projectsResume}
          returnTo={APP_ROUTES.projects}
        />
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-[rgba(118,179,232,0.18)] bg-[linear-gradient(180deg,rgba(9,16,28,0.96),rgba(6,11,20,0.92))] px-4 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
        Active Project
      </p>
      <p className="mt-3 text-lg font-semibold text-[rgba(248,250,255,0.98)]">
        {activeProject.title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
          {activeProject.phaseLabel}
        </span>
        <span className="rounded-full border border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.88)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(180,196,218,0.72)]">
          {activeProject.statusLabel}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[rgba(205,218,236,0.78)]">
        This project stays active across Projects, Billing, Usage, and account surfaces until you
        switch it.
      </p>
      <ActiveProjectSelector
        projects={selectableProjects}
        activeWorkspaceId={activeProject.workspaceId}
        destination={APP_ROUTES.projectsResume}
        returnTo={APP_ROUTES.projects}
      />
    </div>
  );
}

function ProjectSwitchControl({
  activeProject,
  currentRoom,
  availableProjects
}: {
  activeProject: PortalProjectSummary;
  currentRoom: ProjectPortalRoomId;
  availableProjects: PortalProjectSummary[];
}) {
  const switchableProjects = listSelectablePortalProjects(availableProjects);

  if (switchableProjects.length <= 1) {
    return null;
  }

  return (
    <ActiveProjectSelector
      projects={switchableProjects}
      activeWorkspaceId={activeProject.workspaceId}
      destination={buildProjectRoomRoute(activeProject.workspaceId, currentRoom)}
      returnTo={buildProjectRoomRoute(activeProject.workspaceId, currentRoom)}
      label="Project"
      roomId={currentRoom}
      presentation="inline"
    />
  );
}

function ProjectRoomNav({
  activeProject,
  currentRoom,
  className = "mt-5"
}: {
  activeProject: PortalProjectSummary;
  currentRoom: ProjectPortalRoomId;
  className?: string;
}) {
  return (
    <div className={`${className} pointer-events-auto relative z-10 flex flex-wrap gap-2`}>
      {(Object.keys(projectPortalRoomRegistry) as ProjectPortalRoomId[]).map((roomId) => {
        const item = projectPortalRoomRegistry[roomId];
        const active = roomId === currentRoom;

        return (
          <Link
            key={roomId}
            href={buildProjectRoomRoute(activeProject.workspaceId, roomId)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-[rgba(159,214,255,0.24)] bg-[linear-gradient(135deg,rgba(16,28,46,0.98),rgba(10,17,29,0.94))] text-white shadow-[0_20px_42px_rgba(0,0,0,0.28)]"
                : "border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.86)] text-[rgba(221,232,246,0.78)] hover:border-[rgba(150,229,255,0.24)] hover:bg-[rgba(10,19,33,0.94)] hover:text-white"
            }`}
          >
            <span>{item.label}</span>
            {item.restricted ? (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                active
                  ? "bg-white/16 text-white"
                  : "bg-[rgba(9,16,28,0.88)] text-[rgba(180,196,218,0.72)]"
              }`}>
                Locked
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export function OuterPortalShell({
  currentPath,
  userEmail,
  activeProject,
  availableProjects = [],
  showActiveProjectPanel = true,
  showActiveProjectChip = true,
  children
}: OuterPortalShellProps) {
  return (
    <main className="front-door-theme relative isolate min-h-screen overflow-x-hidden pb-16">
      <NeroaAtmosphere />
      <header className="pointer-events-none relative z-[200] mx-auto w-full max-w-[1880px] px-4 pb-0 pt-4 sm:px-6 xl:px-8">
        <div className="neroa-header-row">
          <Link
            href={APP_ROUTES.projects}
            className="neroa-brand-link pointer-events-auto relative z-10"
            aria-label="NEROA projects"
          >
            <Logo tone="dark" presentation="header" />
          </Link>

          <div className="floating-nav neroa-nav-pane pointer-events-auto relative z-10 flex flex-wrap items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5 lg:px-6">
            <div className="relative z-10 flex-wrap items-center gap-3 hidden lg:flex">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Outer Portal
              </span>
              {showActiveProjectChip && activeProject ? (
                <Link
                  href={activeProject.workspaceRoute}
                  className="rounded-full border border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.88)] px-4 py-2 text-sm font-medium text-[rgba(221,232,246,0.78)] transition hover:border-[rgba(150,229,255,0.24)] hover:text-white"
                >
                  Active Project: {activeProject.title}
                </Link>
              ) : null}
            </div>

            <div className="pointer-events-auto relative z-10 flex flex-wrap items-center gap-2">
              <Link href={APP_ROUTES.home} className="button-quiet px-4 py-3 text-sm">
                Home
              </Link>
              <Link href={APP_ROUTES.projectsNew} className="button-primary text-sm">
                New Project
              </Link>
              <Link href={APP_ROUTES.projectsResume} className="button-secondary text-sm">
                Resume Project
              </Link>
              <PublicAccountMenu initialEmail={userEmail} tone="dark" />
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-0 mx-auto w-full max-w-[1880px] px-4 py-4 sm:px-6 xl:px-8">
        <div
          className={`grid gap-6 ${
            showActiveProjectPanel ? "xl:grid-cols-[300px_minmax(0,1fr)]" : "xl:grid-cols-[240px_minmax(0,1fr)]"
          }`}
        >
          <aside className="relative z-10 space-y-4 xl:sticky xl:top-24 xl:self-start">
            <OuterPortalNav currentPath={currentPath} />
            {showActiveProjectPanel ? (
              <OuterPortalActiveProject
                activeProject={activeProject}
                availableProjects={availableProjects}
              />
            ) : null}
          </aside>
          <div className="space-y-6">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function ActiveProjectPortalShell({
  currentRoom,
  userEmail,
  activeProject,
  availableProjects,
  children
}: ActiveProjectPortalShellProps) {
  const isCommandCenter = currentRoom === "command-center";
  const projectOptions = availableProjects.some(
    (project) => project.workspaceId === activeProject.workspaceId
  )
    ? availableProjects
    : [activeProject, ...availableProjects];

  return (
    <main className="front-door-theme relative isolate min-h-screen overflow-x-hidden pb-16">
      <NeroaAtmosphere />
      <header className="pointer-events-none relative z-[200] mx-auto w-full max-w-[1880px] px-4 pb-0 pt-4 sm:px-6 xl:px-8">
        <div className="neroa-header-row">
          <Link
            href={APP_ROUTES.projects}
            className="neroa-brand-link pointer-events-auto relative z-10"
            aria-label="NEROA projects"
          >
            <Logo tone="dark" presentation="header" />
          </Link>

          <div className="floating-nav neroa-nav-pane pointer-events-auto relative z-10 rounded-[30px] px-4 py-4 sm:px-5 lg:px-6">
            <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Active Project Portal
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[rgba(205,218,236,0.78)]">
                  <span className="font-semibold text-[rgba(248,250,255,0.98)]">
                    Project: {activeProject.title}
                  </span>
                  <span className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                    Phase {activeProject.phaseLabel}
                  </span>
                  <span className="rounded-full border border-[rgba(118,179,232,0.16)] bg-[rgba(8,15,27,0.88)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(180,196,218,0.72)]">
                    {activeProject.statusLabel}
                  </span>
                  {userEmail ? (
                    <span className="text-xs text-[rgba(180,196,218,0.72)]">{userEmail}</span>
                  ) : null}
                </div>
                <p className="max-w-3xl text-sm leading-7 text-[rgba(205,218,236,0.78)]">
                  {activeProject.description ??
                    "This project now has its own operating rooms so strategy, planning, execution review, and protected build access stay in the right place."}
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-2 xl:items-end">
                <div className="pointer-events-auto relative z-10 flex flex-wrap items-center gap-2">
                  <Link href={APP_ROUTES.home} className="button-quiet px-4 py-3 text-sm">
                    Home
                  </Link>
                  <Link href={APP_ROUTES.projects} className="button-quiet px-4 py-3 text-sm">
                    Projects
                  </Link>
                  <ProjectSwitchControl
                    activeProject={activeProject}
                    currentRoom={currentRoom}
                    availableProjects={projectOptions}
                  />
                  <PublicAccountMenu initialEmail={userEmail} tone="dark" />
                </div>

                {isCommandCenter ? (
                  <div className="pointer-events-auto relative z-10 flex flex-wrap items-center gap-2 xl:justify-end">
                    <Link
                      href={buildProjectRoomRoute(activeProject.workspaceId, "build-room")}
                      className="button-secondary text-sm"
                    >
                      Review Build Room Gate
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="relative z-10 mt-4 border-t border-[rgba(118,179,232,0.14)] pt-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <ProjectRoomNav
                  activeProject={activeProject}
                  currentRoom={currentRoom}
                  className="mt-0"
                />

                {isCommandCenter ? (
                  <div className="xl:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-700">
                      Operator room
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[rgba(248,250,255,0.98)]">
                      Command Center for live operator work.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-0 mx-auto w-full max-w-[1880px] px-4 py-4 sm:px-6 xl:px-8">
        {children}
      </section>
    </main>
  );
}
