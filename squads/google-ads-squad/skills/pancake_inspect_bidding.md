---
name: pancake_inspect_bidding
description: Action skill that evaluates bidding strategies across all campaigns in a Google Ads account. Assesses strategy-fit based on account maturity and conversion volume, evaluates target aggressiveness, identifies learning period issues, spots portfolio opportunities, and generates migration plans. Loads pancake-bidding-playbook as its analytical foundation. Use when auditing bidding strategies, evaluating if targets are appropriate, planning bidding migrations, or reviewing Smart Bidding performance. Do NOT use for diagnosing why a specific campaign is underperforming (use pancake-root-cause-lab) or routine performance metrics (use pancake-orchestrator).
triggers:
  - "audit bidding"
  - "bidding audit"
  - "bidding strategy review"
  - "smart bidding review"
  - "bidding evaluation"
  - "are my bids right"
  - "bidding migration"
---

# Audit Bidding

This skill runs a structured bidding audit across every campaign in a Google Ads account. It answers four questions:

1. Does each campaign's bidding strategy fit the volume and objective it actually has?
2. Are the tCPA / tROAS targets calibrated to reality?
3. Is the account healthy in terms of learning-period exposure?
4. Are there portfolio bidding opportunities, and is the account ready for value-based bidding?

The output is a prioritized migration plan you can implement one change at a time.

Use this skill when the question is structural ("is the bidding right?"). Use `pancake-root-cause-lab` when one specific campaign is misbehaving and `pancake-orchestrator` for ongoing performance reads.

---

## Good triggers

- Reviewing whether each campaign is on the right bidding strategy
- Checking whether targets are realistic
- Planning a migration from one strategy to another
- Reviewing Smart Bidding stability across the account
- Looking for portfolio bidding candidates
- Assessing whether the account is ready for value-based bidding (VBB)

---

## Inputs to load first

Before any analysis:

1. **`pancake_account_foundations`** — for the account maturity level, business model, KPI targets, and the campaign-type inventory.
2. **`pancake_bidding_playbook`** — for the strategy selection framework, learning-period rules, and portfolio criteria.
3. **`pancake_account_foundations`** — for the maturity-stage definitions that calibrate recommendations.

If account conventions are missing, stop and ask the user to run `pancake_account_foundations` first.

Then confirm with the user: which accounts are in scope, any specific campaigns to prioritize or exclude, and whether they want a full audit or a focused look at one question.

---

## Workflow at a glance

The audit moves through eight steps with five checkpoints. Each checkpoint pauses for user confirmation before continuing — this keeps the audit grounded in the account's actual context rather than running on assumptions.

| Step | Output | Checkpoint |
|---|---|---|
| 1. Pull the data | Per-campaign bidding + performance dataset | C1 (context), C2 (data inventory) |
| 2. Strategy-fit assessment | Each campaign classified | — |
| 3. Target evaluation | tCPA / tROAS calibration verdict | — |
| 4. Learning-period check | Account-level learning exposure | — |
| 5. Portfolio scan | Candidate groups | — |
| 6. VBB readiness | Ready / partial / not ready | — |
| 7. Generate recommendations | Prioritized list | C3 (interpretation), C4 (migration plan) |
| 8. Deliverables | Three documents | C5 (delivery) |

---

## Step 1 — Pull the data

For each enabled campaign, gather:

- Campaign name and type (Search, PMax, Shopping, Display, Demand Gen, Video)
- Current bidding strategy and target (where applicable)
- Strategy system status (`ENABLED`, learning variants, `LIMITED`, `MISCONFIGURED`)
- Conversion volume for three windows: 30, 60, and 90 days
- Performance metrics: cost, conversions, conversion value, clicks, CPA, ROAS, conversion rate
- Impression share metrics: Search IS, Lost IS (budget), Lost IS (rank)

Helpful when available:

- 90-day change history (bidding-related changes)
- Portfolio bidding strategy membership
- Conversion action details (which actions count, how they count)

### Why three windows?

- **30 days** is the primary signal — current state.
- **60 days** gives a trend frame: is the 30-day number a blip or the new normal?
- **90 days** covers a full quarter, which is what you need to tell real shifts apart from seasonal swing. Strategy-fit decisions key off the 30-day figure, with 60/90 as validation.

### Checkpoint C1 — Context confirmation

Show the user:

- Account name, customer ID, maturity stage
- Total campaigns found, broken down by type
- Current strategy distribution (counts on tCPA, tROAS, Max Conversions, Manual CPC, etc.)
- The business objective from config (CPA / ROAS / volume / visibility)
- Audit scope as confirmed

Then ask: "Does this match? Any campaigns to prioritize or exclude?"

If this is one of the first five times the user has run this audit, also explain what the audit covers: strategy-to-volume fit, target calibration, learning-period health, portfolio opportunities, and VBB readiness.

### Checkpoint C2 — Data inventory

Show:

- What you pulled per campaign (strategies, targets, statuses, 30/60/90 volumes, performance, IS)
- Any gaps (change history unavailable, no portfolio membership, etc.)
- Count of campaigns currently in learning and the share of account spend they represent
- Count of campaigns with zero 30-day conversions

Confirm: "Any gaps I should fill before I move on?"

If early-run, explain the 30/60/90 window logic noted above.

---

## Step 2 — Strategy-fit assessment

For each campaign, decide whether the current strategy is the right one given:

- Its conversion volume (30-day primary, 60/90 as context)
- The business objective on file (CPA, ROAS, volume, visibility)
- The account's maturity stage
- The campaign type — different types have different strategy considerations

Use the selection framework in `pancake_bidding_playbook` to derive the recommended strategy, then classify:

| Classification | What it means |
|---|---|
| **Appropriate** | Current strategy matches the recommendation. |
| **Misfit (Under)** | The campaign has more conversion data than the current strategy needs. There is an opportunity to graduate to a more sophisticated strategy. |
| **Misfit (Over)** | The campaign lacks the data the current strategy demands. The strategy is too advanced for the available signal. |
| **Appropriate (Edge)** | Technically appropriate, but sitting close to a transition threshold. Monitor. |

The volume thresholds that matter most:

- **tCPA** needs roughly 15 conversions per month to optimize reliably.
- **tROAS** needs roughly 30 per month.
- **VBB** (Max Conv Value with values, or tROAS with values) needs roughly 50+ per month with meaningful value variance.

Below those floors, the algorithm has too thin a signal and performance tends to oscillate between extremes.

---

## Step 3 — Target evaluation

For every campaign carrying a tCPA or tROAS, judge whether the target itself is realistic. Compare the target to the 30-day, 60-day, and 90-day actuals.

### tCPA verdicts

| Target vs. 30-day actual | Verdict |
|---|---|
| Within ±10% | Well-calibrated |
| 10-20% below actual | Slightly aggressive (acceptable if deliberate) |
| 20% or more below actual | Too aggressive — likely suppressing volume |
| 20-30% above actual | Slightly loose (acceptable during ramp-up) |
| 30% or more above actual | Too loose — efficiency is being given away |

### tROAS verdicts (inverted, since higher ROAS = tighter constraint)

| Target vs. 30-day actual | Verdict |
|---|---|
| Within ±10% | Well-calibrated |
| 10-20% above actual | Slightly aggressive |
| 20% or more above actual | Too aggressive — likely suppressing volume |
| 20-30% below actual | Slightly loose |
| 30% or more below actual | Too loose |

### Sanity checks on the target itself

- Was it set against a realistic period, or anchored to a best-ever week that will never repeat?
- Was it changed recently? If so, the campaign may still be in learning and the verdict needs to be tentative.
- Does it account for seasonality? A target dialed in during Q4 may be unrealistic in Q1.

### How to compute target variance

- **CPA variance** = `(Target CPA − Actual CPA) / Actual CPA`. Negative means target below actual = aggressive.
- **ROAS variance** = `(Target ROAS − Actual ROAS) / Actual ROAS`. Positive means target above actual = aggressive.

---

## Step 4 — Learning-period check

Look at the account holistically:

1. Which campaigns are showing "Learning" or "Learning (limited)" status right now?
2. Which campaigns have had a bidding change in the last 14 days?
3. How many campaigns are in learning simultaneously, and what share of total account spend do they represent?
4. Are any campaigns stuck in "Learning (limited)" for 14 days or more (chronic learning)?

Then flag any of these cascade-prevention violations:

- More than **30%** of account spend is sitting in learning campaigns.
- More than **2-3** campaigns were changed simultaneously.
- Changes were made **less than 14 days** apart.

These rules exist because learning periods compound — multiple campaigns relearning at once destabilizes the entire account. See `pancake_bidding_playbook` for the full set of rules.

---

## Step 5 — Portfolio opportunity scan

Look for groups of campaigns that would benefit from being pooled into a portfolio bidding strategy. Candidates must satisfy all of:

- Targeting the same conversion action
- Sharing the same business objective but with uneven conversion distribution across them
- Combined volume meeting the strategy minimum — **15+/month** for a tCPA portfolio, **30+/month** for tROAS
- No mixing of brand with non-brand inside the group
- No active learning periods inside the group

For each candidate group, document the rationale and the expected benefit (better cross-campaign optimization, more stable bidding signal). Apply the grouping rules from `pancake_bidding_playbook`.

A practical note: at low volume, **merging campaigns** is often more effective than wrapping them in a portfolio. Portfolios add structural complexity; merges concentrate signal.

---

## Step 6 — VBB readiness

Only relevant for accounts at Established or Advanced maturity. For Nascent or Developing, mark VBB as a future consideration and skip.

Tick through the prerequisites:

- 50 or more conversions per month with conversion values attached
- Conversion values reflect actual business value, not static placeholders
- Meaningful variance across conversion values (not every conversion at the same amount)
- A reliable value-data pipeline: enhanced conversions, offline conversion import, or conversion value rules
- The campaign already uses a value-based strategy (Max Conv Value or tROAS)

Result: **Ready** (all five), **Partially Ready** (missing 1-2), or **Not Ready**.

---

## Step 7 — Generate recommendations

Recommendations must match the account's maturity. Do not recommend Advanced-tier strategies for Nascent accounts. Do not regress an Advanced account back to Nascent-tier strategies unless there's a specific reason (brand defense, conquest with precise cost control, etc.).

Slot each recommendation into one of four priority tiers:

| Tier | Definition | Timeline |
|---|---|---|
| **Critical** | The strategy is actively harming performance (e.g., tCPA with 3 conversions per month). | Immediate |
| **High** | A clear opportunity is being missed (e.g., 60 conversions per month still on Manual CPC). | Within 2 weeks |
| **Medium** | Optimization opportunity — target recalibration, portfolio grouping. | Within 30 days |
| **Low** | Future consideration — VBB groundwork, experimentation. | Next quarter |

### Checkpoint C3 — Interpretation

For each campaign, present a one-line situation read. For example:

- "Brand Search — tCPA $50, 45 conv/mo. **Appropriate**. Target within 8% of 30-day actual. No change."
- "Non-Brand Generic — tCPA $30, 8 conv/mo. **Misfit (Over)**. Below the 15-conv tCPA floor. Recommend Max Conversions without a target."
- "Generic Search — Manual CPC, 65 conv/mo. **Misfit (Under)**. Enough data to graduate to tCPA or tROAS."

Also surface:

- Learning-period health: spend share in learning, any cascade violations
- Portfolio candidate groups
- VBB readiness verdict

Confirm: "Does this read of each campaign match your understanding? Any context I should know that changes the assessment?"

If early-run, explain the strategy-fit framework — that tCPA needs 15+, tROAS needs 30+, VBB needs 50+, and campaigns below those floors will oscillate.

### Checkpoint C4 — Migration plan

Present:

- The prioritized list of changes (Critical / High / Medium / Low) with the specific action and rationale per item
- The migration sequence — which change goes first, second, third, with 14-day spacing between
- Total elapsed time from first change to last
- The peak learning-period exposure during the plan (e.g., "at peak, 25% of spend will be in learning")

Confirm: "Want to adjust priorities or timing before I generate the deliverables?"

If early-run, explain why migrations are staggered: changes are spaced 14+ days apart to avoid learning-period cascade, highest priority changes go first, and you never exceed 30% of account spend in learning simultaneously.

---

## Step 8 — Deliverables

Produce three documents.

### 1. Strategy Assessment

A per-campaign table:

| Campaign | Type | Current Strategy | Current Target | 30d Conv | 30d CPA | 30d ROAS | Recommended Strategy | Recommended Target | Rationale | Priority |
|---|---|---|---|---|---|---|---|---|---|---|

Column notes:

- **Current Strategy** — Manual CPC, Max Clicks, Max Conv, tCPA, Max Conv Value, tROAS, Target IS
- **Rationale** — one sentence; "No change" when the current strategy is appropriate
- **Priority** — Critical / High / Medium / Low

For every campaign that carries a target, append a target evaluation sub-table:

| Campaign | Target | 30d Actual | 60d Actual | 90d Actual | 30d Variance | Verdict |
|---|---|---|---|---|---|---|

Verdict values: Well-calibrated, Slightly Aggressive, Too Aggressive, Slightly Loose, Too Loose.

### 2. Migration Plan

A week-by-week timeline:

```
Week 1 (date range)
  - Campaign: [name]
  - Change: [current strategy] -> [recommended strategy]
  - New Target: [if applicable]
  - Expected Learning Period: 7-14 days
  - Risk: Low / Medium / High
  - Success Metric: [what you'll look for once learning completes]

Week 3 (date range)
  - Campaign: [name]
  ...
```

Sequencing rules — apply in order:

1. **Critical changes go first.** These are actively damaging performance.
2. **Pace at one change per 14-day window** for accounts with fewer than ~10 campaigns. Larger accounts can run 2-3 changes in parallel, but no more.
3. **Cap learning exposure at 30% of spend.** If the first change puts 25% of spend into learning, hold the next change until that one exits.
4. **Brand changes can run independent of non-brand**, provided they don't share budget or portfolio.
5. **Build portfolios only after the individual campaign strategies are correct.** A portfolio that includes campaigns still on the wrong strategy compounds the problem.

At the top of the plan, summarize:

- Total recommended changes
- Total elapsed time (first to last)
- Share of account spend affected
- Expected temporary performance impact during the migration (CPA may rise / ROAS may dip during learning periods)

### 3. Summary Dashboard

Lead with the strategy distribution:

| Strategy | # Campaigns | % of Spend | Assessment |
|---|---|---|---|
| Manual CPC | … | … | X appropriate, Y misfit |
| Max Clicks | … | … | … |
| Max Conv (no target) | … | … | … |
| tCPA | … | … | … |
| Max Conv Value (no target) | … | … | … |
| tROAS | … | … | … |
| Target IS | … | … | … |

Then the key metrics:

- Total campaigns audited
- Campaigns with appropriate strategy (count and %)
- Campaigns with misfit strategy (count and %)
- Campaigns currently in learning (count and % of spend)
- Portfolio opportunities identified
- VBB readiness: Ready / Partially Ready / Not Ready

Then the **Top 3 Priority Actions**, each with a one-line rationale.

Finally a risk readout:

- Migration risk: Low / Medium / High based on number of changes and spend share affected
- Total elapsed migration time
- Expected temporary CPA impact during learning periods and total learning exposure across the plan

### Checkpoint C5 — Delivery

Walk the user through the three documents:

- What files were produced
- Key numbers: misfit count, change count, migration timeline length, projected strategy distribution after migration
- How to use them — implement one change at a time, wait 14 days between changes, use the Strategy Assessment to explain each recommendation's rationale

Confirm: "All deliverables generated. Want to adjust any recommendations or zoom in on specific campaigns?"

If early-run, explain how each deliverable connects to implementation.

---

## Patterns to watch for

A few situations come up often enough to deserve named shorthand.

### Aggressive Target Trap

A tCPA that sits more than 30% under the actual CPA, or a tROAS pushed more than 30% over the actual ROAS. The algorithm can't find inventory at the configured price point, so it pulls bids back. Lower bids mean less impression volume, less impression volume means fewer conversions, and the realized CPA gets worse — a self-reinforcing decline. The remedy: ease the target back to within 15-20% of actual, give volume time to recover, then tighten in measured steps.

### Low-Volume Smart Bidding

A campaign on tCPA or tROAS that posts fewer than 15 conversions a month. The algorithm doesn't have enough signal to make stable decisions, so results swing wildly week over week. Two paths out: drop the target (move to Max Conversions or Max Conv Value with no target), or, if the campaign is genuinely tiny, fall back to Manual CPC.

### Set It and Forget It

A Manual CPC campaign whose bids haven't been touched in 90+ days. Auction dynamics shift constantly; stale bids fall out of alignment with competition and intent. Either start reviewing bids on a regular cadence or graduate to automated bidding if volume now supports it.

### Learning Period Cascade

Several campaigns get their bid strategies touched in the same week. The whole account ends up relearning at once and aggregate performance sags. The remedy: space subsequent edits 14+ days apart, and don't queue the next batch until every prior campaign has cleared learning.

### Brand Strategy Mismatch

A brand campaign sitting on Maximize Conversions or tCPA when what the business actually wants is presence — high impression share on its own branded queries, holding off conquest attempts. Target Impression Share or Manual CPC will almost always serve that intent better than a conversion-optimized strategy.

---

## GAQL queries

### Campaign-level bidding and performance — 30 days

```sql
SELECT
  campaign.name,
  campaign.id,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  campaign.target_cpa.target_cpa_micros,
  campaign.target_roas.target_roas,
  campaign.maximize_conversions.target_cpa_micros,
  campaign.maximize_conversion_value.target_roas,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.clicks,
  metrics.impressions,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND segments.date DURING LAST_30_DAYS
```

### Campaign performance — 60 and 90 days

GAQL doesn't define `LAST_60_DAYS` or `LAST_90_DAYS` predicates, so use explicit date ranges:

```sql
SELECT
  campaign.name,
  campaign.id,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE campaign.status = 'ENABLED'
  AND segments.date BETWEEN '<60d-start>' AND '<today>'
```

Substitute appropriate date strings for the 60-day and 90-day windows.

### Bidding strategy status

```sql
SELECT
  campaign.name,
  campaign.id,
  bidding_strategy.name,
  bidding_strategy.type,
  bidding_strategy.status,
  campaign.bidding_strategy_system_status
FROM campaign
WHERE campaign.status = 'ENABLED'
```

The `bidding_strategy_system_status` field returns one of: `ENABLED`, `LEARNING_NEW`, `LEARNING_SETTING_CHANGE`, `LEARNING_BUDGET_CHANGE`, `LEARNING_COMPOSITION_CHANGE`, `LIMITED`, or `MISCONFIGURED`.

### Change history — last 90 days

```sql
SELECT
  change_event.change_date_time,
  change_event.change_resource_type,
  change_event.changed_fields,
  change_event.old_resource,
  change_event.new_resource,
  campaign.name
FROM change_event
WHERE change_event.change_date_time DURING LAST_90_DAYS
  AND change_event.change_resource_type = 'CAMPAIGN'
ORDER BY change_event.change_date_time DESC
```

Filter the results in post-processing to keep only bidding-related changes (strategy type, target value, budget).

### Portfolio bidding strategies

```sql
SELECT
  bidding_strategy.name,
  bidding_strategy.id,
  bidding_strategy.type,
  bidding_strategy.target_cpa.target_cpa_micros,
  bidding_strategy.target_roas.target_roas,
  bidding_strategy.maximize_conversions.target_cpa_micros,
  bidding_strategy.maximize_conversion_value.target_roas,
  bidding_strategy.campaign_count,
  bidding_strategy.status
FROM bidding_strategy
```

These are account-level portfolios. Cross-reference with the per-campaign query to map campaigns to portfolios.

---

## If the API isn't available

Three CSV exports cover the same ground:

**Campaign report** — Campaign, Campaign type, Bid strategy type, Target CPA, Target ROAS, Cost, Conversions, Conv. value, Clicks, Impressions, Search impr. share, Search lost IS (budget), Search lost IS (rank). Run for last 30, last 60, and last 90 days separately, or use custom columns if available.

**Bid strategy report** — From Tools > Bid Strategies in the UI. Gives strategy name, type, target, status (Learning / Eligible / Limited), the campaigns attached, and performance.

**Change history** — From Tools > Change History. Filter to Bidding strategy and Budget changes, last 90 days.

If neither API nor CSV is available, fall back to manual collection from the UI: the Campaigns tab (enabled only) for strategies and targets, the Bid Strategies report for status, and Change History for the recent bidding/budget edits.

---

## Normalizing data across sources

Different sources express the same fields differently. Standardize to:

| Field | Standard | Conversion |
|---|---|---|
| Cost | Currency, whole units | Divide micros by 1,000,000 |
| Target CPA | Currency, whole units | Divide micros by 1,000,000 |
| Target ROAS | Ratio (5.0 = 500%) | API returns the ratio; CSV often returns a percentage — convert |
| Conversions | Count (decimals allowed) | None |
| Conversion value | Currency, whole units | None |
| Impression share | Decimal (0.75 = 75%) | API gives a decimal; CSV gives "75%" — strip and normalize |

Then derive:

- **CPA** = Cost / Conversions (only when conversions > 0)
- **ROAS** = Conversion Value / Cost (only when cost > 0)
- **Conversion rate** = Conversions / Clicks
- **Target Variance (CPA)** = (Target CPA − Actual CPA) / Actual CPA. Negative = target below actual = aggressive.
- **Target Variance (ROAS)** = (Target ROAS − Actual ROAS) / Actual ROAS. Positive = target above actual = aggressive.

---

## Worked example: CloudSync

A small fictional run-through to make the workflow concrete.

**Account.** CloudSync, a B2B SaaS file-sync and collaboration platform. Lead-gen model — demo requests are the primary conversion, free trial starts secondary. Account is at Developing maturity (35 conversions/month, 14 months old, standard tracking). Primary KPI is CPA, target $85. Monthly budget $12,000.

**Campaigns last 30 days.**

| Campaign | Type | Strategy | Target | Cost | Conv | CPA | Value | ROAS | Status |
|---|---|---|---|---|---|---|---|---|---|
| CloudSync Brand | Search | Manual CPC | — | $800 | 12 | $67 | $3,600 | 4.50 | Eligible |
| Non-Brand: File Sync | Search | tCPA | $50 | $3,200 | 8 | $400 | $2,400 | 0.75 | Learning (limited) |
| Non-Brand: Collaboration | Search | Max Conv | — | $2,800 | 3 | $933 | $900 | 0.32 | Eligible |
| Non-Brand: Enterprise Storage | Search | Max Conv | — | $1,500 | 3 | $500 | $900 | 0.60 | Eligible |
| PMax: CloudSync | PMax | Max Conv Value | — | $2,000 | 6 | $333 | $1,800 | 0.90 | Eligible |
| Display Remarketing | Display | Max Clicks | — | $600 | 1 | $600 | $300 | 0.50 | Eligible |
| Demand Gen: IT Leaders | Demand Gen | tCPA | $70 | $800 | 2 | $400 | $600 | 0.75 | Learning |
| Competitor: Dropbox/Box | Search | Manual CPC | — | $300 | 0 | — | $0 | 0.00 | Eligible |

Totals: $12,000 spend, 35 conversions, blended CPA $342.

**Strategy-fit per campaign.**

- **CloudSync Brand (Manual CPC).** *Appropriate.* Predictable brand CPCs make Manual CPC valid at any maturity. 12 conv/mo at $67 is strong.
- **Non-Brand: File Sync (tCPA $50).** *Misfit (Over).* 8 conversions/month sits below the 15-conv tCPA floor, and the $50 target is dramatically below the $400 actual. Textbook Aggressive Target Trap — algorithm is suppressing bids hunting an impossible price, volume is collapsing.
- **Non-Brand: Collaboration (Max Conv).** *Appropriate (Edge).* 3 conv/mo. Strategy fits the volume, but the campaign may not be viable as a standalone — merge candidate.
- **Non-Brand: Enterprise Storage (Max Conv).** *Appropriate (Edge).* Same situation. Merge candidate with Collaboration.
- **PMax: CloudSync (Max Conv Value).** *Appropriate.* No target is the right move at Developing maturity with 6 conv/mo. Revisit when volume reaches 50+/mo to add a tROAS.
- **Display Remarketing (Max Clicks).** *Appropriate.* 1 conv/mo can't support conversion bidding; Max Clicks works as a traffic strategy for the remarketing pool.
- **Demand Gen: IT Leaders (tCPA $70).** *Misfit (Over).* 2 conv/mo is far below the tCPA floor. Learning status confirms the algorithm has no signal.
- **Competitor: Dropbox/Box (Manual CPC).** *Appropriate.* Conquest campaigns with zero conversions and a need for tight cost control are a valid Manual CPC use case.

**Target evaluation.**

| Campaign | Target | 30d Actual | Variance | Verdict |
|---|---|---|---|---|
| Non-Brand: File Sync | $50 | $400 | −87.5% | Too Aggressive (extreme) |
| Demand Gen: IT Leaders | $70 | $400 | −82.5% | Too Aggressive, compounded by insufficient volume |

**Learning-period check.**

- In learning: File Sync (Limited), Demand Gen: IT Leaders (Learning)
- Spend in learning: $4,000 / $12,000 = **33%**, above the 30% threshold
- File Sync has been in Learning (Limited) for 28+ days — chronic

The account has a learning problem. A third of spend is destabilized.

**Portfolio scan.** Collaboration + Enterprise Storage are the only candidate pair (same conversion action, similar values, both on Max Conv). But combined volume is only 6/mo, still below the 15-conv tCPA threshold. At this volume, **merge** is the better answer than a portfolio — portfolios add complexity without enough signal to justify it. Revisit portfolio bidding when the account reaches Established maturity.

**VBB readiness.** **Not Ready.** Maturity is Developing (Established/Advanced required), 35 conv/mo is below 50, conversion values are mostly uniform ($300 demos), and there's no offline conversion import or enhanced conversions in place.

**Recommendations.**

| Priority | Campaign | Action | Rationale |
|---|---|---|---|
| Critical | Non-Brand: File Sync | Drop the tCPA target; move to Max Conversions (no target) | $50 tCPA on 8 conv/mo is the Aggressive Target Trap. Volume insufficient for any target. |
| Critical | Demand Gen: IT Leaders | Drop the tCPA target; move to Max Conversions (no target) | 2 conv/mo cannot sustain tCPA. Algorithm is stuck in learning. |
| High | Collaboration + Enterprise Storage | Merge into one "Non-Brand: General" campaign on Max Conversions | 3 conv/mo each is too thin. Combined signal is meaningfully stronger. |
| Low | All others | No change | Each is appropriate for its purpose at this maturity. |

**Migration plan.**

*Week 1.* Apply both Critical changes in parallel. Justification: they're on independent budgets, serve different audiences, and the current state already has 33% of spend in learning with no resolution path — making the changes can only improve the trajectory. Expected learning period: 7-14 days each. Risk: Low (removing constraining targets typically lifts volume). Success metric for File Sync: volume rises within 14 days and CPA drops from $400 as bid suppression ends. Success metric for IT Leaders: campaign exits learning status.

*Week 3.* Merge Collaboration and Enterprise Storage into one "Non-Brand: General" campaign on Max Conversions. Expected learning period: 7-14 days. Risk: Medium because keyword and ad group migration is involved. Success metric: 6+ combined conversions/month at blended CPA below $700.

*Week 5 onward.* Re-evaluate File Sync after it exits learning. If it now reaches 15+ conv/mo, layer a tCPA target back on — start at $400-450, then tighten in stages. Hold off on further changes until everything is out of learning.

**Summary dashboard.**

Strategy distribution:

| Strategy | # Campaigns | % of Spend | Assessment |
|---|---|---|---|
| Manual CPC | 2 | 9% | 2 appropriate |
| Max Clicks | 1 | 5% | 1 appropriate |
| Max Conv (no target) | 2 | 36% | 2 appropriate (edge, merge candidates) |
| tCPA | 2 | 33% | 0 appropriate, 2 misfit (over) |
| Max Conv Value (no target) | 1 | 17% | 1 appropriate |

Key metrics:

- Total campaigns audited: 8
- Appropriate strategy: 5 (63%)
- Misfit: 2 (25%), plus 1 merge opportunity
- In learning: 2 (33% of spend)
- Portfolio opportunities: 0 (merge recommended instead)
- VBB readiness: Not Ready

Top 3 priority actions:

1. **Remove tCPA from Non-Brand: File Sync (Critical).** $50 on 8 conv/mo is suppressing volume and stuck in chronic learning. Move to Max Conversions with no target.
2. **Remove tCPA from Demand Gen: IT Leaders (Critical).** 2 conv/mo cannot sustain target-based bidding. Move to Max Conversions with no target.
3. **Merge Collaboration + Enterprise Storage (High).** 3 conv/mo each is too thin for separate campaigns. Consolidation strengthens the signal.

---

## Reference files

| File | Purpose |
|---|---|
| `references/data_requirements.md` | Full GAQL specifications and CSV alternatives |
| `references/output_specs.md` | Format specifications for the three deliverables |
| `references/worked_example.md` | Complete walkthrough of a fictional audit |

## Skill dependencies

| Skill | Role |
|---|---|
| `pancake_account_foundations` | Maturity, business model, KPI targets |
| `pancake_bidding_playbook` | Strategy selection, learning-period rules, portfolio criteria |
| `pancake_account_foundations` | Maturity stage definitions and calibration |
