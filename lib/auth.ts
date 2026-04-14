import { redirect } from "next/navigation";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildAuthRedirect(nextPath?: string | null) {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return `/auth?next=${encodeURIComponent(nextPath)}`;
  }

  return "/auth";
}

export async function requireUser(options?: {
  requirePlan?: boolean;
  nextPath?: string | null;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildAuthRedirect(options?.nextPath));
  }

  const access = resolveAccountPlanAccess(user);

  if ((options?.requirePlan ?? true) && !access.hasSelectedPlan) {
    redirect("/start?step=plan");
  }

  return { supabase, user, access };
}

export async function getOptionalUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}
