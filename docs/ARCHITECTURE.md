# Architecture

## High-Level Structure

```text
Phone
  ↓
Personal OS Home
  ↓
Application Backend
  ↓
Shared Database
  ↓
Automations / AI Workflows / General-Purpose Agent
  ↓
External APIs, web sources, email, calendar, other services
```

## Core Components

### 1. Mobile-First Frontend
Recommended starting point: React / Next.js or equivalent.

Responsibilities:
- Home dashboard
- finding review state
- watchlist management
- workflow status
- settings
- approval surfaces for prepared actions

### 2. Backend/API
Responsibilities:
- source retrieval orchestration
- workflow execution
- AI invocation
- deduplication
- change detection
- persistence
- permission enforcement
- usage tracking

### 3. Shared Database
Recommended starting point: PostgreSQL / Supabase-style persistence.

Core entities should likely include:

#### findings
- id
- category
- title
- priority
- what_changed
- why_it_matters
- recommendation
- confidence
- status
- workflow_id
- created_at
- updated_at
- source_metadata

#### sources
- id
- finding_id
- url
- source_type
- title
- retrieved_at

#### watch_items
- id
- category
- external_id
- label
- config
- active
- last_checked_at
- last_state_hash

#### workflows
- id
- type
- name
- config
- enabled
- schedule
- last_run_at
- last_result

#### prepared_actions
- id
- finding_id
- action_type
- payload
- permission_level
- status
- created_at

#### usage
- workflow_id
- provider
- model
- input_tokens
- output_tokens
- estimated_cost
- timestamp

The exact schema may change after implementation begins.

## Execution Model

### Deterministic monitor
```text
fetch source
→ normalize
→ compare to prior state
→ no meaningful change: stop
→ meaningful change: continue
```

### AI workflow
```text
trigger
→ retrieve relevant inputs
→ deterministic filtering
→ AI judgment / scoring
→ structured result
→ persist
→ threshold check
→ surface if worthwhile
```

### General-purpose agent
Use only when:
- the user provides a goal instead of a known procedure
- tools/steps must be selected dynamically
- the task may need iterative planning and recovery

## Event-Driven First

Avoid repeated full-context reasoning.

Prefer:
- content hashes
- structured state comparison
- threshold-based triggers
- incremental updates
- cached model outputs

## Shared Finding Contract

All workflows should emit a common typed result, conceptually:

```ts
type Finding = {
  id: string
  category: string
  title: string
  priority: "high" | "medium" | "low"
  whatChanged: string
  whyItMatters: string
  recommendation?: string
  confidence?: number
  sources: Source[]
  status: "new" | "reviewed" | "dismissed" | "snoozed" | "acted"
  workflowId: string
  createdAt: string
}
```

## AI Integration

AI should be used for:
- classification
- ranking
- comparison
- summarization
- recommendation
- deeper analysis after meaningful change detection

AI should not be used merely to determine that unchanged data is unchanged.

## ChatGPT Integration

Long-term design:

```text
Personal OS backend = source of truth
Personal OS dashboard = primary proactive interface
ChatGPT = conversational interface to Personal OS data/actions
```

Keep the backend modular so it can later expose supported APIs/tools to ChatGPT.

Do not make native ChatGPT scheduled tasks the canonical system state.

## Security

Principles:
- least privilege
- read access before write access
- explicit approval for consequential actions
- keep credentials server-side
- log external actions
- isolate workflow permissions where practical

## Hosting

For the first version, choose the simplest low-maintenance deployment that supports:
- mobile web access
- persistent database
- scheduled jobs
- secret management
- low-volume API traffic

A common approach is managed frontend hosting plus managed Postgres, but implementation should choose based on simplicity rather than brand preference.

## Milestone-One Implementation

The first vertical slice is one Next.js App Router application rather than separate frontend and backend services.

```text
Next.js server-rendered Home
  → server actions / workflow scripts
  → Drizzle query layer
  → PostgreSQL
  → Career source adapters
  → deterministic change detection and filters
  → optional budget-gated OpenAI evaluator
```

Core tables:

- `workflows` and `workflow_runs`
- `source_snapshots`
- `findings`, `finding_sources`, and `finding_events`
- `ai_budget_months` and `model_usage`

The OpenAI call occurs outside database transactions. A short transaction first reserves conservative estimated cost; a second transaction records actual usage and releases the unused reservation. An operational ceiling of $4.50 protects the $5 hard limit from estimation and provider-enforcement lag.

Authentication, scheduling infrastructure, prepared actions, additional workflow domains, and production hosting remain deferred.
