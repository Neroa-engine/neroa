import { buildAuthRedirectPath } from "@/lib/auth/routes";
import { getOptionalUser } from "@/lib/auth";
import { APP_ROUTES } from "@/lib/routes";
import { redirect } from "next/navigation";

type StartPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
    entry?: string;
    title?: string;
    summary?: string;
  };
};

export default async function StartPage({ searchParams }: StartPageProps) {
  const user = await getOptionalUser();
  const nextParams = new URLSearchParams();

  if (searchParams?.entry === "managed") {
    nextParams.set("entry", "managed");
  } else if (searchParams?.entry === "diy") {
    nextParams.set("entry", "diy");
  }

  if (searchParams?.title) {
    nextParams.set("title", searchParams.title);
  }

  if (searchParams?.summary) {
    nextParams.set("summary", searchParams.summary);
  }

  if (searchParams?.error) {
    nextParams.set("error", searchParams.error);
  }

  if (searchParams?.notice) {
    nextParams.set("notice", searchParams.notice);
  }

  const nextPath = nextParams.size > 0 ? `${APP_ROUTES.start}?${nextParams.toString()}` : APP_ROUTES.start;

  if (!user) {
    redirect(buildAuthRedirectPath({ nextPath }));
  }

  redirect(APP_ROUTES.projects);
}
