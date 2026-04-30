import { unstable_noStore as noStore } from "next/cache";
import { WorkspaceProjectLibraryPage } from "@/components/workspace/workspace-project-library-page";

type WorkspaceLibraryRouteProps = {
  params: {
    workspaceId: string;
  };
};

export default function WorkspaceLibraryRoute({ params }: WorkspaceLibraryRouteProps) {
  noStore();

  return <WorkspaceProjectLibraryPage workspaceId={params.workspaceId} />;
}
