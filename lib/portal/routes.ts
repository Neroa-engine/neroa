export type ProjectPortalRoomId =
  | "strategy-room"
  | "project-workspace"
  | "command-center"
  | "build-room";

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
