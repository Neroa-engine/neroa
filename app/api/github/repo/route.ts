import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepo, getRepoContents } from "@/lib/integrations/github";

const bodySchema = z.object({
  owner: z.string().trim().min(1),
  repo: z.string().trim().min(1)
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = bodySchema.parse(json);

    const [repo, contents] = await Promise.all([
      getRepo(body.owner, body.repo),
      getRepoContents(body.owner, body.repo)
    ]);

    return NextResponse.json({
      ok: true,
      repo,
      contents
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body.",
          details: error.flatten()
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

    const message = error instanceof Error ? error.message : "Internal server error.";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status }
    );
  }
}
