# Workflows

## Workflow Design Standard

Every workflow should follow this pattern where possible:

```text
cheap retrieval/check
→ normalize
→ compare with prior state
→ stop if nothing meaningful changed
→ apply deterministic filters
→ invoke AI only if judgment is needed
→ emit structured finding
→ persist
→ surface only if it clears threshold
```

Each workflow must preserve source provenance.

---

## Career Workflow

### Goal
Find strong job opportunities without requiring manual job-board checking.

### Flow

```text
search configured sources
→ normalize listings
→ deduplicate
→ remove obvious mismatches
→ evaluate remaining roles
→ AI score promising roles
→ persist
→ surface only strong opportunities
```

### Output
Each surfaced role should include:
- company
- title
- location
- compensation when available
- direct application/posting URL
- fit score
- rationale
- concerns
- recommendation

### Product Rule
Do not surface weak roles simply to provide volume.

---

## Shopping Workflow

### Goal
Monitor desired products and brands and surface only worthwhile buying opportunities.

### Flow

```text
check watched products / configured sources
→ detect product, size, availability, or price change
→ apply personal criteria
→ AI evaluate when needed
→ persist
→ surface only worthwhile items
```

### Evaluation Priority

1. color / aesthetic
2. fit
3. quality / material / construction
4. price / value

A low price does not compensate for failing the first three criteria.

### Output
Each surfaced item should include:
- product
- brand
- size status
- price
- direct product URL
- aesthetic assessment
- fit assessment
- quality assessment
- value assessment
- recommendation

---

## Travel Workflow

### Goal
Monitor travel opportunities and conditions without surfacing normal pricing noise.

### Flow

```text
retrieve route / itinerary data
→ compare with prior observation
→ detect meaningful change
→ evaluate itinerary quality and constraints
→ recommend book / wait / investigate
→ persist finding
```

### Output
Possible fields:
- route
- dates
- carrier
- itinerary
- current fare
- prior/reference fare
- meaningful change explanation
- constraints / risks
- recommendation
- booking/source URL

---

## Personal Brief Workflow

### Goal
Prioritize the most important items across the system.

### Inputs
- recent findings
- pending actions
- calendar items
- deadlines
- active watchlists
- snoozed items becoming relevant

### Output
A compact prioritized brief, not a raw summary.

Potential sections:
- Needs attention now
- Coming up
- Worth reviewing
- No action needed

---

## Future: Investing Workflow

Potential responsibilities:
- detect earnings/events for tracked holdings
- compare results against stored thesis assumptions
- flag thesis-changing developments
- update valuation inputs
- surface only decision-relevant changes

No autonomous trading.

---

## Future: Fitness Workflow

Potential responsibilities:
- ingest workout logs
- track progression
- identify stalled lifts
- generate next-session targets
- surface only actionable changes

---

## Future: Life Admin Workflow

Potential responsibilities:
- inbox triage
- calendar conflict detection
- pending replies
- recurring deadlines
- administrative reminders

Use Prepare rather than Execute by default for consequential communication.
