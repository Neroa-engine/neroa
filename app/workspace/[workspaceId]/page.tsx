import { WorkspaceProjectPage } from "@/components/workspace/workspace-project-page";

type WorkspacePageProps = {
  params: {
    workspaceId: string;
  };
  searchParams?: {
    error?: string | string[];
    lane?: string | string[];
    supporting?: string | string[];
  };
};

export default function WorkspacePage({ params, searchParams }: WorkspacePageProps) {
  return (
    <WorkspaceProjectPage
      workspaceId={params.workspaceId}
      projectId={params.workspaceId}
      searchParams={searchParams}
    />
  );
}
