import type { NormalizedCareerCandidate } from "./types";

const targetTitleTerms = ["product", "design", "ai", "lead", "staff", "principal"];
const excludedTerms = ["intern", "commission only", "unpaid", "clearance required"];

export function passesDeterministicCareerFilter(candidate: NormalizedCareerCandidate): boolean {
  const haystack = `${candidate.title} ${candidate.description}`.toLowerCase();
  if (excludedTerms.some((term) => haystack.includes(term))) return false;
  return targetTitleTerms.some((term) => candidate.title.toLowerCase().includes(term));
}
