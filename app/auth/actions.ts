"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function authenticate(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const mode = String(formData.get("mode") ?? "signin");

  const supabase = createSupabaseServerClient();

  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      redirect(`/auth?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/auth?notice=Check your email if confirmation is enabled.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
