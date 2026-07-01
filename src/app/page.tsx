import Link from "next/link";
import { getCatalogStats, getCategories } from "@/lib/catalog";
import { BRITPART_CATEGORIES } from "@/lib/types";
import { Truck, Package, Globe, Shield } from "lucide-react";
import { HomeToolsSection } from "@/components/tools/HomeToolsSection";

export default function HomePage() {
  const stats = getCatalogStats();
  const categories = getCategories();

  const featured = BRITPART_CATEGORIES.slice(0, 6);

  return (
    <div>
      <section className="relative bg-stone-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <p className="text-amber-400 font-medium mb-2">Specialists in Land Rover Spares</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase max-w-2xl">
            Trillick Auto Parts Centre
          </h1>
          <p className="mt-4 max-w-xl text-stone-300 text-lg">
            Over {stats.total.toLocaleString()} Britpart accessories in our catalogue. Defender,
            Discovery, Freelander and Range Rover parts — delivered across the UK, Ireland and
            worldwide.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/britpart"
              className="rounded-lg bg-amber-600 px-6 py-3 font-semibold hover:bg-amber-500"
            >
              Browse All Parts
            </Link>
            <Link
              href="/catalogue"
              className="rounded-lg border border-stone-500 px-6 py-3 font-semibold hover:bg-stone-800"
            >
              Interactive Catalogue
            </Link>
            <Link
              href="/tools"
              className="rounded-lg border border-amber-500 bg-amber-600/20 px-6 py-3 font-semibold hover:bg-amber-600/30"
            >
              Adventure Tools
            </Link>
          </div>
        </div>
      </section>

      <HomeToolsSection />

      <section className="border-b border-stone-200 bg-amber-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {[
            { icon: Truck, text: "Free delivery UK & NI on orders over £75" },
            { icon: Package, text: "Over 20,000 lines in stock" },
            { icon: Globe, text: "Worldwide delivery" },
            { icon: Shield, text: "Britpart 24-month guarantee" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-stone-700">
              <Icon className="h-5 w-5 shrink-0 text-amber-700" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold uppercase mb-6">Shop by Category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((cat) => {
            const count = categories.find((c) => c.slug === cat.slug)?.count || 0;
            return (
              <Link
                key={cat.slug}
                href={`/britpart/${cat.slug}`}
                className="group rounded-lg border border-stone-200 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg group-hover:text-amber-800 capitalize">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-stone-500">{count.toLocaleString()} parts</p>
              </Link>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <Link href="/britpart" className="text-amber-700 font-medium hover:underline">
            View all {stats.categories} categories →
          </Link>
        </div>
      </section>

      <section className="bg-stone-100 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold uppercase mb-4">
            Trillick Auto Parts Centre
          </h2>
          <p className="text-stone-600 leading-relaxed">
            Trillick Auto Parts Centre is a family-run business based in Northern Ireland,
            specialising in Land Rover spares, parts, and accessories. We supply components for
            Defender, Discovery, Freelander, and Range Rover. Browse our full Britpart catalogue
            online, then order directly or get in touch by WhatsApp, email, or phone.
          </p>
          <Link href="/about" className="mt-4 inline-block text-amber-700 font-medium hover:underline">
            Learn more about us
          </Link>
        </div>
      </section>
    </div>
  );
}
