CREATE TYPE "public"."finding_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."finding_status" AS ENUM('new', 'reviewed', 'dismissed', 'snoozed', 'acted');--> statement-breakpoint
CREATE TYPE "public"."model_usage_status" AS ENUM('reserved', 'completed', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."workflow_run_status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "ai_budget_months" (
	"month" date PRIMARY KEY NOT NULL,
	"hard_limit_micro_usd" bigint NOT NULL,
	"spent_micro_usd" bigint DEFAULT 0 NOT NULL,
	"reserved_micro_usd" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_budget_limit_positive_check" CHECK ("ai_budget_months"."hard_limit_micro_usd" > 0),
	CONSTRAINT "ai_budget_spent_nonnegative_check" CHECK ("ai_budget_months"."spent_micro_usd" >= 0),
	CONSTRAINT "ai_budget_reserved_nonnegative_check" CHECK ("ai_budget_months"."reserved_micro_usd" >= 0),
	CONSTRAINT "ai_budget_total_within_limit_check" CHECK ("ai_budget_months"."spent_micro_usd" + "ai_budget_months"."reserved_micro_usd" <= "ai_budget_months"."hard_limit_micro_usd")
);
--> statement-breakpoint
CREATE TABLE "finding_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"finding_id" bigint NOT NULL,
	"from_status" "finding_status",
	"to_status" "finding_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finding_sources" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"finding_id" bigint NOT NULL,
	"url" text NOT NULL,
	"label" text,
	"source_type" text NOT NULL,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "findings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"workflow_id" bigint NOT NULL,
	"workflow_run_id" bigint,
	"category" text NOT NULL,
	"external_entity_id" text,
	"title" text NOT NULL,
	"subtitle" text,
	"priority" "finding_priority" NOT NULL,
	"what_changed" text NOT NULL,
	"why_it_matters" text NOT NULL,
	"recommendation" text,
	"confidence" numeric(5, 4),
	"status" "finding_status" DEFAULT 'new' NOT NULL,
	"source_hash" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"snoozed_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "findings_confidence_check" CHECK ("findings"."confidence" is null or ("findings"."confidence" >= 0 and "findings"."confidence" <= 1))
);
--> statement-breakpoint
CREATE TABLE "model_usage" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"workflow_id" bigint NOT NULL,
	"workflow_run_id" bigint,
	"month" date NOT NULL,
	"provider" text DEFAULT 'openai' NOT NULL,
	"model" text NOT NULL,
	"status" "model_usage_status" NOT NULL,
	"reservation_micro_usd" bigint DEFAULT 0 NOT NULL,
	"actual_cost_micro_usd" bigint DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"cached_input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"request_id" text,
	"skipped_reason" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "model_usage_reservation_nonnegative_check" CHECK ("model_usage"."reservation_micro_usd" >= 0),
	CONSTRAINT "model_usage_actual_nonnegative_check" CHECK ("model_usage"."actual_cost_micro_usd" >= 0)
);
--> statement-breakpoint
CREATE TABLE "source_snapshots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"workflow_id" bigint NOT NULL,
	"external_entity_id" text NOT NULL,
	"source_hash" text NOT NULL,
	"payload" jsonb NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_runs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"workflow_id" bigint NOT NULL,
	"status" "workflow_run_status" DEFAULT 'running' NOT NULL,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"retrieved_count" integer DEFAULT 0 NOT NULL,
	"changed_count" integer DEFAULT 0 NOT NULL,
	"filtered_count" integer DEFAULT 0 NOT NULL,
	"evaluated_count" integer DEFAULT 0 NOT NULL,
	"surfaced_count" integer DEFAULT 0 NOT NULL,
	"ai_skipped_reason" text,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"enabled" integer DEFAULT 1 NOT NULL,
	"permission_level" text DEFAULT 'observe' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workflows_enabled_check" CHECK ("workflows"."enabled" in (0, 1)),
	CONSTRAINT "workflows_permission_level_check" CHECK ("workflows"."permission_level" in ('observe', 'prepare', 'execute'))
);
--> statement-breakpoint
ALTER TABLE "finding_events" ADD CONSTRAINT "finding_events_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finding_sources" ADD CONSTRAINT "finding_sources_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_usage" ADD CONSTRAINT "model_usage_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_usage" ADD CONSTRAINT "model_usage_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finding_events_finding_created_idx" ON "finding_events" USING btree ("finding_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "finding_sources_finding_url_uidx" ON "finding_sources" USING btree ("finding_id","url");--> statement-breakpoint
CREATE INDEX "finding_sources_finding_idx" ON "finding_sources" USING btree ("finding_id");--> statement-breakpoint
CREATE UNIQUE INDEX "findings_workflow_entity_hash_uidx" ON "findings" USING btree ("workflow_id","external_entity_id","source_hash");--> statement-breakpoint
CREATE INDEX "findings_attention_idx" ON "findings" USING btree ("status","priority","created_at") WHERE "findings"."status" in ('new', 'reviewed');--> statement-breakpoint
CREATE INDEX "findings_workflow_idx" ON "findings" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "findings_workflow_run_idx" ON "findings" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "model_usage_workflow_month_idx" ON "model_usage" USING btree ("workflow_id","month");--> statement-breakpoint
CREATE INDEX "model_usage_run_idx" ON "model_usage" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_snapshots_workflow_entity_uidx" ON "source_snapshots" USING btree ("workflow_id","external_entity_id");--> statement-breakpoint
CREATE INDEX "source_snapshots_workflow_idx" ON "source_snapshots" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "workflow_runs_workflow_started_idx" ON "workflow_runs" USING btree ("workflow_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "workflows_slug_uidx" ON "workflows" USING btree ("slug");