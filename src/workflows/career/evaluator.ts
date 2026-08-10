import OpenAI from "openai";
import { z } from "zod";
import {
  estimateReservationMicroUsd,
  finalizeModelBudget,
  recordSkippedModelCall,
  releaseModelBudget,
  reserveModelBudget,
} from "@/ai/budget";
import type {
  CareerEvaluation,
  CareerEvaluator,
  NormalizedCareerCandidate,
} from "./types";
import { deterministicEvaluate } from "./deterministic-evaluator";

const MAX_OUTPUT_TOKENS = 900;

const evaluationResponseSchema = z.object({
  evaluations: z.array(
    z.object({
      externalId: z.string(),
      fitScore: z.number().int().min(0).max(100),
      rationale: z.string(),
      concerns: z.array(z.string()),
      recommendation: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
});

export class BudgetGatedCareerEvaluator implements CareerEvaluator {
  async evaluate(
    candidates: NormalizedCareerCandidate[],
    context: { workflowId: number; workflowRunId: number },
  ): Promise<{ evaluations: CareerEvaluation[]; aiSkippedReason?: string }> {
    const model = process.env.OPENAI_MODEL ?? "gpt-5.6-luna";
    if (candidates.length === 0) return { evaluations: [] };

    if (!process.env.OPENAI_API_KEY) {
      const reason = "OPENAI_API_KEY is not configured; deterministic evaluation used.";
      await recordSkippedModelCall({ ...context, model, reason });
      return { evaluations: deterministicEvaluate(candidates), aiSkippedReason: reason };
    }

    const prompt = buildPrompt(candidates);
    const amountMicroUsd = estimateReservationMicroUsd(prompt, MAX_OUTPUT_TOKENS);
    const reservation = await reserveModelBudget({ ...context, model, amountMicroUsd });
    if (!reservation) {
      const reason = "Monthly AI budget is exhausted or reserved.";
      await recordSkippedModelCall({ ...context, model, reason });
      return { evaluations: deterministicEvaluate(candidates), aiSkippedReason: reason };
    }

    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model,
        store: false,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        reasoning: { effort: "low" },
        input: prompt,
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "career_evaluations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["evaluations"],
              properties: {
                evaluations: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: [
                      "externalId",
                      "fitScore",
                      "rationale",
                      "concerns",
                      "recommendation",
                      "priority",
                    ],
                    properties: {
                      externalId: { type: "string" },
                      fitScore: { type: "integer", minimum: 0, maximum: 100 },
                      rationale: { type: "string" },
                      concerns: { type: "array", items: { type: "string" } },
                      recommendation: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = evaluationResponseSchema.parse(JSON.parse(response.output_text));
      const usage = response.usage;
      if (!usage) throw new Error("OpenAI response did not include usage metadata.");
      await finalizeModelBudget(
        reservation,
        {
          inputTokens: usage.input_tokens,
          cachedInputTokens: usage.input_tokens_details.cached_tokens,
          outputTokens: usage.output_tokens,
        },
        response.id,
      );
      return parsed;
    } catch (error) {
      await releaseModelBudget(reservation, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

function buildPrompt(candidates: NormalizedCareerCandidate[]): string {
  return [
    "Evaluate only these pre-filtered career opportunities for a senior product/design leader.",
    "Prefer strong fit over volume. Return concise structured judgments and preserve each externalId.",
    JSON.stringify(
      candidates.map((candidate) => ({
        externalId: candidate.externalId,
        company: candidate.company,
        title: candidate.title,
        location: candidate.location,
        compensation: candidate.compensation,
        description: candidate.description,
        url: candidate.url,
        updatedAt: candidate.updatedAt,
      })),
    ),
  ].join("\n\n");
}
