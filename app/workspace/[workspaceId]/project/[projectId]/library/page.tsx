import { unstable_noStore as noStore } from "next/cache";
import { WorkspaceProjectLibraryPage } from "@/components/workspace/workspace-project-library-page";

type ProjectLibraryRouteProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
};

export default function ProjectLibraryRoute({ params }: ProjectLibraryRouteProps) {
  noStore();

  return (
    <WorkspaceProjectLibraryPage
      workspaceId={params.workspaceId}
      projectId={params.projectId}
    />
  );
}
