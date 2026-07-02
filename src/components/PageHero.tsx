import Image from "next/image";
import type { ReactNode } from "react";
import { getSiteImage, type SiteImageKey } from "@/lib/site-images";

interface PageHeroProps {
  imageKey?: SiteImageKey;
  children: ReactNode;
}

export function PageHero({ imageKey = "heroHome", children }: PageHeroProps) {
  const image = getSiteImage(imageKey);

  return (
    <section className="relative min-h-[420px] overflow-hidden bg-stone-900 text-white md:min-h-[520px]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/65 to-stone-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">{children}</div>
    </section>
  );
}
