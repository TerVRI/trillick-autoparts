/**
 * ISO-TP (ISO 15765-2) framing for UDS over D-CAN.
 * Clean-room implementation of the public transport-layer spec.
 *
 * PCI types:
 *   0x0n  Single Frame (n = length, 0..7)
 *   0x1n  First Frame  (12-bit length across this + next byte)
 *   0x2n  Consecutive Frame (n = sequence number 0..15)
 *   0x3n  Flow Control (0=CTS,1=WAIT,2=OVFLW)
 */

export type IsoTpFrameType = "single" | "first" | "consecutive" | "flow" | "unknown";

export interface IsoTpFrame {
  type: IsoTpFrameType;
  length?: number;
  sequence?: number;
  data: number[];
}

const FRAME_LEN = 8;

export function classifyIsoTp(frame: number[]): IsoTpFrame {
  if (frame.length === 0) return { type: "unknown", data: [] };
  const pci = (frame[0] & 0xf0) >> 4;
  switch (pci) {
    case 0x0:
      return { type: "single", length: frame[0] & 0x0f, data: frame.slice(1) };
    case 0x1:
      return {
        type: "first",
        length: ((frame[0] & 0x0f) << 8) | frame[1],
        data: frame.slice(2),
      };
    case 0x2:
      return { type: "consecutive", sequence: frame[0] & 0x0f, data: frame.slice(1) };
    case 0x3:
      return { type: "flow", data: frame.slice(1) };
    default:
      return { type: "unknown", data: frame };
  }
}

/** Encode a UDS payload into one or more 8-byte ISO-TP CAN frames. */
export function encodeIsoTp(payload: number[]): number[][] {
  if (payload.length <= 7) {
    const frame = [payload.length, ...payload];
    while (frame.length < FRAME_LEN) frame.push(0x00);
    return [frame];
  }
  const frames: number[][] = [];
  const first = [0x10 | ((payload.length >> 8) & 0x0f), payload.length & 0xff, ...payload.slice(0, 6)];
  frames.push(first);
  let idx = 6;
  let seq = 1;
  while (idx < payload.length) {
    const chunk = payload.slice(idx, idx + 7);
    const frame = [0x20 | (seq & 0x0f), ...chunk];
    while (frame.length < FRAME_LEN) frame.push(0x00);
    frames.push(frame);
    idx += 7;
    seq = (seq + 1) & 0x0f;
  }
  return frames;
}

/** Reassemble a UDS payload from a sequence of ISO-TP frames. */
export function decodeIsoTp(frames: number[][]): number[] | null {
  if (frames.length === 0) return null;
  const first = classifyIsoTp(frames[0]);
  if (first.type === "single") {
    return first.data.slice(0, first.length ?? first.data.length);
  }
  if (first.type === "first") {
    const total = first.length ?? 0;
    const out = [...first.data];
    for (let i = 1; i < frames.length; i++) {
      const cf = classifyIsoTp(frames[i]);
      if (cf.type !== "consecutive") continue;
      out.push(...cf.data);
    }
    return out.slice(0, total);
  }
  return null;
}

export const FLOW_CONTROL_CTS = [0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
