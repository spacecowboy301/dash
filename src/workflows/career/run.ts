import { and, eq, sql as drizzleSql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  findingSources,
  findings,
  sourceSnapshots,
  workflowRuns,
  workflows,
} from "@/db/schema";
import { BudgetGatedCareerEvaluator } from "./evaluator";
import { passesDeterministicCareerFilter } from "./filters";
import { fingerprintCareerListing } from "./fingerprint";
import { FixtureCareerSource } from "./fixtures";
import type {
  CareerEvaluator,
  CareerSourceAdapter,
  NormalizedCareerCandidate,
} from "./types";

export type CareerWorkflowResult = {
  workflowRunId: number;
  retrieved: number;
  changed: number;
  filtered: number;
  evaluated: number;
  surfaced: number;
  aiSkippedReason?: string;
};

export async function runCareerWorkflow(options: {
  sources?: CareerSourceAdapter[];
  evaluator?: CareerEvaluator;
  trigger?: string;
} = {}): Promise<CareerWorkflowResult> {
  const sources = options.sources ?? [new FixtureCareerSource()];
  const evaluator = options.evaluator ?? new BudgetGatedCareerEvaluator();

  const [workflow] = await db
    .insert(workflows)
    .values({ slug: "career-monitor", name: "Career monitor", type: "career" })
    .onConflictDoUpdate({
      target: workflows.slug,
      set: { updatedAt: new Date() },
    })
    .returning({ id: workflows.id });

  const [run] = await db
    .insert(workflowRuns)
    .values({ workflowId: workflow.id, trigger: options.trigger ?? "manual" })
    .returning({ id: workflowRuns.id });

  try {
    const fetchedBatches = await Promise.all(sources.map((source) => source.fetch()));
    const listings = fetchedBatches.flat();
    const changed: NormalizedCareerCandidate[] = [];
    let filteredCount = 0;

    for (const listing of listings) {
      const fingerprint = fingerprintCareerListing(listing);
      const [previous] = await db
        .select({ sourceHash: sourceSnapshots.sourceHash })
        .from(sourceSnapshots)
        .where(
          and(
            eq(sourceSnapshots.workflowId, workflow.id),
            eq(sourceSnapshots.externalEntityId, listing.externalId),
          ),
        )
        .limit(1);

      await db
        .insert(sourceSnapshots)
        .values({
          workflowId: workflow.id,
          externalEntityId: listing.externalId,
          sourceHash: fingerprint,
          payload: listing,
        })
        .onConflictDoUpdate({
          target: [sourceSnapshots.workflowId, sourceSnapshots.externalEntityId],
          set: { sourceHash: fingerprint, payload: listing, lastSeenAt: new Date() },
        });

      if (previous?.sourceHash === fingerprint) continue;
      const candidate = { ...listing, fingerprint };
      if (!passesDeterministicCareerFilter(candidate)) {
        filteredCount += 1;
        continue;
      }
      changed.push(candidate);
    }

    const evaluationResult = await evaluator.evaluate(changed, {
      workflowId: workflow.id,
      workflowRunId: run.id,
    });
    const evaluations = new Map(
      evaluationResult.evaluations.map((evaluation) => [evaluation.externalId, evaluation]),
    );
    let surfaced = 0;

    for (const candidate of changed) {
      const evaluation = evaluations.get(candidate.externalId);
      if (!evaluation || evaluation.fitScore < 75) continue;

      const [finding] = await db
        .insert(findings)
        .values({
          workflowId: workflow.id,
          workflowRunId: run.id,
          category: "career",
          externalEntityId: candidate.externalId,
          title: candidate.title,
          subtitle: candidate.company,
          priority: evaluation.priority,
          whatChanged:
            candidate.changeSummary ?? `${candidate.title} changed since the previous check.`,
          whyItMatters: evaluation.rationale,
          recommendation: evaluation.recommendation,
          confidence: (evaluation.fitScore / 100).toFixed(4),
          sourceHash: candidate.fingerprint,
          details: {
            company: candidate.company,
            location: candidate.location,
            compensation: candidate.compensation,
            fitScore: evaluation.fitScore,
            concerns: evaluation.concerns,
          },
          createdAt: new Date(candidate.updatedAt),
          updatedAt: new Date(candidate.updatedAt),
        })
        .onConflictDoNothing()
        .returning({ id: findings.id });

      if (!finding) continue;
      await db.insert(findingSources).values({
        findingId: finding.id,
        url: candidate.url,
        label: `${candidate.company} job posting`,
        sourceType: candidate.source,
      });
      surfaced += 1;
    }

    const result: CareerWorkflowResult = {
      workflowRunId: run.id,
      retrieved: listings.length,
      changed: changed.length + filteredCount,
      filtered: filteredCount,
      evaluated: changed.length,
      surfaced,
      aiSkippedReason: evaluationResult.aiSkippedReason,
    };

    await db
      .update(workflowRuns)
      .set({
        status: "completed",
        retrievedCount: result.retrieved,
        changedCount: result.changed,
        filteredCount: result.filtered,
        evaluatedCount: result.evaluated,
        surfacedCount: result.surfaced,
        aiSkippedReason: result.aiSkippedReason,
        completedAt: new Date(),
      })
      .where(eq(workflowRuns.id, run.id));
    await db
      .update(workflows)
      .set({ lastRunAt: new Date(), updatedAt: new Date() })
      .where(eq(workflows.id, workflow.id));
    return result;
  } catch (error) {
    await db
      .update(workflowRuns)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      })
      .where(eq(workflowRuns.id, run.id));
    throw error;
  }
}

export async function resetDemoCareerData(): Promise<void> {
  const [workflow] = await db
    .select({ id: workflows.id })
    .from(workflows)
    .where(eq(workflows.slug, "career-monitor"))
    .limit(1);
  if (!workflow) return;
  await db.delete(sourceSnapshots).where(eq(sourceSnapshots.workflowId, workflow.id));
  await db.delete(findings).where(eq(findings.workflowId, workflow.id));
  await db
    .update(workflowRuns)
    .set({ completedAt: drizzleSql`coalesce(${workflowRuns.completedAt}, now())` })
    .where(eq(workflowRuns.workflowId, workflow.id));
}
