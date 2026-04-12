"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildWorkspaceName } from "@/lib/narua/planning";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeLaneId, parseSupportingLaneIds } from "@/lib/workspace/lanes";

export async function startWorkspace(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const idea = String(formData.get("idea") ?? "").trim();
  const primaryLaneId = normalizeLaneId(String(formData.get("primaryLaneId") ?? "").trim()) ?? "business";
  const supportingLaneIds = parseSupportingLaneIds(
    String(formData.get("supportingLaneIds") ?? "").trim()
  ).filter((laneId) => laneId !== primaryLaneId);

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?notice=Sign in to continue into your workspace.");
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      owner_id: user.id,
      name: title || buildWorkspaceName(idea),
      description: description || idea || null
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/start?error=${encodeURIComponent(error?.message ?? "Unable to create workspace.")}`);
  }

  revalidatePath("/dashboard");

  const searchParams = new URLSearchParams();
  searchParams.set("lane", primaryLaneId);

  if (supportingLaneIds.length > 0) {
    searchParams.set("supporting", supportingLaneIds.join(","));
  }

  redirect(`/workspace/${data.id}/project/${data.id}?${searchParams.toString()}`);
}
