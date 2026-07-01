/** Camping & overlanding calculator formulas */

export interface ApplianceLoad {
  name: string;
  watts: number;
  hoursPerDay: number;
  dutyCycle?: number;
}

export function dailyWh(appliances: ApplianceLoad[]): number {
  return appliances.reduce((sum, a) => {
    const duty = a.dutyCycle ?? 1;
    return sum + a.watts * a.hoursPerDay * duty;
  }, 0);
}

export function batteryAhRequired(
  dailyWh: number,
  systemVoltage: number,
  daysAutonomy: number,
  depthOfDischarge: number
): number {
  return Math.ceil((dailyWh / systemVoltage / depthOfDischarge) * daysAutonomy);
}

export function solarWattsRequired(
  dailyWh: number,
  peakSunHours: number,
  efficiency = 0.85
): number {
  if (peakSunHours <= 0) return 0;
  return Math.ceil(dailyWh / (peakSunHours * efficiency));
}

export function waterLitresPerDay(
  crew: number,
  tripDays: number,
  hotWeather: boolean
): { drinking: number; cooking: number; washing: number; total: number } {
  const drinkPerPerson = hotWeather ? 4 : 3;
  const cookingPerPerson = 2;
  const washPerPerson = hotWeather ? 3 : 2;
  const drinking = crew * drinkPerPerson * tripDays;
  const cooking = crew * cookingPerPerson * tripDays;
  const washing = crew * washPerPerson * tripDays;
  return { drinking, cooking, washing, total: drinking + cooking + washing };
}

export function payloadRemaining(
  gvm: number,
  kerbWeight: number,
  passengersKg: number,
  cargoKg: number
): { used: number; remaining: number; percent: number } {
  const used = kerbWeight + passengersKg + cargoKg;
  const remaining = gvm - used;
  const percent = gvm > 0 ? Math.round((used / gvm) * 100) : 0;
  return { used, remaining, percent };
}

export function tripChecklist(
  tripDays: number,
  terrain: string,
  season: string
): string[] {
  const base = [
    "Spare wheel & jack",
    "Tyre repair kit / compressor",
    "Recovery straps & shackles",
    "First aid kit",
    "Fire extinguisher",
    "Tool kit & spanners",
    "Engine oil (1L spare)",
    "Coolant top-up",
    "Maps / offline navigation",
    "Vehicle documents & insurance",
  ];
  if (tripDays > 3) {
    base.push("Extra fuel capacity", "Camp stove & fuel", "Sleeping setup", "Water containers");
  }
  if (terrain.includes("sand") || terrain.includes("mud")) {
    base.push("Traction boards", "Shovel", "Tyre deflator", "Kinetic rope");
  }
  if (season === "winter") {
    base.push("Warm layers", "Emergency blanket", "Anti-freeze check", "Battery check");
  }
  return base;
}

export function gearListItems(
  tripLength: "weekend" | "week" | "expedition",
  terrain: string
): { category: string; items: string[] }[] {
  const recovery = ["Recovery straps", "Soft shackles", "Kinetic rope", "Snatch block", "Shackles rated", "Gloves", "Hi-Lift jack or bottle jack"];
  const camping = ["Roof tent or ground tent", "Sleeping bags", "Camp chairs", "Camp stove", "Coolbox or fridge", "Head torches", "Bin bags"];
  const vehicle = ["Spare belts", "Fuses", "Bulbs", "Duct tape", "Cable ties", "Multimeter", "Jump leads"];
  const admin = ["Driving licence", "Insurance docs", "Breakdown cover", "First aid cert", "Emergency contacts"];

  if (tripLength === "weekend") {
    recovery.splice(3);
    camping.splice(4);
  }
  if (terrain.includes("rock")) {
    recovery.push("Rock sliders check", "Underbody protection check");
  }
  return [
    { category: "Recovery", items: recovery },
    { category: "Camping", items: camping },
    { category: "Vehicle Spares", items: vehicle },
    { category: "Documents", items: admin },
  ];
}
