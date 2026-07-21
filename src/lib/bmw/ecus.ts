import type { EcuDefinition } from "./types";

/**
 * Common BMW diagnostic module catalog (public, widely documented addresses).
 * Addresses are the standard KWP diagnostic addresses; D-CAN uses the
 * 0x6F1 tester id with per-ECU response ids (0x600 + address convention varies
 * by platform, so txId/rxId are provided where commonly stable).
 */

export const BMW_ECUS: EcuDefinition[] = [
  {
    address: 0x12,
    txId: 0x6f1,
    rxId: 0x612,
    code: "DME",
    name: "Engine (DME/DDE)",
    description: "Digital Motor/Diesel Electronics — engine management.",
    bus: ["k-line", "d-can"],
  },
  {
    address: 0x18,
    txId: 0x6f1,
    rxId: 0x618,
    code: "EGS",
    name: "Transmission (EGS)",
    description: "Automatic transmission control.",
    bus: ["k-line", "d-can"],
  },
  {
    address: 0x29,
    txId: 0x6f1,
    rxId: 0x629,
    code: "DSC",
    name: "Stability Control (DSC/ABS)",
    description: "Dynamic Stability Control / ABS.",
    bus: ["k-line", "d-can"],
  },
  {
    address: 0x40,
    txId: 0x6f1,
    rxId: 0x640,
    code: "IKE/KOMBI",
    name: "Instrument Cluster",
    description: "Instrument cluster / combination display.",
    bus: ["k-line", "d-can"],
  },
  {
    address: 0x60,
    txId: 0x6f1,
    rxId: 0x660,
    code: "CAS",
    name: "Car Access System (CAS)",
    description: "Access, immobiliser and body gateway.",
    bus: ["d-can"],
  },
  {
    address: 0x00,
    txId: 0x6f1,
    rxId: 0x600,
    code: "ZGW",
    name: "Gateway (ZGW)",
    description: "Central gateway module.",
    bus: ["d-can"],
  },
  {
    address: 0x72,
    txId: 0x6f1,
    rxId: 0x672,
    code: "FRM",
    name: "Footwell Module (FRM)",
    description: "Lighting and door electronics.",
    bus: ["d-can"],
  },
  {
    address: 0x9c,
    txId: 0x6f1,
    rxId: 0x69c,
    code: "JBE",
    name: "Junction Box (JBE)",
    description: "Body power distribution / junction box electronics.",
    bus: ["d-can"],
  },
];

export function findEcu(code: string): EcuDefinition | undefined {
  return BMW_ECUS.find((e) => e.code.toLowerCase() === code.toLowerCase());
}

export function ecusForBus(bus: "k-line" | "d-can"): EcuDefinition[] {
  return BMW_ECUS.filter((e) => e.bus.includes(bus));
}
