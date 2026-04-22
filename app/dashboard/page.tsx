import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { requireUser } from "@/lib/auth";
import { APP_ROUTES } from "@/lib/routes";

type DashboardPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  noStore();
  await requireUser({
    nextPath: APP_ROUTES.dashboard
  });

  if (searchParams?.error) {
    const params = new URLSearchParams();
    params.set("error", searchParams.error);
    redirect(`${APP_ROUTES.projects}?${params.toString()}`);
  }

  redirect(APP_ROUTES.projects);
}
