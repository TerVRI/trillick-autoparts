export interface MaintenanceItem {
  item: string;
  intervalMiles: number;
  intervalMonths: number;
  searchTerms: string[];
}

export const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  { item: "Engine oil & filter", intervalMiles: 10000, intervalMonths: 12, searchTerms: ["oil filter", "engine oil"] },
  { item: "Air filter", intervalMiles: 20000, intervalMonths: 24, searchTerms: ["air filter"] },
  { item: "Fuel filter (diesel)", intervalMiles: 30000, intervalMonths: 24, searchTerms: ["fuel filter"] },
  { item: "Brake fluid", intervalMiles: 30000, intervalMonths: 24, searchTerms: ["brake fluid"] },
  { item: "Coolant", intervalMiles: 60000, intervalMonths: 48, searchTerms: ["coolant", "antifreeze"] },
  { item: "Timing belt/chain check", intervalMiles: 60000, intervalMonths: 60, searchTerms: ["timing belt", "timing chain"] },
  { item: "Spark plugs (petrol)", intervalMiles: 30000, intervalMonths: 36, searchTerms: ["spark plug"] },
  { item: "Transmission fluid", intervalMiles: 60000, intervalMonths: 48, searchTerms: ["transmission fluid", "ATF"] },
  { item: "Transfer box oil", intervalMiles: 30000, intervalMonths: 36, searchTerms: ["transfer box oil"] },
  { item: "Diff oil front/rear", intervalMiles: 30000, intervalMonths: 36, searchTerms: ["diff oil", "EP90"] },
];

export function maintenanceDue(
  currentMiles: number,
  lastServiceMiles: number,
  monthsSinceService: number
): { item: MaintenanceItem; due: boolean; reason: string }[] {
  const milesSince = currentMiles - lastServiceMiles;
  return MAINTENANCE_ITEMS.map((item) => {
    const milesDue = milesSince >= item.intervalMiles;
    const timeDue = monthsSinceService >= item.intervalMonths;
    const due = milesDue || timeDue;
    const reason = milesDue && timeDue
      ? "Due by mileage and time"
      : milesDue
        ? "Due by mileage"
        : timeDue
          ? "Due by time"
          : "OK";
    return { item, due, reason };
  });
}
