import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedOtpTypes: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
] as const;

function safeNextPath(value: string | null | undefined, fallback = "/neroa/account") {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}

function buildNotice(destinationPath: string) {
  if (destinationPath.startsWith("/neroa/auth/reset-password")) {
    return "Recovery confirmed. Set your new password.";
  }

  return "Email confirmed. Your Neroa account is ready.";
}

function buildAuthRedirect(requestUrl: URL, params: {
  error?: string | null;
  notice?: string | null;
}) {
  const destination = new URL("/neroa/auth", requestUrl.origin);

  if (params.error?.trim()) {
    destination.searchParams.set("error", params.error.trim());
  }

  if (params.notice?.trim()) {
    destination.searchParams.set("notice", params.notice.trim());
  }

  return destination;
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
    return NextResponse.redirect(buildAuthRedirect(requestUrl, { error: errorMessage }));
  }

  const destination = new URL(next, requestUrl.origin);
  destination.searchParams.set("notice", buildNotice(destination.pathname));
  return NextResponse.redirect(destination);
}
