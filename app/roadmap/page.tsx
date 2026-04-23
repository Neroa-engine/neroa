import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  loadPortalProjectSummariesForUser,
  resolveStrategyRoomLaunchDestination
} from "@/lib/portal/server";
import { APP_ROUTES } from "@/lib/routes";

export default async function RoadmapPage() {
  const { supabase, user } = await requireUser({
    nextPath: APP_ROUTES.roadmap
  });

  const projects = await loadPortalProjectSummariesForUser({
    supabase,
    userId: user.id
  }).catch(() => []);

  const destination = await resolveStrategyRoomLaunchDestination({
    supabase,
    userId: user.id,
    projects
  }).catch(() => APP_ROUTES.projectsNew);

  redirect(destination);
}
