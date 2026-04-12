import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function redirectWithError(request: Request, message: string) {
  const url = new URL("/dashboard", request.url);
  url.searchParams.set("error", message);

  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(
    formData.get("description") ?? formData.get("goal") ?? ""
  ).trim();

  if (!name) {
    return redirectWithError(request, "Workspace name is required.");
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectTo(request, "/auth");
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      description: description || null,
      owner_id: user.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return redirectWithError(
      request,
      error?.message ?? "Unable to create workspace."
    );
  }

  revalidatePath("/dashboard");

  return redirectTo(request, `/workspace/${data.id}/project/${data.id}`);
}
