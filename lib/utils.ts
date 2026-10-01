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

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const isHex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(
        isHex ? entity.slice(2) : entity.slice(1),
        isHex ? 16 : 10,
      );
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }

    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}
