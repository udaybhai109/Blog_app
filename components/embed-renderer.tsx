"use client";

import Script from "next/script";
import { useEffect } from "react";
import { detectEmbedType, getYouTubeEmbedUrl } from "@/lib/embed";

type EmbedRendererProps = {
  embedLink?: string | null;
};

export function EmbedRenderer({ embedLink }: EmbedRendererProps) {
  const type = detectEmbedType(embedLink);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (type === "instagram") {
      (
        window as Window & {
          instgrm?: { Embeds?: { process?: () => void } };
        }
      ).instgrm?.Embeds?.process?.();
    }

    if (type === "x") {
      (
        window as Window & {
          twttr?: { widgets?: { load?: () => void } };
        }
      ).twttr?.widgets?.load?.();
    }
  }, [type, embedLink]);

  if (type === "none" || !embedLink) {
    return null;
  }

  if (type === "youtube") {
    const src = getYouTubeEmbedUrl(embedLink);
    if (!src) {
      return (
        <a href={embedLink} target="_blank" rel="noreferrer" className="text-accent underline">
          {embedLink}
        </a>
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <iframe
          className="aspect-video w-full"
          src={src}
          title="YouTube embed"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === "instagram") {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <blockquote className="instagram-media" data-instgrm-permalink={embedLink} data-instgrm-version="14">
          <a href={embedLink} target="_blank" rel="noreferrer">
            View on Instagram
          </a>
        </blockquote>
        <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      </div>
    );
  }

  if (type === "x") {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <blockquote className="twitter-tweet">
          <a href={embedLink} target="_blank" rel="noreferrer">
            View on X
          </a>
        </blockquote>
        <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
      </div>
    );
  }

  return (
    <a href={embedLink} target="_blank" rel="noreferrer" className="text-accent underline">
      {embedLink}
    </a>
  );
}
