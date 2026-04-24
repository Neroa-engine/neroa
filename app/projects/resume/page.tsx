import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { APP_ROUTES } from "@/lib/routes";
import {
  loadPortalProjectSummariesForUser,
  resolveSmartResumeDestination
} from "@/lib/portal/server";

type ProjectsResumePageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function ProjectsResumePage({ searchParams }: ProjectsResumePageProps) {
  noStore();
  const { user } = await requireUser({
    nextPath: APP_ROUTES.projectsResume
  });
  const supabase = createSupabaseServerClient();
  const projects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  });
  const destination = await resolveSmartResumeDestination({
    supabase,
    userId: user.id,
    projects
  });

  if (searchParams?.error) {
    const params = new URLSearchParams();
    params.set("error", searchParams.error);
    redirect(`${destination}?${params.toString()}`);
  }

  redirect(destination);
}
