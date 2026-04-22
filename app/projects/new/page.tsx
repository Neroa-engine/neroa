import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { APP_ROUTES } from "@/lib/routes";

export default async function ProjectsNewPage() {
  await requireUser({
    nextPath: "/projects/new"
  });
  redirect(APP_ROUTES.startDiy);
}
