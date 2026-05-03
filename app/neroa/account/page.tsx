import type { Metadata } from "next";
import { NeroaAccountPortalSurface } from "@/components/neroa-portal/neroa-account-portal-surface";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export const metadata: Metadata = {
  title: "Neroa | Account",
  description:
    "Open your Neroa account from the project board, account navigation, and supporting plan context."
};

type AccountSearchParams = Record<string, string | string[] | undefined>;

type NeroaAccountPortalPageProps = {
  searchParams?: Promise<AccountSearchParams> | AccountSearchParams;
};

type AccountProfileSnapshot = {
  name: string | null;
  organization: string | null;
  email: string | null;
  planName: string | null;
  hasReliablePlan: boolean;
  resetPasswordHref: string;
  signOutAvailable: boolean;
};

const sessionPlanLabels = {
  free: "Free Project Preview",
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  managed: "Managed Build",
  builder: "Builder",
  "command-center": "Command Center"
} as const;

function readMetadataValue(
  record: Record<string, unknown> | null | undefined,
  keys: string[]
) {
  for (const key of keys) {
    const value = record?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function normalizeSessionPlanLabel(value: string | null) {
  switch (value) {
    case "free":
    case "starter":
    case "pro":
    case "business":
    case "managed":
    case "builder":
    case "command-center":
      return sessionPlanLabels[value];
    default:
      return null;
  }
}

function readSessionPlanLabel(user: {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const rawPlan =
    readMetadataValue(user.app_metadata, ["selected_plan", "plan", "subscription_tier", "tier"]) ??
    readMetadataValue(user.user_metadata, ["selected_plan", "plan", "subscription_tier", "tier"]);

  return normalizeSessionPlanLabel(rawPlan?.toLowerCase() ?? null);
}

async function buildAccountProfileSnapshot(): Promise<AccountProfileSnapshot> {
  const resetPasswordHref = "/neroa/auth/reset-password";

  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        name: null,
        organization: null,
        email: null,
        planName: null,
        hasReliablePlan: false,
        resetPasswordHref,
        signOutAvailable: false
      };
    }

    const planName = readSessionPlanLabel(user);

    return {
      name: readMetadataValue(user.user_metadata, ["full_name", "name", "display_name"]),
      organization: readMetadataValue(user.user_metadata, [
        "organization",
        "organization_name",
        "organizationName",
        "company",
        "company_name",
        "companyName"
      ]),
      email: user.email?.trim() ?? null,
      planName,
      hasReliablePlan: Boolean(planName),
      resetPasswordHref,
      signOutAvailable: false
    };
  } catch {
    return {
      name: null,
      organization: null,
      email: null,
      planName: null,
      hasReliablePlan: false,
      resetPasswordHref,
      signOutAvailable: false
    };
  }
}

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
  noStore();
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const selectedPlan = normalizeSelectedPlan(readSearchParam(resolvedSearchParams, "plan"));
  const accountProfile = await buildAccountProfileSnapshot();

  return (
    <NeroaAccountPortalSurface
      selectedPlan={selectedPlan}
      accountProfile={accountProfile}
    />
  );
}
