import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContentHtml } from "@/components/ContentHtml";
import { PageBanner } from "@/components/PageBanner";
import { getBlogPost, getBlogSlugs } from "@/lib/site-content";

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog" };
  return {
    title: `${post.title} | Trillick Auto Parts`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <div>
      <PageBanner title={post.title} subtitle={post.excerpt} imageKey="genericBanner" compact />
      <article className="mx-auto max-w-3xl px-4 py-12">
        {post.featuredImage && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}
        <ContentHtml html={post.html} />
        <div className="mt-10 border-t border-stone-200 pt-6">
          <Link href="/blog" className="text-amber-700 font-medium hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
