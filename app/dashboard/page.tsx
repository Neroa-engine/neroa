import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  loadPortalProjectSummariesForUser,
  resolveSmartResumeDestination
} from "@/lib/portal/server";
import { APP_ROUTES } from "@/lib/routes";

type DashboardPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  noStore();
  const { supabase, user } = await requireUser({
    nextPath: APP_ROUTES.dashboard
  });

  if (searchParams?.error) {
    const params = new URLSearchParams();
    params.set("error", searchParams.error);
    redirect(`${APP_ROUTES.projects}?${params.toString()}`);
  }

  const projects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  }).catch(() => []);

  const destination = await resolveSmartResumeDestination({
    supabase,
    userId: user.id,
    projects
  }).catch(() => APP_ROUTES.projects);

  redirect(destination);
}
