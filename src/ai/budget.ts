import { sqlClient } from "@/db/client";
import { canReserveWithinOperationalCeiling } from "./policy";

const DEFAULT_HARD_LIMIT_MICRO_USD = 5_000_000;
const SAFETY_BUFFER_MICRO_USD = 500_000;

export type PriceAssumptions = {
  inputMicroUsdPerMillionTokens: number;
  outputMicroUsdPerMillionTokens: number;
};

export type UsageTokens = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
};

export type BudgetReservation = {
  usageId: number;
  month: string;
  amountMicroUsd: number;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getHardLimitMicroUsd(): number {
  return positiveInteger(process.env.OPENAI_MONTHLY_BUDGET_MICRO_USD, DEFAULT_HARD_LIMIT_MICRO_USD);
}

export function getPriceAssumptions(): PriceAssumptions {
  return {
    inputMicroUsdPerMillionTokens: positiveInteger(
      process.env.OPENAI_INPUT_MICRO_USD_PER_MILLION_TOKENS,
      1_000_000,
    ),
    outputMicroUsdPerMillionTokens: positiveInteger(
      process.env.OPENAI_OUTPUT_MICRO_USD_PER_MILLION_TOKENS,
      6_000_000,
    ),
  };
}

export function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function estimateReservationMicroUsd(
  input: string,
  maxOutputTokens: number,
  prices = getPriceAssumptions(),
): number {
  // UTF-8 bytes conservatively overestimate input tokens for normal prose.
  const conservativeInputTokens = Buffer.byteLength(input, "utf8");
  const estimated = Math.ceil(
    (conservativeInputTokens * prices.inputMicroUsdPerMillionTokens +
      maxOutputTokens * prices.outputMicroUsdPerMillionTokens) /
      1_000_000,
  );
  return Math.max(25_000, estimated);
}

export function actualCostMicroUsd(
  usage: UsageTokens,
  prices = getPriceAssumptions(),
): number {
  const uncachedInputTokens = Math.max(usage.inputTokens - usage.cachedInputTokens, 0);
  // Cached tokens are intentionally priced as regular input. This keeps the local
  // ledger conservative even if provider discounts change.
  const chargedInputTokens = uncachedInputTokens + usage.cachedInputTokens;
  return Math.ceil(
    (chargedInputTokens * prices.inputMicroUsdPerMillionTokens +
      usage.outputTokens * prices.outputMicroUsdPerMillionTokens) /
      1_000_000,
  );
}

export function canReserveModelBudget(input: {
  spentMicroUsd: number;
  reservedMicroUsd: number;
  requestedMicroUsd: number;
}): boolean {
  return canReserveWithinOperationalCeiling({
    ...input,
    hardLimitMicroUsd: getHardLimitMicroUsd(),
    safetyBufferMicroUsd: SAFETY_BUFFER_MICRO_USD,
  });
}

export async function reserveModelBudget(input: {
  workflowId: number;
  workflowRunId: number;
  model: string;
  amountMicroUsd: number;
}): Promise<BudgetReservation | null> {
  const month = monthKey();
  const hardLimit = getHardLimitMicroUsd();
  const operationalCeiling = Math.max(hardLimit - SAFETY_BUFFER_MICRO_USD, 0);

  return sqlClient.begin(async (sql) => {
    await sql`
      insert into ai_budget_months (month, hard_limit_micro_usd)
      values (${month}, ${hardLimit})
      on conflict (month) do update
      set hard_limit_micro_usd = excluded.hard_limit_micro_usd,
          updated_at = now()
    `;

    const budgetRows = await sql<{ month: string }[]>`
      update ai_budget_months
      set reserved_micro_usd = reserved_micro_usd + ${input.amountMicroUsd},
          updated_at = now()
      where month = ${month}
        and spent_micro_usd + reserved_micro_usd + ${input.amountMicroUsd} <= ${operationalCeiling}
      returning month::text
    `;
    if (budgetRows.length === 0) return null;

    const [usage] = await sql<{ id: number }[]>`
      insert into model_usage (
        workflow_id,
        workflow_run_id,
        month,
        model,
        status,
        reservation_micro_usd
      ) values (
        ${input.workflowId},
        ${input.workflowRunId},
        ${month},
        ${input.model},
        'reserved',
        ${input.amountMicroUsd}
      )
      returning id
    `;

    return {
      usageId: usage.id,
      month,
      amountMicroUsd: input.amountMicroUsd,
    };
  });
}

export async function finalizeModelBudget(
  reservation: BudgetReservation,
  usage: UsageTokens,
  requestId: string | null,
): Promise<number> {
  const actual = actualCostMicroUsd(usage);
  if (actual > reservation.amountMicroUsd) {
    throw new Error("Actual model cost exceeded its conservative reservation.");
  }

  await sqlClient.begin(async (sql) => {
    await sql`
      update ai_budget_months
      set reserved_micro_usd = reserved_micro_usd - ${reservation.amountMicroUsd},
          spent_micro_usd = spent_micro_usd + ${actual},
          updated_at = now()
      where month = ${reservation.month}
    `;
    await sql`
      update model_usage
      set status = 'completed',
          actual_cost_micro_usd = ${actual},
          input_tokens = ${usage.inputTokens},
          cached_input_tokens = ${usage.cachedInputTokens},
          output_tokens = ${usage.outputTokens},
          request_id = ${requestId},
          completed_at = now()
      where id = ${reservation.usageId}
    `;
  });
  return actual;
}

export async function releaseModelBudget(
  reservation: BudgetReservation,
  error: string,
): Promise<void> {
  await sqlClient.begin(async (sql) => {
    await sql`
      update ai_budget_months
      set reserved_micro_usd = greatest(reserved_micro_usd - ${reservation.amountMicroUsd}, 0),
          updated_at = now()
      where month = ${reservation.month}
    `;
    await sql`
      update model_usage
      set status = 'failed', error = ${error}, completed_at = now()
      where id = ${reservation.usageId}
    `;
  });
}

export async function recordSkippedModelCall(input: {
  workflowId: number;
  workflowRunId: number;
  model: string;
  reason: string;
}): Promise<void> {
  await sqlClient`
    insert into model_usage (
      workflow_id, workflow_run_id, month, model, status, skipped_reason, completed_at
    ) values (
      ${input.workflowId}, ${input.workflowRunId}, ${monthKey()}, ${input.model},
      'skipped', ${input.reason}, now()
    )
  `;
}

export async function getCurrentBudgetSummary(): Promise<{
  hardLimitMicroUsd: number;
  spentMicroUsd: number;
  reservedMicroUsd: number;
}> {
  const month = monthKey();
  const [row] = await sqlClient<
    { hard_limit_micro_usd: string; spent_micro_usd: string; reserved_micro_usd: string }[]
  >`
    select hard_limit_micro_usd, spent_micro_usd, reserved_micro_usd
    from ai_budget_months
    where month = ${month}
  `;
  if (!row) {
    return {
      hardLimitMicroUsd: getHardLimitMicroUsd(),
      spentMicroUsd: 0,
      reservedMicroUsd: 0,
    };
  }
  return {
    hardLimitMicroUsd: Number(row.hard_limit_micro_usd),
    spentMicroUsd: Number(row.spent_micro_usd),
    reservedMicroUsd: Number(row.reserved_micro_usd),
  };
}
