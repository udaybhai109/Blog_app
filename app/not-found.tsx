import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="py-16">
      <h1 className="font-display text-4xl">Not Found</h1>
      <p className="mt-3 text-muted">The page you requested does not exist.</p>
      <Link href="/" className="mt-5 inline-block text-accent underline">
        Return home
      </Link>
    </section>
  );
}
