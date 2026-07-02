import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageBanner } from "@/components/PageBanner";
import { getBlogPosts } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Blog | Trillick Auto Parts",
  description: "Land Rover tips, product guides, and news from Trillick Auto Parts Centre.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div>
      <PageBanner
        title="Blog"
        subtitle="Land Rover tips, product guides, and news from Trillick Auto Parts Centre."
        imageKey="genericBanner"
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
            >
              {post.featuredImage && (
                <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] bg-stone-100">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </Link>
              )}
              <div className="p-6">
                <h2 className="font-display text-xl font-bold uppercase text-stone-900">
                  <Link href={`/blog/${post.slug}`} className="hover:text-amber-800">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-stone-600">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-block text-sm font-medium text-amber-700 hover:underline"
                >
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
