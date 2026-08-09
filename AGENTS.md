# AGENTS.md

## Project: Personal OS

This repository implements a mobile-first Personal OS: a central hub for proactive monitoring, AI-assisted workflows, and decision support.

## Core Product Principle

Optimize for **attention efficiency**, not information volume.

When the user opens Home, the system should make it immediately clear:

1. What changed?
2. What matters?
3. What should the user consider doing?
4. What can safely be ignored?

Avoid surfacing low-value noise.

## Architecture Principle

Use the simplest execution layer that works:

- **Automation** for deterministic recurring checks.
- **AI workflow** for structured multi-step tasks that need judgment.
- **Agent** only when the path to the goal cannot reasonably be predetermined.

Do not create a separate autonomous agent for every life domain unless there is a clear technical need.

Prefer an event-driven system:

1. Perform a cheap deterministic check.
2. Detect whether something meaningful changed.
3. Stop if nothing changed.
4. Invoke AI only when judgment is useful.
5. Save a structured finding.
6. Surface it only if it clears the attention threshold.

## Home Dashboard

Primary sections:

- Needs Attention
- Today
- Watchlists
- Recent Changes
- Workflow Activity
- Later / Saved
- Settings

`Needs Attention` is the highest-priority product surface.

## Shared Finding Model

Every workflow should normalize results into a common schema with at least:

- category
- title
- priority
- what_changed
- why_it_matters
- recommendation
- source_urls
- timestamp
- status
- confidence
- workflow_id
- external_entity_id when relevant

Supported statuses should include:

- new
- reviewed
- dismissed
- snoozed
- acted

The UI should not care whether a finding originated from deterministic code, an API poll, an LLM workflow, an agent, or manual entry.

## Permission Model

Use three conceptual levels:

### Observe
May retrieve, monitor, analyze, and write findings.

### Prepare
May prepare external actions for review, such as:
- email drafts
- job application materials
- itinerary changes
- proposed calendar changes

### Execute
May modify external systems.

Initially, consequential actions require explicit user approval. Do not autonomously:

- trade securities
- purchase products
- book travel
- submit job applications
- send consequential communications

## Cost Discipline

Keep AI usage low.

- Do not call a model when source inputs are unchanged.
- Prefer deterministic filters before AI.
- Cache reusable analysis.
- Batch related analysis when appropriate.
- Track usage by workflow.
- Preserve the ability to add hard monthly budget limits later.

## Engineering Principles

- Prefer simplicity over speculative extensibility.
- Keep workflows modular.
- Keep source adapters separate from analysis logic.
- Preserve provenance and direct source URLs.
- Avoid duplicate alerts.
- Make workflows observable and debuggable.
- Store important product and architecture decisions in repository docs rather than relying on chat history.
- Add infrastructure only when required by a current feature.
- Prefer one working vertical slice over a broad but incomplete platform.

## Initial Build Order

1. Scaffold application.
2. Define shared data model.
3. Build mobile Home dashboard.
4. Build reusable finding/action state handling.
5. Implement one end-to-end workflow.
6. Add tests.
7. Document local setup.
8. Add more workflows only after the first vertical works.

Use Career as the first workflow unless another workflow provides a clearly better end-to-end proof.

## Documentation

Maintain these files:

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/WORKFLOWS.md`
- `docs/DECISIONS.md`
- `docs/ROADMAP.md`

When making a material product or architecture decision, update `docs/DECISIONS.md`.

## Codex Working Style

Before implementing major changes:

1. Restate the intended behavior.
2. Identify unnecessary complexity.
3. Recommend the smallest viable implementation.
4. Separate decisions required now from decisions that can wait.
5. Then implement.

Challenge overengineering when a simpler approach satisfies the product goal.
