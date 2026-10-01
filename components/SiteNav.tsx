import Link from "next/link";
import { getNavPages } from "@/lib/api";
import { decodeEntities } from "@/lib/utils";

const HIDDEN_SLUGS = new Set(["home", "privacy-policy"]);

async function loadNavPages() {
  try {
    const pages = await getNavPages();
    return pages.filter(
      (page) => !HIDDEN_SLUGS.has(page.slug) && page.title.rendered.trim() !== "",
    );
  } catch {
    return [];
  }
}

export default async function SiteNav() {
  const pages = await loadNavPages();

  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-neutral-600">
      <Link href="/" className="hover:text-neutral-900">
        Posts
      </Link>
      {pages.map((page) => (
        <Link
          key={page.id}
          href={`/${page.slug}`}
          className="hover:text-neutral-900"
        >
          {decodeEntities(page.title.rendered)}
        </Link>
      ))}
    </nav>
  );
}
