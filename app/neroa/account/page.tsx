import type { Metadata } from "next";
import { NeroaAccountPortalSurface } from "@/components/neroa-portal/neroa-account-portal-surface";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export const metadata: Metadata = {
  title: "Neroa | Account",
  description:
    "Open your Neroa account from the project board, account navigation, and supporting plan context."
};

type AccountProfileSnapshot = {
  name: string | null;
  organization: string | null;
  email: string | null;
  selectedPlan: "free" | "starter" | "pro" | "business" | "managed" | null;
  resetPasswordHref: string;
};

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
        selectedPlan: null,
        resetPasswordHref
      };
    }

    const rawSelectedPlan = readMetadataValue(user.user_metadata, ["selected_plan"]);
    const selectedPlan =
      rawSelectedPlan === "free" ||
      rawSelectedPlan === "starter" ||
      rawSelectedPlan === "pro" ||
      rawSelectedPlan === "business" ||
      rawSelectedPlan === "managed"
        ? rawSelectedPlan
        : null;

    return {
      name: readMetadataValue(user.user_metadata, ["name", "full_name"]),
      organization: readMetadataValue(user.user_metadata, ["organization"]),
      email: user.email?.trim() ?? null,
      selectedPlan,
      resetPasswordHref
    };
  } catch {
    return {
      name: null,
      organization: null,
      email: null,
      selectedPlan: null,
      resetPasswordHref
    };
  }
}

export default async function NeroaAccountPortalPage() {
  noStore();
  const accountProfile = await buildAccountProfileSnapshot();

  return <NeroaAccountPortalSurface accountProfile={accountProfile} />;
}
