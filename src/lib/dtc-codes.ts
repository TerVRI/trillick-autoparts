export interface DtcEntry {
  code: string;
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
  likelyCauses: string[];
  relatedCategories: string[];
  searchTerms: string[];
}

export const DTC_CODES: DtcEntry[] = [
  { code: "P0300", title: "Random/Multiple Cylinder Misfire", severity: "high", description: "Engine is misfiring on multiple cylinders.", likelyCauses: ["Worn spark plugs", "Ignition coils", "Vacuum leak", "Low fuel pressure"], relatedCategories: ["repair-and-service-parts", "consumables", "performance"], searchTerms: ["spark plug", "coil", "ignition"] },
  { code: "P0301", title: "Cylinder 1 Misfire", severity: "high", description: "Misfire detected on cylinder 1.", likelyCauses: ["Faulty coil pack", "Spark plug", "Injector", "Compression issue"], relatedCategories: ["repair-and-service-parts"], searchTerms: ["coil", "spark plug"] },
  { code: "P0420", title: "Catalyst System Efficiency Below Threshold", severity: "medium", description: "Catalytic converter not performing efficiently.", likelyCauses: ["Failing cat", "Exhaust leak", "O2 sensor fault"], relatedCategories: ["repair-and-service-parts", "performance"], searchTerms: ["catalyst", "lambda", "exhaust"] },
  { code: "P0171", title: "System Too Lean (Bank 1)", severity: "medium", description: "Air-fuel mixture too lean on bank 1.", likelyCauses: ["Vacuum leak", "MAF sensor", "Fuel pump/filter", "Injector issue"], relatedCategories: ["repair-and-service-parts", "consumables"], searchTerms: ["filter", "sensor", "fuel"] },
  { code: "P0174", title: "System Too Lean (Bank 2)", severity: "medium", description: "Air-fuel mixture too lean on bank 2.", likelyCauses: ["Vacuum leak", "MAF sensor", "Fuel delivery issue"], relatedCategories: ["repair-and-service-parts"], searchTerms: ["filter", "sensor"] },
  { code: "P0401", title: "EGR Flow Insufficient", severity: "medium", description: "Exhaust gas recirculation flow below expected.", likelyCauses: ["Blocked EGR valve", "Carbon buildup", "Vacuum hose"], relatedCategories: ["repair-and-service-parts"], searchTerms: ["EGR", "valve"] },
  { code: "P0128", title: "Coolant Thermostat", severity: "low", description: "Engine not reaching operating temperature in time.", likelyCauses: ["Stuck-open thermostat", "Low coolant", "Coolant sensor"], relatedCategories: ["repair-and-service-parts", "consumables"], searchTerms: ["thermostat", "coolant"] },
  { code: "P0217", title: "Engine Over Temperature", severity: "high", description: "Engine coolant temperature above safe limit.", likelyCauses: ["Low coolant", "Failed water pump", "Thermostat", "Radiator blockage"], relatedCategories: ["repair-and-service-parts", "consumables"], searchTerms: ["coolant", "radiator", "water pump"] },
  { code: "P0562", title: "System Voltage Low", severity: "medium", description: "ECU detecting low system voltage.", likelyCauses: ["Weak battery", "Alternator fault", "Poor earth connection"], relatedCategories: ["repair-and-service-parts", "lucas-and-girling-classic"], searchTerms: ["battery", "alternator"] },
  { code: "P0700", title: "Transmission Control System", severity: "high", description: "General transmission fault detected.", likelyCauses: ["Low ATF", "Solenoid fault", "Internal wear"], relatedCategories: ["repair-and-service-parts", "consumables"], searchTerms: ["transmission", "gearbox"] },
  { code: "P0730", title: "Incorrect Gear Ratio", severity: "high", description: "Transmission gear ratio not as expected.", likelyCauses: ["Low fluid", "Clutch pack wear", "Sensor fault"], relatedCategories: ["repair-and-service-parts"], searchTerms: ["transmission", "gearbox"] },
  { code: "C0035", title: "Left Front Wheel Speed Sensor", severity: "medium", description: "ABS/traction wheel speed sensor circuit fault.", likelyCauses: ["Damaged sensor", "Wiring", "Reluctor ring"], relatedCategories: ["repair-and-service-parts"], searchTerms: ["ABS", "sensor", "brake"] },
  { code: "P0500", title: "Vehicle Speed Sensor", severity: "medium", description: "No signal from vehicle speed sensor.", likelyCauses: ["VSS failure", "Wiring", "Instrument cluster"], relatedCategories: ["repair-and-service-parts", "lucas-and-girling-classic"], searchTerms: ["speed sensor"] },
  { code: "P0101", title: "MAF Sensor Range/Performance", severity: "medium", description: "Mass airflow sensor reading out of range.", likelyCauses: ["Dirty MAF", "Air leak after MAF", "Sensor failure"], relatedCategories: ["repair-and-service-parts"], searchTerms: ["MAF", "air filter"] },
  { code: "P0118", title: "Engine Coolant Temperature High", severity: "high", description: "ECT sensor reading high voltage / low temp signal fault.", likelyCauses: ["Sensor fault", "Wiring", "Actual overheating"], relatedCategories: ["repair-and-service-parts"], searchTerms: ["coolant sensor", "thermostat"] },
];

export function lookupDtc(code: string): DtcEntry | undefined {
  const normalized = code.trim().toUpperCase();
  return DTC_CODES.find((d) => d.code === normalized);
}
