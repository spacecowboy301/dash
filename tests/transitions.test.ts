import { describe, expect, it } from "vitest";
import { assertFindingTransition, canTransitionFinding } from "@/domain/findings/transitions";

describe("finding status transitions", () => {
  it("supports review, dismissal, snooze, and acted states", () => {
    expect(canTransitionFinding("new", "reviewed")).toBe(true);
    expect(canTransitionFinding("new", "dismissed")).toBe(true);
    expect(canTransitionFinding("new", "snoozed")).toBe(true);
    expect(canTransitionFinding("reviewed", "acted")).toBe(true);
  });

  it("rejects transitions out of the terminal acted state", () => {
    expect(() => assertFindingTransition("acted", "new")).toThrow(
      "Finding cannot transition from acted to new.",
    );
  });
});
