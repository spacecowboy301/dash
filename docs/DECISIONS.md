# Decisions

This file records material product and architecture decisions.

---

## D-001: Personal OS is the central hub

**Decision:** Build one mobile-first Home dashboard as the primary proactive interface.

**Rationale:** The goal is to reduce attention fragmentation across many monitors and tools.

---

## D-002: Optimize for attention, not information volume

**Decision:** Surface only meaningful, actionable changes.

**Rationale:** A successful system should reduce checking behavior rather than create another feed.

---

## D-003: Prefer automation → workflow → agent

**Decision:** Use the simplest execution mechanism that solves the problem.

**Rationale:** Most recurring personal monitoring tasks are predictable and do not require open-ended autonomy.

---

## D-004: Event-driven by default

**Decision:** Perform cheap change detection before invoking AI.

**Rationale:** This reduces noise, latency, and API spend.

---

## D-005: One shared finding model

**Decision:** Normalize workflow outputs into a shared schema.

**Rationale:** The Home dashboard should not care what mechanism created the finding.

---

## D-006: One general-purpose agent before multiple specialized agents

**Decision:** Do not initially create separate autonomous Career, Shopping, Travel, Fitness, Investing, and Admin agents.

**Rationale:** Specialized workflows are sufficient for most predictable recurring tasks.

---

## D-007: Consequential actions require approval

**Decision:** AI may Observe and Prepare broadly, but high-impact Execute actions require explicit user approval initially.

**Examples:** purchases, bookings, job submissions, securities trades, consequential email sending.

---

## D-008: Personal OS backend is the long-term source of truth

**Decision:** Monitoring state should eventually live in Personal OS rather than depend on native ChatGPT scheduled tasks.

**Rationale:** One backend can power both the dashboard and future conversational integrations.

---

## D-009: Career is the preferred first vertical

**Decision:** Use Career as the first complete monitor/workflow unless implementation reveals a materially simpler proof case.

**Rationale:** It exercises retrieval, deduplication, filtering, AI scoring, source links, persistence, and dashboard surfacing.

---

## D-010: Shopping ranking priorities

**Decision:** Evaluate shopping opportunities in this order:

1. color / aesthetic
2. fit
3. quality / material / construction
4. price / value

**Rationale:** A low price is not sufficient when aesthetic, fit, or quality are weak.

---

## D-011: Direct links are mandatory for actionable external items

**Decision:** Surfaced jobs and products should include direct source/application/product links.

**Rationale:** The system should minimize friction between finding and action.

---

## D-012: Keep repository docs as durable context

**Decision:** Product and architecture context should live in repository Markdown files.

**Rationale:** Codex and other engineering tools can then operate from durable project context rather than one chat thread.

---

## D-013: Use a Next.js full-stack monolith for milestone one

**Decision:** Keep the dashboard, server actions, workflow orchestration, and database access in one TypeScript application.

**Rationale:** A separate backend service adds deployment and coordination cost without improving the first vertical slice.

---

## D-014: Use PostgreSQL with a thin typed query layer

**Decision:** Persist shared state in PostgreSQL through Drizzle and checked-in SQL migrations.

**Rationale:** PostgreSQL matches the long-term source-of-truth requirement while keeping the schema explicit and portable.

---

## D-015: Manually trigger workflows before adding a scheduler

**Decision:** Run the Career workflow through a local command in milestone one.

**Rationale:** Scheduling infrastructure is unnecessary until the workflow is useful and stable.

---

## D-016: Enforce a $5 monthly OpenAI ceiling in two layers

**Decision:** Reserve model cost atomically in the application, stop new calls at a $4.50 operational ceiling, and require a $5 OpenAI project limit as a provider backstop.

**Rationale:** Provider hard limits can have enforcement lag. The local ledger provides deterministic workflow-level control and attribution.

---

## D-017: Use GPT-5.6 Luna for optional Career judgment

**Decision:** Default to `gpt-5.6-luna` with low reasoning effort, bounded output, Structured Outputs, and no response storage.

**Rationale:** Career evaluation is a focused classification and ranking task. The model is configurable so it can change after evaluation without touching workflow logic.

---

## D-018: Keep the first milestone local-only

**Decision:** Do not publicly deploy until authentication exists.

**Rationale:** The application contains personal decision data and currently assumes one trusted local user.
