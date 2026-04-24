import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";

type ProjectPreviewPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
  };
};

export default async function ProjectPreviewPage({ searchParams }: ProjectPreviewPageProps) {
  const user = await getOptionalUser();
  const nextSearch = new URLSearchParams();

  if (searchParams?.error) {
    nextSearch.set("error", searchParams.error);
  }

  if (searchParams?.notice) {
    nextSearch.set("notice", searchParams.notice);
  }

  const search = nextSearch.size > 0 ? `?${nextSearch.toString()}` : "";
  redirect(`${user ? "/roadmap" : "/signup"}${search}`);
}
