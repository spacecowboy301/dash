export type RawCareerListing = {
  source: string;
  externalId: string;
  company: string;
  title: string;
  location: string;
  compensation?: string;
  description: string;
  url: string;
  updatedAt: string;
  demoFitScore?: number;
  changeSummary?: string;
};

export type NormalizedCareerCandidate = RawCareerListing & {
  fingerprint: string;
};

export type CareerEvaluation = {
  externalId: string;
  fitScore: number;
  rationale: string;
  concerns: string[];
  recommendation: string;
  priority: "high" | "medium" | "low";
};

export interface CareerSourceAdapter {
  readonly name: string;
  fetch(): Promise<RawCareerListing[]>;
}

export interface CareerEvaluator {
  evaluate(
    candidates: NormalizedCareerCandidate[],
    context: { workflowId: number; workflowRunId: number },
  ): Promise<{ evaluations: CareerEvaluation[]; aiSkippedReason?: string }>;
}
