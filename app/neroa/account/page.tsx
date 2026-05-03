import type { Metadata } from "next";
import { NeroaAccountPortalSurface } from "@/components/neroa-portal/neroa-account-portal-surface";

export const metadata: Metadata = {
  title: "Neroa | Account",
  description:
    "Start inside your Neroa account from projects, project board access, and supporting plan context."
};

type AccountSearchParams = Record<string, string | string[] | undefined>;

type NeroaAccountPortalPageProps = {
  searchParams?: Promise<AccountSearchParams> | AccountSearchParams;
};

function readSearchParam(searchParams: AccountSearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSelectedPlan(value: string | undefined) {
  switch (value) {
    case "free":
    case "starter":
    case "pro":
    case "business":
    case "managed":
      return value;
    default:
      return null;
  }
}

export default async function NeroaAccountPortalPage({
  searchParams
}: NeroaAccountPortalPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const selectedPlan = normalizeSelectedPlan(readSearchParam(resolvedSearchParams, "plan"));

  return <NeroaAccountPortalSurface selectedPlan={selectedPlan} />;
}
