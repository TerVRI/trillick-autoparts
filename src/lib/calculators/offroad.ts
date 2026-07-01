/** Off-road calculator formulas */

export function tyrePressureByTerrain(
  roadPsi: number,
  terrain: "gravel" | "sand" | "mud" | "rocks"
): number {
  const factors = { gravel: 0.85, sand: 0.65, mud: 0.7, rocks: 0.75 };
  return Math.round(roadPsi * factors[terrain]);
}

export function speedometerError(oldDiameter: number, newDiameter: number): number {
  if (oldDiameter <= 0) return 0;
  return ((newDiameter - oldDiameter) / oldDiameter) * 100;
}

export function effectiveGearRatio(axleRatio: number, oldDia: number, newDia: number): number {
  return axleRatio * (oldDia / newDia);
}

export function suggestedRegear(currentRatio: number, oldDia: number, newDia: number): number {
  const target = currentRatio * (oldDia / newDia);
  const common = [3.07, 3.31, 3.54, 3.73, 3.91, 4.1, 4.27, 4.56, 4.88, 5.13, 5.38];
  return common.reduce((best, r) =>
    Math.abs(r - target) < Math.abs(best - target) ? r : best
  );
}

export function tyreDiameterFromMetric(width: number, aspect: number, rim: number): number {
  return (width * (aspect / 100) * 2) / 25.4 + rim;
}

export function winchPullRequired(
  vehicleWeightKg: number,
  slopeDegrees: number,
  surfaceFactor: number
): number {
  const slopeRad = (slopeDegrees * Math.PI) / 180;
  const pull = vehicleWeightKg * (Math.sin(slopeRad) + surfaceFactor * Math.cos(slopeRad));
  return Math.ceil(pull * 1.5); // 1.5x safety factor → kg, treat as lb equivalent scale
}

export function kineticRopeRating(vehicleWeightKg: number): { min: number; max: number } {
  const min = Math.ceil(vehicleWeightKg * 2);
  const max = Math.ceil(vehicleWeightKg * 3);
  return { min, max };
}

export function approachAngle(wheelbase: number, frontOverhang: number, rideHeight: number): number {
  if (frontOverhang <= 0) return 0;
  return Math.round((Math.atan(rideHeight / frontOverhang) * 180) / Math.PI);
}

export function departureAngle(wheelbase: number, rearOverhang: number, rideHeight: number): number {
  if (rearOverhang <= 0) return 0;
  return Math.round((Math.atan(rideHeight / rearOverhang) * 180) / Math.PI);
}

export function breakoverAngle(
  wheelbase: number,
  frontOverhang: number,
  rearOverhang: number,
  rideHeight: number
): number {
  const total = wheelbase + frontOverhang + rearOverhang;
  if (total <= 0 || rideHeight <= 0) return 0;
  return Math.round((Math.atan((2 * rideHeight) / total) * 180) / Math.PI);
}
