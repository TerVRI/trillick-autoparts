export interface SymptomEntry {
  id: string;
  label: string;
  checks: string[];
  relatedCategories: string[];
  searchTerms: string[];
}

export const SYMPTOMS: SymptomEntry[] = [
  { id: "misfire", label: "Engine misfire / rough running", checks: ["Check spark plugs and coils", "Scan for P030x codes", "Check for vacuum leaks", "Inspect fuel filter"], relatedCategories: ["repair-and-service-parts", "consumables"], searchTerms: ["spark plug", "coil", "filter"] },
  { id: "no-start", label: "Won't start / hard starting", checks: ["Check battery voltage", "Test starter motor", "Check fuel supply", "Glow plugs (diesel)"], relatedCategories: ["repair-and-service-parts", "lucas-and-girling-classic"], searchTerms: ["starter", "battery", "glow plug"] },
  { id: "overheat", label: "Overheating", checks: ["Check coolant level", "Test thermostat", "Inspect water pump", "Check radiator for blockages"], relatedCategories: ["repair-and-service-parts", "consumables"], searchTerms: ["coolant", "thermostat", "radiator"] },
  { id: "brake-warning", label: "Brake warning light", checks: ["Check brake fluid level", "Inspect pads and discs", "Check ABS sensor wiring", "Handbrake adjustment"], relatedCategories: ["repair-and-service-parts", "lucas-and-girling-classic"], searchTerms: ["brake pad", "disc", "ABS"] },
  { id: "suspension-noise", label: "Suspension clunk / wander", checks: ["Inspect bushings and links", "Check shock absorbers", "Ball joint play", "Wheel bearing"], relatedCategories: ["suspension-and-axle", "repair-and-service-parts"], searchTerms: ["bush", "shock", "ball joint"] },
  { id: "oil-leak", label: "Oil leak", checks: ["Identify leak location", "Check sump gasket", "Rocker cover gasket", "Oil cooler seals"], relatedCategories: ["repair-and-service-parts", "consumables"], searchTerms: ["gasket", "seal", "sump"] },
  { id: "4wd-fault", label: "4WD / diff lock not engaging", checks: ["Check actuator vacuum/electric", "Transfer box oil level", "Centre diff fuse", "HDC fault codes"], relatedCategories: ["off-road", "repair-and-service-parts"], searchTerms: ["transfer box", "actuator", "diff"] },
  { id: "electrical", label: "Electrical gremlins / flat battery", checks: ["Load test battery", "Alternator output", "Parasitic drain test", "Earth point corrosion"], relatedCategories: ["lucas-and-girling-classic", "repair-and-service-parts", "tools"], searchTerms: ["battery", "alternator", "wiring"] },
];
