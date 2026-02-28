import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deletePostBySlug, getPostBySlug } from "@/lib/posts";
import { requireAdmin } from "@/lib/password-middleware";

type PostRouteProps = {
  params: {
    slug: string;
  };
};

export async function GET(_: NextRequest, { params }: PostRouteProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: PostRouteProps) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError;
  }

  try {
    const post = await deletePostBySlug(params.slug);
    return NextResponse.json(post);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
