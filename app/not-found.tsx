import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">404</h1>
      <p className="text-neutral-600">
        This content does not exist in WordPress (or it is not published).
      </p>
      <Link
        href="/"
        className="text-sm font-medium underline underline-offset-4"
      >
        Back to all posts
      </Link>
    </section>
  );
}
