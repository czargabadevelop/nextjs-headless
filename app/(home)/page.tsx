import { getPosts, getPostCount } from "@/lib/api";
import { wordpressUrl } from "@/lib/wordpress";
import PostCard from "@/components/PostCard";

export const revalidate = 60;

export default async function HomePage() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let total = 0;
  let error: string | null = null;

  try {
    [posts, total] = await Promise.all([getPosts(), getPostCount()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  if (error) {
    return (
      <section className="rounded-lg border border-amber-300 bg-amber-50 p-6">
        <h1 className="text-lg font-semibold text-amber-900">
          Could not reach WordPress
        </h1>
        <p className="mt-2 text-sm text-amber-800">{error}</p>
        <p className="mt-4 text-sm text-amber-800">
          Check <code className="rounded bg-amber-100 px-1">WORDPRESS_URL</code>{" "}
          in <code className="rounded bg-amber-100 px-1">.env</code> (see{" "}
          <code className="rounded bg-amber-100 px-1">.env.example</code>), then
          restart the dev server. Expected endpoint:{" "}
          <code className="rounded bg-amber-100 px-1">{wordpressUrl()}/wp/v2/posts</code>
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-end justify-between border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Latest posts</h1>
        <span className="text-sm text-neutral-500">{total} total</span>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No posts returned from WordPress yet. Publish something and it will
          appear here.
        </p>
      ) : (
        <div className="grid gap-10">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} priority={index < 2} />
          ))}
        </div>
      )}
    </section>
  );
}
