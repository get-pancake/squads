---
name: pancake_evaluate_demandgen
description: Action skill that analyzes Demand Gen campaigns in Google Ads. Evaluates performance by placement, audience, and creative format. For lead gen accounts, assesses lead quality. Analyzes cross-channel impact and incrementality signals. Loads pancake-demandgen-playbook as its analytical foundation. Use when analyzing Demand Gen campaigns, evaluating Demand Gen audience strategy, reviewing Demand Gen creative, or assessing Demand Gen lead quality. Do NOT use for YouTube-specific campaign analysis (use pancake-evaluate-youtube) or general creative review (use pancake-creative-atelier).
triggers:
  - "analyze demand gen"
  - "demand gen analysis"
  - "demand gen review"
  - "demand gen audit"
  - "demand gen performance"
  - "demand generation analysis"
---

# Demand Gen Campaign Analysis

This skill walks a Google Ads account through a structured review of its Demand Gen
investment. The workflow looks at where ads served, who they reached, what creative
carried the load, whether leads were any good (for B2B/lead-gen models), and whether
the channel is producing new demand or simply scooping conversions that Search would
have closed anyway.

## When this skill runs

Trigger it when somebody asks for a Demand Gen review, an audit of placements or
audiences in a Demand Gen campaign, a sanity check on creative inside Demand Gen,
or a lead quality comparison against Search. It is not the right skill for a
broader YouTube-only campaign review (route those to `pancake-evaluate-youtube`) or a
generic creative critique that has nothing to do with Demand Gen specifically
(use `pancake-creative-atelier`).

## Prerequisites and loaded context

Before any data work begins, this skill expects the following to be available:

- `pancake_account_foundations` — the canonical account record (CID, business model,
  KPI targets, maturity stage, currency).
- `pancake_demandgen_playbook` — the analytical playbook; its `SKILL.md` is always
  loaded, and additional reference files are pulled based on the account's
  business model.
- `pancake_account_foundations` — used to scale how deep the analysis goes and
  what recommendations are appropriate.

### Methodology files to load by business model

| Business model | Reference files to pull in |
|---|---|
| Lead generation | `demand-gen-for-lead-gen.md`, `audience-expansion-framework.md`, `measurement-attribution.md` |
| eCommerce | `audience-expansion-framework.md`, `creative-format-strategy.md`, `measurement-attribution.md` |
| Any | `audience-expansion-framework.md`, `measurement-attribution.md` |

## Gatekeeping checks

Run these before opening the data taps. If any fail, stop or scope down — do not
manufacture numbers.

1. Confirm at least one Demand Gen campaign exists. Either read
   `has_demand_gen_campaigns` from account conventions, or query Google Ads for
   `campaign.advertising_channel_type = 'DEMAND_GEN'`. If none exist, report that
   and exit.
2. Confirm the business model (lead-gen or eCommerce). It selects the
   evaluation framework used in later steps.
3. Confirm maturity. **Nascent accounts should not be running Demand Gen at all.**
   If you find one that is, flag it and recommend they build a Search foundation
   first.
4. Confirm the primary conversion action is the right thing to optimize Demand
   Gen against.
5. Pick a date window. The default is the trailing 30 days. If the campaign is
   younger than 30 days, use its full lifetime instead.

## Workflow

The workflow is a sequenced eight-step pipeline. Several steps end with
checkpoints where you surface findings to the user and confirm before moving on.
For the first five times this skill is used in a new pod, every checkpoint
includes additional teaching language that explains the why behind each finding;
that scaffolding can drop off afterward.

### Step 0 — Load context

Pull dependencies in this order:

1. `pancake_account_foundations` (so you know the CID, model, maturity, and targets).
2. `pancake_demandgen_playbook/SKILL.md`.
3. The business-model-specific reference files listed above.

### Step 1 — Pull the data

All queries live in `references/data_requirements.md`. At a minimum, you need:

- **Campaign-level performance.** Impressions, clicks, CTR, conversions,
  conversion value, cost, CPA, and ROAS for every Demand Gen campaign. Engaged-view
  conversions (EVC) and view-through conversions (VTC) are separated out as their
  own columns rather than rolled into the headline conversion number. Segment
  daily for trends, weekly for narrative summaries.
- **Placement split.** Break performance out across YouTube, Discover, and Gmail.
  Note that the API surface for this is limited — see the data requirements
  reference for known gaps and workarounds.
- **Audience segments.** Pull performance by segment type (remarketing,
  lookalike, custom intent, in-market, affinity) and record the audience
  expansion setting in use on each ad group.
- **Creative.** Performance by ad format (single image, video, carousel, product
  feed), asset-level data where exposed, and EVC metrics for the video variants.
- **Cross-channel.** Assisted conversions touching Demand Gen, a 90-day branded
  search trend so you can compare pre- and post-launch, and the total account
  conversion curve.

#### Checkpoint C1 — Data Inventory

Show the user:

- How many Demand Gen campaigns were found.
- Which placement breakouts are available (YouTube, Discover, Gmail — Y/N each).
- How many audience segments came back with data.
- The exact date window covered.
- Any gaps you noticed (for example, no placement data, missing segment data,
  missing offline conversions).

Then ask: do they want to plug any of those gaps with CSV exports from the UI
before you analyze?

During the first five runs, add a short explainer: placement data tells you
which surfaces are pulling weight, audience data tells you which segments
deserve more budget, and cross-channel data is what separates "Demand Gen is
adding to your business" from "Demand Gen is just stealing credit from Search."

### Step 2 — Placement analysis

For each surface (YouTube, Discover, Gmail), compute:

1. **Volume:** impressions, clicks, share of spend.
2. **Efficiency:** CTR, conversion rate, CPA.
3. **Conversion mix:** what share of conversions are click-through vs. EVC
   vs. VTC?
4. **Role:** is the placement actually driving conversions or just stacking
   impressions?

#### Directional placement benchmarks

These are rough ranges, not pass/fail lines. Use them to flag anomalies, not to
issue verdicts.

| Surface | Typical CTR | Dominant conversion type | Character |
|---|---|---|---|
| YouTube | ~0.5% to 2.0% | EVC plus click-through | Video engagement is what fuels EVC here |
| Discover | ~0.8% to 3.0% | Click-through | Highly visual, strong engagement |
| Gmail | ~0.3% to 1.5% | Click-through | Lower intent, larger reach |

#### Placement read-outs

- One placement dominating conversions → consider placement-specific creative.
- A placement consuming budget but not converting → check whether your creative
  format actually fits that surface (an image-only setup will underperform on
  YouTube).
- EVC over half of total conversions → this is a video-led campaign; the video
  asset is doing the heavy lifting and needs to be strong.

### Step 3 — Audience evaluation

For every segment in the account, look at:

1. **Conversion rate** — which segments convert?
2. **CPA** — which are efficient?
3. **Volume** — which are actually producing?
4. **Quality (lead gen only)** — if offline conversion data is wired up, which
   segments produce leads that turn into pipeline?

#### Expansion setting check

Find the current setting (narrow, balanced, or broad) on every ad group and ask:

- Is this appropriate for the business model and the account's maturity?
- If broad: is there evidence the algorithm is reaching beyond the core
  audience? Symptoms are big impressions with weak CPA, also known as audience
  dilution.
- If narrow: is the campaign volume-starved (low impressions, high CPA from
  thin learning)?

#### Lookalike audit

For each lookalike:

- What seed list is it built from?
- What expansion level is it set to (narrow / balanced / broad)?
- How does it compare to remarketing on CPA and downstream quality?
- Decision: scale, hold, or tighten.

#### Audience recommendations

- Mark winning segments for budget concentration.
- Mark losing segments for pause or restructure.
- Suggest tests where coverage is thin (e.g., no custom segments at all, no
  lookalikes seeded from converters).
- Flag missing exclusions — most commonly existing customers and recent
  converters who should not be re-targeted.

### Step 4 — Creative performance

For each format (single image, video, carousel, product feed), compute:

1. **CTR** — engagement signal.
2. **Conversion rate** — what happens after the click.
3. **CPA** — end-to-end efficiency.
4. **EVC rate** — for video formats only, the share of video views that turn
   into engaged-view conversions.

#### Creative diversity check

- Is every recommended format represented? The minimum healthy mix is image +
  video + carousel.
- Are all aspect ratios covered (landscape, square, vertical/portrait)?
- Are there at least three variants per format?
- Is there real creative variety — different concepts, hooks, value props —
  or just minor tweaks on a single ad?

#### Creative fatigue red flags

- CTR for the same ad declining when you compare the last 14 days against the
  prior 14 days.
- CPA climbing while impressions stay flat — users are seeing it but no
  longer responding.
- Frequency capping issues: the same person seeing the same ad too many times.

#### Creative recommendations

- Promote the winners to scale.
- Refresh the ads showing decay.
- Suggest format additions where the diversity check is failing.
- Use this testing priority order: concept first, then format, then headline,
  then visual treatment, then CTA.

### Step 5 — Lead quality (lead-gen accounts only)

eCommerce accounts skip this step.

This step needs offline conversion data — MQL, SQL, and downstream stages — to
be flowing back into Google Ads. If it is not, that is a critical implementation
gap and the recommendation is to fix the data pipe before scaling Demand Gen.

#### Comparison framework

Compare Demand Gen against Search on the metrics that matter:

| Metric | What it captures |
|---|---|
| Cost per lead | Top-of-funnel efficiency |
| Valid lead % | Real human, not bot or spam |
| MQL rate | Conversion from raw lead to qualified |
| Cost per MQL | The real currency for B2B |
| SQL rate | Sales-accepted progression (if tracked) |
| Cost per SQL | Bottom-of-funnel cost (if tracked) |

#### Cost-per-MQL decision rule

Use this as the primary scale/optimize/cut decision:

- **Within 20% of Search:** acceptable. Demand Gen is paying its way. Scale it.
- **20%–50% above Search:** marginal. Tighten audiences and refresh creative
  before adding more budget.
- **More than 50% above Search:** problematic. Narrow expansion settings,
  upgrade landing-page qualification, or pause the campaign.

#### Levers to improve lead quality

- Narrow the audience expansion setting.
- Tighten lookalike seeds (use a higher-quality seed list and a narrower
  expansion).
- Add qualifying questions to the landing-page form.
- If volume allows, optimize the campaign for a deeper conversion action
  (e.g., MQL) instead of raw form submission.

#### Checkpoint C2 — Analysis findings

Surface to the user:

- Top placement by conversions, the placement with the worst CPA, and any
  placement burning spend without converting.
- The current expansion setting and whether the evidence says it is right, too
  loose, or too tight.
- For lead-gen accounts, cost-per-MQL versus Search and the corresponding
  verdict (acceptable, marginal, or problematic).
- Top creative format by CPA, missing formats, and any fatigue you spotted.

Then ask: do these findings track with what they are seeing, and is there
external context (recent launches, market shifts, sales-team feedback) you
should fold in?

In the first five runs, expand each finding into its reasoning chain — for
example: "Expansion looks too aggressive here. CPA is sitting 40 points over
target, but impressions are anything but constrained. Read together, that
says Google is buying volume by pulling in users who sit outside the core
audience profile."

### Step 6 — Cross-channel impact

Demand Gen rarely converts directly. Its real job is to seed demand that closes
elsewhere. This step measures whether that is happening.

#### Assisted conversions

- Count conversions where Demand Gen appears as an assist rather than last click.
- Map the dominant paths. The classic one is **Demand Gen → Search → conversion.**
- Compute the assisted-to-last-click ratio. A ratio above 1 means Demand Gen
  introduces more business than it closes.

#### Branded search lift

- Compare branded search impressions before and after Demand Gen launched.
- If branded volume climbed and nothing else changed, Demand Gen is most
  likely the driver.
- Quantify the lift as a percentage so it is reportable.

#### Total conversion trend

- Did total account conversions (all channels combined) rise after Demand Gen
  came online?
- If yes, and Search conversions stayed flat, the Demand Gen volume is
  incremental.
- If Search conversions dipped as Demand Gen ramped, you may be looking at
  cannibalization, not net new demand. Investigate.

### Step 7 — Incrementality signals

Combine the cross-channel evidence into a verdict. Each signal is directional —
none is conclusive on its own.

1. **Net-new users.** What share of Demand Gen converters had zero prior Search
   interaction with the brand? A useful directional benchmark is around 68%.
2. **Branded search lift.** Did branded volume rise after launch?
3. **Total conversion lift.** Did account-wide conversions rise?
4. **Path inspection.** Do the assisted paths show users genuinely discovering
   the brand through Demand Gen rather than re-engaging?

Read the signals together:

- **Strong (two or more positive indicators):** Demand Gen is probably
  incremental. The right next step is a geographic holdout test to put a
  number on it.
- **Mixed (one positive, the rest unclear):** keep monitoring. Do not scale
  aggressively yet.
- **Weak (no positive signals):** assume cannibalization risk. Consider
  pausing and running a holdout test.

#### Checkpoint C3 — Consolidated recommendations

Present to the user:

- Three top recommendations, each with an expected impact and a reason.
- The incrementality verdict (strong, mixed, or weak).
- A one-paragraph cross-channel impact summary covering branded search lift,
  the assisted ratio, and the total conversion trend.
- The recommended posture: scale, optimize, narrow, pause, or test.

Then ask: do the priorities match theirs, or should the emphasis shift?

During the first five runs, walk through how cross-channel evidence shaped the
recommendations. For example: "Standalone CPA is over the target, sure — but
branded search has climbed 22 percent since launch and Demand Gen shows up as
an assist roughly 1.7 times more often than it closes. The channel is
manufacturing demand that other surfaces are cashing in."

### Step 8 — Generate deliverables

Format details are in `references/output_specs.md`. The four standard outputs are:

1. **Creative Report (Markdown)** — performance by format, placement, and
   audience; diversity assessment; fatigue signals and refresh list; testing
   priorities.
2. **Audience Analysis (Markdown)** — segment-level performance table,
   expansion-setting assessment, lookalike evaluation, and audience-level
   recommendations (scale, maintain, narrow, test).
3. **Lead Quality Report (Markdown, lead gen only)** — quality tiers by time
   horizon, Demand Gen vs. Search comparison, cost-per-MQL analysis, and
   improvement levers.
4. **Summary Dashboard (Markdown)** — headline metrics (spend, click +
   EVC + VTC conversions, CPA, ROAS), summaries of each preceding section, the
   incrementality verdict, and the top three recommendations.

#### Checkpoint C4 — Output delivery

Tell the user what was produced and which audience each artifact is for. The
Summary Dashboard is the executive view; the Audience Analysis and Creative
Report are the practitioner working documents; the Lead Quality Report is the
B2B-specific deliverable.

## Calibrating depth by maturity

Not every account gets the full eight-step treatment. Match the depth to the
account's maturity stage:

| Maturity | Depth | Focus |
|---|---|---|
| Nascent | Stop and flag — should not be on Demand Gen | Recommend building Search first |
| Developing | Steps 1–4 plus a light Step 6 | Validate remarketing, verify basic creative |
| Established | Steps 1–7, all four outputs | Full audience and creative work; lead quality if applicable |
| Advanced | Steps 1–8 with incrementality emphasis | Add a measurement / holdout plan |

## Changelog

- 2026-03-26 — First version. End-to-end Demand Gen analysis covering
  placement, audience, creative, lead quality, cross-channel impact, and
  incrementality.

---

## Reference: data_requirements.md

# Data Requirements for Demand Gen Analysis

This reference covers the GAQL queries, the placement-data limitations of the
Google Ads API, the CSV fallbacks from the UI, and a pre-flight validation
checklist.

## GAQL queries

### Query 1 — Campaign-level performance

```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.conversions,
  metrics.conversions_value,
  metrics.cost_micros,
  metrics.cost_per_conversion,
  metrics.conversions_from_interactions_rate,
  metrics.view_through_conversions,
  metrics.video_views,
  metrics.video_view_rate,
  segments.date
FROM campaign
WHERE campaign.advertising_channel_type = 'DEMAND_GEN'
  AND segments.date DURING LAST_30_DAYS
  AND campaign.status != 'REMOVED'
ORDER BY metrics.cost_micros DESC
```

A few things worth knowing:

- The `advertising_channel_type = 'DEMAND_GEN'` filter is what scopes the pull
  to Demand Gen specifically.
- EVC numbers are folded into `metrics.conversions` under data-driven
  attribution and cannot be split out at the campaign level. To isolate EVC
  you need to drop to the ad-group or ad level with conversion-action
  segmentation (see Query 5).
- `metrics.view_through_conversions` returns VTC as its own column.

### Query 2 — Ad group performance, including audience-segmented ad groups

```sql
SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group.status,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.conversions_value,
  metrics.cost_micros,
  metrics.cost_per_conversion,
  metrics.view_through_conversions
FROM ad_group
WHERE campaign.advertising_channel_type = 'DEMAND_GEN'
  AND segments.date DURING LAST_30_DAYS
  AND ad_group.status != 'REMOVED'
ORDER BY metrics.cost_micros DESC
```

### Query 3 — Audience segment performance

```sql
SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group_criterion.type,
  ad_group_criterion.status,
  ad_group_criterion.user_list.user_list,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.conversions_value,
  metrics.cost_micros,
  metrics.cost_per_conversion
FROM ad_group_audience_view
WHERE campaign.advertising_channel_type = 'DEMAND_GEN'
  AND segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```

Notes:

- `ad_group_audience_view` is the resource that exposes audience-level numbers
  for Demand Gen ad groups.
- Audience names usually need to be resolved separately through a `user_list`
  query — the audience view will give you IDs only.

### Query 4 — Ad-level creative performance

```sql
SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group_ad.ad.id,
  ad_group_ad.ad.type,
  ad_group_ad.ad.name,
  ad_group_ad.status,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.conversions,
  metrics.conversions_value,
  metrics.cost_micros,
  metrics.cost_per_conversion,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.view_through_conversions
FROM ad_group_ad
WHERE campaign.advertising_channel_type = 'DEMAND_GEN'
  AND segments.date DURING LAST_30_DAYS
  AND ad_group_ad.status != 'REMOVED'
ORDER BY metrics.cost_micros DESC
```

Notes:

- The `ad_group_ad.ad.type` field tells you the creative format. Expected
  values include `DISCOVERY_MULTI_ASSET_AD`, `DISCOVERY_CAROUSEL_AD`, and
  `DISCOVERY_VIDEO_RESPONSIVE_AD`.
- Asset-level performance inside a Demand Gen ad is not always available
  through GAQL. For per-asset breakdowns, fall back to the Google Ads UI asset
  performance report.

### Query 5 — Conversion action breakdown (separates EVC from click-through)

```sql
SELECT
  campaign.id,
  campaign.name,
  segments.conversion_action,
  segments.conversion_action_name,
  metrics.conversions,
  metrics.conversions_value,
  metrics.all_conversions
FROM campaign
WHERE campaign.advertising_channel_type = 'DEMAND_GEN'
  AND segments.date DURING LAST_30_DAYS
ORDER BY metrics.conversions DESC
```

This is how you separate click-through conversions from EVC conversions when
they live under distinct conversion actions.

### Query 6 — Cross-channel attribution workaround

GAQL does not support direct path-level attribution. To get assisted-conversion
visibility, you have two options:

1. Use the Google Ads UI Attribution report (Model Comparison or Top Conversion
   Paths) and export.
2. Approximate it with this query, grouped by channel type:

```sql
SELECT
  campaign.advertising_channel_type,
  metrics.conversions,
  metrics.conversions_value,
  metrics.cost_micros
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status != 'REMOVED'
```

Then compare total account conversions before vs. after Demand Gen launched
(launch date must be known).

### Query 7 — Branded search trend

```sql
SELECT
  campaign.id,
  campaign.name,
  metrics.search_impression_share,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  segments.date
FROM campaign
WHERE campaign.advertising_channel_type = 'SEARCH'
  AND segments.date DURING LAST_90_DAYS
  AND campaign.status != 'REMOVED'
```

Filter the result set to branded campaigns by name convention to isolate the
brand demand trend.

## Placement data — known API limitations

The Demand Gen placement split (YouTube / Discover / Gmail) is not a fully
supported GAQL segment across all API versions. Specifically:

- `segments.ad_network_type` does not give you reliable Demand Gen placement
  granularity.
- The `group_placement_view` resource only exposes managed placements, which is
  the wrong level for Demand Gen.

#### Workarounds

- If the API will not give you the placement breakdown, write that limitation
  into the deliverable rather than fabricating it.
- Use ad format as a rough proxy — video ads land mostly on YouTube, image ads
  can show across all three surfaces.
- For a precise breakdown, export the Placements tab CSV from the UI.

## CSV exports from the UI (fallbacks)

When GAQL falls short, these UI exports cover the gaps:

| Need | Where in the UI | Useful columns |
|---|---|---|
| Placement breakdown | Campaigns → [Demand Gen campaign] → Where ads showed | Placement, Impressions, Clicks, Conversions, Cost |
| Asset performance | Campaigns → [Demand Gen campaign] → Assets | Asset, Type, Performance rating, Impressions |
| Audience segments | Campaigns → [Demand Gen campaign] → Audiences | Segment, Type, Impressions, Conversions, CPA |
| Conversion paths | Tools → Attribution → Top paths | Path, Conversions, Value |

## Pre-analysis validation checklist

Run these checks before you commit to the workflow. If one fails, document the
gap and scope the analysis around it.

- [ ] At least one active Demand Gen campaign exists.
- [ ] Conversions are non-zero across the date range.
- [ ] Spend looks reasonable (campaigns weren't paused the whole window).
- [ ] The date range is fully covered by campaign activity.
- [ ] VTC is reported separately, not merged into click-through.
- [ ] Audience data returns for at least one segment.

---

## Reference: output_specs.md

# Output Specifications

The Demand Gen workflow ships four deliverables. They are all Markdown.

## Deliverable 1 — Creative Report

### Creative performance table

```markdown
| Creative / Format | Placement | Impressions | Clicks | CTR | Conversions | EVC | VTC | CPA | ROAS |
|-------------------|-----------|-------------|--------|-----|-------------|-----|-----|-----|------|
| [Ad name] / Image | YouTube   | X,XXX       | XXX    | X.X%| XX          | -   | X   | $XX | X.Xx |
| [Ad name] / Video | YouTube   | X,XXX       | XXX    | X.X%| XX          | XX  | X   | $XX | X.Xx |
| [Ad name] / Carousel | Discover | X,XXX    | XXX    | X.X%| XX          | -   | X   | $XX | X.Xx |
```

Column conventions:

- **EVC** only applies to video formats. Use `-` for non-video.
- **VTC** is populated for every format.
- **CPA** is computed against click-through + EVC. VTC is excluded from the
  headline CPA.
- **ROAS** is only meaningful for eCommerce. Use `-` on lead-gen accounts.

### Creative diversity assessment

```markdown
### Creative Diversity

| Format | Present | Count | Aspect Ratios | Assessment |
|--------|---------|-------|---------------|------------|
| Image  | Yes/No  | X     | L/S/P         | Sufficient / Needs more |
| Video  | Yes/No  | X     | L/S/V         | Sufficient / Needs more |
| Carousel | Yes/No | X    | -             | Sufficient / Needs more |
| Product Feed | Yes/No | - | -             | Active / Not connected |
```

### Testing recommendations

Three to five bullets. Each bullet answers three questions: what should be
tested, why, and what impact you expect.

## Deliverable 2 — Audience Analysis

### Segment performance table

```markdown
| Segment | Type | Impressions | Clicks | Conversions | CPA | Conv Rate | Recommendation |
|---------|------|-------------|--------|-------------|-----|-----------|----------------|
| [Name] | Remarketing | X,XXX | XXX | XX | $XX | X.X% | Scale / Maintain / Narrow / Pause |
| [Name] | Lookalike (narrow) | X,XXX | XXX | XX | $XX | X.X% | Scale / Maintain / Narrow / Pause |
| [Name] | Custom (URL) | X,XXX | XXX | XX | $XX | X.X% | Scale / Maintain / Narrow / Pause |
```

Recommendation logic:

- **Scale** — CPA below target, volume growing, quality holding.
- **Maintain** — CPA at target, performance stable.
- **Narrow** — CPA above target or quality slipping; targeting needs to tighten.
- **Pause** — CPA materially above target, quality poor, or volume too thin to
  matter.

### Expansion settings

```markdown
### Expansion Settings

| Ad Group | Current Setting | Monthly Conversions | Recommendation |
|----------|----------------|--------------------|-|
| [Name]   | Balanced       | XX                 | Maintain / Narrow / Broaden |
```

### Audience recommendations

Three to five bullets covering additions, removals, expansion changes, and
exclusion updates.

## Deliverable 3 — Lead Quality Report (lead-gen accounts only)

### Comparison table

```markdown
| Metric | Demand Gen | Search | Delta | Assessment |
|--------|-----------|--------|-------|------------|
| Total Leads | XXX | XXX | - | |
| Cost per Lead | $XX | $XX | +/-X% | Better / Comparable / Worse |
| Valid Lead % | XX% | XX% | +/-Xpp | Better / Comparable / Worse |
| MQL Rate | XX% | XX% | +/-Xpp | Better / Comparable / Worse |
| Cost per MQL | $XX | $XX | +/-X% | Better / Comparable / Worse |
| SQL Rate | XX% | XX% | +/-Xpp | Better / Comparable / Worse |
| Cost per SQL | $XX | $XX | +/-X% | Better / Comparable / Worse |
```

Conventions:

- SQL rows are only filled when the offline pipeline reaches SQL.
- `pp` denotes percentage points — the absolute difference between two
  rates, not a relative percent change.
- Verdict labels: **Comparable** if Demand Gen is within 20% of Search,
  **Better** if Demand Gen outperforms, **Worse** if the gap exceeds 20%.

### Quality tiers by time horizon

```markdown
### Lead Quality by Time Horizon

| Time Horizon | Demand Gen | Search | Notes |
|-------------|-----------|--------|-------|
| Same-day (valid contact) | XX% | XX% | |
| 7-day (responded) | XX% | XX% | |
| 30-day (MQL) | XX% | XX% | |
| 90-day (customer) | XX% | XX% | |
```

### When offline data is missing

```markdown
### Lead Quality Data Gap

There is no offline conversion data flowing into this Google Ads account. Without it,
Demand Gen lead quality cannot be benchmarked against Search.

**Fix this first.** Stand up offline conversion import via GCLID matching. Doing so
unlocks:
- Bidding optimization against MQL or SQL rather than form submission.
- True cost-per-qualified-lead by channel.
- A training signal that helps Google's models target users who actually qualify.

**Implementation outline:**
1. Capture GCLID on every form submission as a hidden field.
2. Persist the GCLID against the lead record in the CRM.
3. Upload MQL and SQL events back to Google Ads (API or manual upload).
4. Configure MQL as a secondary conversion action so Demand Gen has a quality signal.
```

## Deliverable 4 — Summary Dashboard

### Template

```markdown
# Demand Gen Analysis: [Account Name]
**Period:** [Date range]
**Business Model:** Lead Gen / eCommerce
**Account Maturity:** Nascent / Developing / Established / Advanced

## Top-Line Metrics

| Metric | Value | vs. Target | vs. Prior Period |
|--------|-------|-----------|-----------------|
| Spend | $X,XXX | X% of budget | +/-X% |
| Conversions (click-through) | XXX | | +/-X% |
| Conversions (EVC) | XXX | | +/-X% |
| Conversions (VTC) | XXX | | +/-X% |
| CPA (click + EVC) | $XX | vs. $XX target | +/-X% |
| ROAS (eComm only) | X.Xx | vs. X.Xx target | +/-X% |

## Placement Summary
[1-2 sentence summary of placement performance]

## Audience Summary
[1-2 sentence summary of audience performance]

## Creative Summary
[1-2 sentence summary of creative performance]

## Cross-Channel Impact
- Branded search volume: [trend]
- Total account conversions: [trend]
- Assisted conversions: [finding]

## Incrementality Assessment
[1-2 sentence assessment: strong / mixed / weak signals]

## Top 3 Recommendations

1. **[Action]**: [What to do and why]. Expected impact: [projected outcome].
2. **[Action]**: [What to do and why]. Expected impact: [projected outcome].
3. **[Action]**: [What to do and why]. Expected impact: [projected outcome].
```

### Formatting conventions

- Money is shown with the account's currency symbol.
- Percentages are rendered to one decimal place.
- Numbers above 999 use comma separators.
- Delta columns get a `+` prefix on increases, `-` on decreases, and the word
  `flat` for any movement under 1%.
- Recommendations open with a verb, are specific, and quantify the expected
  outcome.

---

## Reference: worked_example.md

# Worked Example — Harborline Insurance Group (fictional)

A made-up lead-gen account walking through every stage of the workflow end to end.

## Account snapshot

| Field | Value |
|---|---|
| Account | Harborline Insurance Group |
| Business model | Lead gen (insurance quotes) |
| Maturity | Established (~72 conversions/month) |
| Primary KPI | CPA (target: $88) |
| Demand Gen campaigns | 2 active |
| Period analyzed | Mar 6–12 vs. Feb 27–Mar 5 |

## Step 1 — Data acquisition

Two Demand Gen campaigns are running:

| Campaign | Daily budget | Spend | Conversions | CPA | Conversion rate |
|---|---|---|---|---|---|
| Harborline – DG – Renters Quote | $90 | $612 | 9 | $68.00 | 3.4% |
| Harborline – DG – Auto + Renters Combo | $65 | $441 | 4 | $110.25 | 1.9% |

## Step 2 — Placement analysis

### Renters Quote

| Placement | Spend | Impressions | Clicks | Conversions | CPA |
|---|---|---|---|---|---|
| YouTube | $268 | 19,800 | 124 | 4 | $67.00 |
| Discover | $221 | 24,300 | 102 | 4 | $55.25 |
| Gmail | $123 | 15,200 | 47 | 1 | $123.00 |

Read: Discover and YouTube are pulling efficient leads. Gmail is roughly
1.8x the CPA of the other two surfaces.

### Auto + Renters Combo

| Placement | Spend | Impressions | Clicks | Conversions | CPA |
|---|---|---|---|---|---|
| YouTube | $194 | 15,100 | 71 | 2 | $97.00 |
| Discover | $158 | 17,600 | 57 | 2 | $79.00 |
| Gmail | $89 | 10,400 | 31 | 0 | N/A |

Read: $89 burned on Gmail without a single conversion. Discover is doing the
heavy lifting.

## Step 3 — Audience evaluation

### Renters Quote audiences

| Audience | Type | Spend | Conversions | CPA |
|---|---|---|---|---|
| First-Time Renters (In-Market) | Google | $232 | 5 | $46.40 |
| Site Visitors 30d | Remarketing | $158 | 3 | $52.67 |
| Lookalike – Quoted Leads | Lookalike | $138 | 1 | $138.00 |
| Custom – Apartment Search Keywords | Custom | $84 | 0 | N/A |

Read: The in-market renters segment and 30-day remarketing are carrying the
campaign. The lookalike is underperforming. The custom keyword segment spent
$84 with nothing to show for it.

### Auto + Renters Combo audiences

| Audience | Type | Spend | Conversions | CPA |
|---|---|---|---|---|
| Auto Insurance Shoppers (In-Market) | Google | $202 | 3 | $67.33 |
| Site Visitors 30d | Remarketing | $140 | 1 | $140.00 |
| Lookalike – Quoted Leads | Lookalike | $99 | 0 | N/A |

Read: The in-market segment is doing the work; remarketing is pricey here;
the lookalike posted zero — almost certainly a seed-quality issue.

## Step 4 — Creative performance

### Renters Quote

| Creative | Format | Impressions | CTR | Conversions | CPA |
|---|---|---|---|---|---|
| "Coverage in Minutes" | Single Image | 24,100 | 2.3% | 5 | $54.80 |
| "Renters Coverage Walkthrough" | Carousel | 19,400 | 1.5% | 3 | $74.00 |
| "Your First Place" | Video (15s) | 15,200 | 1.0% | 1 | $156.00 |

Read: The single-image ad is the workhorse. The video underperforms on both
CTR and conversion rate — most likely the value prop never lands in the
opening beats.

### Auto + Renters Combo

| Creative | Format | Impressions | CTR | Conversions | CPA |
|---|---|---|---|---|---|
| "Bundle & Save 25%" | Single Image | 25,800 | 1.7% | 3 | $78.00 |
| "Auto + Renters Estimator" | Carousel | 17,100 | 1.3% | 1 | $154.00 |

Read: Discount-led messaging beats tool-led messaging. Carousel is the weaker
format across both campaigns.

## Step 5 — Lead quality

Harborline syncs CRM outcomes back into Google Ads:

| Quality tier | Renters Quote | Auto + Renters | Total |
|---|---|---|---|
| Qualified (quoted) | 6 (66.7%) | 2 (50%) | 8 (61.5%) |
| Contacted, not qualified | 2 (22.2%) | 1 (25%) | 3 (23.1%) |
| No response | 1 (11.1%) | 1 (25%) | 2 (15.4%) |

Cost per qualified lead:

- Renters: $102.00
- Auto+Renters: $220.50
- Blended: $131.63

Read: Renters Quote looks healthy on quality. Auto + Renters' qualified rate
is in range, but $220 per qualified lead is past the $180 profitability
threshold — the audience layer needs to tighten.

## Step 6 — Cross-channel

### Branded search

| Metric | Prior | Current | Δ |
|---|---|---|---|
| Branded impressions | 1,360 | 1,548 | +13.8% |
| Branded clicks | 438 | 511 | +16.7% |
| Branded conversions | 49 | 57 | +16.3% |

Read: A 13.8% climb in branded impressions during the Demand Gen window.
Suggestive, not proof (seasonality could be a factor), but encouraging.

### Assisted paths

| Path | Conversions |
|---|---|
| Demand Gen click → Search conversion | 5 |
| Demand Gen view → Search conversion | 8 |
| Demand Gen only | 13 |

Read: 13 conversions reached Search after a Demand Gen touch. The true CPA is
materially better than the last-click number on its own.

## Summary Dashboard

### Headline numbers

| Metric | Value | Status |
|---|---|---|
| Total spend | $1,053 | On pace |
| Total conversions | 13 | Under target (17) |
| Blended CPA | $81.00 | Inside the $88 target |
| Qualified rate | 61.5% | Acceptable |
| Cost per qualified lead | $131.63 | Watch |
| Branded search lift | +13.8% | Positive |

### Top 3 recommendations

1. **Cut Gmail on Auto + Renters Combo.** $89 a week is disappearing into
   Gmail with zero conversions to show. Reroute the budget to Discover, where
   leads are coming in at $79.
2. **Re-cut the Renters Quote video.** 1.0% CTR against 2.3% on single image.
   Build a new edit that puts the offer on screen inside the first three
   seconds. Two weeks should be sufficient signal.
3. **Tighten or pause the Auto + Renters lookalike.** Zero conversions on
   $99. Confirm the seed list is 1,000+ contacts; if it is, drop the
   expansion to narrow before pushing more budget.

### Next quarter — to explore

- Geographic holdout test to put a number on Demand Gen incrementality
  through branded search.
- Product-feed creative variant for auto insurance (side-by-side comparison
  cards).
- Revisit the engaged-view conversion window — currently 30 days. Try 7 days
  for tighter attribution.
