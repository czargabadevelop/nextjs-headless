export type WPImageSize = {
  url: string;
  width: number;
  height: number;
};

export type WPMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, WPImageSize | undefined>;
  };
};

export type WPTerm = {
  id: number;
  name: string;
  slug: string;
};

export type WPLink = {
  href: string;
  embeddable?: boolean;
};

export type WPAuthor = {
  id: number;
  name: string;
  slug: string;
};

export type WPPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string; protected: boolean };
  featured_media: number;
  author: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    "wp:featuredmedia"?: WPMedia[];
    "wp:term"?: WPTerm[][];
    author?: WPAuthor[];
  };
};

export type WPPage = Omit<
  WPPost,
  "categories" | "tags" | "excerpt" | "featured_media" | "author"
> & {
 excerpt?: { rendered: string; protected: boolean };
};
