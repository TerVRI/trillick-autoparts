export interface ToolRecommendation {
  label: string;
  href: string;
  searchQuery?: string;
}

export const CATEGORY_LINKS: Record<string, string> = {
  "wheels": "/britpart/wheels",
  "suspension-and-axle": "/britpart/suspension-and-axle",
  "winching": "/britpart/winching",
  "off-road": "/britpart/off-road",
  "towing": "/britpart/towing",
  "camping": "/britpart/camping",
  "racks-and-roll-cages": "/britpart/racks-and-roll-cages",
  "lighting": "/britpart/lighting",
  "tools": "/britpart/tools",
  "consumables": "/britpart/consumables",
  "enhancements": "/britpart/enhancements",
  "interior-protection": "/britpart/interior-protection",
  "repair-and-service-parts": "/britpart/repair-and-service-parts",
  "service-kits": "/britpart/service-kits",
  "lucas-and-girling-classic": "/britpart/lucas-and-girling-classic",
  "performance": "/britpart/performance",
};

export function recommendationsFromCategories(categories: string[]): ToolRecommendation[] {
  return categories
    .filter((c) => CATEGORY_LINKS[c])
    .map((c) => ({
      label: c.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      href: CATEGORY_LINKS[c],
    }));
}

export function recommendationsFromSearchTerms(terms: string[]): ToolRecommendation[] {
  return terms.map((t) => ({
    label: `Search: ${t}`,
    href: `/search?q=${encodeURIComponent(t)}`,
    searchQuery: t,
  }));
}

export function offRoadRecommendations(tool: string): ToolRecommendation[] {
  const map: Record<string, string[]> = {
    "tyre-pressure": ["wheels", "off-road"],
    "tyre-gear": ["wheels", "suspension-and-axle", "performance"],
    winch: ["winching", "off-road", "tools"],
    "kinetic-rope": ["winching", "towing", "off-road"],
    geometry: ["suspension-and-axle", "off-road"],
  };
  return recommendationsFromCategories(map[tool] ?? ["off-road"]);
}

export function campingRecommendations(tool: string): ToolRecommendation[] {
  const map: Record<string, string[]> = {
    trip: ["camping", "tools", "consumables"],
    "gear-list": ["camping", "off-road", "tools", "lighting"],
    payload: ["racks-and-roll-cages", "camping", "towing"],
    water: ["camping", "consumables"],
    power: ["camping", "lighting", "tools"],
  };
  return recommendationsFromCategories(map[tool] ?? ["camping"]);
}

export function entertainmentRecommendations(): ToolRecommendation[] {
  return [
    ...recommendationsFromCategories(["enhancements", "interior-protection", "tools"]),
    ...recommendationsFromSearchTerms(["wiring", "radio", "speaker"]),
  ];
}

export function diagnosticsRecommendations(categories: string[], searchTerms: string[]): ToolRecommendation[] {
  return [
    ...recommendationsFromCategories(categories),
    ...recommendationsFromSearchTerms(searchTerms),
  ];
}
