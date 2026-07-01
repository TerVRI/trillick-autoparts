import { LAND_ROVER_MODELS } from "../types";
import type {
  MaintenanceEntry,
  TyreSetup,
  VehicleModification,
  VehicleProfile,
} from "./types";

export const DEFAULT_TYRE_SETUP: TyreSetup = {
  size: "265/65 R18",
  roadPsi: 36,
  offRoadPsi: 22,
};

export const ENGINE_OPTIONS = [
  "2.0 Td4",
  "2.2 SD4",
  "3.0 SDV6",
  "5.0 V8",
  "TD5",
  "Tdi",
  "Other",
] as const;

export const MOD_CATEGORIES: { id: VehicleModification["category"]; label: string }[] = [
  { id: "engine", label: "Engine & performance" },
  { id: "suspension", label: "Suspension & lift" },
  { id: "tyres", label: "Tyres & wheels" },
  { id: "recovery", label: "Recovery" },
  { id: "electrical", label: "Electrical & camping" },
  { id: "other", label: "Other" },
];

export function createVehicleProfile(partial?: Partial<VehicleProfile>): VehicleProfile {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    label: partial?.label ?? "My Land Rover",
    make: partial?.make ?? "Land Rover",
    model: partial?.model ?? LAND_ROVER_MODELS[0],
    year: partial?.year ?? new Date().getFullYear() - 5,
    engine: partial?.engine ?? ENGINE_OPTIONS[0],
    trim: partial?.trim ?? "SE",
    fuelType: partial?.fuelType ?? "diesel",
    mileage: partial?.mileage,
    vin: partial?.vin,
    mods: partial?.mods ?? [],
    maintenance: partial?.maintenance ?? [],
    tyres: partial?.tyres ?? { ...DEFAULT_TYRE_SETUP },
    notes: partial?.notes,
    createdAt: partial?.createdAt ?? now,
    updatedAt: now,
  };
}

export function addModification(
  profile: VehicleProfile,
  mod: Omit<VehicleModification, "id">,
): VehicleProfile {
  return {
    ...profile,
    mods: [...profile.mods, { ...mod, id: crypto.randomUUID() }],
    updatedAt: new Date().toISOString(),
  };
}

export function addMaintenanceEntry(
  profile: VehicleProfile,
  entry: Omit<MaintenanceEntry, "id">,
): VehicleProfile {
  return {
    ...profile,
    maintenance: [...profile.maintenance, { ...entry, id: crypto.randomUUID() }],
    updatedAt: new Date().toISOString(),
  };
}

export function profileSummary(profile: VehicleProfile): string {
  return `${profile.year} ${profile.make} ${profile.model} · ${profile.engine} · ${profile.trim}`;
}

export function mergeVinIntoProfile(profile: VehicleProfile, vin: string | null): VehicleProfile {
  if (!vin) return profile;
  return {
    ...profile,
    vin,
    updatedAt: new Date().toISOString(),
  };
}

/** Expected sensor ranges by fuel type for anomaly hints */
export function expectedRanges(fuelType: VehicleProfile["fuelType"]) {
  const isDiesel = fuelType === "diesel";
  return {
    coolantC: { min: 80, max: 98, label: "Coolant at operating temp" },
    voltage: { min: 12.2, max: 14.8, label: "System voltage" },
    fuelTrimPct: { min: -15, max: 15, label: "Short fuel trim" },
    idleRpm: { min: isDiesel ? 650 : 700, max: isDiesel ? 900 : 950, label: "Idle RPM" },
  };
}
