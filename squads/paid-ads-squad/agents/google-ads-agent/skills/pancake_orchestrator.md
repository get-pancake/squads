---
name: pancake_orchestrator
description: The launchpad for every recurring Google Ads account review. Reads the account roster, resolves the reporting window, routes the right action skills to each account at the right cadence (weekly, monthly, quarterly), executes them in a safe sequence with parallelism where possible, and gates progress on four mandatory human checkpoints. It also owns the per-account performance read itself — pulling the GAQL data, computing period-over-period KPI deltas, building campaign breakdowns, classifying four-week directional trends, and emitting both a client-ready dashboard and a practitioner trend document. The performance read describes what changed; causal work is handed off to pancake_root_cause_lab and the specialist skills.
triggers:
  - "run the review"
  - "account review"
  - "run all accounts"
  - "weekly review"
  - "monthly review"
  - "quarterly review"
  - "google ads review"
  - "analyze all accounts"
  - "run the analysis"
  - "performance review"
  - "performance analysis"
  - "weekly metrics"
  - "campaign performance"
  - "account performance"
  - "WoW comparison"
  - "performance dashboard"
---

# Pancake Orchestrator

## What this skill is

This is the single entry point for a recurring Google Ads review. It plays two roles in one document:

1. **Orchestrator.** Drives the rest of the toolkit. Reads the roster, picks the right action skills per account at the current cadence, executes them in safe order, and pauses at four mandatory human checkpoints so an operator can sign off before the run advances.
2. **Per-account performance read.** Owns the measurement layer itself — period-over-period deltas, campaign breakdowns, four-week trend classification, threshold flags, and the two written deliverables (client dashboard and practitioner trend doc).

If you want one command to start the weekly, monthly, or quarterly review, this is it. The orchestrator describes *what* changed; any *why* work is delegated to specialist skills (see the routing matrix below).

---

## Calling the Google Ads API

Integration calls are made from Python scripts that import the generated SDK. The authoritative reference for available functions lives in the SDK's Google Ads client module.

A representative call:

```python
import asyncio
from sdk.google_ads_client import google_ads_run_gaql_query

async def main():
    result = await google_ads_run_gaql_query(
        customer_id="1234567890",
        query="""
            SELECT campaign.name, metrics.impressions, metrics.clicks,
                   metrics.conversions, metrics.cost_micros
            FROM campaign
            WHERE segments.date DURING LAST_30_DAYS
        """,
    )
    print(result)

asyncio.run(main())
```

Run any script with `uv run python script.py`.

Most-used functions:

- `google_ads_run_gaql_query(customer_id, query)` — the workhorse
- `google_ads_list_campaigns(customer_id, ...)` — enumerate campaigns
- `google_ads_get_campaign_performance(customer_id, ...)` — campaign metrics
- `google_ads_get_keyword_performance(customer_id, ...)` — keyword metrics

Two operational notes:

- **Writes are drafts.** Every mutation produces a draft and must be approved with `submit_draft(draft_id)` before going live.
- **Money values are micros.** Divide cost or budget values by 1,000,000 to get currency values.

---

## The run, end to end

The orchestrator runs in six numbered steps. Step 3 contains the embedded per-account performance read.

### Step 0 — Configuration and scope

Read the workspace configuration produced by `pancake_account_foundations` (default location: `pancake_account_foundations/config.yaml`). If the file is missing, stop and have the operator run `pancake_account_foundations` first — without it there is no roster, no targets, and no thresholds.

Filter the roster to accounts where `status: active`, then show the operator the working list:

| # | Account | Business Model | Maturity | Primary KPI | Campaign Types |
|---|---------|---------------|----------|-------------|----------------|
| 1 | {name} | {business_model} | {maturity_level} | {primary_kpi}: {target} | {campaign_types_active} |

Ask which accounts to include (all, or a subset by number or name).

Then resolve the reporting window from `reporting.period`:

- `thu_wed` — Thursday through Wednesday, ending yesterday or the most recent Wednesday.
- `mon_sun` — Monday through Sunday, ending the most recent Sunday.
- `custom` — a 7-day window derived from `custom_period_start`.

The comparison window defaults to the seven days immediately before the reporting window. If `reporting.comparison` is `prior_year`, use the same calendar dates one year earlier. If `reporting.comparison` is `both`, generate both comparisons in parallel. Show resolved dates and have the operator confirm.

Finally, capture context before anything runs:

- Were any campaigns paused, launched, or relaunched this period?
- Were any budgets changed?
- Is there a seasonal driver, promotion, or external event?
- Are there any known tracking issues?

Record the answers as run notes. Each downstream skill is handed these notes so its findings factor them in from the start instead of rediscovering the situation.

### Step 1 — Auth check

Confirm the Google Ads integration is connected by listing the accounts visible to the credential:

```python
import asyncio
from sdk.google_ads_client import google_ads_list_all_accounts

async def main():
    result = await google_ads_list_all_accounts()
    print(result)

asyncio.run(main())
```

If the call fails, the operator needs to connect Google Ads through the integrations layer. Fetch the connect URL with `get_integration_connect_url("google_ads")` from the integrations API. If the API integration is unreachable, fall back to CSV exports from the Google Ads UI. Do not advance to Step 2 until auth is verified.

### Step 2 — Route skills per account

For each confirmed account, build the list of action skills to invoke. Routing draws on three inputs: the account configuration, the campaign types running, and the current cadence (weekly / monthly / quarterly). The full routing logic — by attribute, by detected channel type, by business model, and by maturity — sits in the [Routing logic](#routing-logic) section below.

Render the resolved routing per account in a compact block:

```
Account: {name} ({maturity_level})
Skills this run: pancake_orchestrator (performance read), pancake_inspect_bidding, pancake_query_intelligence, pancake_pmax_workshop
Monthly additions (if applicable): pancake_creative_atelier, pancake_inspect_settings (full)
Estimated scope: {N campaigns}, {campaign types present}
```

Ask: "Does this routing look right? Anything to add or skip?" Do not advance until the operator confirms.

### Step 3 — Execute per account (with embedded performance read)

Process accounts one at a time, in roster order.

#### 3a. Performance read first

Before any other skill fires, the orchestrator runs its own performance read on the account. This produces the WoW comparison and the flag set that the other skills reference. The full mechanics are described in the [Performance read](#per-account-performance-read) section below; in short it pulls the GAQL queries Q1–Q6 (plus Q7/Q8 when warranted), computes the account snapshot, builds the per-campaign breakdown, classifies the four-week trend, generates flags by business model, and writes the dashboard and trend files at the end of Step 5.

#### 3b. Action skills, parallel where safe

Once the performance read is in hand, run the remaining routed skills.

Parallel-safe group (independent inputs):

- `pancake_query_intelligence`
- `pancake_pmax_workshop`
- `pancake_evaluate_shopping`
- `pancake_evaluate_youtube`
- `pancake_evaluate_demandgen`
- `pancake_inspect_local`

Sequential group (depends on earlier output):

- `pancake_inspect_bidding` — uses the performance data
- `pancake_creative_atelier` — monthly only
- `pancake_inspect_settings` — full monthly, quick weekly
- `pancake_budget_engine` — monthly only, needs both performance and bidding output
- `pancake_root_cause_lab` — only invoked for campaigns flagged earlier

#### 3c. Aggregate per-account findings

After every skill completes for the account, collect:

- All flags (critical, warning, info)
- All recommendations with priority
- Headline metrics: spend, primary KPI, WoW change
- Items to revisit next week

#### Per-account checkpoint

Present a compact summary at account close:

- Health verdict: Healthy / Needs Attention / Urgent
- Top finding
- Count of recommendations by priority

Ask: "Continue to the next account, or dig deeper here?"

### Step 4 — Recommendations review (Checkpoint 3)

Once every selected account has been processed, consolidate into a portfolio view before writing anything to disk.

#### Portfolio summary

| Account | Health | Spend | Primary KPI | WoW Change | Top Recommendation |
|---------|--------|-------|-------------|------------|--------------------|
| {name} | {status} | {spend} | {value} | {%} | {recommendation} |

#### Top three recommendations per account

Use the Strategic Unlock framing — pair the technical finding with the business capability it unlocks:

**{Account Name}**
1. "{Technical finding}" → "{Business capability it unlocks}"
2. "{Technical finding}" → "{Business capability it unlocks}"
3. "{Technical finding}" → "{Business capability it unlocks}"

#### Cross-account patterns

Look for themes spanning multiple accounts:

- Shared bidding-strategy issues
- Negative keyword opportunities applicable across accounts
- Universal tracking problems
- Portfolio-level budget reallocation chances

This is the most important checkpoint. Wait for the operator's sign-off before any files are written — they may reprioritize, add context, or override recommendations.

### Step 5 — Output generation

Once recommendations are approved, write the deliverables.

#### Per-account files

The performance read produces two Markdown files per account (dashboard + trend doc, full spec in [Deliverables](#deliverables) below). Additional skills append their own per-account file as routed.

The overarching review file pulls everything together:

- Directory: `{reporting.output_path}`
- File name pattern: `{reporting.output_naming}` with tokens `{client}` (account name), `{week}` (ISO week number), and `{date}` (period end date).

Contents:

1. Header with account name, reporting period, and maturity level
2. Performance summary table with the key WoW metrics
3. Findings from each invoked skill, grouped by skill
4. Prioritized recommendations
5. Follow-up items for next week

#### Cross-account summary file

Produced only when `reporting.include_cross_account_summary: true`.

File name: `Cross-Account Summary - Week {WW}.md`

Sections:

1. **Account Health Ranking** — every account sorted by health.

   | Rank | Account | Health | Spend | Primary KPI | Flags (Crit/Warn) | WoW Trend |
   |------|---------|--------|-------|-------------|-------------------|-----------|

2. **Top 5 Priority Actions** across the portfolio, by impact.
3. **Accounts Needing Urgent Attention** with a specific reason for each.
4. **WoW Direction** per account: Improving, Stable, or Declining — with the signal that drove the call.
5. **Portfolio observations** — total spend, blended KPI, cross-account themes.

### Step 6 — Memory and follow-up

After files are written, close the loop:

1. **Persistent findings.** Ask whether anything should be remembered for future runs — newly discovered structures, recalibrated KPI targets, maturity changes, new brand terms, new negative patterns.
2. **Watch list.** Compile next-period follow-ups: bidding learning periods that should have completed, budget changes to verify, experiments to read out, settings changes to confirm.
3. **Config drift.** If the account changed (campaigns added or paused, budgets shifted), ask whether to update `pancake_account_foundations` now while it's fresh.

---

## Mandatory checkpoints

Four points where the orchestrator pauses for a human. They are not optional, even when the operator says to skip checkpoints.

| # | Where | Confirm |
|---|---|---|
| 1 | Steps 0–1 (pre-flight) | Accounts, dates, auth, special circumstances |
| 2 | After Step 2 (routing) | Skill matrix per account |
| 3 | After Step 4 (recommendations) | Top 3 per account and cross-account patterns |
| 4 | After Steps 5–6 (post-output) | Files correct, memory items captured, follow-ups recorded |

If the operator asks to "run it all" or "skip checkpoints", honor everything except Checkpoint 3. Recommendations drive what will be implemented, so they always require human signoff.

---

## Per-account performance read

This is the orchestrator's own measurement layer, invoked at Step 3a for every active account. It produces the WoW/MoM evidence base the other skills reference. It is strictly descriptive — no causal claims. Bleeding campaigns go to `pancake_root_cause_lab`; bidding mismatches go to `pancake_inspect_bidding`.

Occasions to invoke this layer standalone:

- Standing weekly or monthly cadence reports for one account
- A WoW or MoM brief
- Identifying movers — campaigns trending up or down
- Generating a client-shareable dashboard
- Surfacing metrics that crossed thresholds

### Bootstrap

Load the account configuration from `pancake_account_foundations` (KPI targets, threshold values, business model, reporting cadence, currency, output paths, and maturity grade so depth can be tuned). If no config exists for the account, stop and run `pancake_account_foundations` first. Confirm with the operator: accounts in scope, reporting period (default: most recent period defined in config), comparison period (default: prior period).

### Data acquisition

Run the GAQL queries below. The minimum dataset:

- **Account totals** for both periods: cost, conversions, conversion value, impressions, clicks, CTR, average CPC.
- **Campaign-level totals** for both periods: the same metrics plus IS, Lost IS (Budget), Lost IS (Rank), bidding strategy, budget.
- **Conversion actions summary**: which are active, how counted, total volume per action.
- **Four-week weekly campaign series**: weekly spend, conversions, CPA/ROAS, IS — input to the trend section.

Pull extra segments only when warranted:

- Device segment when device behavior is known to skew the account.
- Geographic segment when the business model is local.

#### Required queries

**Q1 — Account totals, current period**

```sql
SELECT
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpc,
  metrics.conversions_from_interactions_rate
FROM customer
WHERE segments.date BETWEEN '{current_start}' AND '{current_end}'
```

Replace `{current_start}` and `{current_end}` with dates resolved from the reporting config in `YYYY-MM-DD` format.

**Q2 — Account totals, comparison period.** Same columns as Q1, with `{comparison_start}` and `{comparison_end}` in the `WHERE` clause.

**Q3 — Campaign totals, current period**

```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  campaign_budget.amount_micros,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpc,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date BETWEEN '{current_start}' AND '{current_end}'
  AND campaign.status = 'ENABLED'
```

**Q4 — Campaign totals, comparison period.** Same as Q3 with the comparison window.

**Q5 — Weekly campaign series for the trend section**

```sql
SELECT
  campaign.id,
  campaign.name,
  segments.week,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions,
  metrics.clicks,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status = 'ENABLED'
ORDER BY segments.week DESC
```

The 30-day window yields four full or near-full ISO weeks — the input to the trend step.

**Q6 — Conversion actions inventory**

```sql
SELECT
  conversion_action.id,
  conversion_action.name,
  conversion_action.status,
  conversion_action.category,
  conversion_action.counting_type,
  conversion_action.include_in_conversions_metric
FROM conversion_action
WHERE conversion_action.status = 'ENABLED'
```

Note: the Google Ads API does not allow `metrics.conversions` on the `conversion_action` resource — pull conversion totals from the account-level or campaign-level queries.

#### Optional queries

**Q7 — Device breakdown, current period**

```sql
SELECT
  campaign.id,
  campaign.name,
  segments.device,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions,
  metrics.clicks
FROM campaign
WHERE segments.date BETWEEN '{current_start}' AND '{current_end}'
  AND campaign.status = 'ENABLED'
```

Run when device behavior diverges or when the operator asks for device detail.

**Q8 — Geographic breakdown, current period**

```sql
SELECT
  campaign.id,
  campaign.name,
  geographic_view.country_criterion_id,
  geographic_view.location_type,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions,
  metrics.clicks
FROM geographic_view
WHERE segments.date BETWEEN '{current_start}' AND '{current_end}'
  AND campaign.status = 'ENABLED'
```

Use for local businesses or whenever geographic distribution matters.

#### CSV / manual fallback

If GAQL is unavailable, the same data can be exported from the Google Ads UI:

- **Campaigns view** — date range = current period, then export campaign name, status, type, bidding strategy, daily budget, cost, conversions, conversion value, CPA or ROAS (add via column picker), IS, Lost IS (Budget), Lost IS (Rank), CTR, average CPC, conversion rate.
- **Same export for the comparison window.**
- **Custom report** segmented by week over the trailing four weeks for the trend section.
- **Overview tab** for a quick account snapshot.

#### Field normalization

- Divide `cost_micros` and `amount_micros` by 1,000,000 for currency values.
- CPA = cost ÷ conversions, ROAS = conversions_value ÷ cost. Guard divide-by-zero — print `N/A`, not zero or infinity.
- Impression share comes back as a 0–1 fraction; multiply by 100.
- CTR also returns as a fraction; multiply by 100.
- Average CPC arrives in micros; divide by 1,000,000.

#### Resolving the reporting window

| `reporting.period` | Current Window | Comparison Window |
|---|---|---|
| `thu_wed` | Most recent Thursday-to-Wednesday block | Thursday-to-Wednesday block before that |
| `mon_sun` | Most recent Monday-to-Sunday block | Monday-to-Sunday block before that |
| `custom` | Derived from `custom_period_start` | Same-length window placed immediately before the current one |

If `reporting.comparison` = `prior_year`, compare against the same calendar dates a year ago. If `reporting.comparison` = `both`, generate both comparisons in parallel.

#### Data quality gate

Before analysis runs:

1. At least some campaigns have non-zero conversions (otherwise tracking may be broken — flag as blocking).
2. The currency returned matches the account config.
3. Daily data has no gaps across the reporting window.
4. Any `special_handling_notes` filters from the config have been applied (e.g., the FLIR rule scoping campaigns to names containing both `ffg` and `.e.`).
5. Search and Shopping campaigns return IS data. PMax does not — that is expected. Null IS on a Search campaign usually signals very low volume.

#### Checkpoint — confirm the inventory

Show the operator:

- Number of days covered in each period.
- Active campaigns with spend in the current period.
- Comparison type (WoW / MoM / YoY / custom) with explicit date ranges on both sides.
- Any data gaps (e.g., missing IS for PMax, campaigns launched mid-period).
- Whether four-week trend data is available.

Ask: "The dataset looks [complete/has gaps]. Continue?"

For the first five runs on this account, add a brief teaching note: account totals show direction, campaign breakdown localizes the source of change, the four-week trend separates real shifts from week-to-week noise.

### Account snapshot

For the account as a whole, compute current vs. prior values plus absolute and percentage change for: total spend, total conversions, primary KPI (CPA or ROAS), Search IS, CTR, average CPC, conversion rate. Render as a single table.

Each row gets a flag derived from the change percentage compared against `flag_thresholds` in the config and the business-model logic below:

- **Green** (no marker) — within tolerance or moving favorably.
- **Yellow** — warning threshold crossed.
- **Red** — critical threshold crossed.

#### Checkpoint — account-level review

Always present the snapshot, even when nothing dramatic moved. Add:

- A one-word trajectory call on the primary KPI: Improving, Declining, Stable, or Volatile.
- A list of metrics that crossed any threshold.
- A direct ask: any known budget changes, launches, pauses, seasonality?

Ask: "Here is the account picture before we drill into campaigns. Any of these movements already explained?"

Early-run teaching note: a metric crossing a threshold is not automatically a problem — it could be variance, seasonality, or an intentional change. The next step localizes it.

### Campaign breakdown

For every enabled campaign, build a row with: campaign name, channel type, spend, conversions, primary KPI (CPA for lead gen / local, ROAS for ecommerce), IS, and change in spend, conversions, and primary KPI vs. the prior period. Sort by spend descending.

Flag a campaign when any of these is true:

- A metric crossed a threshold boundary (e.g., CPA moved from under target to over).
- Conversions fell to zero.
- Spend grew 20%+ without proportional conversion gain.
- IS dropped 10 percentage points or more (competitive pressure or budget cap).
- The campaign is in a bidding learning period (recent strategy change).

Apply the account's `campaign_naming_pattern` and any `special_handling_notes` before flagging — FLIR's dual-division setup needs per-division filtering, for example.

### Four-week trend analysis

For each campaign with at least four weeks of data, build a small table with one row per week: spend, conversions, CPA or ROAS, IS. Classify each metric's direction across that window:

- **Improving** — three or more consecutive weeks moving favorably (CPA down, ROAS up, conversions up, IS up).
- **Declining** — three or more consecutive weeks moving the wrong way.
- **Stable** — WoW change inside ±5% for three or more weeks.
- **Volatile** — oscillation with swings greater than 10% between consecutive weeks.

Visual indicators: up arrow for improving, down arrow for declining, flat bar for stable, zigzag for volatile. Direction reflects business impact, not raw math — falling CPA is an "improving" arrow.

### Flag generation by business model

Pull actual numeric thresholds from `flag_thresholds`; defaults below are illustrative.

**Lead generation** (primary KPI = CPA)

- Red when CPA exceeds the critical threshold (default: target CPA × 1.5).
- Yellow when CPA exceeds the warning threshold (default: target CPA × 1.2).
- Green when CPA is at or below target.
- Also flag when conversion volume falls while spend is steady or rising.

**eCommerce** (primary KPI = ROAS)

- Red when ROAS falls below the critical threshold (default: target ROAS × 0.6).
- Yellow when ROAS falls below the warning threshold (default: target ROAS × 0.8).
- Green when ROAS is at or above target.
- Also flag when revenue falls while spend is steady or rising.

**Local businesses**

- Apply CPA thresholds, and additionally monitor absolute conversion volume — local operators need a minimum lead flow per week.
- Flag when conversion volume falls below a viability floor (typical: fewer than five conversions per week).

**Dual-model accounts** (e.g., FLIR with both ecommerce and lead-gen divisions)

- Use a separate threshold set per division.
- Do not mix metrics across divisions.
- Report each division as its own section in the account dashboard.

**Universal flags** (regardless of business model)

| Signal | Threshold | Likely Cause |
|---|---|---|
| Spend rose without performance improving | +20% spend | Budget unlocked an inefficient cohort |
| Impression share dropped | -10 percentage points | Competitive pressure or budget constraint |
| CTR dropped | -15% | Ad fatigue or relevance erosion |
| Average CPC rose | +15% | Competitive bidding or Quality Score decline |

### Depth calibration by maturity

The performance read scales depth to the account's stage (from `pancake_account_foundations`):

- **Nascent.** Account still proving tracking and demand. Skip KPI flagging when a campaign has fewer than 15 conversions in the period — note instead that volume is too low for reliable KPI assessment, and focus on whether conversions are tracking at all and whether volume is growing. Skip IS analysis and competitive signals.
- **Developing.** Run the standard WoW comparison across all metrics. Add bid-strategy appropriateness commentary (e.g., Manual CPC campaign at 40+ conversions/month should be flagged as automation-ready). Include basic IS analysis on Search campaigns.
- **Established.** Produce the full dashboard. Include IS with competitive signals (Lost IS (Rank) trends). Flag campaigns with strong performance but low IS — these are budget opportunities. Add device and geographic breakdowns where material.
- **Advanced.** Everything from Established, plus portfolio roll-ups (group campaigns by portfolio bidding strategy or business line). Include marginal efficiency indicators — is the last dollar producing diminishing returns? Cross-reference with `pancake_budget_engine` output for pacing context.

### Data source flexibility

The mechanism is selected by `data_source.method` in the account config:

- **Python ADC** — use the GAQL queries above directly.
- **API** — adapt the same queries to API function signatures.
- **CSV** — operator exports the relevant reports from the Google Ads UI.
- **Manual** — provide a fillable template.

### Deliverables

Two Markdown files per account, both written into the path from `reporting.output_path` using the `reporting.output_naming` template.

#### Deliverable 1 — Performance Dashboard (client-facing)

Four blocks: header, account snapshot, per-campaign detail, observations + flags.

**Header**

```markdown
# [Account Name] — Performance Dashboard

**Period:** [current_start] to [current_end]
**Comparison:** [comparison_start] to [comparison_end] ([WoW/MoM/YoY])
**Generated:** [timestamp]
**Maturity:** [nascent/developing/established/advanced]
**Data Source:** [adc/api/csv/manual]
```

**Account Snapshot**

```markdown
## Account Snapshot

| Metric | Current | Prior | Change | Change % | Flag |
|---|---|---|---|---|---|
| Spend | $9,832.40 | $9,415.10 | +$417.30 | +4.4% | |
| Conversions | 118 | 131 | -13 | -9.9% | :yellow_circle: |
| CPA | $83.32 | $71.87 | +$11.45 | +15.9% | :red_circle: |
| ROAS | 3.9x | 4.5x | -0.6x | -13.3% | :yellow_circle: |
| Search IS | 41.7% | 44.2% | -2.5pp | -5.7% | |
| CTR | 3.5% | 3.9% | -0.4pp | -10.3% | |
| Avg CPC | $2.03 | $1.86 | +$0.17 | +9.1% | |
| Conv Rate | 4.9% | 5.4% | -0.5pp | -9.3% | :yellow_circle: |
```

Flag legend: `:red_circle:` = critical, `:yellow_circle:` = warning, empty = within tolerance or improving. Plain-text fallback when emoji rendering is unavailable: `[RED]`, `[YLW]`, blank for green.

**Campaign Detail.** One Markdown block per campaign, sorted by spend descending. Each opens with metadata, then the metric table.

```markdown
### [Campaign Name]
**Type:** [Search/PMax/Shopping/Display] | **Bidding:** [strategy] | **Daily Budget:** [$X]

| Metric | Current | Prior | Change | Change % | Flag |
|---|---|---|---|---|---|
| Spend | $2,910.55 | $2,684.20 | +$226.35 | +8.4% | |
| Conversions | 38 | 44 | -6 | -13.6% | :yellow_circle: |
| CPA | $76.59 | $61.00 | +$15.59 | +25.6% | :red_circle: |
| IS | 49.8% | 53.4% | -3.6pp | -6.7% | |
| Lost IS (Budget) | 21.0% | 17.1% | +3.9pp | +22.8% | |
| Lost IS (Rank) | 29.2% | 29.5% | -0.3pp | -1.0% | |
| CTR | 3.7% | 4.2% | -0.5pp | -11.9% | |
| Avg CPC | $1.83 | $1.65 | +$0.18 | +10.9% | |
```

Special cases:

- For PMax, omit IS rows and note IS is unavailable for PMax.
- For campaigns with fewer than 15 conversions in the period, note that KPI flags are suppressed under the nascent calibration rule.

**Key Observations.** Three to five bullets calling out the most important changes, ordered by business impact (not raw percentage). Lead with the movement, then explain the significance plainly.

```markdown
## Key Observations

- **Conversions fell 9.9% even as spend rose 4.4%.** CPA climbed to $83.32, crossing the $78.00 warning line. Most of the efficiency loss traces back to [campaign name].
- **[Campaign name] saw IS slip from 53% to 50%.** Lost IS (Budget) widened by 3.9 percentage points — consistent with a budget that is no longer keeping pace. Even so, this campaign still leads the account on CPA.
- **[Campaign name] is in bidding strategy learning mode** after a switch on [date]. Plan for roughly one to two weeks of volatility before metrics settle.
```

Voice rules: describe what happened, never assert why (causal work belongs to `pancake_root_cause_lab`). Use hedged language for interpretation — "suggests", "consistent with", "may indicate". Connect each observation to a business consequence when possible.

**Flags Summary.** Single consolidated block grouping red and yellow.

```markdown
## Flags Summary

### :red_circle: Critical
- Account CPA ($83.32) sits above the $80.00 critical line
- [Campaign name] CPA jumped 25.6% week-over-week

### :yellow_circle: Warning
- Account conversions fell 9.9%
- Account conversion rate slid from 5.4% to 4.9%
- [Campaign name] IS dipped under the 50% line
```

**Footer**

```markdown
---
*Analysis window: [dates]. Maturity: [level]. Thresholds — warning: [value], critical: [value]. Next recommended review: [date].*
```

#### Deliverable 2 — Trend Analysis (practitioner-facing)

Per-campaign four-week tables and a summary section.

**Per-Campaign Trend Table**

```markdown
## [Campaign Name]

| Week | Spend | Conversions | CPA | IS | Direction |
|---|---|---|---|---|---|
| W14 (Apr 7-13)  | $920 | 11 | $83.64 | 50% | |
| W13 (Mar 31-Apr 6) | $895 | 12 | $74.58 | 51% | |
| W12 (Mar 24-30) | $860 | 13 | $66.15 | 53% | |
| W11 (Mar 17-23) | $830 | 14 | $59.29 | 55% | |
| **4-Week Trend** | **Up** | **Down** | **Rising (declining)** | **Down** | |
```

For ecommerce, swap CPA for ROAS.

**Direction Vocabulary**

| Symbol | Meaning | Criterion |
|---|---|---|
| Up | Metric rising | 3+ consecutive weeks up |
| Down | Metric falling | 3+ consecutive weeks down |
| Flat | Metric stable | WoW changes within ±5% for 3+ weeks |
| Mixed | Metric volatile | Direction alternates with >10% swings |

Translate raw direction into business impact when labeling:

- Falling CPA → Improving
- Rising CPA → Declining
- Rising ROAS → Improving
- Falling ROAS → Declining
- Rising conversions → Improving
- Falling IS → Declining

**Per-Campaign Classification.** One-line verdict below each table.

```markdown
**Trend:** Declining — CPA has risen for 3 weeks running while conversions dropped. Hand off to pancake_root_cause_lab.
```

Classification vocabulary:

- **Improving** — most key metrics trending favorably for 3+ weeks.
- **Stable** — metrics inside normal variance, no clear direction.
- **Declining** — most key metrics trending unfavorably for 3+ weeks.
- **Volatile** — large swings, no consistent direction.
- **Ramping** — new or freshly changed campaign still finding its footing within the first 4 weeks after launch or a major change.

**Trend Summary.** End with three tables.

```markdown
## Trend Summary

### Campaigns Needing Attention
| Campaign | Trend | Primary Concern | Next Step |
|---|---|---|---|
| [name] | Declining | CPA rising 3 weeks | Run pancake_root_cause_lab |
| [name] | Volatile | Conversion volume swings ±30% | Check tracking |

### Campaigns Performing Well
| Campaign | Trend | Highlight |
|---|---|---|
| [name] | Improving | CPA down 15% over 4 weeks |
| [name] | Stable | Performing consistently at target |

### Insufficient Data
| Campaign | Reason |
|---|---|
| [name] | Fewer than 4 weeks of data (launched [date]) |
| [name] | Fewer than 15 conversions in the period |
```

**Formatting conventions**

- Currency: symbol with two decimals (`$1,234.56`).
- Percentages: one decimal (`45.3%`).
- ROAS: one decimal with `x` suffix (`4.2x`).
- Sign the change column explicitly: prefix with `+` or `-`.
- Percentage-point deltas: use the `pp` suffix (`-2.8pp`).
- Weeks: ISO week numbers (`W13`) with the date range in parentheses.
- Round to readable precision — never fractional conversions or sub-penny CPA.
- Use `N/A` when the denominator is zero.

**File naming.** Read `reporting.output_naming` from the config. Default pattern:

```
{client} - Performance Dashboard - {date}.md
{client} - Trend Analysis - {date}.md
```

Substitute `{client}` for the account label and `{date}` for the last day of the reporting window. Write into the path set by `reporting.output_path`.

#### Checkpoint — flags and handoffs

Present:

- The consolidated red and yellow flag list with campaign names attached.
- Campaigns recommended for handoff with the target skill named (see handoff table below).
- Budget opportunities — efficient campaigns that are also constrained.
- Trend concerns — campaigns declining 3+ weeks.

Ask: "These are the campaigns flagged for attention. Want to investigate any of them now, or proceed to file output?"

Early-run teaching note: red flag is the strongest investigation candidate; yellow is a watchlist signal. The handoff column points to the specialist skill best matched to each finding.

#### Checkpoint — delivery

Present:

- The names of the files produced.
- Account-level trajectory: Improving / Declining / Stable / Volatile.
- The single most important observation.
- A reminder on use: the dashboard is client-ready, the trend file is a working document for optimization planning.

Ask: "Both deliverables are written. Want to drill into a specific campaign or tweak the thresholds?"

### Handoff table

| Trigger | Recommended Skill |
|---|---|
| Red-flagged campaign needs a root cause | `pancake_root_cause_lab` |
| Efficient campaigns are constrained, inefficient ones are not | `pancake_budget_engine` |
| Bidding strategy looks wrong for the campaign's data volume | `pancake_inspect_bidding` |
| Search term quality is suspect | `pancake_query_intelligence` |
| PMax needs channel-level inspection | `pancake_pmax_workshop` |

---

## Routing logic

The orchestrator decides which action skills run for each account given configuration, campaign types, business model, maturity, and cadence.

### Base routing by account attribute

| When | Skill | Cadence |
|---|---|---|
| Always (every active account) | `pancake_orchestrator` performance read | Every run |
| Always | `pancake_inspect_bidding` | Every run |
| `search` listed in `campaign_types_active` | `pancake_query_intelligence` | Every run |
| `pmax` listed in `campaign_types_active` | `pancake_pmax_workshop` | Every run |
| `shopping` listed in `campaign_types_active` | `pancake_evaluate_shopping` | Every run |
| `has_youtube_campaigns: true` | `pancake_evaluate_youtube` | Every run |
| `has_demand_gen_campaigns: true` | `pancake_evaluate_demandgen` | Every run |
| `business_model: local` OR `has_gbp: true` | `pancake_inspect_local` | Every run |
| Always | `pancake_creative_atelier` (full audit including landing page module) | Monthly (first run of month) |
| Always | `pancake_inspect_settings` | Full monthly + lightweight weekly |
| Always | `pancake_budget_engine` | Monthly |
| Any campaign flagged in the prior period | `pancake_root_cause_lab` | Ad-hoc |

### Routing by detected campaign type

When `campaign_types_active` is not explicitly populated, detect from live campaign data:

| Signal (`advertising_channel_type`) | Skills Triggered |
|---|---|
| SEARCH | `pancake_query_intelligence`, `pancake_inspect_bidding` |
| PERFORMANCE_MAX | `pancake_pmax_workshop` |
| SHOPPING | `pancake_evaluate_shopping` |
| VIDEO | `pancake_evaluate_youtube` |
| DEMAND_GEN | `pancake_evaluate_demandgen` |
| DISPLAY | `pancake_creative_atelier` (display section) |
| LOCAL_SERVICES | `pancake_inspect_local` |

### Depth by maturity level

| Skill | Nascent | Developing | Established | Advanced |
|---|---|---|---|---|
| `pancake_orchestrator` performance read | Volume + tracking. Skip IS. | Standard WoW. Basic IS. | Full dashboard + IS breakdown. | + Portfolio roll-ups, marginal efficiency. |
| `pancake_query_intelligence` | Basic negatives, brand protection. 5-click threshold. | Full classification + n-grams. 10-click threshold. | + Statistical significance. 15-click threshold. | + Cross-campaign patterns. 20-click threshold. |
| `pancake_pmax_workshop` | Asset completeness check only. | + Channel breakdown, basic search terms. | + Full 8-channel analysis, product tiers. | + Marginal channel efficiency, placement pruning. |
| `pancake_evaluate_shopping` | Feed quality, basic product list. | + Tier classification, IS analysis. | + Structure evaluation, hybrid modeling. | + Marginal product efficiency, custom label strategy. |
| `pancake_inspect_bidding` | Strategy appropriateness only. | + Target evaluation, automation readiness. | + Portfolio opportunities, experiment planning. | + VBB readiness, incrementality testing. |
| `pancake_creative_atelier` (creative) | Basic RSA check (asset count). | + Ad strength, asset ratings. | + A/B test planning, fatigue detection. | + Multivariate testing, cross-campaign consistency. |
| `pancake_creative_atelier` (landing page module) | Skip (insufficient data). | Basic alignment, top 10 pages only. | Full alignment + QS diagnostic, up to 50 pages. | + Cross-campaign page overlap, content gap prioritization. |
| `pancake_root_cause_lab` | Simplified tree (tracking, budget, keywords). | Standard diagnostic tree. | Full tree + attribution analysis. | + Competitive impact, incrementality signals. |
| `pancake_budget_engine` | Basic pacing check. | + Constrained campaign identification. | + Reallocation modeling. | + Marginal efficiency curves, portfolio budgeting. |
| `pancake_inspect_local` | GBP linked check, basic targeting. | + Location targeting, offline tracking status. | + Full LSA review, geographic analysis. | + Multi-location optimization, service area strategy. |
| `pancake_evaluate_youtube` | Skip unless explicitly requested. | Basic format performance. | + Funnel analysis, audience insights. | + Cross-channel lift, incrementality. |
| `pancake_evaluate_demandgen` | Skip unless explicitly requested. | Placement + audience overview. | + Creative analysis, lead quality. | + Cross-channel impact, incrementality testing. |
| `pancake_inspect_settings` | Tracking check only. | + Campaign settings scan. | + Compliance audit, data connections. | + Full audit, automation rules review. |

### Routing by business model

| Business Model | Additional Routing |
|---|---|
| lead_gen | Lead quality assessment in `pancake_evaluate_demandgen`. Offline conversion check in `pancake_inspect_settings`. Count setting audit priority. |
| ecommerce | Product tier analysis in `pancake_evaluate_shopping`. Feed quality in `pancake_pmax_workshop`. ROAS-based flag thresholds. |
| local | `pancake_inspect_local` on every run. Geographic performance in the orchestrator's performance read. LSA review when `lsa_active`. |
| dual | Split analysis by campaign naming convention. Separate thresholds per division. Report divisions separately. |
| saas | Activation tracking focus. Lead-to-activation attribution. CPA by conversion quality tier. |

### Skill execution order

When multiple skills run for the same account, execute in this order so each skill can build on the previous output without duplicating data pulls:

```
1.  pancake_orchestrator performance read   (baseline + flags)
2.  pancake_inspect_settings                (validate data foundation)
3.  pancake_inspect_bidding                 (strategy assessment)
4.  pancake_query_intelligence              (search term health)
5.  pancake_pmax_workshop                   (PMax deep-dive)
6.  pancake_evaluate_shopping               (Shopping deep-dive)
7.  pancake_evaluate_youtube                (YouTube deep-dive)
8.  pancake_evaluate_demandgen              (Demand Gen deep-dive)
9.  pancake_creative_atelier                (creative + landing page health)
10. pancake_inspect_local                   (local-specific)
11. pancake_budget_engine                   (budget modeling, uses everything above)
12. pancake_root_cause_lab                  (root cause on flagged campaigns)
```

Steps 3 through 10 can fan out in parallel when their inputs are pre-collected. Steps 11 and 12 must wait — they depend on findings from the earlier skills.

---

## Cadence at a glance

| Cadence | Scope | When |
|---|---|---|
| Weekly | Performance metrics, search terms, bidding alerts, PMax channel split, budget pacing | Every run |
| Monthly | Everything weekly, plus creative audit, full settings audit, feed quality, audience health, budget optimization | First run of each month |
| Quarterly | Everything monthly, plus maturity reassessment, strategy alignment, full account health, KPI target review | First run of each quarter |

Levels stack — monthly does everything weekly plus monthly additions; quarterly does everything monthly plus quarterly additions.

### Picking the cadence

- **Weekly** is the default. Every run includes the weekly scope.
- **Monthly** applies on the first run whose reporting window includes the first day of a new month.
- **Quarterly** applies on the first run whose reporting window includes the first day of a new quarter (January 1, April 1, July 1, October 1).

### Weekly scope (every run)

**Performance**

- Account-level deltas vs. the prior period: spend, conversions, conversion value, CPA or ROAS.
- WoW comparison on every active campaign.
- Flag any campaign whose primary KPI moved more than 20% in the wrong direction.
- Budget pacing: projected month spend vs. monthly budget, days remaining in the month.

**Search terms**

- Pull the period's search terms.
- Classify each into one of four buckets: urgent negative, expand to exact, monitor, or review manually.
- Run n-gram analysis to find recurring patterns.
- Produce a negative keyword CSV and an expansion keyword CSV.
- Audit candidate negatives against existing positive keywords for conflicts.

**Bidding health**

- Check learning period status on every campaign.
- Flag campaigns stuck in "Learning (limited)" for 14 days or more.
- Notice when multiple campaigns entered learning at the same time.
- Compare actual to target on CPA / ROAS to confirm targets remain calibrated.

**PMax channel distribution**

- Pull the 8-channel breakdown for every PMax campaign.
- Compare the split to the benchmark for the account's business model.
- Flag channels falling outside healthy ranges.
- Check the brand vs. non-brand share of PMax search terms.

**Budget pacing**

- Month-to-date spend vs. monthly budget.
- Projected end-of-month spend at the current daily rate.
- Flag accounts pacing more than 10% above or below budget.
- Flag campaigns whose Lost IS (Budget) is above 20%.

**Red flags**

- Conversion tracking interruption — a sudden drop to zero.
- Spend anomalies — a >50% WoW move with no known cause.
- CPA or ROAS outside the thresholds in the account config.
- Status changes — paused, removed, or disapproved campaigns.

### Monthly scope (first run of month)

Adds to weekly:

**Creative audit**

- RSA asset performance across every Search campaign.
- Asset effectiveness distribution: Best / Good / Low.
- Replacement candidates: assets rated Low for 30+ days.
- PMax asset group completeness scores.
- PMax asset quality and trend.
- Video creative performance for YouTube campaigns.
- Fatigue signal: CTR falling while impressions hold steady.

**Full settings audit**

- Account settings: conversion tracking configuration, audiences, auto-apply recommendations status.
- Campaign settings: networks, locations, languages, ad rotation, schedules.
- Conversion action inventory: which actions are primary, counting type, attribution model.
- Enhanced conversions status.
- Privacy compliance: consent mode, data processing terms.
- Data connections: GA4 link, Merchant Center link, CRM integrations.

**Feed quality review** (Merchant Center accounts)

- Product disapproval rate and top reasons.
- Title optimization coverage.
- Image quality flags.
- Missing performance-relevant attributes (GTIN, brand, color, size).
- Custom label utilization and accuracy.
- Supplemental feed health, when used.

**Audience health**

- Remarketing list sizes and trend direction.
- Customer match list freshness — last update date.
- Performance by audience segment: remarketing vs. prospecting vs. similar.
- In-market and affinity audience performance.
- Overlap between campaigns' audiences.

**Competitive positioning**

- Auction insights trend for top campaigns: IS, overlap rate, position above rate.
- New competitors appearing in auction insights.
- IS direction — gaining or losing ground.
- Top-of-page rate trend for Search campaigns.

**Budget optimization**

- Marginal efficiency: is the last dollar in each campaign still profitable?
- Identify constrained efficient campaigns (high Lost IS Budget, strong KPI).
- Identify unconstrained inefficient campaigns (low Lost IS Budget, weak KPI).
- Model reallocation scenarios — moving budget from inefficient to constrained efficient.
- Present recommendations with projected impact.

**Product tier reclassification** (Shopping or PMax with a feed)

- Re-run tier classification (Heroes, Sidekicks, Zombies, Villains).
- Compare to last month's tiering.
- Find products that migrated up or down.
- Update custom-label recommendations if tiers shifted meaningfully.

### Quarterly scope (first run of quarter)

Adds to monthly:

**Maturity reassessment**

- Re-run the questionnaire from `pancake_account_foundations`.
- Compare the new level to last quarter's.
- If it changed, recalibrate every skill's thresholds.
- Document the change and its implications for strategy.

**Strategy alignment**

- Are the account's goals still current? Confirm with the operator.
- Do KPI targets reflect current performance and business objectives?
- Has the competitive landscape shifted enough to demand a strategy change?
- Are the campaign types still appropriate? Should the account add PMax, YouTube, or Demand Gen?
- Is the account structure still right — consolidation or expansion needed?

**Full health audit**

- Run every action skill regardless of weekly routing.
- Include skills that normally fire only when flagged (e.g., `pancake_root_cause_lab` for the top three campaigns by spend, even if not flagged).
- Deep-dive into areas that the weekly cadence only summarizes.

**Cross-account portfolio analysis**

- Compare trends across every account in the portfolio.
- Identify accounts that improved versus declined over the quarter.
- Spot portfolio-level themes — seasonal, market, or competitive.
- Compare budget allocation to opportunity — is spend proportional?
- Separate the accounts that are positioned to scale from those that need a structural rework before any scale conversation makes sense.

**KPI target review**

- Compare last quarter's targets to actual performance.
- Recommend target adjustments based on what was observed.
- Adjust for the seasonal profile of the quarter ahead.
- Present new targets for operator approval before updating the config.

### Cadence summary table

| Area | Weekly | Monthly | Quarterly |
|---|---|---|---|
| Performance WoW | Full | Full | Full |
| Search term mining | Full | Full | Full |
| Bidding health | Alerts only | Full audit | Full audit |
| PMax channels | Distribution | + Asset groups | + Product tiers |
| Budget pacing | Pacing check | + Reallocation modeling | + Cross-account allocation |
| Creative | Skip | Full audit | Full audit |
| Settings | Quick check | Full audit | Full audit |
| Feed quality | Skip | Full review | Full review |
| Audience health | Skip | Full check | Full check |
| Competitive positioning | Skip | Auction insights | + Strategic implications |
| Maturity | Skip | Skip | Reassessment |
| Strategy alignment | Skip | Skip | Full review |
| Cross-account portfolio | Summary only | Summary + trends | Full portfolio analysis |
| KPI targets | Skip | Skip | Full review + recommendations |

### Cadence recap by routed skill

**Weekly (every run).** Orchestrator performance read (all accounts), `pancake_query_intelligence` (search accounts), `pancake_pmax_workshop` (PMax accounts), `pancake_evaluate_shopping` (shopping accounts), `pancake_inspect_bidding` (all accounts), `pancake_inspect_local` (local accounts), `pancake_evaluate_youtube` (YouTube accounts), `pancake_evaluate_demandgen` (Demand Gen accounts), quick settings check (tracking status, auto-apply alerts).

**Monthly (first run of month).** Everything weekly, plus `pancake_creative_atelier` (full creative audit + landing page alignment + QS diagnostic — also fires ad-hoc when `pancake_root_cause_lab` reaches Branch 5 or when the gray-area decision tree's Step 3 needs the data), `pancake_inspect_settings` (full settings + compliance + connections), `pancake_budget_engine` (reallocation modeling), feed quality deep-dive (shopping and PMax accounts), audience health check (list sizes, segment performance).

**Quarterly (first run of quarter).** Everything monthly, plus account maturity reassessment (run the `pancake_account_foundations` questionnaire), strategy alignment review, `pancake_root_cause_lab` as a proactive audit of the top 3 campaigns by spend, cross-account portfolio analysis, KPI target review with adjustment recommendations.

---

## Edge cases

**Account spent nothing this period.** Mark "No Activity" in the summary, skip the action skills, ask the operator why — paused intentionally, budget exhausted, ad approval problem.

**Conversion tracking is broken.** If the performance read detects tracking interruptions, stop the rest of the skills for that account and route to `pancake_inspect_settings`. Performance analysis is not meaningful when the conversion stream is unreliable.

**New account in onboarding.** No baseline exists yet, so skip performance comparisons. Only run `pancake_inspect_settings` and `pancake_inspect_bidding`.

**Mid-period changes.** If a budget or strategy change happened mid-period, capture the date and have the performance read segment the window into pre-change and post-change halves where the data supports it.

---

## Dependencies

| Skill | Role |
|---|---|
| `pancake_account_foundations` | Roster, config, all account-specific data; maturity definitions used by depth calibration |
| All routed action skills | Invoked according to the routing matrix |
