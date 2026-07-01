export interface BuildType {
  id: string;
  label: string;
  description: string;
  categories: string[];
  items: string[];
  searchTerms: string[];
}

export const BUILD_TYPES: BuildType[] = [
  {
    id: "greenlaning",
    label: "Weekend Greenlaning",
    description: "Tyres, basic recovery, and protection for trail days.",
    categories: ["wheels", "off-road", "winching", "tools"],
    items: ["All-terrain tyres", "Compressor & deflator", "Recovery straps", "Traction boards", "Underbody protection"],
    searchTerms: ["tyre", "recovery", "strap", "compressor"],
  },
  {
    id: "overlanding",
    label: "Overlanding / Camping",
    description: "Roof storage, power, lighting, and camp setup.",
    categories: ["camping", "racks-and-roll-cages", "lighting", "tools"],
    items: ["Roof rack / tent", "12V fridge setup", "Aux battery & solar", "LED camp lights", "Water storage"],
    searchTerms: ["roof", "camping", "light", "rack"],
  },
  {
    id: "recovery",
    label: "Recovery-Ready",
    description: "Winch, ropes, shackles, and recovery points.",
    categories: ["winching", "off-road", "towing", "tools"],
    items: ["Winch (rated for vehicle)", "Kinetic rope", "Soft shackles", "Snatch block", "Recovery hitch"],
    searchTerms: ["winch", "kinetic", "shackle", "recovery"],
  },
  {
    id: "lighting",
    label: "Lighting Upgrade",
    description: "Driving lights, work lights, and wiring.",
    categories: ["lighting", "tools", "consumables"],
    items: ["LED light bar or driving lamps", "Wiring harness & relay", "Switch panel", "Fuses & connectors"],
    searchTerms: ["light", "LED", "lamp", "switch"],
  },
  {
    id: "audio",
    label: "Audio / Entertainment",
    description: "Head unit, speakers, wiring, and deadening.",
    categories: ["enhancements", "interior-protection", "tools"],
    items: ["Head unit (CarPlay/Android Auto)", "Speaker upgrade", "Sound deadening", "Wiring kit"],
    searchTerms: ["radio", "speaker", "enhancement", "wiring"],
  },
  {
    id: "service",
    label: "Service Refresh",
    description: "Filters, fluids, belts, and service kits.",
    categories: ["service-kits", "consumables", "repair-and-service-parts"],
    items: ["Service kit (oil + filters)", "Brake fluid", "Coolant", "Wiper blades", "Bulbs"],
    searchTerms: ["service kit", "filter", "oil", "fluid"],
  },
  {
    id: "towing",
    label: "Towing Setup",
    description: "Tow bars, electrics, and load accessories.",
    categories: ["towing", "racks-and-roll-cages", "tools"],
    items: ["Tow bar & electrics", "Extended mirrors", "Load bars", "Recovery hitch"],
    searchTerms: ["tow", "towing", "hitch", "bar"],
  },
];

export interface BuildConfig {
  buildType: string;
  vehicle: string;
  budget: string;
  notes: string;
}

export function encodeBuildConfig(config: BuildConfig): string {
  return btoa(JSON.stringify(config));
}

export function decodeBuildConfig(encoded: string): BuildConfig | null {
  try {
    return JSON.parse(atob(encoded)) as BuildConfig;
  } catch {
    return null;
  }
}
