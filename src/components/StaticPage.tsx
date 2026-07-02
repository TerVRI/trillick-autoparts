import { PageBanner } from "@/components/PageBanner";
import { ContentHtml } from "@/components/ContentHtml";
import { getStaticPageImageKey, type SiteImageKey } from "@/lib/site-images";

export function StaticPage({
  title,
  children,
  html,
  imageKey,
}: {
  title: string;
  children?: React.ReactNode;
  html?: string;
  imageKey?: SiteImageKey;
}) {
  return (
    <div>
      <PageBanner title={title} imageKey={imageKey ?? getStaticPageImageKey(title)} />
      <div className="mx-auto max-w-3xl px-4 py-12">
        {html ? <ContentHtml html={html} /> : null}
        {children}
      </div>
    </div>
  );
}
