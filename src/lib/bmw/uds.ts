/**
 * UDS / KWP2000 service identifiers (public: ISO 14229 / ISO 14230-3)
 * and helpers for building read requests and interpreting responses.
 */

export const UDS_SERVICE = {
  DIAGNOSTIC_SESSION_CONTROL: 0x10,
  ECU_RESET: 0x11,
  CLEAR_DIAGNOSTIC_INFO: 0x14,
  READ_DTC_INFORMATION: 0x19,
  READ_DATA_BY_ID: 0x22,
  READ_MEMORY_BY_ADDRESS: 0x23,
  SECURITY_ACCESS: 0x27,
  COMMUNICATION_CONTROL: 0x28,
  READ_DATA_BY_LOCAL_ID: 0x21,
  WRITE_DATA_BY_ID: 0x2e,
  ROUTINE_CONTROL: 0x31,
  REQUEST_DOWNLOAD: 0x34,
  REQUEST_UPLOAD: 0x35,
  TRANSFER_DATA: 0x36,
  REQUEST_TRANSFER_EXIT: 0x37,
  WRITE_MEMORY_BY_ADDRESS: 0x3d,
  TESTER_PRESENT: 0x3e,
  // KWP2000 legacy
  KWP_READ_ECU_ID: 0x1a,
  KWP_READ_DTC_BY_STATUS: 0x18,
  KWP_START_DIAGNOSTIC_SESSION: 0x10,
} as const;

export const NEGATIVE_RESPONSE = 0x7f;

export const POSITIVE_RESPONSE_OFFSET = 0x40;

export const NRC_TEXT: Record<number, string> = {
  0x10: "General reject",
  0x11: "Service not supported",
  0x12: "Sub-function not supported",
  0x13: "Incorrect message length",
  0x22: "Conditions not correct",
  0x31: "Request out of range",
  0x33: "Security access denied",
  0x35: "Invalid key",
  0x78: "Response pending",
  0x7e: "Sub-function not supported in active session",
  0x7f: "Service not supported in active session",
};

export interface UdsResponse {
  service: number;
  positive: boolean;
  data: number[];
  nrc?: number;
  nrcText?: string;
}

export function parseUdsResponse(payload: number[]): UdsResponse | null {
  if (payload.length === 0) return null;
  const sid = payload[0];
  if (sid === NEGATIVE_RESPONSE) {
    const requested = payload[1];
    const nrc = payload[2];
    return {
      service: requested,
      positive: false,
      data: [],
      nrc,
      nrcText: NRC_TEXT[nrc] ?? `NRC 0x${nrc?.toString(16)}`,
    };
  }
  return {
    service: sid - POSITIVE_RESPONSE_OFFSET,
    positive: true,
    data: payload.slice(1),
  };
}

/** Build a "read data by identifier" request (UDS 0x22). */
export function readDataByIdentifier(did: number): number[] {
  return [UDS_SERVICE.READ_DATA_BY_ID, (did >> 8) & 0xff, did & 0xff];
}

/** Build a "read DTC information" request (UDS 0x19, sub 0x02 = by status mask). */
export function readDtcByStatusMask(statusMask = 0xff): number[] {
  return [UDS_SERVICE.READ_DTC_INFORMATION, 0x02, statusMask];
}

/** KWP2000 read ECU identification (0x1A) with an identifier byte. */
export function kwpReadEcuIdentification(id = 0x80): number[] {
  return [UDS_SERVICE.KWP_READ_ECU_ID, id];
}

/** Tester-present keepalive (0x3E). */
export function testerPresent(suppressResponse = true): number[] {
  return [UDS_SERVICE.TESTER_PRESENT, suppressResponse ? 0x80 : 0x00];
}

export function serviceName(sid: number): string {
  const entry = Object.entries(UDS_SERVICE).find(([, v]) => v === sid);
  return entry ? entry[0] : `SERVICE_0x${sid.toString(16)}`;
}
