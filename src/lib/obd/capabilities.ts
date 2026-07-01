/**
 * v1 read-only MVP capabilities and supported adapter guidance.
 * Stack: Next.js client-side PWA in this repo — no server required for live OBD.
 */

import type { ObdMode, TransportKind } from "./types";

export const MVP_VERSION = "1.0.0";

export const SUPPORTED_ADAPTERS = [
  {
    id: "obdlink-sx-ex",
    name: "OBDLink SX / EX",
    transports: ["web-serial"] as TransportKind[],
    notes: "Recommended — reliable timing and broad PID support.",
  },
  {
    id: "vlinker-vgate",
    name: "vLinker / VGate iCar Pro (USB)",
    transports: ["web-serial", "webusb"] as TransportKind[],
    notes: "Good performance; test baud rate on your device.",
  },
  {
    id: "elm327-usb",
    name: "ELM327 USB (PIC18F25K80)",
    transports: ["web-serial"] as TransportKind[],
    notes: "Avoid cheapest clones; prefer FTDI/CH340 with real ELM327 firmware.",
  },
] as const;

/** Standard OBD-II PIDs polled in v1 */
export const MVP_PIDS = [
  { pid: "0C", label: "Engine RPM", unit: "rpm", mode: "01" as ObdMode },
  { pid: "0D", label: "Vehicle Speed", unit: "km/h", mode: "01" as ObdMode },
  { pid: "05", label: "Coolant Temp", unit: "°C", mode: "01" as ObdMode },
  { pid: "0F", label: "Intake Air Temp", unit: "°C", mode: "01" as ObdMode },
  { pid: "11", label: "Throttle Position", unit: "%", mode: "01" as ObdMode },
  { pid: "04", label: "Engine Load", unit: "%", mode: "01" as ObdMode },
  { pid: "06", label: "Short Fuel Trim B1", unit: "%", mode: "01" as ObdMode },
  { pid: "10", label: "MAF Air Flow", unit: "g/s", mode: "01" as ObdMode },
  { pid: "0B", label: "Intake Manifold Pressure", unit: "kPa", mode: "01" as ObdMode },
  { pid: "42", label: "Control Module Voltage", unit: "V", mode: "01" as ObdMode },
] as const;

/** Read-only OBD modes enabled in v1 */
export const MVP_READ_MODES: ObdMode[] = ["01", "02", "03", "07", "09"];

export const DEFAULT_BAUD_RATES = [38400, 9600, 57600, 115200] as const;

export const DEFAULT_COMMAND_DELAY_MS = 150;

export const POLL_INTERVAL_MS = 500;

export const SIMULATOR_TICK_MS = 500;
