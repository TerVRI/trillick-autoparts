/**
 * KWP2000 (ISO 14230) message framing for BMW K-Line ECUs.
 * Clean-room implementation of the public ISO 14230-2 format.
 *
 * Frame layout (physical addressing):
 *   [FMT] [TGT] [SRC] [LEN?] [DATA...] [CS]
 *   - FMT high bits carry address mode; low 6 bits carry length (1..63),
 *     or 0 meaning length is in the separate LEN byte.
 *   - CS is an 8-bit sum of all preceding bytes.
 */

export const TESTER_ADDRESS = 0xf1;

export function checksum(bytes: number[]): number {
  return bytes.reduce((sum, b) => (sum + b) & 0xff, 0);
}

/** Build a KWP2000 physical-addressed request frame. */
export function buildKwpFrame(target: number, data: number[], source = TESTER_ADDRESS): number[] {
  if (data.length === 0) throw new Error("KWP frame requires at least one data byte");
  const useLenByte = data.length > 63;
  const fmt = 0x80 | (useLenByte ? 0 : data.length);
  const header = useLenByte
    ? [fmt, target, source, data.length]
    : [fmt, target, source];
  const frame = [...header, ...data];
  frame.push(checksum(frame));
  return frame;
}

export interface KwpResponse {
  source: number;
  target: number;
  data: number[];
  valid: boolean;
}

/** Parse a single KWP2000 response frame from raw bytes. */
export function parseKwpFrame(bytes: number[]): KwpResponse | null {
  if (bytes.length < 5) return null;
  const fmt = bytes[0];
  if ((fmt & 0x80) === 0) return null;
  const lenInFmt = fmt & 0x3f;
  let dataLen: number;
  let dataStart: number;
  if (lenInFmt === 0) {
    dataLen = bytes[3];
    dataStart = 4;
  } else {
    dataLen = lenInFmt;
    dataStart = 3;
  }
  const total = dataStart + dataLen + 1;
  if (bytes.length < total) return null;
  const frame = bytes.slice(0, total - 1);
  const cs = bytes[total - 1];
  const valid = checksum(frame) === cs;
  return {
    target: bytes[1],
    source: bytes[2],
    data: bytes.slice(dataStart, dataStart + dataLen),
    valid,
  };
}

/** Extract the first complete KWP frame from a rolling buffer; returns frame + remaining bytes. */
export function extractKwpFrame(buffer: number[]): { frame: KwpResponse | null; rest: number[] } {
  for (let start = 0; start < buffer.length; start++) {
    if ((buffer[start] & 0x80) === 0) continue;
    const parsed = parseKwpFrame(buffer.slice(start));
    if (parsed) {
      const fmt = buffer[start];
      const lenInFmt = fmt & 0x3f;
      const dataStart = lenInFmt === 0 ? 4 : 3;
      const dataLen = lenInFmt === 0 ? buffer[start + 3] : lenInFmt;
      const consumed = start + dataStart + dataLen + 1;
      return { frame: parsed, rest: buffer.slice(consumed) };
    }
  }
  return { frame: null, rest: buffer };
}
