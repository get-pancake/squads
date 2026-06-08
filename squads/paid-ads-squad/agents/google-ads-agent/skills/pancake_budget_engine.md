---
name: pancake_budget_engine
description: End-to-end Google Ads budget engine — combines the methodology for marginal-efficiency analysis, diminishing-returns assessment, and pacing with the operational workflow that turns those concepts into reallocation plans. Examines how an account's spend is currently distributed, identifies where the next dollar produces the most incremental return, models risk-graded reallocation scenarios, projects account-level impact, and produces approval-ready budget plans. Use to reallocate budget, surface budget waste, justify incremental spend, fix pacing, or decide where to add money. Do not use to diagnose why a specific campaign is broken (use pancake_root_cause_lab) or for routine performance review (use pancake_orchestrator).
triggers:
  - "optimize budgets"
  - "budget optimization"
  - "budget optimization methodology"
  - "reallocate budget"
  - "budget reallocation"
  - "budget allocation framework"
  - "budget methodology"
  - "budget waste"
  - "budget increase"
  - "budget distribution"
  - "where should I spend more"
---

# Budget Engine

A unified planning skill: methodology plus workflow. The first half lays out how to think about budget — marginal efficiency, diminishing returns, impression-share bands, pacing, and the constraints that govern every move. The second half is the operational procedure that turns those ideas into a reviewable reallocation plan with projected impact, three risk-graded scenarios, and a staged implementation order.

The output is always a plan, never a live change. The operator approves a scenario before any campaign is touched.

---

## Part 1 — The framework

### The underlying premise

There is no such thing as a "right" budget number in isolation. A budget is right or wrong relative to what the *next* dollar would do. The work is to make sure each marginal dollar lands where it produces the most incremental return — within a campaign, across campaigns inside an account, or across accounts in a portfolio.

That framing changes the question. "Are we spending too much?" is the wrong question. "Is each dollar going to its highest-return use?" is the right one. Budget optimization is a routing problem, not a sizing problem.

### Marginal efficiency: how each campaign grows

Every campaign follows the same general curve. The first dollar in is the most efficient one — it captures the highest-intent, most relevant users at the lowest auction cost. Each subsequent dollar is slightly less efficient as the intent profile broadens, relevance softens, and competition stiffens. Eventually each extra dollar produces almost nothing additional, and the campaign approaches saturation.

Three concepts operationalize this:

- **Marginal CPA / ROAS.** Average CPA and ROAS are blended numbers that lag the truth. What matters for budget decisions is the cost or return of the *next* conversion the campaign would buy if it had one more dollar.
- **Curve position.** You can't measure curve position directly, but you can estimate it from impression share, the Lost IS breakdown, and how performance has moved as spend has moved over time.
- **Cross-campaign comparison.** The next dollar belongs in whichever campaign currently has the best marginal efficiency. Campaign size, age, or historical importance does not change that answer.

### Reading position on the curve

Impression share is the cleanest proxy in Search and Shopping. Use it as a rough map:

| IS band | Curve position | Marginal efficiency | Headroom |
|---|---|---|---|
| 0–30% | Very early on the curve | High — dollars still buy premium impressions | Large; lots of unaddressed demand |
| 30–60% | Mid-curve | Moderate; healthy returns, more competition appearing | Solid |
| 60–80% | Late curve | Declining — each point of IS costs more | Limited |
| 80–95% | Heavy diminishing returns | Low — big spend buys small IS gains | Minimal; near market ceiling |
| 95%+ | At market ceiling | Very low — almost no incremental impact | Negligible |

The Lost IS breakdown is what makes IS useful for budget decisions, and it is the single most important guardrail in the framework:

- **Lost IS (Budget) > Lost IS (Rank):** the auction had impressions available, but the daily budget ran dry before they could be served. Adding budget pulls those impressions in at acceptable cost.
- **Lost IS (Rank) > Lost IS (Budget):** the campaign was eligible but Ad Rank wasn't strong enough to win. Budget cannot solve this — the fix is on the bid, Quality Score, or relevance side. **Never push budget into a rank-constrained campaign.**
- **Both high:** address the quality problem first, then revisit budget.

### Diminishing returns vary by campaign type

Different inventory types saturate at different IS levels:

| Campaign type | Returns soften (IS) | Steep diminishing returns (IS) | Notes |
|---|---|---|---|
| Brand Search | ~80% | ~95% | High-intent, narrow audience. Efficiency holds until very near the ceiling. |
| Non-Brand Search | ~50% | ~75% | Broader audience and stiffer competition. Saturates earlier. |
| Shopping (Standard) | ~55% | ~80% | Feed quality sets the practical ceiling. |
| Performance Max | N/A (no IS) | N/A | Substitute a spend-to-CPA/ROAS trend over time. |
| Display (remarketing) | Frequency-driven | Frequency-driven | Use frequency caps rather than IS to detect saturation. |
| Display (prospecting) | Frequency-driven | Frequency-driven | Wider audience, higher frequency tolerance, still capped by frequency. |
| YouTube | Frequency-driven | Frequency-driven | Saturation is a function of audience reach and view frequency. |

### When IS isn't available — PMax and friends

PMax doesn't publish impression share, so the IS bands don't apply. Substitute the spend-to-performance trend.

**Method:**

1. Pull at least eight weeks of weekly spend and CPA (or ROAS) data.
2. Plot spend on the x-axis, CPA or ROAS on the y-axis.
3. Find the inflection point where the metric starts to deteriorate as spend rises.

**Decision thresholds:**

- A CPA rise of 15%+ paired with a spend rise of 20%+ = diminishing-returns territory.
- A ROAS drop of 15%+ paired with the same spend rise = same conclusion.
- Stable CPA/ROAS across a range of spend levels = the campaign still has headroom.

**Caveats:** correlation isn't causation — seasonality, competitive shifts, and creative fatigue can move CPA independently of spend. Eight weeks is a soft minimum; less than that and the signal is too noisy. PMax also blends performance across channels (Search, Shopping, Display, YouTube), which means a CPA increase can reflect a channel-mix shift rather than true saturation in any one channel.

### Estimating the impact of a budget change

Directional ranges for forecasting a budget move. Treat them as approximations, never predictions.

**+10% budget**
- If Lost IS (Budget) is 15% or higher, expect to capture roughly 5–8% more impressions.
- Returns are non-linear; the next-easiest impressions get picked up first.
- Marginal CPA/ROAS lands within about 5–10% of current average.

**+25% budget**
- Diminishing returns begin to bite harder.
- Roughly 50–60% of theoretical IS headroom is realistically capturable.
- Marginal CPA can run 5–15% above current average; marginal ROAS 5–15% below it.

**+50% budget**
- Material diminishing returns.
- Closer to 40–50% of theoretical headroom recoverable.
- Marginal CPA can climb 10–25% above current average.
- Large spend can drag auction prices up on its own — competitive feedback becomes a factor.

**+100% (doubling)**
- Severe diminishing returns for most campaigns.
- Better executed as a sequence of smaller increases with measurement in between.
- Exception: severely constrained campaigns with Lost IS (Budget) above 40% can sometimes absorb a doubling at acceptable efficiency.

These ranges assume stable competition and stable Quality Scores. Seasonal swings, new entrants, and quality drift can blow the estimates apart, so always communicate projections as ranges and as directional, not deterministic.

### Pacing

Pacing is the operational side of budget management — making sure spend distributes across the day, the month, and the year in line with intent.

**Daily pacing.** Standard delivery is the only option for Search and Shopping campaigns (accelerated delivery has been retired). Two specifics worth knowing:

- Google may spend up to **2x the daily budget** on a high-opportunity day.
- Monthly spend is capped at **daily budget × 30.4** (the average days per month).

Symptoms of an intraday problem:

- The hour-of-day report shows a sharp impression drop during business hours — the campaign exhausted budget early.
- Lead gen accounts losing evening hours (6 PM – 10 PM) are missing residential search intent.
- Ecommerce accounts losing evening hours are missing peak purchase windows.

Reading the day-level signal:

- Daily spend equals daily budget on 5+ of 7 days → the campaign is budget-capped.
- Daily spend sits consistently 20%+ below the cap → not budget-constrained; the bottleneck is elsewhere (bids, targeting, inventory, search volume, ad disapprovals).

**Three signs a campaign is budget-capped:**

1. The native "Limited by budget" status appears in the campaign view — Google itself estimates more spend is available.
2. Lost IS (Budget) above 10% — the cleanest quantitative signal.
3. Daily spend equals daily budget on 5+ of 7 days.

A capped + performing campaign is a clean reallocation or budget-increase candidate. A capped + underperforming campaign is *not* a budget problem — fix efficiency first.

**Monthly pacing.** The routine check:

1. Target daily run rate = monthly budget ÷ days in month.
2. Actual daily run rate = total spend to date ÷ days elapsed.
3. Compare. Actual exceeds target by 10%+ → over-pacing. Actual is 10%+ below target → under-pacing.
4. Project month-end: (actual daily run rate × remaining days) + spend to date.

*Under-pacing usually traces to:* bids set too low to win, targeting too narrow, genuine low search volume, budget set above what demand can deliver, ad disapprovals or policy issues, or a seasonal trough.

*Over-pacing usually traces to:* competitive bidding pushing CPCs up, broad match expanding into more queries than intended, a demand surge, a new competitor in the auction, or budget set below what current demand wants.

*Corrective playbook:*

- Under-pacing: revisit bids, broaden targeting, audit ad approvals, or right-size the budget downward and reallocate the surplus.
- Over-pacing: prune wasted search terms, tighten targeting, adjust bids, or increase budget if performance supports it.

**Seasonal planning.** Demand isn't flat. Budget should anticipate seasonality, not chase it.

To build a seasonal calendar:

1. Pull 12–24 months of monthly performance data.
2. Identify the months that consistently run hot and cold.
3. Compute a seasonal index per month: that month's conversions ÷ the monthly average. A month at 120% of average gets an index of 1.2.
4. Apply the index against a base monthly budget to set each month's allocation.

Practical rules:

- Money has to be in place *before* demand arrives. If Q4 peaks, the budget increase happens in late September — not mid-November.
- Cut budgets proactively in known troughs. Don't let inefficient campaigns drain a trough budget just because it's sitting there.
- Refresh the seasonal calendar annually — patterns shift with market changes, new product mixes, and competitive moves.

**Day-of-week patterns.** Some accounts have strong skew (B2B often peaks Tuesday–Thursday; consumer ecommerce often peaks on weekends). Standard delivery handles some of this implicitly, but if the daily cap binds, that automation gets short-circuited. When day-of-week patterns are pronounced, layer in ad scheduling alongside budget management.

### Cross-campaign dynamics

Once you move beyond a single campaign, dollars are inherently competing. Three sub-cases to know:

**Shared budgets.** Google's built-in shared-budget feature pools spend across campaigns. The upside is automation — Google can shift budget toward high-opportunity campaigns. The downside is that one high-volume campaign can drain the pool and starve the others. Practical rules:

- Audit per-campaign spend inside shared budgets weekly. If a high-priority campaign keeps getting starved, pull it out into its own budget.
- Don't mix brand and non-brand in a single shared budget — brand will dominate due to higher volume and quality scores.
- Don't put PMax in a shared budget at all — its cross-channel distribution makes the pool unpredictable.
- Campaigns inside a shared budget can't be reallocated relative to each other without first splitting them out.

**Fixed account budgets.** When the monthly account budget is a hard number, every dollar added to one campaign comes out of another. Reallocation becomes zero-sum and every recommendation needs an explicit tradeoff.

**Incremental budget cases.** When every efficient campaign is constrained and there are no reasonable sources to draw from, the answer isn't internal reshuffling — it's asking for more money. See the workflow's incremental-budget step below for how to build that case.

### Hard constraints — never break

- **No budget into rank-limited campaigns.** The dollars don't solve the problem.
- **Respect minimum viable spend.** Smart Bidding needs enough daily budget to find conversions — a workable rule of thumb is daily budget at 2–3x the target CPA. Drop below that and the strategy stops working. Performance Max needs roughly **$30–$50/day** minimum to distribute spend across its channels effectively.
- **Never change budget by more than 20% on a campaign in learning.** It resets the algorithm.
- **Give campaigns time after learning ends.** Allow at least two weeks of stable post-learning performance before adjusting budget.
- **Strategic holdouts.** Some campaigns exist for non-efficiency reasons — brand defense, conquesting, regulatory advertising. Flag these in the analysis and don't pull budget from them without explicit approval. `pancake_account_foundations` may define which campaigns are strategic.
- **No budget into broken tracking.** A campaign with absent or broken conversion tracking can't be optimized — you'd be working from noise.
- **Use qualifier language for every projection.** Budget modeling is directional. "Projected," "estimated," and "based on current trends" are mandatory, not stylistic.

### Campaign classification against KPI targets

The buckets get tightened once you map them onto the account's actual KPI targets and flag thresholds (defined in `pancake_account_foundations`):

| Classification | Signal | Implication |
|---|---|---|
| **Constrained-Efficient** | Lost IS (Budget) > 15% AND average CPA below `primary_kpi_target` | Room to grow at acceptable efficiency. Prime destination. |
| **Efficient-Near-Ceiling** | Lost IS (Budget) between 5% and 15% AND average CPA close to `primary_kpi_target` | Hold and monitor. Small increases may still work. |
| **Diminishing Returns** | Lost IS (Budget) < 5% AND marginal CPA above `flag_thresholds.warning` | Efficient ceiling reached. Take budget from here. |
| **Rank-Constrained** | Lost IS (Rank) > 15% regardless of budget IS | Not a budget problem. Address Quality Score, bid, or relevance first. |

Surface these classifications with their evidence at the C3 checkpoint, showing how each campaign maps against the configured KPI target.

### Calibrating depth to account maturity

Budget analysis should match what the data can actually support. `pancake_account_foundations` defines the brackets; here's how depth scales:

| Maturity | Approach |
|---|---|
| **Nascent** (<50 conversions/month) | Stay basic: is the budget actually being spent? Surface campaigns spending in full with no conversions (pure waste). Confirm each campaign sits at minimum viable spend so automation can function. Skip marginal-efficiency modeling and multi-scenario work — produce one recommendation. |
| **Developing** (50–200 conv/month) | Use Lost IS (Budget) to identify constrained campaigns. Reallocate the obvious cases (clearly inefficient → clearly constrained). Add monthly pacing analysis. Begin tracking spend-vs-CPA/ROAS trends over rolling 4-week windows. Two scenarios (Conservative and Moderate). |
| **Established** (200–500 conv/month) | Full reallocation modeling with three scenarios. Estimate curve position from IS plus trend analysis. Cross-campaign optimization. Seasonal budget planning anchored to historical baselines. Shared-budget audits enter the routine. |
| **Advanced** (500+ conv/month) | Build marginal efficiency curves from 8+ weeks of data. Reallocate at both campaign and ad-group granularity. Portfolio-level optimization across campaign types. Incremental budget modeling with projected ROI per increment. Automated pacing rules and alert thresholds. |

### Companion skills

- **pancake_account_foundations** — sets the depth of analysis to perform and provides KPI targets, business model context, and reporting preferences.
- **pancake_bidding_playbook** — bid strategy and budget are tightly coupled. Target CPA consumes budget differently from Maximize Clicks. Budget and bidding decisions can't be made in isolation.
- **pancake_root_cause_lab** — when a diagnostic identifies budget as the root cause of underperformance, this skill supplies the fix.

---

## Part 2 — The workflow

### What this skill produces

Five deliverables, in order:

1. An efficiency-and-constraint roll-up across every active campaign.
2. Reallocation tables for two to three risk-graded scenarios.
3. A projected impact report for each scenario, at the account level.
4. A short list of the highest-leverage budget moves.
5. A pacing summary, when pacing issues exist.

### When not to use it

- For diagnosing why a specific campaign is broken, use `pancake_root_cause_lab`.
- For week-over-week reporting cadence, use `pancake_orchestrator`.

### Required context

Before any analysis runs, load:

- **pancake_account_foundations** — account roster, KPI targets, business model, maturity tier, reporting preferences; also controls how deep the analysis goes.

The skill runs in **eight steps** and pauses at **five checkpoints (C1–C5)** for explicit operator confirmation.

### Step 0 — Lock the context

**Checkpoint C1 — Context confirmation.** Before pulling any data, surface to the user:

- Account name, CID, and maturity tier.
- Total monthly spend and the number of active campaigns.
- The primary KPI (CPA or ROAS) and the target value.
- Any known strategic constraints (e.g., "PMax minimum spend of $30/day," "brand campaign is a strategic holdout, do not touch").

Ask: *"Is this the right scope? Are there campaigns to exclude or constraints I should treat as immovable?"*

**First five runs:** explain the approach explicitly — campaigns are ranked by efficiency, classified by constraint status, positioned on the diminishing-returns curve, and then two or three reallocation scenarios are modeled. The overarching principle: shift dollars away from campaigns where the next dollar is producing little and toward campaigns where the next dollar is still productive.

### Step 1 — Pull the data

The minimum data set:

- Per-campaign spend, daily budget, and budget type (individual vs. shared) for the last 30 days.
- Per-campaign performance (conversions, conversion value, plus CPA or ROAS) for the last 30 days.
- Per-campaign impression share, IS lost to budget, IS lost to rank for the last 30 days.
- Daily spend by campaign for at least 28 days (four-week minimum for pacing).
- Shared budget definitions if any are in use.

Useful when available:

- 60 days of performance data for trend context.
- Eight weeks of weekly spend and CPA/ROAS for PMax marginal-efficiency estimation.
- Each campaign's bid strategy and status.
- Ad schedule.

Up-front data quality checks:

- Verify conversion tracking is alive — if a campaign reports zero conversions across 30 days, treat it as a possible tracking break, not an inefficient campaign.
- Confirm the account currency from `pancake_account_foundations` and apply it consistently.
- Note any campaign carrying a "Limited by budget" status.

**Checkpoint C2 — Data quality.** Show the user:

- Days of campaign-level data pulled.
- Count of campaigns with active spend.
- Conversion tracking status (active vs. possible issues on N campaigns).
- IS data availability (present for which campaigns, not applicable for which types).
- Whether enough history exists for curve work (eight or more weeks for PMax; an IS trend for Search and Shopping).
- Specific data-quality concerns ("two campaigns show zero conversions over 30 days; tracking may be broken").

Ask: *"Data looks clean / has these gaps. Proceed, or fix the data first?"*

**First five runs:** explain why this matters — broken conversion tracking will make a fine campaign look inefficient, and IS data is the only way to tell a budget-starved campaign apart from one that simply does not have enough demand.

### Step 2 — Rank campaigns by efficiency

Rank every active campaign by the account's primary KPI.

- **Lead-gen accounts (CPA-driven):** lowest CPA to highest. Campaigns with zero conversions are surfaced separately since CPA can't be computed.
- **eCommerce accounts (ROAS-driven):** highest ROAS to lowest. Campaigns with zero revenue are surfaced separately.
- **Hybrid accounts:** whichever KPI `pancake_account_foundations` defines as primary.

Then classify each campaign with a two-axis matrix (efficiency vs. budget constraint):

| Classification | Definition |
|---|---|
| **Efficient + Constrained** | KPI is at or beyond target AND IS lost to budget is above 10% |
| **Efficient + Unconstrained** | KPI is at or beyond target AND IS lost to budget is below 10% |
| **Inefficient + Spending** | KPI is below target AND the campaign is consuming at least 80% of its daily budget |
| **Inefficient + Underspending** | KPI is below target AND daily spend is below 80% of the daily budget |
| **Insufficient Data** | Fewer than 10 conversions in the window — cannot be classified reliably |

A campaign showing very low IS lost to budget (3% or less) while marginal CPA already exceeds target should be additionally tagged **Diminishing Returns** — a reallocation source even when it appears "efficient" on the surface.

**Checkpoint C3 — Classification review.** Show each campaign's classification with the explicit evidence behind it. Tie every classification back to KPI targets in `pancake_account_foundations`. Flag any campaign whose classification is borderline.

Examples of the rationale to display:

- "Campaign X is **Efficient + Constrained**: CPA of $52 sits below the $70 target, and IS lost to budget is 19%."
- "Campaign Y is **Inefficient + Spending**: CPA of $108 is well over the $70 target and the campaign is consuming 91% of its daily budget."
- "Campaign Z is **Diminishing Returns**: IS lost to budget is only 4%, while marginal CPA of $132 has drifted past the $75 target."

Ask: *"Do these match how you see them? Any campaigns where strategic context, planned changes, or seasonality changes the picture?"*

**First five runs:** spell out what each classification means for reallocation. Efficient + Constrained campaigns are prime destinations because they can absorb more spend without sacrificing efficiency. Inefficient + Spending campaigns are prime sources. Diminishing Returns campaigns are also sources — they look fine on average but the marginal dollar has gone unproductive.

### Step 3 — Constraint analysis

Now look more carefully at what kind of constraint each campaign is under. The make-or-break question: **is the constraint budget, or is it rank?** Adding budget to a rank-constrained campaign produces little incremental volume.

For each campaign, capture:

- Current impression share.
- IS lost to budget and IS lost to rank, side by side.
- Whether daily spend is hitting the daily budget cap, and how often (X out of 30 days).
- Where the campaign is against its monthly pace.

Output a constraint summary:

| Campaign | IS | Lost IS (Budget) | Lost IS (Rank) | Budget Capped? | Constraint Type |
|---|---|---|---|---|---|
| ... | ... | ... | ... | Yes/No | Budget / Rank / Both / None |

Read the signals:

- **Lost IS (Budget):** above 10% = meaningfully budget-constrained; above 25% = severely constrained; below 5% = budget is not the bottleneck.
- **Daily budget cap:** spend = daily budget on 5+ of 7 days indicates the cap is binding. Routine mid-day exhaustion means it's binding hard.
- **Pacing:** over a rolling 14-day window, spend persistently at or near the cap means constrained; persistently well below means a non-budget issue (bids, targeting, inventory, demand).
- **Budget vs. Rank:** when Lost IS (Rank) exceeds Lost IS (Budget), more budget cannot solve the problem — quality and bid work has to come first.

### Step 4 — Estimate marginal efficiency

For each campaign, estimate where it sits on its returns curve.

- **Search and Shopping:** IS is the proxy — map IS to curve position (early, mid, late, diminishing returns, near saturation) using the bands in Part 1.
- **PMax:** IS is not exposed. If at least eight weeks of weekly spend-versus-KPI data are available, infer the slope from the trend. Otherwise note that marginal efficiency cannot be estimated and qualify all PMax projections heavily.
- **Display and YouTube:** the saturation mechanic is frequency, not IS. A campaign at its frequency ceiling will not benefit from more budget; it will just buy more impressions per user at diminishing return.

Tag campaigns with high estimated marginal efficiency (good reallocation destinations) and those with low or negative marginal efficiency (good reallocation sources).

### Step 5 — Model reallocation scenarios

Build two or three scenarios at different risk levels. Don't deliver a single recommendation when reasonable practitioners might choose different risk profiles.

#### Conservative
- Move budget only from campaigns that are unambiguously inefficient toward campaigns that are unambiguously constrained and efficient.
- Leave anything ambiguous alone.
- Minimal disruption, smallest projected impact, lowest risk. Right when data confidence is low.

#### Moderate (default recommendation)
- Also pull budget from diminishing-returns campaigns and from mediocre performers near saturation.
- Push into constrained efficient destinations.
- Balanced risk-to-impact. Appropriate for most situations with reasonable data confidence.

#### Aggressive
- May fully pause underperformers.
- Maximum push into constrained efficient destinations.
- Highest projected impact and the most risk of side effects. Only when data confidence is strong and efficiency gaps are unambiguous.

**Picking sources and destinations:**

*Sources — pull budget from:*
- Inefficient campaigns missing KPI.
- Campaigns in diminishing-returns territory (high IS, declining marginal efficiency, rising spend).
- Low-strategic-priority campaigns consuming budget without proportional contribution.
- Campaigns with overlapping targeting that are cannibalizing more efficient siblings.
- Under-pacing campaigns whose budget sits unused.

*Destinations — push budget into:*
- Efficient + budget-constrained campaigns (the canonical case).
- New campaigns that still need enough daily spend to graduate out of the learning phase.
- Strategic campaigns funded for a defined reason — seasonal pushes, launches, competitive defense.

*Never send budget to:*
- A rank-limited campaign.
- A campaign currently in learning, unless it specifically needs more budget to reach minimum viable spend.
- A campaign with broken or absent conversion tracking.

**Estimation pattern** (per move):

- With Lost IS (Budget) at 20% and a 15% budget bump, plan on recovering 8–12% of the lost impressions — auction competition absorbs the rest of the lift.
- Convert recovered-impression estimate into projected conversions via the campaign's running conversion rate.
- Convert that into incremental cost using current CPA or ROAS, remembering that marginal performance lands a step below the blended average.
- Wrap output in qualifier language ("projected," "estimated," "based on current trends") and present ranges where the data allows.

For each scenario, model per campaign:

- Current daily budget → proposed daily budget.
- Projected incremental conversions (lead-gen) or projected incremental revenue (eCommerce).
- Account-level effect on CPA or ROAS.
- Risks and tradeoffs.

**Reallocation guardrails** (apply across all scenarios regardless of how aggressive):

- Never push a campaign below the minimum viable spend for its bid strategy.
- For any campaign currently in a learning period, cap the budget change at ±20%.
- Do not redirect budget into a rank-constrained campaign — it won't convert into volume.
- Honor any strategic holdouts defined in `pancake_account_foundations`.
- For PMax, treat $30–$50/day as the floor.

### Step 6 — Incremental budget case (when relevant)

If every efficient campaign is constrained and there is no good reallocation source inside the account, model what additional budget would buy. The framing is incremental, not redistributive.

For each constrained efficient campaign, project incremental conversions at three injection levels:

- +$500/month
- +$1,000/month
- +$2,000/month

(For larger accounts substitute $1K / $3K / $5K to show the diminishing-returns shape at higher increments.)

Compute the projected incremental CPA or ROAS at each level so the user can see the diminishing-returns curve play out across the three options. Frame each line as: "for an additional $X/month, expect approximately Y incremental conversions at a CPA of $Z."

Compare the incremental CPA against the account average. If it lands within roughly 20% of the average, the investment is sound. The flattening curve at higher increments is what justifies the recommended amount rather than a larger one.

Use qualifier language throughout — these are directional, not deterministic, projections.

### Step 7 — Pacing review

Classify each campaign as on track, over-pacing, or under-pacing against its monthly budget.

- Over-pacing campaigns will overspend if left alone — they need a pacing correction or a budget reduction.
- Under-pacing campaigns are spending less than allotted; they become potential reallocation sources because the budget is sitting unused.
- If seasonality data is available, sanity-check whether the current pace matches the seasonal expectation.

### Step 8 — Produce the deliverables

#### Deliverable 1 — Efficiency & Constraint Summary

A single markdown table, one row per active campaign, sorted best-efficiency to worst.

Columns: Campaign, Type, 30d Spend, Daily Budget, Conversions, CPA or ROAS, IS, Lost IS (Budget), Lost IS (Rank), Classification. Add a totals row.

#### Deliverable 2 — Reallocation Tables

One table per scenario. Only include rows where a budget change is proposed.

Columns: Campaign, Current Daily Budget, Proposed Daily Budget, Change ($), Change (%), Current CPA/ROAS, Projected CPA/ROAS, Constraint.

Below each table:

- Monthly budget delta (sum of daily changes × 30.4).
- Net reallocation (should be $0 for a pure shift, positive when recommending incremental budget).
- A one-to-two-sentence risk note.

#### Deliverable 3 — Projected Impact Report

One section per scenario. Format:

```
### [Scenario name]

| Metric | Current (30d) | Projected (30d) | Change |
|---|---|---|---|
| Total Monthly Spend | $X | $Y | ± $Z |
| Total Conversions | X | Y | ± Z |
| Account CPA / ROAS | $X / Xx | $Y / Yx | ± |
| Constrained Campaigns | X of Y | Z of Y | - N |
| Budget Utilization | X% | Y% | ± Z% |

**Key tradeoffs:** [one or two sentences describing what is gained and what is given up]
```

Always append a disclaimer: *"All projected figures are directional approximations derived from the recent performance window. Real outcomes will move with auction competition, seasonal demand, and quality score drift."*

#### Deliverable 4 — Top Actions

A numbered list of three to five highest-leverage actions. Each carries:

- The action in one sentence.
- Projected impact (often as a range, e.g., "+12–18 conversions/month").
- Risk level (Low / Medium / High).
- Priority (Immediate / This week / This month).

#### Deliverable 5 — Pacing Summary

Only include if pacing issues exist. Columns: Campaign, Monthly Budget, Projected Spend, Pacing Status, Action.

**Checkpoint C4 — Scenario review.** Present:

- The Conservative scenario: change summary and projected impact.
- The Moderate scenario, flagged as the recommended default: change summary and projected impact.
- The Aggressive scenario: change summary and projected impact.
- The incremental budget case if applicable.
- The risk profile for each.

Ask: *"Which scenario matches your risk tolerance? Want to adjust any specific campaign's allocation before we finalize?"*

**First five runs:** explain the laddering. Conservative only touches clear winners and clear losers. Moderate adds diminishing-returns campaigns to the reallocation pool. Aggressive may pause underperformers entirely. Each step up adds projected upside and adds risk in equal measure.

**Checkpoint C5 — Delivery.** Show the user:

- The files produced.
- The recommended scenario and the projected account-level KPI before-and-after.
- The implementation order — which budget changes go first, second, and third.
- A usage note: the Reallocation Table contains the exact per-campaign daily-budget changes; implement them in the suggested order so learning periods do not cascade.

Ask: *"All deliverables generated. Want to adjust any scenarios or drill into a specific campaign?"*

**First five runs:** explain why ordering matters. Every budget change can trigger a new learning period. Pushing all changes simultaneously can destabilize the account; staging them keeps the disruption contained.

### Output formatting conventions

- Currency: include the symbol and two decimal places (`$1,234.56`).
- Percentages: one decimal place (`45.3%`).
- ROAS: one decimal place with the `x` suffix (`4.2x`).
- CPA: standard currency format (`$45.67`).
- Prefix positive changes with `+`, negative changes with `-`.
- Do not project to the penny or to single-conversion accuracy. Use ranges when confidence is lower ("12–18 conversions" rather than "15 conversions").

### Edge cases and error handling

- **IS data missing** (some campaign types, some date ranges): note the gap and substitute spend-to-performance trend analysis.
- **Less than 30 days of data:** note the narrowed window and add stronger qualifier language to every projection.
- **No conversions account-wide:** blocking. Budget optimization is meaningless without conversion data; surface this and stop.
- **No KPI target in `pancake_account_foundations`:** ask the user for a target CPA or ROAS before producing any classifications.

### Checkpoint summary

| Checkpoint | After step | Purpose |
|---|---|---|
| C1 | Step 0 | Lock account, scope, KPI, and constraints. |
| C2 | Step 1 | Confirm data completeness before analyzing. |
| C3 | Step 2 | Validate efficiency classifications against KPI targets. |
| C4 | Step 8 | Choose a scenario with risk-tolerance context. |
| C5 | Step 8 | Deliver artifacts and the implementation sequence. |

---

## Part 3 — GAQL data requirements

### Query 1 — Campaign budgets and 30-day performance

```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  campaign_budget.amount_micros,
  campaign_budget.type,
  campaign_budget.has_recommended_budget,
  campaign_budget.recommended_budget_amount_micros,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions,
  metrics.clicks
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status = 'ENABLED'
```

`campaign_budget.type` distinguishes shared budgets from individual budgets. `has_recommended_budget` and `recommended_budget_amount_micros` carry Google's own suggestion — use as a sanity reference, not as a prescription.

### Query 2 — Impression share and lost IS (30 days)

```sql
SELECT
  campaign.id,
  campaign.name,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share,
  metrics.content_impression_share,
  metrics.content_budget_lost_impression_share,
  metrics.content_rank_lost_impression_share
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status = 'ENABLED'
```

Notes on IS availability:

- Search and Display: available.
- Shopping: use `shopping_performance_view` and `search_*` IS metrics.
- PMax: IS is not exposed at all; substitute the weekly trend method.

For Shopping campaigns:

```sql
SELECT
  campaign.id,
  campaign.name,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM shopping_performance_view
WHERE segments.date DURING LAST_30_DAYS
```

### Query 3 — Daily spend by campaign (28+ days)

```sql
SELECT
  campaign.id,
  campaign.name,
  segments.date,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status = 'ENABLED'
ORDER BY segments.date DESC
```

Used for pacing analysis and to detect budget cap days. Compare each day's spend to the day's budget — when a campaign repeatedly bumps into its cap, it is functionally budget-constrained even before IS confirms it.

### Query 4 — Shared budget definitions

```sql
SELECT
  campaign_budget.id,
  campaign_budget.name,
  campaign_budget.amount_micros,
  campaign_budget.type,
  campaign_budget.reference_count
FROM campaign_budget
WHERE campaign_budget.type = 'SHARED'
```

Cross-reference with Query 1 to identify which campaigns share which budget pool. Shared budgets change the reallocation calculus — moving budget within a shared pool is different from moving budget between pools.

### Query 5 — Weekly trend for PMax marginal efficiency (8+ weeks)

```sql
SELECT
  campaign.id,
  campaign.name,
  segments.week,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions
FROM campaign
WHERE segments.date DURING LAST_90_DAYS
  AND campaign.status = 'ENABLED'
  AND campaign.advertising_channel_type = 'PERFORMANCE_MAX'
ORDER BY segments.week DESC
```

The substitute for IS on PMax: plot spend against CPA or ROAS week by week and read the slope.

### Query 6 — Extended trend (60 days, optional)

The same shape as Query 1 with `LAST_60_DAYS`. Useful for catching seasonal context.

### Query 7 — Intraday burn (14 days, optional)

```sql
SELECT
  campaign.id,
  campaign.name,
  segments.hour,
  metrics.impressions,
  metrics.cost_micros
FROM campaign
WHERE segments.date DURING LAST_14_DAYS
  AND campaign.status = 'ENABLED'
```

Detects intraday budget exhaustion. If impressions drop to zero in the afternoon or evening, the campaign is burning through its budget before the day ends — another form of budget constraint that IS alone may not surface.

### Fallback — UI exports

If GAQL access is not available, the same data can be exported from the Google Ads UI:

- **Campaigns tab:** name, status, type, daily budget, conversions, cost, ROAS or CPA, IS, Lost IS (Budget), Lost IS (Rank), the "Limited by budget" flag.
- **Budget report:** monthly spend vs. budget over time; recommended budget.
- **Custom reports:** daily spend by campaign over the last 28 days; weekly spend by campaign over the last 8 weeks.

### Data normalization

- Both `cost_micros` and `amount_micros` divide by 1,000,000 to give the actual currency value.
- CPA = cost ÷ conversions. Handle zero conversions explicitly (do not divide).
- ROAS = conversions_value ÷ cost. Handle zero cost explicitly.
- IS and Lost IS are returned as fractions (0.45 = 45%). Convert for display.

### Pre-analysis data quality checks

1. Conversion tracking is alive somewhere in the account.
2. `campaign_budget.amount_micros` is populated for every enabled campaign.
3. Search and Shopping campaigns return IS values. A null IS usually means the campaign is too small for Google to compute one.
4. The daily series has no gaps over the requested window.
5. Currency is consistent across the account (set at account level; confirm via `pancake_account_foundations`).

---

## Part 4 — Worked example: Meridian Outdoor Co.

A fictional walkthrough showing how the workflow handles a realistic six-campaign eCommerce account.

### Account snapshot

- **Account:** Meridian Outdoor Co. (fictional, direct-to-consumer camping and hiking gear).
- **Monthly Google Ads spend:** $18,000.
- **Primary KPI:** ROAS, target 3.5x.
- **Maturity:** Established (~310 conversions/month).
- **Currency:** USD.

### Steps 1–2 — Efficiency ranking

| Campaign | Type | 30d Spend | Daily Budget | Conv | ROAS | IS | Lost IS (Budget) | Lost IS (Rank) | Classification |
|---|---|---|---|---|---|---|---|---|---|
| Non-Brand Search | Search | $3,400 | $115 | 71 | 4.9x | 32% | 26% | 34% | Efficient + Constrained |
| Shopping Standard | Shopping | $3,900 | $130 | 84 | 3.9x | 47% | 21% | 28% | Efficient + Constrained |
| PMax | PMax | $4,600 | $155 | 79 | 3.6x | N/A | N/A | N/A | Efficient + Unconstrained |
| Display Remarketing | Display | $1,800 | $60 | 33 | 2.4x | N/A | N/A | N/A | Efficient + Unconstrained |
| Branded Search | Search | $2,400 | $80 | 92 | 2.0x | 83% | 6% | 11% | Efficient + Unconstrained |
| Display Prospecting | Display | $1,900 | $65 | 11 | 0.9x | N/A | N/A | N/A | Inefficient + Spending |

**Account totals:** $18,000 spend, 370 conversions, 3.2x blended ROAS.

What the ranking surfaces:

- **Non-Brand Search** is the headline opportunity: highest ROAS in the account (4.9x) at only 32% IS with 26% IS lost to budget — clearly budget-starved.
- **Shopping Standard** is in the same situation, less severely: 3.9x ROAS at 47% IS, 21% lost to budget.
- **PMax** is performing at 3.6x ROAS, just above the 3.5x target. With no IS to read, the eight-week weekly trend carries the analysis — and it is flat, suggesting there is still headroom before saturation.
- **Display Remarketing** posts a respectable 2.4x ROAS but its constraint is frequency, not budget. Pushing more spend in raises per-user frequency and erodes efficiency.
- **Branded Search** posts 2.0x ROAS at 83% IS. Only 6% IS is lost to budget — this campaign is effectively saturated. The marginal dollar buys very little incremental volume.
- **Display Prospecting** is unambiguously underwater: 0.9x ROAS (revenue below spend) and burning its full daily budget. The obvious source for reallocation.

### Step 3 — Constraint analysis

| Campaign | IS | Lost IS (Budget) | Lost IS (Rank) | Budget Capped? | Constraint Type |
|---|---|---|---|---|---|
| Non-Brand Search | 32% | 26% | 34% | Yes (30/30 days) | Budget (primary) + Rank (secondary) |
| Shopping Standard | 47% | 21% | 28% | Yes (24/30 days) | Budget (primary) + Rank (secondary) |
| PMax | N/A | N/A | N/A | No | None detected |
| Display Remarketing | N/A | N/A | N/A | No | Frequency-limited |
| Branded Search | 83% | 6% | 11% | No | Near saturation |
| Display Prospecting | N/A | N/A | N/A | Yes (27/30 days) | None worth solving (campaign is inefficient) |

**Critical nuance for Non-Brand Search:** Lost IS (Rank) at 34% sits above Lost IS (Budget) at 26%. A budget increase only captures the budget-lost portion of the gap. Fully unlocking this campaign also requires downstream quality score and bidding work.

### Step 4 — Marginal efficiency

| Campaign | Curve position | Marginal efficiency | Headroom |
|---|---|---|---|
| Non-Brand Search | Early-to-mid (32% IS) | High | Large, but partly capped by rank |
| Shopping Standard | Mid (47% IS) | Moderate-to-high | Solid, with rank ceiling |
| PMax | Unknown (no IS); 8-week trend stable | Apparently stable | Some, with uncertainty |
| Display Remarketing | At frequency ceiling | Low for new spend | Minimal |
| Branded Search | Late (83% IS) | Low | Minimal |
| Display Prospecting | N/A (currently inefficient) | Negative (money-losing) | Not applicable |

### Step 5 — Reallocation scenarios

#### Conservative — pure cut and paste

Move ~$600/month from Display Prospecting into Non-Brand Search. Nothing else changes.

| Campaign | Current Daily | Proposed Daily | Change | Projected ROAS |
|---|---|---|---|---|
| Display Prospecting | $65 | $45 | -$20/day (-31%) | 0.9x (unchanged) |
| Non-Brand Search | $115 | $135 | +$20/day (+17%) | 4.5x (modest dip from 4.9x) |

- Net monthly budget change: $0 (redistribution only).
- Projected impact: roughly +9 conversions/month at marginal ROAS in the 4.2–4.7x range.
- Risk: low. Cutting a money-losing campaign improves things by itself, and Non-Brand Search has clear budget headroom.

#### Moderate — the default recommendation

Pull ~$1,800/month total: $1,200 from Display Prospecting and $600 from Branded Search. Push $1,200 into Non-Brand Search and $600 into Shopping Standard.

| Campaign | Current Daily | Proposed Daily | Change | Projected ROAS |
|---|---|---|---|---|
| Display Prospecting | $65 | $25 | -$40/day (-62%) | 0.9x |
| Branded Search | $80 | $60 | -$20/day (-25%) | 2.1x (modest improvement at the margins) |
| Non-Brand Search | $115 | $155 | +$40/day (+35%) | 4.2x (moderate dip from 4.9x) |
| Shopping Standard | $130 | $150 | +$20/day (+15%) | 3.6x (slight dip from 3.9x) |

- Net monthly budget change: $0.
- Projected impact: ~+20 conversions/month. Account ROAS projected to move from 3.2x toward ~3.4x.
- Risk: medium-low. The Branded Search trim is small and it is near saturation anyway. The Display Prospecting cut is significant but the campaign is unprofitable. The Non-Brand Search +35% jump is meaningful but well-supported by 26% IS lost to budget.

**Why this is the recommendation:** it addresses both clear problems (a money-losing prospecting campaign and a near-saturated brand campaign) and funds both clear opportunities (two efficient, budget-constrained campaigns). No single campaign moves more than 35%, so the disruption envelope is bounded.

#### Aggressive — pause the loser

Pause Display Prospecting outright. Push $2,400 into Non-Brand Search and $1,200 into Shopping Standard. Cut Branded Search by $600.

| Campaign | Current Daily | Proposed Daily | Change | Projected ROAS |
|---|---|---|---|---|
| Display Prospecting | $65 | $0 | -$65/day (paused) | N/A |
| Branded Search | $80 | $60 | -$20/day (-25%) | 2.1x |
| Non-Brand Search | $115 | $195 | +$80/day (+70%) | 3.7x (notable dip from 4.9x) |
| Shopping Standard | $130 | $170 | +$40/day (+31%) | 3.4x (moderate dip from 3.9x) |

- Net monthly budget change: -$600/month (the pause frees more than the reallocation absorbs).
- Projected impact: ~+28 conversions/month. Account ROAS projected at ~3.5x.
- Risk: medium-high. Two specific concerns: (a) the +70% jump on Non-Brand Search likely pushes into diminishing returns faster than the model suggests, and (b) 34% IS lost to rank means a meaningful fraction of the extra spend will not actually be captured. On top of that, pausing prospecting entirely cuts off the new-audience pipeline that feeds remarketing — a 4–8 week downstream consequence that does not show up in the immediate numbers.

### Recommendation rationale

The Moderate scenario is the recommended choice because:

1. It tackles both clear inefficiencies — the money-losing prospecting campaign and the near-saturated brand campaign.
2. It funds both clear opportunities — the two efficient, constrained campaigns.
3. It preserves some prospecting volume to keep feeding the remarketing pool.
4. The projected lift (+20 conversions, ROAS 3.2x → 3.4x) is material.
5. The largest per-campaign change is +35%, keeping risk contained.

### Follow-up actions after implementation

- Track Non-Brand Search IS across the next two weeks. If it climbs from 32% toward roughly 42% while ROAS holds, the reallocation is working.
- Do the same for Shopping Standard.
- Recheck Display Prospecting at its reduced budget after two weeks. If ROAS climbs above 1.0x at the lower spend, the campaign was over-funded rather than fundamentally broken. If it stays below 1.0x, escalate to the Aggressive scenario and pause it.
- Begin quality score work on Non-Brand Search to attack the 34% IS lost to rank. That is the next optimization lever once the budget side has been solved.
