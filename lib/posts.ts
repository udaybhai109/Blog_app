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
  const baseSlug = createSlug(input.slug || input.title);

  if (!baseSlug) {
    throw new Error("Slug could not be created. Use a title with letters or numbers.");
  }

  let finalSlug = baseSlug.slice(0, 80);
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug: finalSlug }
    });

    if (!existing) break;

    finalSlug = `${baseSlug.slice(0, 70)}-${counter}`;
    counter++;
  }

  return prisma.post.create({
    data: {
      title: input.title.trim(),
      slug: finalSlug,
      content: input.content,
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
