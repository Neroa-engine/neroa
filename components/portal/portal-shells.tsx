import type { ReactNode } from "react";
import Link from "next/link";
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

function PortalAtmosphere() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_54%)]" />
      <div className="pointer-events-none absolute left-[-9rem] top-[10rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_62%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-9rem] top-[20rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.10),transparent_60%)] blur-3xl" />
    </>
  );
}

function outerPortalNavState(currentPath: string, href: string) {
  if (href === APP_ROUTES.projects) {
    return (
      currentPath === APP_ROUTES.projects ||
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
      <div className="rounded-[24px] border border-slate-200/75 bg-white/84 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Outer Portal
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
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
                ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
                : "border-slate-200/70 bg-white/86 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/70"
            }`}
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className={`mt-1 text-xs leading-6 ${active ? "text-slate-200" : "text-slate-500"}`}>
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
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/72 px-4 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Active Project
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
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
      <div className="rounded-[28px] border border-cyan-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(236,254,255,0.84))] px-4 py-5 shadow-[0_20px_50px_rgba(34,211,238,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Active Project
        </p>
        <p className="mt-3 text-lg font-semibold text-slate-950">Choose a project context</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Pick which project should stay active across the signed-in portal.
        </p>
        <ActiveProjectSelector
          projects={selectableProjects}
          destination={APP_ROUTES.dashboard}
          returnTo={APP_ROUTES.projects}
        />
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-cyan-200/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(236,254,255,0.84))] px-4 py-5 shadow-[0_20px_50px_rgba(34,211,238,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
        Active Project
      </p>
      <p className="mt-3 text-lg font-semibold text-slate-950">{activeProject.title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
          {activeProject.phaseLabel}
        </span>
        <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {activeProject.statusLabel}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        This project stays active across Projects, Billing, Usage, and account surfaces until you
        switch it.
      </p>
      <ActiveProjectSelector
        projects={selectableProjects}
        activeWorkspaceId={activeProject.workspaceId}
        destination={APP_ROUTES.dashboard}
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
    <div className={`${className} flex flex-wrap gap-2`}>
      {(Object.keys(projectPortalRoomRegistry) as ProjectPortalRoomId[]).map((roomId) => {
        const item = projectPortalRoomRegistry[roomId];
        const active = roomId === currentRoom;

        return (
          <Link
            key={roomId}
            prefetch={false}
            href={buildProjectRoomRoute(activeProject.workspaceId, roomId)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-slate-950 bg-slate-950 text-white shadow-[0_16px_36px_rgba(15,23,42,0.16)]"
                : "border-slate-200/75 bg-white/80 text-slate-600 hover:border-cyan-200 hover:bg-cyan-50/70 hover:text-slate-950"
            }`}
          >
            <span>{item.label}</span>
            {item.restricted ? (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                active ? "bg-white/16 text-white" : "bg-slate-100 text-slate-500"
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
    <main className="relative isolate min-h-screen overflow-x-hidden pb-16 text-slate-900">
      <PortalAtmosphere />
      <header className="relative z-40 mx-auto w-full max-w-[1880px] px-4 pb-0 pt-4 sm:px-6 xl:px-8">
        <div className="floating-nav flex flex-wrap items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5 lg:px-6">
          <Link href={APP_ROUTES.projects} className="relative z-10 flex-shrink-0">
            <Logo />
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Outer Portal
            </span>
            {showActiveProjectChip && activeProject ? (
              <Link
                prefetch={false}
                href={activeProject.workspaceRoute}
                className="rounded-full border border-slate-200 bg-white/82 px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                Active Project: {activeProject.title}
              </Link>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={APP_ROUTES.home} className="button-quiet px-4 py-3 text-sm">
              Home
            </Link>
            <Link href={APP_ROUTES.projectsNew} className="button-primary text-sm">
              New Project
            </Link>
            <Link href={APP_ROUTES.dashboard} className="button-secondary text-sm">
              Resume Project
            </Link>
            <PublicAccountMenu initialEmail={userEmail} />
          </div>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-[1880px] px-4 py-4 sm:px-6 xl:px-8">
        <div
          className={`grid gap-6 ${
            showActiveProjectPanel ? "xl:grid-cols-[300px_minmax(0,1fr)]" : "xl:grid-cols-[240px_minmax(0,1fr)]"
          }`}
        >
          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
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
    <main className="relative isolate min-h-screen overflow-x-hidden pb-16 text-slate-900">
      <PortalAtmosphere />
      <header className="relative z-40 mx-auto w-full max-w-[1880px] px-4 pb-0 pt-4 sm:px-6 xl:px-8">
        <div className="floating-nav rounded-[30px] px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={APP_ROUTES.projects} className="relative z-10 flex-shrink-0">
                  <Logo />
                </Link>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Active Project Portal
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-950">Project: {activeProject.title}</span>
                <span className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Phase {activeProject.phaseLabel}
                </span>
                <span className="rounded-full border border-slate-200 bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {activeProject.statusLabel}
                </span>
                {userEmail ? (
                  <span className="text-xs text-slate-500">{userEmail}</span>
                ) : null}
              </div>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                {activeProject.description ??
                  "This project now has its own operating rooms so strategy, planning, execution review, and protected build access stay in the right place."}
              </p>
            </div>

            <div className="flex flex-col gap-2 xl:items-end">
              <div className="flex flex-wrap items-center gap-2">
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
                <PublicAccountMenu initialEmail={userEmail} />
              </div>

              {isCommandCenter ? (
                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  <Link
                    prefetch={false}
                    href={buildProjectRoomRoute(activeProject.workspaceId, "build-room")}
                    className="button-secondary text-sm"
                  >
                    Review Build Room Gate
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200/70 pt-4">
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
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    Command Center for live operator work.
                  </p>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-[1880px] px-4 py-4 sm:px-6 xl:px-8">
        {children}
      </section>
    </main>
  );
}
