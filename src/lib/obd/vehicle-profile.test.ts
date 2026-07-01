import { describe, expect, it } from "vitest";
import {
  createVehicleProfile,
  addModification,
  addMaintenanceEntry,
  profileSummary,
  expectedRanges,
} from "./vehicle-profile";

describe("vehicle-profile", () => {
  it("creates a default Land Rover profile", () => {
    const profile = createVehicleProfile();
    expect(profile.make).toBe("Land Rover");
    expect(profile.model).toBeTruthy();
    expect(profile.tyres.roadPsi).toBeGreaterThan(0);
    expect(profile.id).toBeTruthy();
  });

  it("adds modifications and maintenance", () => {
    let profile = createVehicleProfile();
    profile = addModification(profile, { category: "recovery", label: "Warn winch" });
    profile = addMaintenanceEntry(profile, {
      date: "2026-01-15",
      title: "Oil change",
      mileage: 85000,
    });
    expect(profile.mods).toHaveLength(1);
    expect(profile.maintenance).toHaveLength(1);
  });

  it("formats profile summary", () => {
    const profile = createVehicleProfile({ year: 2018, model: "Defender 110", engine: "2.2 SD4" });
    expect(profileSummary(profile)).toContain("2018");
    expect(profileSummary(profile)).toContain("Defender 110");
  });

  it("provides fuel-type-specific expected ranges", () => {
    const diesel = expectedRanges("diesel");
    const petrol = expectedRanges("petrol");
    expect(diesel.idleRpm.min).toBeLessThan(petrol.idleRpm.min);
  });
});
