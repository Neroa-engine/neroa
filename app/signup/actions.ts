"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/routes";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function safeNextPath(value: string, fallback: string = APP_ROUTES.dashboard) {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function buildSignupRedirect(params: {
  error?: string;
  notice?: string;
  email?: string;
  next?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.notice) {
    searchParams.set("notice", params.notice);
  }

  if (params.email) {
    searchParams.set("email", params.email);
  }

  if (params.next) {
    searchParams.set("next", params.next);
  }

  return searchParams.size > 0 ? `/signup?${searchParams.toString()}` : "/signup";
}

function normalizeAuthErrorMessage(message: string) {
  if (message.toLowerCase() === "email not confirmed") {
    return "Email not confirmed. Confirm your email first, then sign in to continue.";
  }

  return message;
}

function resolveSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const headerStore = headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host?.includes("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

function buildAuthConfirmationUrl(next: string) {
  const url = new URL("/auth/confirm", resolveSiteOrigin());
  url.searchParams.set("next", next);
  return url.toString();
}

function buildResetPasswordConfirmationUrl(next: string) {
  const url = new URL("/auth/confirm", resolveSiteOrigin());
  url.searchParams.set("next", `/reset-password?next=${encodeURIComponent(next)}`);
  return url.toString();
}

export async function signInFromSignup(formData: FormData) {
  const email = safeString(formData.get("email"));
  const password = safeString(formData.get("password"));
  const next = safeNextPath(safeString(formData.get("next")));

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(
      buildSignupRedirect({
        error: normalizeAuthErrorMessage(error.message),
        email,
        next
      })
    );
  }

  redirect(next);
}

export async function signUpFromSignup(formData: FormData) {
  const email = safeString(formData.get("email"));
  const password = safeString(formData.get("password"));
  const confirmPassword = safeString(formData.get("confirmPassword"));
  const name = safeString(formData.get("name"));
  const next = safeNextPath(safeString(formData.get("next")));

  if (password !== confirmPassword) {
    redirect(
      buildSignupRedirect({
        error: "Passwords do not match. Re-enter the same password in both fields.",
        email,
        next
      })
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildAuthConfirmationUrl(next),
      data: {
        name,
        full_name: name
      }
    }
  });

  if (error) {
    redirect(
      buildSignupRedirect({
        error: error.message,
        email,
        next
      })
    );
  }

  if (!data.session) {
    redirect(
      buildSignupRedirect({
        notice:
          "Account created. Check your email, open the confirmation link in this same browser, then continue here if a sign-in step is still needed.",
        email,
        next
      })
    );
  }

  redirect(next);
}

function buildForgotPasswordRedirect(params: {
  error?: string;
  notice?: string;
  email?: string;
  next?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.notice) {
    searchParams.set("notice", params.notice);
  }

  if (params.email) {
    searchParams.set("email", params.email);
  }

  if (params.next) {
    searchParams.set("next", params.next);
  }

  return searchParams.size > 0 ? `/forgot-password?${searchParams.toString()}` : "/forgot-password";
}

function buildResetPasswordRedirect(params: {
  error?: string;
  notice?: string;
  next?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.error) {
    searchParams.set("error", params.error);
  }

  if (params.notice) {
    searchParams.set("notice", params.notice);
  }

  if (params.next) {
    searchParams.set("next", params.next);
  }

  return searchParams.size > 0 ? `/reset-password?${searchParams.toString()}` : "/reset-password";
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = safeString(formData.get("email"));
  const next = safeNextPath(safeString(formData.get("next")));

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildResetPasswordConfirmationUrl(next)
  });

  if (error) {
    redirect(
      buildForgotPasswordRedirect({
        error: error.message,
        email,
        next
      })
    );
  }

  redirect(
    buildForgotPasswordRedirect({
      notice:
        "Password reset email sent. Open the link in this same browser so Neroa can finish the recovery flow cleanly.",
      email,
      next
    })
  );
}

export async function updatePasswordFromRecovery(formData: FormData) {
  const password = safeString(formData.get("password"));
  const confirmPassword = safeString(formData.get("confirmPassword"));
  const next = safeNextPath(safeString(formData.get("next")), APP_ROUTES.dashboard);

  if (password !== confirmPassword) {
    redirect(
      buildResetPasswordRedirect({
        error: "Passwords do not match. Re-enter the same password in both fields.",
        next
      })
    );
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    redirect(
      buildResetPasswordRedirect({
        error: error.message,
        next
      })
    );
  }

  await supabase.auth.signOut().catch(() => {
    // If sign-out fails, still continue to the sign-in step.
  });

  redirect(`/auth?notice=${encodeURIComponent("Password updated. Sign in with your new password.")}&next=${encodeURIComponent(next)}`);
}
