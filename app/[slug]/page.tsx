import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/api";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) return { title: "Page not found" };

  return {
    title: page.title.rendered,
    description: page.excerpt?.rendered.replace(/<[^>]*>/g, "").trim(),
  };
}

export default async function WordPressPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) notFound();

  return (
    <article className="flex flex-col gap-6">
      <h1 className="text-4xl font-semibold tracking-tight">
        {page.title.rendered}
      </h1>

      <div
        className="prose-wp"
        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
      />
    </article>
  );
}
