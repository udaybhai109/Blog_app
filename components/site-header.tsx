import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border py-6">
      <div>
        <Link href="/" className="font-display text-3xl tracking-wide">
          TASH
        </Link>
        <p className="mt-1 text-sm text-muted">Literary notes in quiet detail.</p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          Admin
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
