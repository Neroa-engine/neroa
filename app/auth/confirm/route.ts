import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { APP_ROUTES } from "@/lib/routes";
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

  return APP_ROUTES.start;
}

function normalizeNextPath(nextPath: string) {
  if (nextPath === APP_ROUTES.start || nextPath.startsWith("/start?entry=")) {
    return nextPath;
  }

  if (nextPath === APP_ROUTES.dashboard) {
    return APP_ROUTES.dashboard;
  }

  if (nextPath === "/start?step=plan") {
    return APP_ROUTES.startDiy;
  }

  if (nextPath === "/project-preview" || nextPath.startsWith("/project-preview")) {
    return APP_ROUTES.startDiy;
  }

  if (nextPath === "/projects/new") {
    return APP_ROUTES.startDiy;
  }

  if (nextPath === APP_ROUTES.projects || nextPath === APP_ROUTES.roadmap) {
    return APP_ROUTES.start;
  }

  return nextPath;
}

async function resolvePostConfirmationDestination(args: {
  supabase: ReturnType<typeof createSupabaseServerClient>;
  nextPath: string;
  type: string | null;
}) {
  const normalizedNextPath = normalizeNextPath(args.nextPath);

  if (normalizedNextPath === APP_ROUTES.dashboard) {
    return APP_ROUTES.dashboard;
  }

  return normalizedNextPath;
}

function buildConfirmationNotice(destinationPath: string) {
  if (destinationPath.startsWith("/reset-password")) {
    return "Email confirmed. Set your new password in this same browser.";
  }

  if (destinationPath.startsWith(APP_ROUTES.start)) {
    return "Email confirmed. Continue into your planning center.";
  }

  if (destinationPath === APP_ROUTES.dashboard) {
    return "Email confirmed. Continue into your saved build step.";
  }

  if (destinationPath.includes("/command-center")) {
    return "Email confirmed. Continue into your project's Command Center.";
  }

  return "Email confirmed. Continue into Neroa.";
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
    const destination = new URL(APP_ROUTES.auth, requestUrl.origin);
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
