import Link from "next/link";
import type { Post } from "@prisma/client";

type PostCardProps = {
  post: Pick<Post, "title" | "slug" | "content" | "createdAt">;
};

function excerpt(markdown: string) {
  const plain = markdown.replace(/[#*_`>\-\[\]\(\)!]/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > 180 ? `${plain.slice(0, 180)}...` : plain;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50">
      <p className="text-xs text-muted">{new Date(post.createdAt).toLocaleDateString()}</p>
      <h2 className="mt-2 font-display text-2xl">
        <Link href={`/posts/${post.slug}`} className="hover:text-accent">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{excerpt(post.content)}</p>
      <Link href={`/posts/${post.slug}`} className="mt-4 inline-block text-sm text-accent underline">
        Read post
      </Link>
    </article>
  );
}
