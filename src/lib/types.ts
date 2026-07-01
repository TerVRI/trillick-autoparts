export type StockStatus = "in_stock" | "available_to_order" | "quote_required";

export interface Product {
  partNumber: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string | null;
  cataloguePage: number | null;
  vehicles: string[];
  fitmentText: string;
  price: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  onSite: boolean;
  hasImage: boolean;
  hasPrice: boolean;
  purchasable: boolean;
  stockStatus: StockStatus;
}

export interface Category {
  slug: string;
  name: string;
  count: number;
}

export interface CartItem {
  partNumber: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface SavedVehicle {
  id: string;
  label: string;
  model: string;
  year?: string;
}

export interface OrderRecord {
  id: string;
  stripeSessionId?: string;
  status: string;
  customerEmail: string;
  customerName: string;
  shipping: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface QuoteRequest {
  id: string;
  partNumbers: string[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message?: string;
  createdAt: string;
}

export const BRITPART_CATEGORIES = [
  { slug: "camping", name: "Camping" },
  { slug: "chassis-and-body-components", name: "Chassis & Body Components" },
  { slug: "clearance-accessories", name: "Clearance Accessories" },
  { slug: "consumables", name: "Consumables" },
  { slug: "enhancements", name: "Enhancements" },
  { slug: "exterior-protection", name: "Exterior Protection" },
  { slug: "interior-protection", name: "Interior Protection" },
  { slug: "lighting", name: "Lighting" },
  { slug: "lucas-and-girling-classic", name: "Lucas & Girling Classic" },
  { slug: "merchandise", name: "Merchandise" },
  { slug: "miscellaneous", name: "Miscellaneous" },
  { slug: "off-road", name: "Off Road" },
  { slug: "performance", name: "Performance" },
  { slug: "racks-and-roll-cages", name: "Racks & Roll Cages" },
  { slug: "repair-and-service-parts", name: "Repair & Service Parts" },
  { slug: "seats-and-trim", name: "Seats & Trim" },
  { slug: "service-kits", name: "Service Kits" },
  { slug: "side-and-rear-steps", name: "Side & Rear Steps" },
  { slug: "suspension-and-axle", name: "Suspension & Axle" },
  { slug: "tools", name: "Tools" },
  { slug: "towing", name: "Towing" },
  { slug: "wheels", name: "Wheels" },
  { slug: "winching", name: "Winching" },
] as const;

export const LAND_ROVER_MODELS = [
  "Defender 90",
  "Defender 110",
  "Defender 130",
  "Defender",
  "Discovery 1",
  "Discovery 2",
  "Discovery 3",
  "Discovery 4",
  "Discovery 5",
  "Discovery Sport",
  "Freelander 1",
  "Freelander 2",
  "Range Rover Classic",
  "Range Rover Sport",
  "Range Rover",
  "Range Rover Evoque",
  "Range Rover Velar",
  "Series 1",
  "Series 2",
  "Series 2A",
  "Series 3",
] as const;
