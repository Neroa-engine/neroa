import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/routes";

type DashboardPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  if (searchParams?.error) {
    const params = new URLSearchParams();
    params.set("error", searchParams.error);
    redirect(`${APP_ROUTES.projectsResume}?${params.toString()}`);
  }

  redirect(APP_ROUTES.projectsResume);
}
