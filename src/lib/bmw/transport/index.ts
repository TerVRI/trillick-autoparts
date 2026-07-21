import type { BmwSafetyConfig } from "../safety";
import type { BmwTransportKind } from "../types";
import { BmwSimulatorTransport } from "./simulator";
import { KdcanWebSerialTransport } from "./kdcan-web-serial";
import type { BmwTransport, BmwTransportOptions } from "./types";

export { BmwSimulatorTransport } from "./simulator";
export { KdcanWebSerialTransport } from "./kdcan-web-serial";
export type { BmwTransport, BmwTransportOptions } from "./types";

export function createBmwTransport(
  kind: BmwTransportKind,
  options: BmwTransportOptions & { safetyConfig?: BmwSafetyConfig } = {},
): BmwTransport {
  switch (kind) {
    case "kdcan-web-serial":
      return new KdcanWebSerialTransport(options);
    case "simulator":
    default:
      return new BmwSimulatorTransport(options);
  }
}
