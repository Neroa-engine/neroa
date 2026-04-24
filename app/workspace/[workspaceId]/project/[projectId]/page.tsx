import { WorkspaceProjectPage } from "@/components/workspace/workspace-project-page";

type ProjectPageProps = {
  params: {
    workspaceId: string;
    projectId: string;
  };
  searchParams?: {
    error?: string | string[];
    lane?: string | string[];
    supporting?: string | string[];
  };
};

export default function ProjectPage({ params, searchParams }: ProjectPageProps) {
  return (
    <WorkspaceProjectPage
      workspaceId={params.workspaceId}
      projectId={params.projectId}
      searchParams={searchParams}
    />
  );
}
