import type { TransportKind } from "../types";

export interface ObdTransport {
  kind: TransportKind;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(command: string): Promise<string>;
  isConnected(): boolean;
}

export interface TransportOptions {
  baudRate?: number;
  commandDelayMs?: number;
  onLog?: (message: string) => void;
}
