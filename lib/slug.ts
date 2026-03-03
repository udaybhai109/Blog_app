export function createSlug(input: string) {
  if (!input) return "";

  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "") // allow all languages
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
