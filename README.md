# Dash — Personal OS

Dash is a mobile-first Personal OS that surfaces a small number of meaningful changes. The first vertical slice includes a persisted Home dashboard, reusable finding states, workflow activity, and a Career monitor with deterministic filtering and optional budget-gated OpenAI evaluation.

## What works

- PostgreSQL-backed findings, sources, snapshots, workflow runs, status history, and model usage
- mobile Home with review, dismiss, snooze, and acted states
- Career source adapters for demo fixtures and public Greenhouse boards
- hash-based change detection and deterministic mismatch filtering before AI
- optional OpenAI Responses API structured evaluation
- application-enforced $5 monthly limit with a $0.50 safety buffer
- per-workflow token and estimated-cost ledger

## Local setup

Requirements: Node.js 20+ with pnpm and PostgreSQL 15+.

```bash
cp .env.example .env.local
createdb personal_os
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The seed workflow uses deterministic fixtures and does not require an OpenAI key. Re-running it demonstrates change detection: unchanged listings do not create new findings or model calls.

## Run the Career workflow

The fixture source is used by default:

```bash
pnpm workflow:career
```

To query one or more public Greenhouse boards, add this to `.env.local`:

```bash
GREENHOUSE_BOARDS=linear:Linear,notion:Notion
```

Each entry is `board-token:company-name`.

## Optional OpenAI evaluation

Set `OPENAI_API_KEY` locally to enable model evaluation. Never commit the key. The default evaluator uses `gpt-5.6-luna`, low reasoning effort, Structured Outputs, and `store: false`.

The application will not call OpenAI unless all of these are true:

1. source content changed;
2. deterministic filters passed;
3. judgment is useful;
4. an API key is configured; and
5. a conservative cost reservation fits below the operational ceiling.

The database hard limit is $5.00/month and new calls stop at $4.50 to preserve a safety buffer. Price assumptions are configurable because provider pricing can change. Also configure a $5 project hard limit in the [OpenAI API project settings](https://developers.openai.com/api/docs/guides/spend-limits). Provider enforcement can lag slightly, so the local ledger remains the first line of defense.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Current boundary

This milestone is single-user and local-first. Do not expose it publicly until authentication is added. Scheduling, additional workflows, prepared actions, and ChatGPT integration are deliberately deferred.
