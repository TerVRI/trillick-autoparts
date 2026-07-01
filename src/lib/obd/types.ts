/** Core OBD-II dashboard types */

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export type TransportKind = "simulator" | "web-serial" | "webusb";

export type ObdMode = "01" | "02" | "03" | "04" | "07" | "09";

export interface AdapterInfo {
  kind: TransportKind;
  label: string;
  firmware?: string;
  protocol?: string;
  baudRate?: number;
}

export interface LivePidValue {
  pid: string;
  label: string;
  unit: string;
  value: number | null;
  raw?: string;
  supported: boolean;
  updatedAt: number;
}

export interface DtcRecord {
  code: string;
  type: "stored" | "pending";
  description?: string;
}

export interface ReadinessMonitor {
  id: string;
  label: string;
  status: "complete" | "incomplete" | "not_supported" | "unknown";
}

export interface VehicleSnapshot {
  timestamp: number;
  rpm: number | null;
  speedKph: number | null;
  coolantC: number | null;
  intakeTempC: number | null;
  throttlePct: number | null;
  engineLoadPct: number | null;
  fuelTrimPct: number | null;
  mafGps: number | null;
  mapKpa: number | null;
  voltage: number | null;
}

export interface DiagnosticSnapshot {
  vin: string | null;
  dtcs: DtcRecord[];
  readiness: ReadinessMonitor[];
  adapter: AdapterInfo | null;
}

export interface SessionSample extends VehicleSnapshot {
  dtcs: string[];
}

export interface ObdSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  transport: TransportKind;
  vehicleProfileId?: string;
  samples: SessionSample[];
}

export interface VehicleModification {
  id: string;
  category: "engine" | "suspension" | "tyres" | "recovery" | "electrical" | "other";
  label: string;
  notes?: string;
}

export interface MaintenanceEntry {
  id: string;
  date: string;
  mileage?: number;
  title: string;
  notes?: string;
}

export interface TyreSetup {
  size: string;
  roadPsi: number;
  offRoadPsi: number;
}

export interface VehicleProfile {
  id: string;
  label: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  trim: string;
  fuelType: "petrol" | "diesel" | "hybrid" | "other";
  mileage?: number;
  vin?: string;
  mods: VehicleModification[];
  maintenance: MaintenanceEntry[];
  tyres: TyreSetup;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSupport {
  webSerial: boolean;
  webBluetooth: boolean;
  webUsb: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  recommendedTransport: TransportKind | null;
  warnings: string[];
}

export interface InsightSummary {
  overall: "good" | "attention" | "critical";
  headline: string;
  bullets: string[];
  anomalies: string[];
}
