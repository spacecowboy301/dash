# Product

## Vision

Personal OS is a mobile-first central hub for proactive AI-assisted monitoring, workflows, and decision support.

The system should reduce the amount of attention the user spends repeatedly checking jobs, prices, travel conditions, investments, calendar items, and other recurring information.

The desired experience is:

> Open Home and immediately understand what changed, what matters, and what to do.

The system should not behave like a feed of everything AI found.

## Product Goals

### 1. Minimize attention cost
Surface only information that meaningfully changes a decision or requires attention.

### 2. Be proactive
Important findings should appear without the user needing to remember what to ask.

### 3. Remain quiet when nothing matters
“No meaningful change” is a valid and desirable result.

### 4. Preserve user control
AI may monitor, analyze, and prepare actions broadly. Consequential execution should initially require explicit approval.

### 5. Centralize recurring decision support
Different workflows should share one Home surface, one finding model, and one action state model.

## Core Home Experience

### Needs Attention
Highest priority. Contains only items that merit user action or review.

Each item should explain:
- what changed
- why it matters
- what action is recommended
- supporting source(s)
- confidence where appropriate

### Today
Calendar, deadlines, reminders, and time-sensitive pending items.

### Watchlists
Items currently being monitored, grouped by domain.

### Recent Changes
Useful changes that do not yet require action.

### Workflow Activity
Shows that checks actually ran and whether anything meaningful was found.

### Later / Saved
Items the user intentionally deferred.

## Product Philosophy

### Automation before workflow
If a deterministic rule solves the task, do not invoke AI.

### Workflow before agent
If the sequence of steps is known, encode it.

### Agent only when needed
Use a general-purpose agent for genuinely open-ended tasks whose execution path cannot be predefined.

## Initial Domains

### Career
Find and score high-quality opportunities.

### Shopping
Monitor products and availability, but only surface items that clear the user's quality bar.

### Travel
Monitor fares and travel conditions and recommend when action is worthwhile.

### Personal Brief
Aggregate high-value items across the system into a prioritized periodic review.

Future domains may include:
- investing
- fitness
- life admin
- email/calendar workflows

## User-Specific Evaluation Rules

### Career
Prefer strong-fit roles over volume.

Every surfaced role should include:
- company
- title
- location
- compensation when available
- direct application/posting URL
- fit score
- rationale
- concerns
- recommendation

### Shopping
Evaluation priority:

1. color / aesthetic
2. fit
3. quality / material / construction
4. price / value

Price matters only after the product clears the first three criteria.

Every surfaced product should include a direct product link.

## Non-Goals for the First Version

- Building many autonomous agents
- Fully autonomous purchasing
- Automated securities trading
- Automated job submission
- Complex enterprise permissions
- Large-scale multi-user support
- Perfect visual polish before the first useful workflow works
