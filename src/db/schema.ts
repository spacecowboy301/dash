import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const findingPriority = pgEnum("finding_priority", ["high", "medium", "low"]);
export const findingStatus = pgEnum("finding_status", [
  "new",
  "reviewed",
  "dismissed",
  "snoozed",
  "acted",
]);
export const workflowRunStatus = pgEnum("workflow_run_status", [
  "running",
  "completed",
  "failed",
]);
export const modelUsageStatus = pgEnum("model_usage_status", [
  "reserved",
  "completed",
  "skipped",
  "failed",
]);

export const workflows = pgTable(
  "workflows",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    enabled: integer("enabled").notNull().default(1),
    permissionLevel: text("permission_level").notNull().default("observe"),
    config: jsonb("config").notNull().default({}),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("workflows_slug_uidx").on(table.slug),
    check("workflows_enabled_check", sql`${table.enabled} in (0, 1)`),
    check(
      "workflows_permission_level_check",
      sql`${table.permissionLevel} in ('observe', 'prepare', 'execute')`,
    ),
  ],
);

export const workflowRuns = pgTable(
  "workflow_runs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    workflowId: bigint("workflow_id", { mode: "number" })
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    status: workflowRunStatus("status").notNull().default("running"),
    trigger: text("trigger").notNull().default("manual"),
    retrievedCount: integer("retrieved_count").notNull().default(0),
    changedCount: integer("changed_count").notNull().default(0),
    filteredCount: integer("filtered_count").notNull().default(0),
    evaluatedCount: integer("evaluated_count").notNull().default(0),
    surfacedCount: integer("surfaced_count").notNull().default(0),
    aiSkippedReason: text("ai_skipped_reason"),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [index("workflow_runs_workflow_started_idx").on(table.workflowId, table.startedAt)],
);

export const findings = pgTable(
  "findings",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    workflowId: bigint("workflow_id", { mode: "number" })
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    workflowRunId: bigint("workflow_run_id", { mode: "number" }).references(
      () => workflowRuns.id,
      { onDelete: "set null" },
    ),
    category: text("category").notNull(),
    externalEntityId: text("external_entity_id"),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    priority: findingPriority("priority").notNull(),
    whatChanged: text("what_changed").notNull(),
    whyItMatters: text("why_it_matters").notNull(),
    recommendation: text("recommendation"),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    status: findingStatus("status").notNull().default("new"),
    sourceHash: text("source_hash").notNull(),
    details: jsonb("details").notNull().default({}),
    snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("findings_workflow_entity_hash_uidx").on(
      table.workflowId,
      table.externalEntityId,
      table.sourceHash,
    ),
    index("findings_attention_idx")
      .on(table.status, table.priority, table.createdAt)
      .where(sql`${table.status} in ('new', 'reviewed')`),
    index("findings_workflow_idx").on(table.workflowId),
    index("findings_workflow_run_idx").on(table.workflowRunId),
    check("findings_confidence_check", sql`${table.confidence} is null or (${table.confidence} >= 0 and ${table.confidence} <= 1)`),
  ],
);

export const findingSources = pgTable(
  "finding_sources",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    findingId: bigint("finding_id", { mode: "number" })
      .notNull()
      .references(() => findings.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    label: text("label"),
    sourceType: text("source_type").notNull(),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("finding_sources_finding_url_uidx").on(table.findingId, table.url),
    index("finding_sources_finding_idx").on(table.findingId),
  ],
);

export const findingEvents = pgTable(
  "finding_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    findingId: bigint("finding_id", { mode: "number" })
      .notNull()
      .references(() => findings.id, { onDelete: "cascade" }),
    fromStatus: findingStatus("from_status"),
    toStatus: findingStatus("to_status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("finding_events_finding_created_idx").on(table.findingId, table.createdAt)],
);

export const sourceSnapshots = pgTable(
  "source_snapshots",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    workflowId: bigint("workflow_id", { mode: "number" })
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    externalEntityId: text("external_entity_id").notNull(),
    sourceHash: text("source_hash").notNull(),
    payload: jsonb("payload").notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("source_snapshots_workflow_entity_uidx").on(
      table.workflowId,
      table.externalEntityId,
    ),
    index("source_snapshots_workflow_idx").on(table.workflowId),
  ],
);

export const aiBudgetMonths = pgTable(
  "ai_budget_months",
  {
    month: date("month").primaryKey(),
    hardLimitMicroUsd: bigint("hard_limit_micro_usd", { mode: "number" }).notNull(),
    spentMicroUsd: bigint("spent_micro_usd", { mode: "number" }).notNull().default(0),
    reservedMicroUsd: bigint("reserved_micro_usd", { mode: "number" }).notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("ai_budget_limit_positive_check", sql`${table.hardLimitMicroUsd} > 0`),
    check("ai_budget_spent_nonnegative_check", sql`${table.spentMicroUsd} >= 0`),
    check("ai_budget_reserved_nonnegative_check", sql`${table.reservedMicroUsd} >= 0`),
    check(
      "ai_budget_total_within_limit_check",
      sql`${table.spentMicroUsd} + ${table.reservedMicroUsd} <= ${table.hardLimitMicroUsd}`,
    ),
  ],
);

export const modelUsage = pgTable(
  "model_usage",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    workflowId: bigint("workflow_id", { mode: "number" })
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    workflowRunId: bigint("workflow_run_id", { mode: "number" }).references(
      () => workflowRuns.id,
      { onDelete: "set null" },
    ),
    month: date("month").notNull(),
    provider: text("provider").notNull().default("openai"),
    model: text("model").notNull(),
    status: modelUsageStatus("status").notNull(),
    reservationMicroUsd: bigint("reservation_micro_usd", { mode: "number" }).notNull().default(0),
    actualCostMicroUsd: bigint("actual_cost_micro_usd", { mode: "number" }).notNull().default(0),
    inputTokens: integer("input_tokens").notNull().default(0),
    cachedInputTokens: integer("cached_input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    requestId: text("request_id"),
    skippedReason: text("skipped_reason"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("model_usage_workflow_month_idx").on(table.workflowId, table.month),
    index("model_usage_run_idx").on(table.workflowRunId),
    check("model_usage_reservation_nonnegative_check", sql`${table.reservationMicroUsd} >= 0`),
    check("model_usage_actual_nonnegative_check", sql`${table.actualCostMicroUsd} >= 0`),
  ],
);
