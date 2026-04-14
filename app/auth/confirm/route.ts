import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { resolveAccountPlanAccess } from "@/lib/account/plan-access";
import { listAccessibleWorkspaces } from "@/lib/platform/foundation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedOtpTypes: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
];

function safeNextPath(value: string | null | undefined) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/start?step=plan";
}

function shouldResumeGuidedSetup(nextPath: string, type: string | null) {
  if (type === "recovery" || type === "email_change") {
    return false;
  }

  return nextPath === "/start?step=plan" || nextPath.startsWith("/start");
}

async function resolvePostConfirmationDestination(args: {
  supabase: ReturnType<typeof createSupabaseServerClient>;
  nextPath: string;
  type: string | null;
}) {
  if (!shouldResumeGuidedSetup(args.nextPath, args.type)) {
    return args.nextPath;
  }

  const {
    data: { user }
  } = await args.supabase.auth.getUser();

  if (!user) {
    return "/start?step=plan";
  }

  const access = resolveAccountPlanAccess(user);

  if (!access.hasSelectedPlan) {
    return "/start?step=plan";
  }

  const workspaces = await listAccessibleWorkspaces({
    supabase: args.supabase,
    userId: user.id
  }).catch(() => []);

  if (workspaces.length > 0) {
    return "/dashboard";
  }

  return "/start?step=entry";
}

function buildConfirmationNotice(destinationPath: string) {
  if (destinationPath.startsWith("/dashboard")) {
    return "Email confirmed. Your account is ready.";
  }

  if (destinationPath.includes("step=entry")) {
    return "Email confirmed. Continue the guided setup so Neroa can shape your first system before the Engine is created.";
  }

  return "Email confirmed. Choose your plan and continue setting up your first Engine.";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const supabase = createSupabaseServerClient();

  let errorMessage: string | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      errorMessage = error.message || "Unable to confirm this account.";
    }
  } else if (tokenHash && type && allowedOtpTypes.includes(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash
    });

    if (error) {
      errorMessage = error.message || "Unable to confirm this account.";
    }
  } else {
    errorMessage = "The confirmation link is missing the required account details.";
  }

  if (errorMessage) {
    const destination = new URL("/auth", requestUrl.origin);
    destination.searchParams.set("error", errorMessage);
    destination.searchParams.set("next", next);
    return NextResponse.redirect(destination);
  }

  const resolvedDestinationPath = await resolvePostConfirmationDestination({
    supabase,
    nextPath: next,
    type
  });
  const destination = new URL(resolvedDestinationPath, requestUrl.origin);
  destination.searchParams.set("notice", buildConfirmationNotice(resolvedDestinationPath));

  return NextResponse.redirect(destination);
}
