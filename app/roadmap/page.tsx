import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { APP_ROUTES } from "@/lib/routes";

export default async function RoadmapPage() {
  await requireUser({
    nextPath: APP_ROUTES.roadmap
  });

  redirect(APP_ROUTES.projects);
}
