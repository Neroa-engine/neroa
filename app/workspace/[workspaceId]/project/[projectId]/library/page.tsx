import { redirect } from "next/navigation";
import { buildProjectLibraryRoute } from "@/lib/portal/routes";

type ProjectLibraryRouteProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
};

export default function ProjectLibraryRoute({ params }: ProjectLibraryRouteProps) {
  redirect(buildProjectLibraryRoute(params.workspaceId));
}
