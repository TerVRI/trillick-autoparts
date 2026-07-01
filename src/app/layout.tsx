import type { Metadata } from "next";
import { Fjalla_One, Roboto } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@/components/layout/HeaderFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieConsent } from "@/components/CookieConsent";

const fjalla = Fjalla_One({
  weight: "400",
  variable: "--font-fjalla",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Trillick Auto Parts | Land Rover Spares & Parts",
    template: "%s | Trillick Auto Parts",
  },
  description:
    "Trillick Auto Parts Centre — specialists in Land Rover spares, parts and accessories. Defender, Discovery, Freelander and Range Rover. NI based, UK & worldwide delivery.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fjalla.variable} ${roboto.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
          <WhatsAppButton />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
