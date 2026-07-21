import type { BmwBus, BmwTransportKind } from "../types";

export interface BmwTransport {
  kind: BmwTransportKind;
  bus: BmwBus;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  /** Send a raw UDS/KWP service payload to an ECU and return the response payload. */
  request(ecuAddress: number, servicePayload: number[]): Promise<number[]>;
  isConnected(): boolean;
}

export interface BmwTransportOptions {
  bus?: BmwBus;
  commandDelayMs?: number;
  onLog?: (message: string) => void;
}
