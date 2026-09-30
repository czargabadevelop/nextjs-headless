import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/lib/types";
import { featuredImage, formatDate, plainExcerpt, postCategories } from "@/lib/utils";

type Props = {
  post: WPPost;
  priority?: boolean;
};

export default function PostCard({ post, priority = false }: Props) {
  const image = featuredImage(post);
  const categories = postCategories(post);
  const excerpt = plainExcerpt(post);

  return (
    <article className="group flex flex-col gap-3 border-b border-neutral-200 pb-8">
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {categories.length > 0 && (
          <span className="flex gap-2">
            {categories.slice(0, 2).map((term) => (
              <span
                key={term.id}
                className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600"
              >
                {term.name}
              </span>
            ))}
          </span>
        )}
      </div>

      {image?.source_url && (
        <Link
          href={`/posts/${post.slug}`}
          className="relative block aspect-[16/9] overflow-hidden rounded-lg bg-neutral-100"
        >
          <Image
            src={image.source_url}
            alt={image.alt_text || post.title.rendered}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      )}

      <h2 className="text-2xl font-semibold tracking-tight">
        <Link href={`/posts/${post.slug}`} className="hover:underline">
          {post.title.rendered}
        </Link>
      </h2>

      {excerpt && (
        <p
          className="max-w-prose text-sm leading-relaxed text-neutral-600"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />
      )}

      <Link
        href={`/posts/${post.slug}`}
        className="text-sm font-medium text-neutral-900 underline underline-offset-4"
      >
        Read more
      </Link>
    </article>
  );
}
