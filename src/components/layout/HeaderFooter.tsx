import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { BRITPART_CATEGORIES } from "@/lib/types";
import { SearchBar } from "@/components/SearchBar";
import { CartButton } from "@/components/CartButton";
import { VehicleSelector } from "@/components/VehicleSelector";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="bg-stone-900 text-stone-100 text-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <p className="hidden sm:block">
            EU Customer Notice: Shipping from Northern Ireland — No Import Duties
            Shall Apply (NI Protocol)
          </p>
          <div className="flex items-center gap-4 ml-auto">
            <a href="tel:02889561897" className="flex items-center gap-1 hover:text-amber-400">
              <Phone className="h-3.5 w-3.5" />
              028 8956 1897
            </a>
            <a href="mailto:info@trillickautoparts.com" className="hidden md:flex items-center gap-1 hover:text-amber-400">
              <Mail className="h-3.5 w-3.5" />
              info@trillickautoparts.com
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-stone-900 uppercase">
              Trillick Auto Parts
            </span>
            <span className="text-xs text-stone-500">
              Land Rover Spares, Parts &amp; Accessories
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-3 min-w-[200px] max-w-xl">
            <SearchBar />
            <CartButton />
          </div>
        </div>
        <div className="mt-3">
          <VehicleSelector compact />
        </div>
      </div>

      <nav className="border-t border-stone-100 bg-stone-50">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <ul className="flex gap-1 py-2 text-sm whitespace-nowrap">
            <li>
              <Link href="/britpart" className="rounded px-3 py-1.5 font-medium text-stone-800 hover:bg-amber-100 hover:text-amber-900">
                All Parts
              </Link>
            </li>
            {BRITPART_CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/britpart/${cat.slug}`}
                  className="rounded px-3 py-1.5 text-stone-600 hover:bg-amber-100 hover:text-amber-900 capitalize"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-bold text-white uppercase mb-3">
            Trillick Auto Parts Centre
          </h3>
          <p className="text-sm leading-relaxed">
            Family-run business in Northern Ireland, specialising in Land Rover
            spares, parts, and accessories for Defender, Discovery, Freelander,
            and Range Rover.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-amber-400">About Us</Link></li>
            <li><Link href="/catalogue" className="hover:text-amber-400">Britpart Catalogue</Link></li>
            <li><Link href="/delivery" className="hover:text-amber-400">Delivery</Link></li>
            <li><Link href="/returns" className="hover:text-amber-400">Returns Policy</Link></li>
            <li><Link href="/faqs" className="hover:text-amber-400">FAQs</Link></li>
            <li><Link href="/contact" className="hover:text-amber-400">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              53 Effernan Rd, Trillick, Omagh, BT78 3SG, Co. Tyrone, UK
            </li>
            <li><a href="tel:02889561897" className="hover:text-amber-400">Tel: 028 8956 1897</a></li>
            <li><a href="mailto:info@trillickautoparts.com" className="hover:text-amber-400">info@trillickautoparts.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Trillick Auto Parts. All rights reserved.
      </div>
    </footer>
  );
}
