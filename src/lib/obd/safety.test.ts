import { describe, expect, it } from "vitest";
import {
  classifyCommand,
  evaluateCommand,
  assertCommandAllowed,
  DEFAULT_SAFETY_CONFIG,
} from "./safety";

describe("safety gate", () => {
  it("allows standard read PIDs in read-only mode", () => {
    expect(evaluateCommand("010C")).toEqual({ allowed: true });
    expect(evaluateCommand("03")).toEqual({ allowed: true });
    expect(evaluateCommand("0902")).toEqual({ allowed: true });
  });

  it("allows adapter init commands", () => {
    expect(evaluateCommand("ATZ")).toEqual({ allowed: true });
    expect(evaluateCommand("ATE0")).toEqual({ allowed: true });
  });

  it("blocks clear DTC in read-only mode", () => {
    const decision = evaluateCommand("04");
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toMatch(/Lab Mode|read-only/i);
  });

  it("allows clear DTC in diagnostics mode", () => {
    const decision = evaluateCommand("04", { ...DEFAULT_SAFETY_CONFIG, level: "diagnostics" });
    expect(decision.allowed).toBe(true);
  });

  it("blocks unknown write commands without lab mode", () => {
    const decision = evaluateCommand("2F1234");
    expect(decision.allowed).toBe(false);
  });

  it("requires lab confirmation for lab mode writes", () => {
    const config = { level: "lab_mode" as const, labModeConfirmed: false, labCommandWhitelist: [] };
    expect(evaluateCommand("2F1234", config).allowed).toBe(false);

    const confirmed = { ...config, labModeConfirmed: true };
    expect(evaluateCommand("2F1234", confirmed).allowed).toBe(true);
  });

  it("enforces lab command whitelist when set", () => {
    const config = {
      level: "lab_mode" as const,
      labModeConfirmed: true,
      labCommandWhitelist: ["2F1234"],
    };
    expect(evaluateCommand("2F1234", config).allowed).toBe(true);
    expect(evaluateCommand("2F9999", config).allowed).toBe(false);
  });

  it("classifies commands by risk", () => {
    expect(classifyCommand("0105").risk).toBe("none");
    expect(classifyCommand("04").risk).toBe("high");
    expect(classifyCommand("3A00").risk).toBe("critical");
  });

  it("throws when assertCommandAllowed blocks", () => {
    expect(() => assertCommandAllowed("04")).toThrow(/blocked|read-only/i);
  });
});
