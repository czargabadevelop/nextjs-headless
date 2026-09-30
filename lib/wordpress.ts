const DEFAULT_WP_URL = "http://localhost:8080";

function baseUrl(): string {
  const raw =
    process.env.WP_JSON_URL ??
    process.env.WORDPRESS_URL ??
    DEFAULT_WP_URL;

  const trimmed = raw.trim().replace(/\/+$/, "");

  if (!trimmed) return DEFAULT_WP_URL;

  return trimmed.endsWith("/wp-json")
    ? trimmed
    : `${trimmed}/wp-json`;
}

export function wordpressUrl(): string {
  return baseUrl();
}

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export class WordPressError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "WordPressError";
  }
}

export async function wpFetch<T>(
  path: string,
  options: NextFetchOptions = {},
): Promise<T> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;

  try {
    response = await fetch(url, {
      next: {
        revalidate: options.revalidate ?? 60,
        tags: options.tags ?? ["wordpress"],
      },
    });
  } catch (error) {
    throw new WordPressError(
      `Could not reach WordPress at ${baseUrl()}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      0,
      path,
    );
  }

  if (!response.ok) {
    throw new WordPressError(
      `WordPress responded ${response.status} for ${path}`,
      response.status,
      path,
    );
  }

  return (await response.json()) as T;
}
