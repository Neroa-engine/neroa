import type { Metadata } from "next";
import { NeroaAuthSurface } from "@/components/neroa-portal/neroa-auth-surface";

export const metadata: Metadata = {
  title: "Neroa | Sign In",
  description: "Sign in or create a Neroa account to start your project."
};

type AuthSearchParams = Record<string, string | string[] | undefined>;

type NeroaAuthPageProps = {
  searchParams?: Promise<AuthSearchParams> | AuthSearchParams;
};

function readSearchParam(searchParams: AuthSearchParams, key: string) {
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

export default async function NeroaAuthPage({
  searchParams
}: NeroaAuthPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const selectedPlan = normalizeSelectedPlan(readSearchParam(resolvedSearchParams, "plan"));

  return <NeroaAuthSurface selectedPlan={selectedPlan} />;
}
