import { desc, eq } from "drizzle-orm";
import { getCurrentBudgetSummary } from "@/ai/budget";
import { db } from "@/db/client";
import { workflowRuns, workflows } from "@/db/schema";
import { listAttentionFindings } from "@/domain/findings/repository";

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData() {
  const findingsPromise = listAttentionFindings();
  const activityPromise = db
    .select({
      workflowName: workflows.name,
      status: workflowRuns.status,
      retrievedCount: workflowRuns.retrievedCount,
      changedCount: workflowRuns.changedCount,
      filteredCount: workflowRuns.filteredCount,
      surfacedCount: workflowRuns.surfacedCount,
      aiSkippedReason: workflowRuns.aiSkippedReason,
      completedAt: workflowRuns.completedAt,
    })
    .from(workflowRuns)
    .innerJoin(workflows, eq(workflows.id, workflowRuns.workflowId))
    .orderBy(desc(workflowRuns.startedAt))
    .limit(1);
  const budgetPromise = getCurrentBudgetSummary();

  const [attentionFindings, activityRows, budget] = await Promise.all([
    findingsPromise,
    activityPromise,
    budgetPromise,
  ]);

  return {
    attentionFindings,
    latestActivity: activityRows[0] ?? null,
    budget,
  };
}
