import { lookupDtc } from "../dtc-codes";
import { expectedRanges } from "./vehicle-profile";
import type { DiagnosticSnapshot, InsightSummary, VehicleProfile, VehicleSnapshot } from "./types";

export function buildInsights(
  snapshot: VehicleSnapshot,
  diagnostics: DiagnosticSnapshot,
  profile: VehicleProfile | null,
  previousSnapshot?: VehicleSnapshot | null,
): InsightSummary {
  const bullets: string[] = [];
  const anomalies: string[] = [];
  let overall: InsightSummary["overall"] = "good";

  const storedCount = diagnostics.dtcs.filter((d) => d.type === "stored").length;
  const pendingCount = diagnostics.dtcs.filter((d) => d.type === "pending").length;

  if (storedCount > 0) {
    overall = storedCount >= 2 ? "critical" : "attention";
    bullets.push(`${storedCount} stored fault code${storedCount > 1 ? "s" : ""} — review before long trips.`);
  } else {
    bullets.push("No stored fault codes detected.");
  }

  if (pendingCount > 0) {
    overall = overall === "good" ? "attention" : overall;
    bullets.push(`${pendingCount} pending code${pendingCount > 1 ? "s" : ""} — monitor on next drive.`);
  }

  const incomplete = diagnostics.readiness.filter((m) => m.status === "incomplete");
  if (incomplete.length > 0) {
    bullets.push(`${incomplete.length} emissions monitor(s) not complete — may affect MOT/smog readiness.`);
    if (overall === "good") overall = "attention";
  } else if (diagnostics.readiness.length > 0) {
    bullets.push("Emissions readiness monitors look complete.");
  }

  if (profile) {
    bullets.push(`Profile: ${profile.year} ${profile.model} with ${profile.mods.length} mod(s) tracked.`);
    const ranges = expectedRanges(profile.fuelType);

    if (snapshot.coolantC !== null) {
      if (snapshot.coolantC < ranges.coolantC.min) {
        anomalies.push(`Coolant ${snapshot.coolantC.toFixed(0)}°C — below normal warm-up range.`);
        overall = "attention";
      } else if (snapshot.coolantC > ranges.coolantC.max) {
        anomalies.push(`Coolant ${snapshot.coolantC.toFixed(0)}°C — running hot.`);
        overall = "critical";
      }
    }

    if (snapshot.voltage !== null && (snapshot.voltage < ranges.voltage.min || snapshot.voltage > ranges.voltage.max)) {
      anomalies.push(`Voltage ${snapshot.voltage.toFixed(1)}V — check battery/alternator.`);
      if (overall !== "critical") overall = "attention";
    }

    if (snapshot.fuelTrimPct !== null && Math.abs(snapshot.fuelTrimPct) > 15) {
      anomalies.push(`Fuel trim ${snapshot.fuelTrimPct.toFixed(1)}% — possible vacuum or sensor issue.`);
      if (overall !== "critical") overall = "attention";
    }

    if (snapshot.rpm !== null && snapshot.speedKph !== null && snapshot.speedKph < 5) {
      if (snapshot.rpm < ranges.idleRpm.min || snapshot.rpm > ranges.idleRpm.max) {
        anomalies.push(`Idle RPM ${Math.round(snapshot.rpm)} — outside typical range for ${profile.fuelType}.`);
      }
    }
  }

  if (previousSnapshot && snapshot.coolantC !== null && previousSnapshot.coolantC !== null) {
    const delta = snapshot.coolantC - previousSnapshot.coolantC;
    if (Math.abs(delta) >= 5) {
      bullets.push(`Coolant changed ${delta > 0 ? "+" : ""}${delta.toFixed(0)}°C since last sample.`);
    }
  }

  for (const dtc of diagnostics.dtcs.slice(0, 3)) {
    const entry = lookupDtc(dtc.code);
    if (entry) {
      bullets.push(`${dtc.code}: ${entry.title} (${entry.severity})`);
    }
  }

  const headline =
    overall === "good"
      ? "Vehicle looks healthy from available OBD data."
      : overall === "attention"
        ? "A few items need attention — review codes and live sensors."
        : "Critical issues detected — address before driving.";

  return { overall, headline, bullets, anomalies };
}
