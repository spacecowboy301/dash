export type ModelInvocationDecision = {
  invoke: boolean;
  reason?: string;
};

export function decideModelInvocation(input: {
  meaningfulChange: boolean;
  passesDeterministicFilters: boolean;
  needsJudgment: boolean;
  apiKeyConfigured: boolean;
  budgetAvailable: boolean;
}): ModelInvocationDecision {
  if (!input.meaningfulChange) return { invoke: false, reason: "unchanged" };
  if (!input.passesDeterministicFilters) return { invoke: false, reason: "filtered" };
  if (!input.needsJudgment) return { invoke: false, reason: "deterministic_result" };
  if (!input.apiKeyConfigured) return { invoke: false, reason: "api_key_unavailable" };
  if (!input.budgetAvailable) return { invoke: false, reason: "budget_unavailable" };
  return { invoke: true };
}

export function canReserveWithinOperationalCeiling(input: {
  spentMicroUsd: number;
  reservedMicroUsd: number;
  requestedMicroUsd: number;
  hardLimitMicroUsd: number;
  safetyBufferMicroUsd: number;
}): boolean {
  const ceiling = Math.max(input.hardLimitMicroUsd - input.safetyBufferMicroUsd, 0);
  return input.spentMicroUsd + input.reservedMicroUsd + input.requestedMicroUsd <= ceiling;
}
