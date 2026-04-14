import { NextRequest } from "next/server";
import {
  buildBlogPublishPayload,
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts
} from "@/lib/blog";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (slug) {
    const post = getPublishedBlogPostBySlug(slug);

    if (!post) {
      return Response.json({ error: "Published post not found." }, { status: 404 });
    }

    return Response.json({
      status: "ready",
      payload: buildBlogPublishPayload(post)
    });
  }

  return Response.json({
    status: "ready",
    posts: getPublishedBlogPosts().map((post) => ({
      slug: post.slug,
      status: post.status,
      payload: buildBlogPublishPayload(post)
    }))
  });
}

export async function POST(request: NextRequest) {
  let body: { slug?: string } | null = null;

  try {
    body = (await request.json()) as { slug?: string };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body?.slug) {
    return Response.json({ error: "A blog slug is required." }, { status: 400 });
  }

  const post = getPublishedBlogPostBySlug(body.slug);

  if (!post) {
    return Response.json({ error: "Published post not found." }, { status: 404 });
  }

  return Response.json({
    status: "ready",
    publishedAt: post.publishedAt,
    payload: buildBlogPublishPayload(post)
  });
}
