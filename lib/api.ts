import { wordpressUrl, wpFetch, WordPressError } from "./wordpress";
import type { WPAuthor, WPNavPage, WPPage, WPPost, WPTerm } from "./types";

type QueryParams = Record<string, string | number | boolean | undefined>;

function qs(params: QueryParams = {}): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }

  const rendered = search.toString();
  return rendered ? `?${rendered}` : "";
}

export async function getPosts(
  params: QueryParams = {},
): Promise<WPPost[]> {
  return wpFetch<WPPost[]>(
    `/wp/v2/posts${qs({
      per_page: 10,
      orderby: "date",
      order: "desc",
      _embed: 1,
      ...params,
    })}`,
    { revalidate: 60, tags: ["wordpress", "posts"] },
  );
}

export async function getPost(slug: string): Promise<WPPost | null> {
  try {
    const posts = await wpFetch<WPPost[]>(
      `/wp/v2/posts${qs({ slug, _embed: 1, per_page: 1 })}`,
      { revalidate: 60, tags: ["wordpress", "posts", `post:${slug}`] },
    );

    return posts[0] ?? null;
  } catch (error) {
    if (error instanceof WordPressError && error.status === 404) return null;
    throw error;
  }
}

export async function getPostCount(): Promise<number> {
  try {
    const response = await fetch(
      `${wordpressUrl()}/wp/v2/posts?per_page=1`,
      { next: { revalidate: 60, tags: ["wordpress", "posts"] } },
    );

    const total = response.headers.get("X-WP-Total");
    return total ? Number(total) : 0;
  } catch {
    return 0;
  }
}

export async function getPages(
  params: QueryParams = {},
): Promise<WPPage[]> {
  return wpFetch<WPPage[]>(
    `/wp/v2/pages${qs({ per_page: 20, _embed: 1, ...params })}`,
    { revalidate: 300, tags: ["wordpress", "pages"] },
  );
}

export async function getPage(slug: string): Promise<WPPage | null> {
  try {
    const pages = await wpFetch<WPPage[]>(
      `/wp/v2/pages${qs({ slug, _embed: 1, per_page: 1 })}`,
      { revalidate: 300, tags: ["wordpress", "pages", `page:${slug}`] },
    );

    return pages[0] ?? null;
  } catch (error) {
    if (error instanceof WordPressError && error.status === 404) return null;
    throw error;
  }
}

export async function getCategories(): Promise<WPTerm[]> {
  return wpFetch<WPTerm[]>(`/wp/v2/categories${qs({ per_page: 100 })}`, {
    revalidate: 300,
    tags: ["wordpress", "categories"],
  });
}

export async function getNavPages(): Promise<WPNavPage[]> {
  return wpFetch<WPNavPage[]>(
    `/wp/v2/pages${qs({
      parent: 0,
      orderby: "menu_order",
      order: "asc",
      per_page: 20,
      _fields: "id,slug,title,menu_order",
    })}`,
    { revalidate: 300, tags: ["wordpress", "pages", "nav"] },
  );
}

export async function getAuthor(id: number): Promise<WPAuthor | null> {
  try {
    return await wpFetch<WPAuthor>(`/wp/v2/users/${id}`, {
      revalidate: 300,
      tags: ["wordpress", `author:${id}`],
    });
  } catch {
    return null;
  }
}
