export type ProjectPortalRoomId =
  | "strategy-room"
  | "project-workspace"
  | "command-center"
  | "build-room";

export type ProjectPortalRouteSummary = {
  workspaceRoute: string;
  libraryRoute?: string;
  strategyRoomRoute: string;
  commandCenterRoute: string;
  buildRoomRoute: string;
};

export const projectPortalRoomRegistry: Record<
  ProjectPortalRoomId,
  {
    label: string;
    summary: string;
    restricted?: boolean;
  }
> = {
  "strategy-room": {
    label: "Strategy Room",
    summary: "Define and revise what should be built."
  },
  "project-workspace": {
    label: "Project Workspace",
    summary: "Review the approved roadmap, phases, and next step."
  },
  "command-center": {
    label: "Command Center",
    summary: "See how the approved plan translates into execution."
  },
  "build-room": {
    label: "Build Room",
    summary: "Protected live build environment.",
    restricted: true
  }
};

export function buildProjectWorkspaceRoute(workspaceId: string) {
  return `/workspace/${workspaceId}`;
}

export function buildProjectLibraryRoute(workspaceId: string) {
  return `/workspace/${workspaceId}/library`;
}

export function buildProjectStrategyRoomRoute(workspaceId: string) {
  return `/workspace/${workspaceId}/strategy-room`;
}

export function buildProjectCommandCenterRoute(workspaceId: string) {
  return `/workspace/${workspaceId}/command-center`;
}

export function buildProjectBuildRoomRoute(workspaceId: string) {
  return `/workspace/${workspaceId}/build-room`;
}

const projectPortalRouteBuilders: Record<
  ProjectPortalRoomId,
  (workspaceId: string) => string
> = {
  "strategy-room": buildProjectStrategyRoomRoute,
  "project-workspace": buildProjectWorkspaceRoute,
  "command-center": buildProjectCommandCenterRoute,
  "build-room": buildProjectBuildRoomRoute
};

export function buildProjectRoomRoute(
  workspaceId: string,
  roomId: ProjectPortalRoomId
) {
  return projectPortalRouteBuilders[roomId](workspaceId);
}

export function resolveProjectPortalHref(
  project: ProjectPortalRouteSummary,
  roomId: ProjectPortalRoomId
) {
  if (roomId === "project-workspace") {
    return project.workspaceRoute;
  }

  if (roomId === "strategy-room") {
    return project.strategyRoomRoute;
  }

  if (roomId === "command-center") {
    return project.commandCenterRoute;
  }

  return project.buildRoomRoute;
}

export function resolveProjectRoomFromPathname(pathname: string): ProjectPortalRoomId {
  const segments = pathname.split("/").filter(Boolean);
  const roomSegment = segments[2] ?? null;

  if (roomSegment === "strategy-room") {
    return "strategy-room";
  }

  if (roomSegment === "command-center") {
    return "command-center";
  }

  if (roomSegment === "build-room") {
    return "build-room";
  }

  return "project-workspace";
}
