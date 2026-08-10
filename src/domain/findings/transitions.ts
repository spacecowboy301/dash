import type { FindingStatus } from "./types";

const allowedTransitions: Record<FindingStatus, ReadonlySet<FindingStatus>> = {
  new: new Set(["reviewed", "dismissed", "snoozed", "acted"]),
  reviewed: new Set(["dismissed", "snoozed", "acted"]),
  dismissed: new Set(["new"]),
  snoozed: new Set(["new", "dismissed", "acted"]),
  acted: new Set([]),
};

export function canTransitionFinding(from: FindingStatus, to: FindingStatus): boolean {
  return allowedTransitions[from].has(to);
}

export function assertFindingTransition(from: FindingStatus, to: FindingStatus): void {
  if (!canTransitionFinding(from, to)) {
    throw new Error(`Finding cannot transition from ${from} to ${to}.`);
  }
}
