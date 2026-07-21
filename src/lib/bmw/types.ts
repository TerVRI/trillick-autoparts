/**
 * INPA-style BMW diagnostics types.
 *
 * Read-only diagnostics built from public standards:
 *  - KWP2000 (ISO 14230) for K-Line E-series (pre ~03/2007)
 *  - UDS (ISO 14229) over ISO-TP (ISO 15765-2) for D-CAN (~03/2007+)
 *
 * This is an independent, clean-room implementation of public protocols.
 * It is NOT BMW INPA/Ediabas and ships no proprietary BMW data.
 */

export type BmwBus = "k-line" | "d-can";

export type BmwTransportKind = "simulator" | "kdcan-web-serial";

export interface EcuDefinition {
  /** Diagnostic address (KWP) or request CAN id low byte convention */
  address: number;
  /** ISO-TP request CAN id for D-CAN (e.g. 0x6F1 tester -> ecu) */
  txId?: number;
  /** ISO-TP response CAN id for D-CAN */
  rxId?: number;
  code: string;
  name: string;
  description: string;
  bus: BmwBus[];
}

export interface EcuIdentification {
  ecuCode: string;
  address: number;
  vin?: string;
  hardwareNumber?: string;
  softwareNumber?: string;
  supplier?: string;
  rawIdentification?: string;
}

export interface BmwDtc {
  /** Raw 2-byte code value */
  raw: number;
  /** Formatted code, e.g. P-code or BMW hex code */
  code: string;
  /** BMW shadow/fault text if known */
  description?: string;
  statusByte?: number;
  status: {
    present: boolean;
    stored: boolean;
    pendingConfirmation?: boolean;
  };
}

export interface LiveValue {
  id: string;
  label: string;
  unit: string;
  value: number | null;
}

export interface EcuScanResult {
  ecu: EcuDefinition;
  reachable: boolean;
  identification?: EcuIdentification;
  faultCount?: number;
  error?: string;
}

export type BmwConnectionState = "disconnected" | "connecting" | "connected" | "error";

export interface BmwSessionInfo {
  bus: BmwBus;
  transport: BmwTransportKind;
  cableName: string;
  switchHint: string;
}
