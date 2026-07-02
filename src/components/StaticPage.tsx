import { PageBanner } from "@/components/PageBanner";
import { getStaticPageImageKey, type SiteImageKey } from "@/lib/site-images";

export function StaticPage({
  title,
  children,
  imageKey,
}: {
  title: string;
  children: React.ReactNode;
  imageKey?: SiteImageKey;
}) {
  return (
    <div>
      <PageBanner title={title} imageKey={imageKey ?? getStaticPageImageKey(title)} />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-stone space-y-4 text-stone-600">{children}</div>
      </div>
    </div>
  );
}
