import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const SECRET = process.env.WP_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!SECRET) {
    return NextResponse.json(
      { message: "WP_WEBHOOK_SECRET is not configured" },
      { status: 503 },
    );
  }

  const header = request.headers.get("x-wp-webhook-secret");
  const url = new URL(request.url);
  const query = url.searchParams.get("secret");

  if (header !== SECRET && query !== SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let tag = "posts";

  try {
    const body = (await request.json()) as { tag?: string };
    if (body?.tag) tag = body.tag;
  } catch {
    // body is optional
  }

  revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, tag });
}
