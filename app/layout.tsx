import type { Metadata } from "next";
import { Cormorant_Garamond, Literata } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

const bodyFont = Literata({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "TASH",
    template: "%s | TASH"
  },
  description: "TASH is a minimal literary blog for essays, notes, and stories.",
  openGraph: {
    title: "TASH",
    description: "A minimal literary blog for essays, notes, and stories.",
    type: "website",
    siteName: "TASH"
  },
  twitter: {
    card: "summary_large_image",
    title: "TASH",
    description: "A minimal literary blog for essays, notes, and stories."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 sm:px-8">
            <SiteHeader />
            <main className="flex-1 py-10">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
