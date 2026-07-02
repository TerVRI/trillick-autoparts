import Image from "next/image";
import { getSiteImage, type SiteImageKey } from "@/lib/site-images";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  imageKey?: SiteImageKey;
  compact?: boolean;
}

export function PageBanner({ title, subtitle, imageKey = "genericBanner", compact = false }: PageBannerProps) {
  const image = getSiteImage(imageKey);
  const heightClass = compact ? "h-40 md:h-48" : "h-48 md:h-56";

  return (
    <section className={`relative ${heightClass} overflow-hidden bg-stone-900`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/60 to-stone-900/45" />
      <div className="relative flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-6 md:pb-8">
          <h1 className="font-display text-3xl font-bold uppercase text-white md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-stone-200">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
