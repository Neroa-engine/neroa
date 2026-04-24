import type { AccountPlanAccess } from "@/lib/account/plan-access";
import type { BillingIntervalId } from "@/lib/pricing/config";
import {
  buildOrganizationSlug,
  buildPersonalOrganizationName,
  buildProfileRow,
  buildQuotaRow,
  isMissingPlatformTableError,
  normalizeEmail,
  safeUpsert,
  type PlatformUser,
  type ServerSupabaseClient
} from "./foundation-shared";

export async function ensurePlatformAccountState(args: {
  supabase: ServerSupabaseClient;
  user: PlatformUser;
  access: AccountPlanAccess;
  billingInterval?: BillingIntervalId | null;
}) {
  const result = {
    organizationId: null as string | null,
    profilePersisted: false,
    quotaPersisted: false,
    adminPersisted: false
  };

  result.profilePersisted = await safeUpsert(
    args.supabase.from("profiles").upsert(buildProfileRow(args), {
      onConflict: "user_id"
    })
  );

  result.quotaPersisted = await safeUpsert(
    args.supabase.from("account_usage_quotas").upsert(buildQuotaRow(args), {
      onConflict: "user_id"
    })
  );

  if (args.access.isAdmin) {
    result.adminPersisted = await safeUpsert(
      args.supabase.from("admin_overrides").upsert(
        {
          user_id: args.user.id,
          email: normalizeEmail(args.user),
          is_active: true,
          billing_exempt: true,
          plan_override: "all_access",
          notes: "Platform admin override"
        },
        { onConflict: "email" }
      )
    );
  }

  const { data: existingOrganization, error: organizationError } = await args.supabase
    .from("organizations")
    .select("id")
    .eq("owner_user_id", args.user.id)
    .eq("personal", true)
    .maybeSingle();

  if (organizationError) {
    if (isMissingPlatformTableError(organizationError)) {
      return result;
    }

    throw new Error(organizationError.message || "Unable to resolve the account workspace.");
  }

  let organizationId = existingOrganization?.id ?? null;

  if (!organizationId) {
    const { data: createdOrganization, error: createOrganizationError } = await args.supabase
      .from("organizations")
      .insert({
        owner_user_id: args.user.id,
        name: buildPersonalOrganizationName(args.user),
        slug: buildOrganizationSlug(args.user.id),
        personal: true
      })
      .select("id")
      .single();

    if (createOrganizationError) {
      if (isMissingPlatformTableError(createOrganizationError)) {
        return result;
      }

      throw new Error(createOrganizationError.message || "Unable to create the personal workspace.");
    }

    organizationId = createdOrganization?.id ?? null;
  }

  result.organizationId = organizationId;

  if (!organizationId) {
    return result;
  }

  await safeUpsert(
    args.supabase.from("organization_memberships").upsert(
      {
        organization_id: organizationId,
        user_id: args.user.id,
        role: "owner",
        status: "active"
      },
      { onConflict: "organization_id,user_id" }
    )
  );

  return result;
}

export async function ensureWorkspaceTenancyRecords(args: {
  supabase: ServerSupabaseClient;
  user: PlatformUser;
  access: AccountPlanAccess;
  workspaceId: string;
  organizationId?: string | null;
  billingInterval?: BillingIntervalId | null;
}) {
  const accountState = await ensurePlatformAccountState({
    supabase: args.supabase,
    user: args.user,
    access: args.access,
    billingInterval: args.billingInterval
  });
  const organizationId = args.organizationId ?? accountState.organizationId;

  if (!organizationId) {
    return {
      organizationId: null
    };
  }

  const { error: workspaceUpdateError } = await args.supabase
    .from("workspaces")
    .update({
      organization_id: organizationId
    })
    .eq("id", args.workspaceId)
    .eq("owner_id", args.user.id);

  if (workspaceUpdateError && !isMissingPlatformTableError(workspaceUpdateError)) {
    throw new Error(workspaceUpdateError.message || "Unable to align workspace tenancy.");
  }

  await safeUpsert(
    args.supabase.from("workspace_memberships").upsert(
      {
        workspace_id: args.workspaceId,
        user_id: args.user.id,
        role: "owner",
        status: "active"
      },
      { onConflict: "workspace_id,user_id" }
    )
  );

  return {
    organizationId
  };
}
