import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { APP_ROUTES } from "@/lib/routes";
import {
  buildAuthRedirectPath,
  normalizeAppPath
} from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;
type AccountAccess = ReturnType<typeof resolveAccountPlanAccess>;

export type OptionalServerAuthContext = {
  supabase: SupabaseServerClient;
  user: User | null;
  access: AccountAccess | null;
};

export type AuthenticatedServerContext = {
  supabase: SupabaseServerClient;
  user: User;
  access: AccountAccess;
};

function buildPlanSelectionRedirectPath(path?: string | null) {
  return normalizeAppPath(path, APP_ROUTES.startDiy);
}

export async function getServerAuthContext(): Promise<OptionalServerAuthContext> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
    access: user ? resolveAccountPlanAccess(user) : null
  };
}

export async function requireUser(options?: {
  nextPath?: string | null;
}) {
  const context = await getServerAuthContext();

  if (!context.user || !context.access) {
    redirect(buildAuthRedirectPath({ nextPath: options?.nextPath }));
  }

  return {
    ...context,
    user: context.user,
    access: context.access
  } satisfies AuthenticatedServerContext;
}

export async function requirePlanAccess(options?: {
  nextPath?: string | null;
  planRedirectPath?: string | null;
}) {
  const context = await requireUser({
    nextPath: options?.nextPath
  });

  if (!context.access.hasSelectedPlan) {
    redirect(buildPlanSelectionRedirectPath(options?.planRedirectPath));
  }

  return context;
}

export async function getOptionalUser() {
  const { user } = await getServerAuthContext();
  return user;
}

export function buildUnauthorizedApiResponse(args?: {
  message?: string;
  field?: "error" | "message";
  status?: number;
}) {
  const field = args?.field ?? "error";
  const message = args?.message ?? "Sign in before continuing.";

  return NextResponse.json(
    {
      [field]: message
    },
    {
      status: args?.status ?? 401
    }
  );
}

export async function requireApiUser(options?: {
  message?: string;
  field?: "error" | "message";
  status?: number;
}) {
  const context = await getServerAuthContext();

  if (!context.user || !context.access) {
    return {
      ok: false as const,
      response: buildUnauthorizedApiResponse(options)
    };
  }

  return {
    ok: true as const,
    ...context,
    user: context.user,
    access: context.access
  };
}
