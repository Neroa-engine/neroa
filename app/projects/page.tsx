import { ProjectsDashboardPage } from "@/components/dashboard/projects-dashboard-page";
import { APP_ROUTES } from "@/lib/routes";

type ProjectsPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  return <ProjectsDashboardPage entryPath={APP_ROUTES.projects} searchParams={searchParams} />;
}
