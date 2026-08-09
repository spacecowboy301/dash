# Roadmap

## Phase 0 — Project Setup

- Create repository
- Add persistent project documentation
- Choose minimal stack
- Scaffold application
- Configure local development
- Configure secrets/environment handling

Success criteria:
- application runs locally
- docs are committed
- deployment path is clear

---

## Phase 1 — Core Personal OS

Build:
- shared database schema
- finding model
- Home dashboard
- Needs Attention
- finding status actions
- workflow activity view
- basic watchlist model

Success criteria:
- manually inserted findings render correctly
- user can review, dismiss, snooze, and mark acted
- mobile experience is usable

---

## Phase 2 — First End-to-End Workflow

Preferred: Career

Build:
- source adapter
- retrieval
- normalization
- deduplication
- deterministic filtering
- AI scoring
- persistence
- Home surfacing
- direct application links

Success criteria:
- workflow can run end-to-end
- unchanged listings do not generate duplicate findings
- weak opportunities stay hidden
- strong opportunities appear with rationale and source

---

## Phase 3 — Reusable Monitoring Framework

Extract common components:
- schedules
- change detection
- source state
- deduplication
- structured AI output
- alert thresholds
- workflow logging
- model usage tracking

Success criteria:
- second workflow can be added without duplicating core orchestration logic

---

## Phase 4 — Shopping

Build:
- watch items
- size/availability checks
- price tracking
- aesthetic/fit/quality/value evaluation
- direct product links

Success criteria:
- system remains quiet when nothing worthwhile changes
- recommendations follow stored ranking priorities

---

## Phase 5 — Travel

Build:
- route watches
- fare/history comparisons where available
- itinerary quality evaluation
- book / wait / investigate recommendation

Success criteria:
- normal fare noise is suppressed
- meaningful opportunities surface clearly

---

## Phase 6 — Personal Brief

Build:
- cross-domain aggregation
- priority ranking
- periodic brief
- pending-action review

Success criteria:
- brief is concise and action-oriented

---

## Phase 7 — General-Purpose Agent

Add one agent that can:
- query Personal OS data
- use available research tools
- invoke existing workflows
- reason across domains
- prepare actions

Do not add multiple autonomous agents unless clearly justified.

---

## Phase 8 — Calendar and Email Integration

Add:
- calendar reading
- conflict detection
- pending-action surfacing
- inbox triage
- prepared drafts

Keep consequential send/update actions approval-gated.

---

## Phase 9 — Additional Domains

Potential:
- investing
- fitness
- life admin

Only add when a recurring workflow is clearly valuable.

---

## Phase 10 — ChatGPT Integration

Expose Personal OS through a supported integration layer so ChatGPT can:
- query findings
- inspect watchlists
- create/update monitors
- retrieve pending actions
- invoke supported workflows

Personal OS remains the source of truth.

---

## Build Discipline

At every phase:

1. Ship the smallest useful slice.
2. Measure whether it reduces attention or manual checking.
3. Remove noise before adding features.
4. Avoid speculative infrastructure.
5. Keep AI usage proportional to actual decision value.
