export async function createPost(input: CreatePostInput): Promise<Post> {
  const baseSlug = createSlug(input.slug || input.title);

  if (!baseSlug) {
    throw new Error("Slug could not be created. Use a title with letters or numbers.");
  }

  let finalSlug = baseSlug.slice(0, 80); // prevent overly long slugs
  let counter = 1;

  // ensure unique slug
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
      content: input.content, // do NOT trim large content aggressively
      imageUrl: input.imageUrl?.trim() || null,
      embedLink: input.embedLink?.trim() || null
    }
  });
}
