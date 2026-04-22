import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";
import { buildAuthRedirectPath } from "@/lib/auth/routes";
import { APP_ROUTES } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams?: {
    error?: string;
  };
};

function appendError(destination: string, error?: string) {
  if (!error?.trim()) {
    return destination;
  }

  const separator = destination.includes("?") ? "&" : "?";
  return `${destination}${separator}error=${encodeURIComponent(error.trim())}`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  noStore();

  const user = await getOptionalUser();

  if (!user) {
    redirect(buildAuthRedirectPath({ nextPath: APP_ROUTES.dashboard }));
  }

  const supabase = createSupabaseServerClient();
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const destination = workspaces?.[0]?.id
    ? `/workspace/${workspaces[0].id}/project/${workspaces[0].id}`
    : APP_ROUTES.start;

  redirect(appendError(destination, searchParams?.error));
}
