import type { SafetyGateConfig } from "../safety";
import type { TransportKind } from "../types";
import { Elm327Client } from "../elm327";
import { SimulatorTransport } from "./simulator";
import type { ObdTransport, TransportOptions } from "./types";
import { WebSerialTransport } from "./web-serial";
import { WebUsbTransport } from "./webusb-fallback";

export { Elm327Client } from "../elm327";
export { SimulatorTransport } from "./simulator";
export { WebSerialTransport } from "./web-serial";
export { WebUsbTransport, isWebUsbAvailable } from "./webusb-fallback";
export { detectPlatformSupport, platformSupportSummary } from "./platform";
export type { ObdTransport, TransportOptions } from "./types";

export function createTransport(
  kind: TransportKind,
  options: TransportOptions & { safetyConfig?: SafetyGateConfig } = {},
): ObdTransport {
  switch (kind) {
    case "simulator":
      return new SimulatorTransport(options);
    case "web-serial":
      return new WebSerialTransport(options);
    case "webusb":
      return new WebUsbTransport(options);
    default:
      return new SimulatorTransport(options);
  }
}

export function createClient(
  kind: TransportKind,
  options: TransportOptions & { safetyConfig?: SafetyGateConfig; onLog?: (msg: string) => void } = {},
): { transport: ObdTransport; client: Elm327Client } {
  const transport = createTransport(kind, options);
  const client = new Elm327Client(transport, options.onLog);
  return { transport, client };
}
