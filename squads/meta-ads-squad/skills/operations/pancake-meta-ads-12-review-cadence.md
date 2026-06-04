---
name: pancake-meta-ads-12-review-cadence
description: How to sequence the audit skills across weekly, monthly, and quarterly cadences. Load on the weekly-review cron; it decides which deeper audits to fold in based on the calendar.
---

# Weekly Review Workflow

This file is the operating cadence that ties everything else together. It sequences the audits across weekly, monthly, and quarterly checkpoints. The agent executes the findings autonomously — the only gate is the budget-commitment rule, which routes any action that increases total committed spend through the user for approval. Everything that holds spend flat or reduces it runs without asking.

## The cadence

| Frequency | Skills to run |
| --- | --- |
| Weekly | Performance baseline; creative analysis; bidding audit; Advantage+ analysis (if applicable); catalog analysis (if applicable); budget optimization; investigate-campaign (triggered) |
| Bi-weekly | Audience audit; automated rules check |
| Monthly | Audience audit; structure audit; measurement audit; budget optimization (deeper) |
| Quarterly | Compliance audit; maturity reassessment; deeper structure and measurement audits |
| On-demand | Launch new campaign; generate creative brief; run A/B tests |

## Pre-flight: load configuration

Before doing anything, read the account profile (see file 01 — Account Setup). Pull:

- Account name, ID, currency, timezone, status
- Maturity level
- Monthly spend (for context and prioritization)
- Capability flags (has Advantage+, has catalog, active campaign types)
- KPI config (targets, thresholds)
- Creative config (testing framework, weekly volume target)
- Reporting period and output path
- Last review date

Then reconstruct recent operating context from the account itself:

- Any campaigns paused, launched, or significantly changed since last review (check change history and last-edit timestamps)
- Pending budget-approval requests still in the queue (from the prior digest)
- Outstanding flags from the prior review that weren't resolved
- Known issues logged to the audit log

If the user has flagged upcoming events or context shifts in the digest channel (promos, seasonal peaks, product launches), pick those up too. Otherwise proceed without waiting for a human briefing.

## Determine the cadence

```
Is this the account's first review? → onboarding (run everything)
Is today in the first 7 days of a quarter? → quarterly (add compliance, lift studies)
Is today in the first 7 days of a month? → monthly (add audiences, structure, measurement)
Otherwise → weekly (performance, creative, bidding, A+, catalog if applicable)
```

## Authentication check

Verify the Meta Ads API is reachable, accounts are accessible, permissions are sufficient (at minimum read access to campaigns, ad sets, ads, insights), and API rate limits aren't exhausted. Don't proceed past this step until at least one account passes.

## Sequence the audits

Audits have dependencies. Run them in this order.

### Phase A: performance baseline (always first)

Run the performance analysis. This must complete first because:
- It establishes the context all other skills reference
- It generates the flag list that triggers deeper investigations
- It identifies campaigns needing diagnostic work

Capture from this phase:
- Account health status (healthy / warning / critical)
- Active flags with severity and recommended next action
- Campaign-level performance summary
- 4-week trend data

### Phase B: independent skills (can run in parallel)

These depend on Phase A but not on each other:

- **Creative analysis** — scorecard, fatigue detection, refresh priorities, test plan
- **Bidding audit** — strategy-fit matrix, learning phase audit, cost control assessment
- **Advantage+ analysis** (if `has_advantage_plus = true`) — ASC performance, customer split, creative within A+
- **Catalog analysis** (if `has_catalog = true`) — product tiers, feed quality, set performance

Capture from each:
- Key findings list
- Flagged items
- Recommendations with priority

### Phase C: dependent skills (sequential)

These depend on findings from Phase B:

- **Budget optimization** — needs bidding context from the bidding audit and pacing from performance analysis
- **Investigate campaign** — triggered for any campaign with red flags from Phase A or B

### Phase D: monthly/quarterly skills (cadence-dependent)

Only run when the cadence trigger is met:

- **Audience audit** (monthly) — overlap, saturation, expansion opportunities
- **Structure audit** (monthly) — consolidation opportunities
- **Measurement audit** (monthly) — pixel, CAPI, attribution
- **Compliance audit** (quarterly) — policy, disapprovals, account health

### Phase E: creative brief generation

Run the creative brief based on fatigue alerts and format/concept gaps from creative analysis. Cadence depends on the account's configured weekly volume target.

### Phase F: aggregation

Roll up all findings into a unified report:

- Account: name and ID
- Health status: healthy / warning / critical
- Skills run this cycle
- Total flags by severity
- Per-skill summary findings
- Cross-skill themes (where multiple audits flag the same root cause)
- Prioritized action list

## Autonomy and the budget-commitment gate

Findings get acted on without checkpoints. The cadence, the skill routing, and the unified review all run end-to-end. The agent picks what to do and does it.

The single exception is the budget-commitment gate: any action that would raise total committed spend is held back, packaged as a structured approval request, and surfaced in the daily digest for the user to approve or skip.

### What executes without asking

Anything that holds total committed spend flat or reduces it:

- Pausing fatigued, underperforming, or saturated ads and ad sets
- Reducing daily or lifetime budgets
- Lowering Cost Caps and Bid Caps
- Moving winning Post IDs into the Winners campaign (no net-new spend)
- Activating prepared replacement creative
- Consolidating overlapping ad sets where total budget stays flat or drops
- Switching bid strategies at current cost levels (e.g. Lowest Cost → Cost Cap at current avg CPA)
- Tightening audiences and adding exclusions
- Refreshing stale audiences (re-uploading customer lists)
- Creating Custom Conversions for orphan pixel events
- All read-only audits (measurement, compliance, structure)

### What queues for approval

Anything that raises total committed spend:

- Raising a campaign's daily or lifetime budget
- Raising a Cost Cap or Bid Cap
- Lowering a Minimum ROAS floor (which lifts the spend ceiling)
- Launching a new campaign or ad set that adds incremental spend
- Three-tier reallocation that grows total committed spend

For each queued action, the request includes: what would change, why, the pre-change baseline, the expected impact, and the rollback condition. The user resolves with `approve <id>` or `skip <id>` in the digest channel.

### Tracking the budget envelope

The agent maintains a running view of current total committed daily and monthly budget. Every proposed action is classified against that envelope before execution. If the classification is ambiguous (rare), the action defaults to "queue for approval" — when in doubt, ask.

## Output format

Each cycle produces a single report saved to the account's reporting output path. Standard structure:

```
# Weekly Review — [Account Name]
Date: [YYYY-MM-DD]
Cadence: Weekly / Monthly / Quarterly / Onboarding
Period: [start] to [end]
Maturity: [stage]

## Executive Summary
[3–5 sentences: overall health, biggest risk, biggest opportunity, top recommendation]

## Health Scorecard
| Dimension | Score | Status |
| Performance | /10 | healthy / warning / critical |
| Creative | /10 | ... |
| Bidding | /10 | ... |
| Audiences | /10 | ... |
| Structure | /10 | ... |
| Measurement | /10 | ... |
| Budget | /10 | ... |
| Compliance | /10 | ... |
| Overall | /80 | ... |

## Key Findings
1. [Top finding with evidence]
2. ...

## Action List
### P0 — fix this week
1. [Action] — [owner] — [expected impact]
### P1 — fix this month
### P2 — backlog
### Not recommended
[Things considered and ruled out]

## Per-Skill Details
[Sections for each skill that ran]

## Monitoring for next cycle
| Metric | Current | Target | Check |
```

## Cross-skill synthesis

The point of running multiple audits is the synthesis. Watch for:

- **Creative fatigue + audience saturation:** if both surface, refresh creative first (it buys you time), then expand audiences
- **Measurement issue + apparent performance problem:** if measurement is flagged, ignore the performance problem until measurement is fixed
- **Structure fragmentation + Learning Limited:** consolidation usually fixes both
- **Budget constraint + scaling opportunity:** if a campaign is hitting its budget with on-target CPA, the constraint itself is the bug
- **Bidding mismatch + maturity transition:** if the account just moved up a stage, bidding strategy may be outdated for the new stage

## What this is and what it isn't

This workflow is autopilot for Meta Ads operations within the budget envelope the user sets. The agent pulls data, runs the audits, makes the call, and executes. The user reviews the daily digest, approves any budget-increase requests, and intervenes when something looks off.

What the workflow does **not** do:

- Decide budget allocation across markets or channels (that's the user's call)
- Make brand positioning or creative direction decisions
- Diagnose business model issues (pricing, product-market fit, LTV)
- Execute any action that raises total committed spend without approval
- Continue executing once the user activates the kill switch (recommendation-only mode)

When the user wants to override what the agent did, they can roll back from the audit log, post a correction in the digest channel, or activate the kill switch to pause autonomous execution entirely.

## Onboarding override

For a new account (`last_review_date is null`), run every skill regardless of cadence rules. This establishes the baseline for all future reviews. Plan for the onboarding pass to take 2–4× the time of a normal weekly review.

## Failure handling

If any skill fails (API error, missing data, etc.):
- Log the error and skip that skill
- Continue with the others — partial output is better than no output
- Note in the report which audits were skipped and why
- Add a P0 action to fix the underlying issue (often a config gap or missing capability flag)

Don't block the entire review on one broken skill.
