import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createPost, getAllPosts } from "@/lib/posts";
import { requireAdmin } from "@/lib/password-middleware";

type CreatePostPayload = {
  title?: string;
  slug?: string;
  content?: string;
  imageUrl?: string | null;
  embedLink?: string | null;
};

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  let payload: CreatePostPayload;
  try {
    payload = (await request.json()) as CreatePostPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = payload.title?.trim();
  const content = payload.content?.trim();
  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    );
  }

  try {
    const post = await createPost({
      title,
      slug: payload.slug,
      content,
      imageUrl: payload.imageUrl,
      embedLink: payload.embedLink
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
