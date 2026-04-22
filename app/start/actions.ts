"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildAuthRedirectPath } from "@/lib/auth/routes";
import { APP_ROUTES } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildStartWorkspaceName(title: string, description: string) {
  if (title) {
    return title;
  }

  const candidate = description
    .split(/\n+|[.!?](?:\s+|$)/)
    .map((part) => part.trim())
    .find(Boolean);

  if (!candidate) {
    return "New Neroa Build";
  }

  return candidate.slice(0, 72);
}

function buildStartReturnPath(args: {
  entry: "diy" | "managed";
  title?: string;
  summary?: string;
  error?: string;
}) {
  const params = new URLSearchParams();
  params.set("entry", args.entry);

  if (args.title?.trim()) {
    params.set("title", args.title.trim());
  }

  if (args.summary?.trim()) {
    params.set("summary", args.summary.trim());
  }

  if (args.error?.trim()) {
    params.set("error", args.error.trim());
  }

  return `${APP_ROUTES.start}?${params.toString()}`;
}

export async function startEntryWorkspace(formData: FormData) {
  const selectedPathId = safeString(formData.get("selectedPathId")) === "managed" ? "managed" : "diy";
  const title = safeString(formData.get("title"));
  const description = safeString(formData.get("description"));
  const nextPath = buildStartReturnPath({
    entry: selectedPathId,
    title,
    summary: description
  });

  if (!title || !description) {
    redirect(
      buildStartReturnPath({
        entry: selectedPathId,
        title,
        summary: description,
        error: "Add a project name and short build description before continuing."
      })
    );
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      buildAuthRedirectPath({
        nextPath,
        notice: "Sign in to continue into your planning workspace."
      })
    );
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      owner_id: user.id,
      name: buildStartWorkspaceName(title, description),
      description
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      buildStartReturnPath({
        entry: selectedPathId,
        title,
        summary: description,
        error: error?.message ?? "Unable to create the workspace from Strategy Room."
      })
    );
  }

  revalidatePath(APP_ROUTES.dashboard);
  redirect(`/workspace/${data.id}/project/${data.id}`);
}
