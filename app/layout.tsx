import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Next.js + Headless WordPress",
    template: "%s | Next.js + Headless WordPress",
  },
  description:
    "A Next.js App Router boilerplate sourcing content from the WordPress REST API (wp-json).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              nextjs-headless
            </Link>
            <nav className="flex gap-6 text-sm text-neutral-600">
              <Link href="/" className="hover:text-neutral-900">
                Posts
              </Link>
              <Link href="/about" className="hover:text-neutral-900">
                About
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>

        <footer className="border-t border-neutral-200">
          <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-neutral-500">
            Served by Next.js — content from the WordPress REST API.
          </div>
        </footer>
      </body>
    </html>
  );
}
