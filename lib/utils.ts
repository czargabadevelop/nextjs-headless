import type { WPMedia, WPPost } from "./types";

export function featuredImage(post: WPPost): WPMedia | null {
  return post._embedded?.["wp:featuredmedia"]?.[0] ?? null;
}

export function postCategories(post: WPPost) {
  return post._embedded?.["wp:term"]?.[0] ?? [];
}

export function postAuthor(post: WPPost) {
  return post._embedded?.author?.[0] ?? null;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function plainExcerpt(post: WPPost): string {
  const raw = post.excerpt.rendered.replace(/<[^>]*>/g, "").trim();
  return raw;
}
