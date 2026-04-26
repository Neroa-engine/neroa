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

function buildCanonicalWorkspaceRedirect(args: {
  workspaceId: string;
  error: string | null;
  lane?: string | null;
  supporting?: string | null;
}) {
  const canonicalRoute = buildProjectWorkspaceRoute(args.workspaceId);
  const params = new URLSearchParams();

  if (args.error) {
    params.set("error", args.error);
  }

  if (args.lane) {
    params.set("lane", args.lane);
  }

  if (args.supporting) {
    params.set("supporting", args.supporting);
  }

  if (params.size === 0) {
    return canonicalRoute;
  }

  return `${canonicalRoute}?${params.toString()}`;
}

export default function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const error =
    firstValue(searchParams?.error) ??
    (params.projectId !== params.workspaceId
      ? "This legacy project route has been retired. Continue in the active project portal."
      : null);

  redirect(
    buildCanonicalWorkspaceRedirect({
      workspaceId: params.workspaceId,
      error,
      lane: firstValue(searchParams?.lane) ?? null,
      supporting: firstValue(searchParams?.supporting) ?? null
    })
  );
}
