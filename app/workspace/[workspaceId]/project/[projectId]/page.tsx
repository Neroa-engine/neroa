import { redirect } from "next/navigation";
import { buildProjectWorkspaceRoute } from "@/lib/portal/routes";

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

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCanonicalWorkspaceRedirect(workspaceId: string, error: string | null) {
  const canonicalRoute = buildProjectWorkspaceRoute(workspaceId);

  if (!error) {
    return canonicalRoute;
  }

  return `${canonicalRoute}?error=${encodeURIComponent(error)}`;
}

export default function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const error =
    firstValue(searchParams?.error) ??
    (params.projectId !== params.workspaceId
      ? "This legacy project route has been retired. Continue in the canonical active project portal."
      : null);

  redirect(buildCanonicalWorkspaceRedirect(params.workspaceId, error));
}
