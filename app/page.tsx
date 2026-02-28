import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

export const metadata: Metadata = {
  title: "Home",
  description: "Read the latest posts from TASH."
};

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <section>
      <div className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl">Recent Posts</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          TASH is a quiet corner for essays, reflections, and long-form notes.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-muted">No posts yet.</div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
