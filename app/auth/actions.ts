"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeAppPath } from "@/lib/auth/routes";
import { APP_ROUTES } from "@/lib/routes";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildErrorRedirect(message: string, next: string) {
  const params = new URLSearchParams();
  params.set("error", message);

  if (next !== APP_ROUTES.dashboard) {
    params.set("next", next);
  }

  return `/auth?${params.toString()}`;
}

function normalizeAuthErrorMessage(message: string) {
  if (message.toLowerCase() === "email not confirmed") {
    return "Email not confirmed. Confirm your email first, then sign in to continue.";
  }

  return message;
}

export async function authenticate(formData: FormData) {
  const email = safeString(formData.get("email"));
  const password = safeString(formData.get("password"));
  const next = normalizeAppPath(safeString(formData.get("next")), APP_ROUTES.dashboard);

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(buildErrorRedirect(normalizeAuthErrorMessage(error.message), next));
  }

  redirect(next);
}
