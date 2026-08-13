import { describe, expect, it } from "vitest";
import {
  canReserveWithinOperationalCeiling,
  decideModelInvocation,
  isModelEvaluationExplicitlyEnabled,
} from "@/ai/policy";

describe("AI invocation policy", () => {
  it("requires an exact, explicit opt-in before model evaluation", () => {
    expect(isModelEvaluationExplicitlyEnabled(undefined)).toBe(false);
    expect(isModelEvaluationExplicitlyEnabled("false")).toBe(false);
    expect(isModelEvaluationExplicitlyEnabled("TRUE")).toBe(false);
    expect(isModelEvaluationExplicitlyEnabled("true")).toBe(true);
  });

  it("never invokes a model for unchanged input", () => {
    expect(
      decideModelInvocation({
        meaningfulChange: false,
        passesDeterministicFilters: true,
        needsJudgment: true,
        apiKeyConfigured: true,
        budgetAvailable: true,
      }),
    ).toEqual({ invoke: false, reason: "unchanged" });
  });

  it("never invokes a model for deterministically rejected input", () => {
    expect(
      decideModelInvocation({
        meaningfulChange: true,
        passesDeterministicFilters: false,
        needsJudgment: true,
        apiKeyConfigured: true,
        budgetAvailable: true,
      }),
    ).toEqual({ invoke: false, reason: "filtered" });
  });

  it("blocks calls that would enter the $5 safety buffer", () => {
    expect(
      canReserveWithinOperationalCeiling({
        spentMicroUsd: 4_450_000,
        reservedMicroUsd: 25_000,
        requestedMicroUsd: 50_000,
        hardLimitMicroUsd: 5_000_000,
        safetyBufferMicroUsd: 500_000,
      }),
    ).toBe(false);
  });

  it("allows a changed, filtered, judgment-requiring call with budget", () => {
    expect(
      decideModelInvocation({
        meaningfulChange: true,
        passesDeterministicFilters: true,
        needsJudgment: true,
        apiKeyConfigured: true,
        budgetAvailable: true,
      }),
    ).toEqual({ invoke: true });
  });
});
