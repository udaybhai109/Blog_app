import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EmbedRenderer } from "@/components/embed-renderer";
import { MarkdownContent } from "@/components/markdown-content";
import { getPostBySlug } from "@/lib/posts";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found"
    };
  }

  return {
    title: post.title,
    description: post.content.slice(0, 150),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 150),
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined
    },
    twitter: {
      card: post.imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.content.slice(0, 150),
      images: post.imageUrl ? [post.imageUrl] : undefined
    }
  };
}

export const revalidate = 60;

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.createdAt.toISOString(),
    image: post.imageUrl || undefined,
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/posts/${post.slug}`
  };

  return (
    <article className="mx-auto w-full max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="mb-8">
        <p className="text-xs text-muted">
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{post.title}</h1>
      </header>

      {post.imageUrl ? (
        <div className="mb-8 overflow-hidden rounded-xl border border-border">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1200}
            height={700}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      ) : null}

      {post.embedLink ? (
        <div className="mb-8">
          <EmbedRenderer embedLink={post.embedLink} />
        </div>
      ) : null}

      <MarkdownContent content={post.content} />
    </article>
  );
}
