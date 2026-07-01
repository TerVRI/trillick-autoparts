export function calculateShipping(subtotal: number, country: string): number {
  const c = country.toUpperCase();
  if (c === "GB" || c === "UK" || c === "NI") {
    return subtotal >= 75 ? 0 : 6.95;
  }
  if (c === "IE" || c === "IRELAND") {
    return subtotal >= 75 ? 0 : 9.95;
  }
  if (["FR", "DE", "NL", "BE", "ES", "IT", "PT"].includes(c)) {
    return 14.95;
  }
  return 24.95;
}

export function shippingLabel(country: string): string {
  const c = country.toUpperCase();
  if (c === "GB" || c === "UK" || c === "NI") return "UK & Northern Ireland";
  if (c === "IE") return "Ireland";
  if (["FR", "DE", "NL", "BE", "ES", "IT"].includes(c)) return "EU";
  return "Worldwide";
}

export const SHIPPING_COUNTRIES = [
  { code: "GB", label: "United Kingdom" },
  { code: "NI", label: "Northern Ireland" },
  { code: "IE", label: "Ireland" },
  { code: "FR", label: "France" },
  { code: "DE", label: "Germany" },
  { code: "NL", label: "Netherlands" },
  { code: "BE", label: "Belgium" },
  { code: "ES", label: "Spain" },
  { code: "US", label: "United States" },
  { code: "AU", label: "Australia" },
] as const;
