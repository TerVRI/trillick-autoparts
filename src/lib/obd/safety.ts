/**
 * Safety gate for OBD commands — read-only by default.
 * ECU coding / write commands require explicit lab mode and per-command approval.
 */

import type { ObdMode } from "./types";
import { MVP_READ_MODES } from "./capabilities";

export type SafetyLevel = "read_only" | "diagnostics" | "lab_mode";

export type CommandRisk = "none" | "low" | "medium" | "high" | "critical";

export interface ObdCommand {
  raw: string;
  mode?: ObdMode;
  description: string;
  risk: CommandRisk;
  requiresLabMode?: boolean;
}

export interface SafetyDecision {
  allowed: boolean;
  reason?: string;
}

const WRITE_PATTERNS = [
  /^04/i, // Clear DTCs
  /^2[0-9A-F]/i, // Mode 2x manufacturer-specific writes
  /^3[0-9A-F]/i, // Custom writes
  /AT\s*WS/i,
  /AT\s*SP/i,
];

const READ_ONLY_AT_COMMANDS = new Set([
  "ATZ", "ATI", "AT@1", "ATDP", "ATDPN", "ATRV", "ATSP0", "ATSP6",
  "ATE0", "ATE1", "ATL0", "ATL1", "ATH0", "ATH1", "ATS0", "ATS1",
  "ATST", "ATSH", "ATCRA", "ATCAF0", "ATCAF1",
]);

export interface SafetyGateConfig {
  level: SafetyLevel;
  /** Explicit user confirmation token for destructive ops */
  labModeConfirmed: boolean;
  /** Whitelist of raw commands allowed in lab mode (future ECU coding) */
  labCommandWhitelist: string[];
}

export const DEFAULT_SAFETY_CONFIG: SafetyGateConfig = {
  level: "read_only",
  labModeConfirmed: false,
  labCommandWhitelist: [],
};

export function classifyCommand(raw: string): ObdCommand {
  const trimmed = raw.trim().toUpperCase();
  if (trimmed.startsWith("AT")) {
    const cmd = trimmed.replace(/\s+/g, "");
    if (READ_ONLY_AT_COMMANDS.has(cmd) || cmd.startsWith("ATST")) {
      return { raw, description: "Adapter configuration", risk: "none" };
    }
    return { raw, description: "Adapter command", risk: "low" };
  }
  const mode = trimmed.slice(0, 2) as ObdMode;
  if (mode === "04") {
    return { raw, mode, description: "Clear stored DTCs", risk: "high", requiresLabMode: true };
  }
  if (MVP_READ_MODES.includes(mode)) {
    return { raw, mode, description: "Standard OBD read", risk: "none" };
  }
  if (WRITE_PATTERNS.some((p) => p.test(trimmed))) {
    return { raw, description: "Potential ECU write", risk: "critical", requiresLabMode: true };
  }
  return { raw, description: "Unknown command", risk: "medium", requiresLabMode: true };
}

export function evaluateCommand(
  raw: string,
  config: SafetyGateConfig = DEFAULT_SAFETY_CONFIG,
): SafetyDecision {
  const cmd = classifyCommand(raw);

  if (cmd.risk === "none" || cmd.risk === "low") {
    if (cmd.mode && !MVP_READ_MODES.includes(cmd.mode) && config.level === "read_only") {
      return { allowed: false, reason: `Mode ${cmd.mode} is not enabled in read-only mode.` };
    }
    return { allowed: true };
  }

  if (cmd.mode === "04" && config.level === "diagnostics") {
    return { allowed: true };
  }

  if (cmd.requiresLabMode) {
    if (config.level !== "lab_mode" || !config.labModeConfirmed) {
      return {
        allowed: false,
        reason: `${cmd.description} blocked — enable Lab Mode and confirm explicitly.`,
      };
    }
    if (config.labCommandWhitelist.length > 0 && !config.labCommandWhitelist.includes(raw.trim().toUpperCase())) {
      return { allowed: false, reason: "Command not in lab whitelist for this vehicle profile." };
    }
  }

  if (config.level === "read_only") {
    return { allowed: false, reason: "Write or advanced commands are disabled in read-only mode." };
  }

  return { allowed: true };
}

export function assertCommandAllowed(raw: string, config?: SafetyGateConfig): void {
  const decision = evaluateCommand(raw, config);
  if (!decision.allowed) {
    throw new Error(decision.reason ?? "Command blocked by safety gate.");
  }
}

/** Future ECU coding command metadata template */
export interface EcuCodingCommand {
  id: string;
  vehicleFamily: string;
  label: string;
  description: string;
  risk: CommandRisk;
  prerequisites: string[];
  rawCommand: string;
  backupRecommended: boolean;
}

export const ECU_CODING_PLACEHOLDER: EcuCodingCommand[] = [
  {
    id: "example-bcm-mirror-fold",
    vehicleFamily: "Land Rover L319",
    label: "Mirror fold on lock (example — not verified)",
    description: "Research placeholder only. Do not execute without verified command database.",
    risk: "critical",
    prerequisites: ["Ignition ON", "Battery stable >12.5V", "Verified backup"],
    rawCommand: "PLACEHOLDER",
    backupRecommended: true,
  },
];
