import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { findingEvents, findings, findingSources } from "@/db/schema";
import { assertFindingTransition } from "./transitions";
import type { DashboardFinding, FindingDetails, FindingStatus } from "./types";

export async function listAttentionFindings(): Promise<DashboardFinding[]> {
  const rows = await db
    .select({
      id: findings.id,
      title: findings.title,
      subtitle: findings.subtitle,
      priority: findings.priority,
      whatChanged: findings.whatChanged,
      whyItMatters: findings.whyItMatters,
      recommendation: findings.recommendation,
      confidence: findings.confidence,
      status: findings.status,
      createdAt: findings.createdAt,
      details: findings.details,
      sourceUrl: findingSources.url,
    })
    .from(findings)
    .leftJoin(findingSources, eq(findingSources.findingId, findings.id))
    .where(inArray(findings.status, ["new", "reviewed"]))
    .orderBy(desc(findings.createdAt));

  const deduped = new Map<number, DashboardFinding>();
  for (const row of rows) {
    if (deduped.has(row.id)) continue;
    deduped.set(row.id, {
      ...row,
      confidence: row.confidence === null ? null : Number(row.confidence),
      details: row.details as FindingDetails,
    });
  }
  const priorityRank = { high: 0, medium: 1, low: 2 } as const;
  return [...deduped.values()].sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export async function transitionFinding(
  id: number,
  toStatus: FindingStatus,
  options: { snoozedUntil?: Date; note?: string } = {},
): Promise<void> {
  await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: findings.status })
      .from(findings)
      .where(eq(findings.id, id))
      .limit(1)
      .for("update");

    if (!current) throw new Error("Finding not found.");
    assertFindingTransition(current.status, toStatus);

    await tx
      .update(findings)
      .set({
        status: toStatus,
        snoozedUntil: toStatus === "snoozed" ? options.snoozedUntil : null,
        updatedAt: new Date(),
      })
      .where(eq(findings.id, id));

    await tx.insert(findingEvents).values({
      findingId: id,
      fromStatus: current.status,
      toStatus,
      note: options.note,
    });
  });
}
