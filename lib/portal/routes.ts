export type ProjectPortalRoomId =
  | "strategy-room"
  | "project-workspace"
  | "command-center"
  | "build-room";

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

export function buildProjectRoomRoute(
  workspaceId: string,
  roomId: ProjectPortalRoomId
) {
  if (roomId === "project-workspace") {
    return buildProjectWorkspaceRoute(workspaceId);
  }

  return `/workspace/${workspaceId}/${roomId}`;
}

export function resolveProjectRoomFromPathname(pathname: string): ProjectPortalRoomId {
  if (pathname.includes("/strategy-room")) {
    return "strategy-room";
  }

  if (pathname.includes("/command-center")) {
    return "command-center";
  }

  if (pathname.includes("/build-room")) {
    return "build-room";
  }

  return "project-workspace";
}
