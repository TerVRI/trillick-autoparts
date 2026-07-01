import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <StaticPage title="About Us">
      <p>
        Trillick Auto Parts Centre is a family-run business based in Northern Ireland,
        specialising in Land Rover spares, parts, and accessories. We supply components
        for Defender, Discovery, Freelander, and Range Rover models.
      </p>
      <p>
        Our goal is to provide Land Rover owners and enthusiasts with the right parts,
        exactly when they need them, at competitive prices. We deliver across the UK,
        Ireland, and worldwide.
      </p>
    </StaticPage>
  );
}
