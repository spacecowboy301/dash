import type { CareerEvaluation, NormalizedCareerCandidate } from "./types";

export function deterministicEvaluate(
  candidates: NormalizedCareerCandidate[],
): CareerEvaluation[] {
  return candidates.map((candidate) => {
    const fitScore = candidate.demoFitScore ?? deterministicScore(candidate);
    return {
      externalId: candidate.externalId,
      fitScore,
      rationale:
        fitScore >= 85
          ? "Strong alignment across seniority, product scope, and AI-adjacent work."
          : "Relevant product leadership scope with enough alignment to merit a quick review.",
      concerns:
        candidate.compensation === undefined
          ? ["Compensation was not listed."]
          : ["Confirm team scope and in-office expectations."],
      recommendation:
        fitScore >= 88 ? "Review the role before Tuesday" : "Compare scope with your criteria",
      priority: fitScore >= 88 ? "high" : fitScore >= 75 ? "medium" : "low",
    };
  });
}

function deterministicScore(candidate: NormalizedCareerCandidate): number {
  const text = `${candidate.title} ${candidate.description}`.toLowerCase();
  let score = 55;
  if (/staff|principal|lead/.test(text)) score += 15;
  if (/product/.test(text)) score += 10;
  if (/ai|artificial intelligence/.test(text)) score += 10;
  if (/new york|remote/.test(candidate.location.toLowerCase())) score += 5;
  return Math.min(score, 95);
}
