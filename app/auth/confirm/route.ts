import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { normalizeAppPath } from "@/lib/auth/routes";
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

function buildAuthErrorRedirect(requestUrl: URL, message: string, next: string) {
  const destination = new URL(APP_ROUTES.auth, requestUrl.origin);
  destination.searchParams.set("error", message);
  destination.searchParams.set("next", next);
  return NextResponse.redirect(destination);
}

function buildConfirmationNotice(destinationPath: string) {
  if (destinationPath.startsWith(APP_ROUTES.resetPassword)) {
    return "Email confirmed. Set your new password in this same browser.";
  }

  if (destinationPath.startsWith(APP_ROUTES.start)) {
    return "Email confirmed. Continue into Strategy Room.";
  }

  if (destinationPath.startsWith("/workspace/")) {
    return "Email confirmed. Continue into your current build.";
  }

  return "Email confirmed. Continue into Neroa.";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = normalizeAppPath(requestUrl.searchParams.get("next"), APP_ROUTES.dashboard);
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
    return buildAuthErrorRedirect(requestUrl, errorMessage, next);
  }

  const destination = new URL(next, requestUrl.origin);
  destination.searchParams.set("notice", buildConfirmationNotice(next));
  return NextResponse.redirect(destination);
}
