import type { NextConfig } from "next";

type Pattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
};

function toOrigin(value: string): URL {
  const trimmed = value.trim().replace(/\/+$/, "");
  return new URL(trimmed.endsWith("/wp-json") ? trimmed.slice(0, -8) : trimmed);
}

function patternFromUrl(url: URL): Pattern {
  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port || undefined,
  };
}

const wpOrigin = toOrigin(
  process.env.WP_JSON_URL ?? process.env.WORDPRESS_URL ?? "http://localhost:8080",
);

const extraHosts = (process.env.WP_IMAGE_HOSTS ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) =>
    patternFromUrl(
      toOrigin(entry.includes("://") ? entry : `https://${entry}`),
    ),
  );

const seen = new Set<string>();
const remotePatterns: Pattern[] = [patternFromUrl(wpOrigin), ...extraHosts].filter(
  (pattern) => {
    const key = `${pattern.protocol}://${pattern.hostname}:${pattern.port ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  },
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
