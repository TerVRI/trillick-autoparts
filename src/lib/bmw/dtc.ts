import type { BmwDtc } from "./types";

/**
 * DTC decoding. Standard 2-byte OBD/UDS DTC encoding (public SAE J2012 / ISO 15031-6)
 * plus a raw BMW hex fallback for manufacturer-specific fault memory codes.
 */

const FIRST_CHAR = ["P", "C", "B", "U"] as const;

/** Decode a 2-byte value into a standard DTC string (e.g. P0301). */
export function decodeStandardDtc(high: number, low: number): string {
  const first = FIRST_CHAR[(high >> 6) & 0x03];
  const d1 = (high >> 4) & 0x03;
  const d2 = high & 0x0f;
  const d3 = (low >> 4) & 0x0f;
  const d4 = low & 0x0f;
  return `${first}${d1}${d2.toString(16)}${d3.toString(16)}${d4.toString(16)}`.toUpperCase();
}

/** BMW fault memory often reports raw hex codes; keep both representations. */
export function decodeBmwDtc(high: number, low: number, statusByte?: number): BmwDtc {
  const raw = (high << 8) | low;
  const present = statusByte === undefined ? true : (statusByte & 0x01) !== 0 || (statusByte & 0x24) !== 0;
  const stored = statusByte === undefined ? true : (statusByte & 0x08) !== 0 || (statusByte & 0x20) !== 0;
  return {
    raw,
    code: decodeStandardDtc(high, low),
    statusByte,
    status: {
      present,
      stored,
      pendingConfirmation: statusByte !== undefined ? (statusByte & 0x04) !== 0 : undefined,
    },
  };
}

/**
 * Parse a UDS 0x19/0x02 positive response payload (after the SID/subfunction stripped).
 * Layout: [statusAvailabilityMask] then repeating [DTC hi][DTC mid][DTC lo][status].
 * For 2-byte BMW-style variants we also support [hi][lo][status] triplets.
 */
export function parseDtcPayload(data: number[]): BmwDtc[] {
  const dtcs: BmwDtc[] = [];
  if (data.length === 0) return dtcs;

  // UDS 0x19 sub 0x02: first byte is status availability mask, then 4-byte records
  const body = data.slice(1);
  if (body.length >= 4 && body.length % 4 === 0) {
    for (let i = 0; i + 3 < body.length; i += 4) {
      const hi = body[i];
      const mid = body[i + 1];
      const status = body[i + 3];
      dtcs.push(decodeBmwDtc(hi, mid, status));
    }
    if (dtcs.length > 0) return dtcs;
  }

  // KWP-style 3-byte triplets [hi][lo][status]
  if (data.length % 3 === 0) {
    for (let i = 0; i + 2 < data.length; i += 3) {
      dtcs.push(decodeBmwDtc(data[i], data[i + 1], data[i + 2]));
    }
    return dtcs;
  }

  // Fallback: 2-byte codes without status
  for (let i = 0; i + 1 < data.length; i += 2) {
    if (data[i] === 0 && data[i + 1] === 0) continue;
    dtcs.push(decodeBmwDtc(data[i], data[i + 1]));
  }
  return dtcs;
}

export function formatDtcRaw(dtc: BmwDtc): string {
  return `0x${dtc.raw.toString(16).toUpperCase().padStart(4, "0")}`;
}
