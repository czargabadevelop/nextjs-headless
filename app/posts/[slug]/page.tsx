import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/api";
import { featuredImage, formatDate, postAuthor, postCategories } from "@/lib/utils";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const posts = await getPosts({ per_page: 50 });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Post not found" };

  return {
    title: post.title.rendered,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, "").trim(),
    openGraph: {
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: post._embedded?.author?.map((a) => a.name),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const image = featuredImage(post);
  const author = postAuthor(post);
  const categories = postCategories(post);

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        ← All posts
      </Link>

      <header className="flex flex-col gap-4 border-b border-neutral-200 pb-6">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((term) => (
              <span
                key={term.id}
                className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600"
              >
                {term.name}
              </span>
            ))}
          </div>
        )}

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
          {post.title.rendered}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {author && <span>· {author.name}</span>}
        </div>
      </header>

      {image?.source_url && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-neutral-100">
          <Image
            src={image.source_url}
            alt={image.alt_text || post.title.rendered}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      )}

      <div
        className="prose-wp"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </article>
  );
}
