import type { Post } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

export type CreatePostInput = {
  title: string;
  slug?: string;
  content: string;
  imageUrl?: string | null;
  embedLink?: string | null;
};

export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: {
      slug
    }
  });
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const slug = createSlug(input.slug || input.title);
  if (!slug) {
    throw new Error("Slug could not be created. Use a title with letters or numbers.");
  }

  return prisma.post.create({
    data: {
      title: input.title.trim(),
      slug,
      content: input.content.trim(),
      imageUrl: input.imageUrl?.trim() || null,
      embedLink: input.embedLink?.trim() || null
    }
  });
}

export async function deletePostBySlug(slug: string) {
  return prisma.post.delete({
    where: {
      slug
    }
  });
}
