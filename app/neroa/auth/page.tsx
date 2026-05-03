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

const safeNeroaPathPattern = /^\/neroa(?:\/|$)/;

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

function normalizeSafeNeroaNextPath(
  value: string | undefined,
  fallback = "/neroa/account"
) {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    safeNeroaPathPattern.test(value)
  ) {
    return value;
  }

  return fallback;
}

export default async function NeroaAuthPage({
  searchParams
}: NeroaAuthPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const selectedPlanFromQuery = normalizeSelectedPlan(readSearchParam(resolvedSearchParams, "plan"));
  const selectedPlan = selectedPlanFromQuery ?? "free";
  const hasExplicitPlan = selectedPlanFromQuery !== null;
  const error = readSearchParam(resolvedSearchParams, "error") ?? null;
  const notice = readSearchParam(resolvedSearchParams, "notice") ?? null;
  const nextPath = normalizeSafeNeroaNextPath(readSearchParam(resolvedSearchParams, "next"));

  return (
    <NeroaAuthSurface
      selectedPlan={selectedPlan}
      hasExplicitPlan={hasExplicitPlan}
      initialError={error}
      initialNotice={notice}
      initialNextPath={nextPath}
    />
  );
}
