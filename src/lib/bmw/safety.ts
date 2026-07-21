import { UDS_SERVICE } from "./uds";

/**
 * BMW diagnostics safety gate.
 *
 * Read services are allowed by default. Anything that writes, resets, flashes,
 * unlocks security access, or clears memory is blocked unless the user explicitly
 * enables coding mode AND confirms — mirroring the OBD dashboard safety model.
 * Blind ECU writes can brick modules, so writes ship disabled.
 */

export type BmwSafetyLevel = "read_only" | "clear_faults" | "coding";

export interface BmwSafetyConfig {
  level: BmwSafetyLevel;
  codingConfirmed: boolean;
}

export const DEFAULT_BMW_SAFETY: BmwSafetyConfig = {
  level: "read_only",
  codingConfirmed: false,
};

const READ_SERVICES = new Set<number>([
  UDS_SERVICE.DIAGNOSTIC_SESSION_CONTROL,
  UDS_SERVICE.TESTER_PRESENT,
  UDS_SERVICE.READ_DTC_INFORMATION,
  UDS_SERVICE.READ_DATA_BY_ID,
  UDS_SERVICE.READ_DATA_BY_LOCAL_ID,
  UDS_SERVICE.READ_MEMORY_BY_ADDRESS,
  UDS_SERVICE.KWP_READ_ECU_ID,
  UDS_SERVICE.KWP_READ_DTC_BY_STATUS,
]);

const CLEAR_SERVICES = new Set<number>([UDS_SERVICE.CLEAR_DIAGNOSTIC_INFO]);

const CODING_SERVICES = new Set<number>([
  UDS_SERVICE.ECU_RESET,
  UDS_SERVICE.SECURITY_ACCESS,
  UDS_SERVICE.COMMUNICATION_CONTROL,
  UDS_SERVICE.WRITE_DATA_BY_ID,
  UDS_SERVICE.ROUTINE_CONTROL,
  UDS_SERVICE.REQUEST_DOWNLOAD,
  UDS_SERVICE.REQUEST_UPLOAD,
  UDS_SERVICE.TRANSFER_DATA,
  UDS_SERVICE.REQUEST_TRANSFER_EXIT,
  UDS_SERVICE.WRITE_MEMORY_BY_ADDRESS,
]);

export interface BmwSafetyDecision {
  allowed: boolean;
  reason?: string;
  category: "read" | "clear" | "coding" | "unknown";
}

export function classifyService(sid: number): BmwSafetyDecision["category"] {
  if (READ_SERVICES.has(sid)) return "read";
  if (CLEAR_SERVICES.has(sid)) return "clear";
  if (CODING_SERVICES.has(sid)) return "coding";
  return "unknown";
}

export function evaluateService(sid: number, config: BmwSafetyConfig = DEFAULT_BMW_SAFETY): BmwSafetyDecision {
  const category = classifyService(sid);

  if (category === "read") return { allowed: true, category };

  if (category === "clear") {
    if (config.level === "clear_faults" || (config.level === "coding" && config.codingConfirmed)) {
      return { allowed: true, category };
    }
    return {
      allowed: false,
      category,
      reason: "Clearing fault memory is disabled in read-only mode.",
    };
  }

  if (category === "coding") {
    if (config.level === "coding" && config.codingConfirmed) {
      return { allowed: true, category };
    }
    return {
      allowed: false,
      category,
      reason: "Coding / writing / flashing is blocked. Enable Coding mode and confirm explicitly.",
    };
  }

  // Unknown services are treated as potentially destructive
  if (config.level === "coding" && config.codingConfirmed) {
    return { allowed: true, category };
  }
  return {
    allowed: false,
    category,
    reason: `Unrecognised service 0x${sid.toString(16)} blocked outside coding mode.`,
  };
}

export function assertServiceAllowed(sid: number, config?: BmwSafetyConfig): void {
  const decision = evaluateService(sid, config);
  if (!decision.allowed) {
    throw new Error(decision.reason ?? "Service blocked by BMW safety gate.");
  }
}
