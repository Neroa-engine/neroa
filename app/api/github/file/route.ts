import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGitHubFileContent } from "@/lib/integrations/github";

const bodySchema = z.object({
  owner: z.string().trim().min(1),
  repo: z.string().trim().min(1),
  path: z.string().trim().min(1)
});

export async function POST(request: NextRequest) {
  let owner = "";
  let repo = "";
  let path = "";

  try {
    const rawBody = await request.text();
    console.log("GITHUB_FILE_RAW_BODY", rawBody);

    const json = rawBody ? JSON.parse(rawBody) : {};
    const body = bodySchema.parse({
      owner: json?.owner,
      repo: json?.repo,
      path: json?.path
    });

    owner = body.owner;
    repo = body.repo;
    path = body.path;

    console.log("GITHUB_FILE_REQUEST", { owner, repo, path });

    const result = await getGitHubFileContent(owner, repo, path);

    return NextResponse.json({
      ok: true,
      owner: result.owner,
      repo: result.repo,
      path: result.path,
      file: result.file
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body",
          owner,
          repo,
          path
        },
        { status: 400 }
      );
    }

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    const message = error instanceof Error ? error.message : "Internal server error";

    const errorOwner =
      typeof error === "object" &&
      error !== null &&
      "owner" in error &&
      typeof error.owner === "string"
        ? error.owner
        : owner;

    const errorRepo =
      typeof error === "object" &&
      error !== null &&
      "repo" in error &&
      typeof error.repo === "string"
        ? error.repo
        : repo;

    const errorPath =
      typeof error === "object" &&
      error !== null &&
      "path" in error &&
      typeof error.path === "string"
        ? error.path
        : path;

    return NextResponse.json(
      {
        ok: false,
        error: message,
        owner: errorOwner,
        repo: errorRepo,
        path: errorPath
      },
      { status }
    );
  }
}
