export type EmbedType = "youtube" | "instagram" | "x" | "link" | "none";

export function detectEmbedType(embedLink?: string | null): EmbedType {
  if (!embedLink) {
    return "none";
  }

  let url: URL;
  try {
    url = new URL(embedLink);
  } catch {
    return "link";
  }

  const hostname = url.hostname.replace("www.", "").toLowerCase();

  if (hostname === "youtube.com" || hostname === "youtu.be" || hostname === "m.youtube.com") {
    return "youtube";
  }

  if (hostname === "instagram.com") {
    return "instagram";
  }

  if (hostname === "x.com" || hostname === "twitter.com") {
    return "x";
  }

  return "link";
}

export function getYouTubeEmbedUrl(embedLink: string) {
  try {
    const url = new URL(embedLink);
    const hostname = url.hostname.replace("www.", "").toLowerCase();

    if (hostname === "youtu.be") {
      const videoId = url.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (url.pathname.startsWith("/watch")) {
        const videoId = url.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      const pathParts = url.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "shorts" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }

      if (pathParts[0] === "embed" && pathParts[1]) {
        return `https://www.youtube.com/embed/${pathParts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}
