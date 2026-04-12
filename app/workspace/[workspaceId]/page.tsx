import { redirect } from "next/navigation";

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

function appendValue(params: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => params.append(key, item));
    return;
  }

  params.set(key, value);
}

export default function WorkspacePage({ params, searchParams }: WorkspacePageProps) {
  const query = new URLSearchParams();
  appendValue(query, "error", searchParams?.error);
  appendValue(query, "lane", searchParams?.lane);
  appendValue(query, "supporting", searchParams?.supporting);

  const target = `/workspace/${params.workspaceId}/project/${params.workspaceId}${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  redirect(target);
}
