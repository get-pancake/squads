---
name: pancake_evaluate_youtube
description: Action skill that analyzes YouTube advertising campaigns in Google Ads. Evaluates performance by funnel stage, format, and audience. Assesses creative effectiveness, cross-channel impact, and audience insights. Loads pancake-youtube-playbook as its analytical foundation. Use when analyzing YouTube campaigns, evaluating video ad performance, reviewing YouTube audience strategy, or assessing YouTube's contribution to the marketing funnel.
triggers:
  - "analyze youtube"
  - "youtube analysis"
  - "youtube campaign review"
  - "video ads analysis"
  - "youtube performance"
  - "youtube audit"
---

# Analyze YouTube

This skill drives a structured workflow for reviewing a Google Ads account's YouTube (and video-eligible Demand Gen) investment. The output explains where YouTube sits in the funnel, how each format and audience is performing, and what the channel is contributing beyond click-through conversions.

The depth of analysis is tied to the account's maturity stage. Less mature accounts get a lean read; more mature accounts get the full multi-dimensional decomposition.

---

## Prerequisites

Three reference skills must be loaded before any data work begins:

- `pancake_account_foundations` for account roster, naming conventions, brand terms, KPI targets, and business model
- `pancake_youtube_playbook` for the full-funnel framework, format strategy, audience model, and measurement approach
- `pancake_account_foundations` for the maturity stage definitions that calibrate scope

If `pancake_account_foundations` has never been configured for the target account, stop and hand control to that skill before continuing.

---

## Workflow

### 0. Scope and pre-flight

1. Pull the account configuration.
2. Inspect the `has_youtube_campaigns` flag.
   - If unset or `false`, surface that to the user. They may either confirm the situation (and decide to evaluate whether YouTube should be added) or ask to scan anyway because the flag may be stale.
   - If `true`, continue.
3. Enumerate every campaign that could carry YouTube inventory:
   - Anything with `campaign.advertising_channel_type = 'VIDEO'`
   - Sub-types that matter: `VIDEO_REACH`, `VIDEO_VIEW`, `VIDEO_ACTION`, `VIDEO_NON_SKIPPABLE_IN_STREAM`
   - Demand Gen (`DEMAND_GEN`) campaigns, since they can run video assets on YouTube surfaces
4. Lock in scope with the user:
   - Which subset of those campaigns to analyze (default: all)
   - Window: 30 days with a 30-day prior period as comparison, unless overridden
   - Any standing concerns that should be prioritized
5. Read the maturity level from the config. This will gate later steps.

---

### 1. Pull the data

Use the GAQL queries documented later in this file (under "GAQL reference"). Some queries are run for every account; others only activate at higher maturity.

Always run:

- Campaign-level YouTube performance (impressions, views, view rate, CPV, quartile rates, conversions, VTC, cost)
- Format breakdown (bumper, skippable, non-skip, in-feed, Shorts)
- Per-video metrics (views, view rate, quartiles, earned actions)

Run from Developing onwards:

- Audience segment performance (in-market, affinity, custom, remarketing)
- Weekly trend (date segmentation)
- Geographic performance

Run from Established onwards:

- Demographics: age, gender, household income
- Devices: mobile, desktop, tablet, connected TV
- Top placements by spend and conversions

If Performance Max is active, also pull a network segment breakdown filtered to YouTube. The exact query is shared with `pancake_pmax_workshop`.

---

### 2. Map each campaign to a funnel stage

Use the campaign sub-type plus bidding strategy as the primary signal.

| Sub-type | Typical bidding | Stage |
|---|---|---|
| `VIDEO_REACH` | Target CPM | Awareness |
| `VIDEO_NON_SKIPPABLE_IN_STREAM` | Target CPM | Awareness |
| `VIDEO_VIEW` | Max CPV | Consideration |
| `VIDEO_ACTION` | tCPA or Max Conversions | Action |
| `DEMAND_GEN` (with video) | tCPA, Max Conversions, or tROAS | Action |

Two override rules:

1. A `VIDEO_VIEW` campaign with CTA overlays and a conversion-oriented setup belongs in Action, not Consideration.
2. When the sub-type alone is ambiguous, let bidding decide: CPM-based reads as awareness, CPV-based as consideration, and CPA/ROAS-based as action.

After classifying, assess funnel coverage:

- **All three stages active**: ideal for advanced accounts.
- **Two adjacent stages**: workable for established accounts.
- **Action only**: functional but starves the remarketing pool. Note this as an opportunity.
- **Awareness only**: spend with no conversion path. Flag unless the account has explicitly chosen pure brand awareness as the goal.

---

### 3. Format-level read

Inside each funnel stage, evaluate the formats present against their benchmarks.

**Bumper (6s, non-skippable)**

- CPM benchmark: $2-6
- Frequency above 4 per week is a warning — saturation and negative brand reaction risk
- Bumper CPM should sit below non-skip CPM; if not, something is off

**Non-skippable in-stream (15s)**

- CPM benchmark: $4-10
- Should reach efficiently relative to bumper

**Skippable in-stream**

- View rate benchmark: 15-30%
- CPV benchmark: $0.03-0.10
- Examine quartile completion (25/50/75/100%) to find where viewers drop off
- For Action campaigns, also look at CPA and conversion volume

**In-feed (Discovery)**

- View rate should exceed in-stream because viewers self-initiate
- Compare CPV to in-stream CPV
- Watch time tends to be longer in this format

**Shorts**

- Track CPM and reach
- Inspect engagement metrics and audience composition (age skew, device mix)

Then take a step back and ask whether the format mix is doing its job: are awareness formats feeding warm pools to action formats, and are any formats clearly missing benchmarks?

---

### 4. Audience read

For each segment with enough data, look at:

- Impressions and unique reach
- View rate (engagement quality signal)
- Conversions and CPA (for Action stage)
- View-through conversions
- Segment size, saturation, and frequency per user

Questions to answer:

1. Which segments produce the highest view rates? Treat that as a consideration signal.
2. Which segments produce conversions most cheaply?
3. Are YouTube-engagement remarketing audiences being passed forward into action campaigns?
4. Is the YouTube channel linked to Google Ads at all? Without that link, engagement remarketing is not available.
5. Are Customer Match lists used (for targeting or for exclusion)?
6. What does per-user frequency look like inside each segment?

Finally, check for overlap. If the same users are being hit by multiple YouTube campaigns, recommend exclusions or consolidation.

---

### 5. Creative read

This is a quick scan; deep creative work belongs in `pancake_creative_atelier`.

Always look at:

- Best and worst videos by view rate
- Quartile drop-off curves (where attention is lost)
- Earned actions by video (subscribes, shares, likes — these signal real resonance)
- Creative age — fatigue typically appears after 6-8 weeks on the same asset

At Established and Advanced maturity, also look at:

- A/B results between video variants
- Whether specific creative resonates with specific audience segments
- Thumbnail performance on in-feed placements
- CTR on CTA overlays

---

### 6. Cross-channel impact

YouTube earns most of its keep outside the direct-click column. Three measurements matter here.

**Branded search lift**

1. Pull weekly branded search volume for the analysis window and the equivalent prior window.
2. Compare during-flight vs. before-flight volume.
3. If location data is available, contrast exposed regions to unexposed regions.
4. Compute lift as `(current branded volume - baseline) / baseline`.

**Assisted conversions**

1. Use multi-channel funnel reports to find paths that touch YouTube.
2. Tally assisted conversion count and value.
3. Compute the ratio `assisted / direct`. A ratio above 1.0 means YouTube is acting more as an assister than a closer — typical and expected for the channel.

**View-through conversions**

1. Sum VTC by campaign and audience.
2. Express VTC as a share of total YouTube-attributed conversions.
3. Compute an effective CPA that weights VTC at somewhere between 50% and 75%, reflecting the partial credit appropriate for view-only exposure.

---

### 7. YouTube inside Performance Max

When PMax is active, do not treat it as a black box.

1. Pull the network breakdown and isolate the YouTube share (the GAQL filter `segments.ad_network_type = 'YOUTUBE'` does this cleanly).
2. Compute the equivalent CPM or CPV for those PMax YouTube impressions.
3. Compare against dedicated YouTube campaigns.
4. Apply the share-of-spend decision rule:

   | YouTube share of PMax spend | Action |
   |---|---|
   | Below 10% | Leave it inside PMax |
   | 10-15% | Monitor; consider piloting a dedicated YouTube campaign |
   | Above 15% | Pull YouTube out into a dedicated campaign for proper control |

5. Check whether PMax video and dedicated YouTube are overlapping on the same audiences.

Note that PMax YouTube data is shallow — spend and basic metrics are exposed, but audience-level and placement-level visibility inside PMax remains limited.

---

### 8. Deliverables

Produce four artifacts.

**a. Performance report.** One markdown table per funnel stage with period-over-period deltas:

- Awareness columns: Campaign, Format, Impressions, Reach, Frequency, CPM, change vs. prior
- Consideration columns: Campaign, Format, Impressions, Views, View Rate, CPV, Watch Time, change vs. prior
- Action columns: Campaign, Format, Impressions, Views, Conversions, VTC, CPA, change vs. prior

Append a summary row showing total spend per stage, the primary KPI for that stage, the benchmark band ($2-6 / $4-10 for CPM; 15-30% for view rate; account target for CPA), and a Pass/Above/Below status.

**b. Audience insights.** Table of top-performing segments with segment, type, funnel stage, impressions, view rate, conversions, CPA, and a recommendation (scale / hold / pause / test). Group by segment type. Below the table, list coverage flags: remarketing active yes/no, Customer Match active yes/no, channel linked yes/no, average frequency per user per week, and overlap risk rating.

**c. Cross-channel impact.** A branded-search weekly trend table with YouTube spend in the same week, the computed lift percentage, an assisted-conversion path table with the assist/direct ratio, a VTC summary table, and a consolidated "full impact" table:

- Direct (click-through) conversions
- VTC weighted at 50%
- Assisted conversions
- Estimated search-lift conversions
- Total attributed impact
- Effective CPA = total spend / total impact

**d. Summary dashboard.**

- Funnel coverage status (which stages are populated, which are missing)
- 3-5 headline findings
- Prioritized recommendations, ordered by expected impact
- Next steps tuned to the account's maturity stage

---

## Calibrating by maturity

**Nascent.** Most likely YouTube is not the right channel yet. Run a basic performance check if it is already running. Default recommendation: redirect that budget to Search or Shopping unless brand awareness has been explicitly chosen as the goal.

**Developing.** Run campaign-level performance, a basic audience review, and a search-lift check. Skip format-mix evaluation, deep creative work, and demographic splits. Default recommendation: pilot one Video Action campaign and measure the search-lift impact.

**Established.** Full read on campaign, format, and audience. Include the cross-channel impact section. Skip the deepest placement work and Brand Lift study recommendations. Default recommendation: two-stage funnel (awareness plus action) with deliberate remarketing audience building.

**Advanced.** Every step, including placement performance, demographic decomposition, PMax YouTube extraction analysis, Brand Lift study recommendation, formal search-lift measurement plan, and frequency-management audit. Default recommendation: three-stage funnel with explicit audience sequencing and measurement.

---

## GAQL reference

### Campaign-level YouTube performance (all maturity levels)

```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.advertising_channel_sub_type,
  campaign.bidding_strategy_type,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.average_cpv,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.view_through_conversions,
  metrics.video_quartile_p25_rate,
  metrics.video_quartile_p50_rate,
  metrics.video_quartile_p75_rate,
  metrics.video_quartile_p100_rate
FROM campaign
WHERE campaign.advertising_channel_type = 'VIDEO'
  AND segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.status != 'REMOVED'
```

Then the same shape for Demand Gen:

```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  metrics.impressions,
  metrics.video_views,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.view_through_conversions
FROM campaign
WHERE campaign.advertising_channel_type = 'DEMAND_GEN'
  AND segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.status != 'REMOVED'
```

### Per-video metrics

```sql
SELECT
  video.id,
  video.title,
  video.duration_millis,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.average_cpv,
  metrics.cost_micros,
  metrics.conversions,
  metrics.view_through_conversions,
  metrics.video_quartile_p25_rate,
  metrics.video_quartile_p50_rate,
  metrics.video_quartile_p75_rate,
  metrics.video_quartile_p100_rate
FROM video
WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
```

### Ad group with ad type

```sql
SELECT
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name,
  ad_group.type,
  ad_group_ad.ad.type,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.average_cpv,
  metrics.cost_micros,
  metrics.conversions,
  metrics.view_through_conversions
FROM ad_group_ad
WHERE campaign.advertising_channel_type = 'VIDEO'
  AND segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.status != 'REMOVED'
  AND ad_group.status != 'REMOVED'
```

### Audience segment performance (Developing+)

```sql
SELECT
  campaign.id,
  campaign.name,
  ad_group_criterion.audience.audience_segment,
  ad_group_criterion.type,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.average_cpv,
  metrics.cost_micros,
  metrics.conversions,
  metrics.view_through_conversions
FROM ad_group_audience_view
WHERE campaign.advertising_channel_type = 'VIDEO'
  AND segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.status != 'REMOVED'
```

### Weekly trend (Developing+)

```sql
SELECT
  campaign.id,
  campaign.name,
  segments.week,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.average_cpv,
  metrics.cost_micros,
  metrics.conversions,
  metrics.view_through_conversions
FROM campaign
WHERE campaign.advertising_channel_type = 'VIDEO'
  AND segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.status != 'REMOVED'
```

### Geography (Established+)

```sql
SELECT
  campaign.id,
  campaign.name,
  geographic_view.country_criterion_id,
  geographic_view.location_type,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.cost_micros,
  metrics.conversions,
  metrics.view_through_conversions
FROM geographic_view
WHERE campaign.advertising_channel_type = 'VIDEO'
  AND segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.status != 'REMOVED'
```

### Demographics (Established+)

```sql
SELECT
  campaign.id,
  campaign.name,
  ad_group_criterion.age_range.type,
  ad_group_criterion.gender.type,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.cost_micros,
  metrics.conversions
FROM gender_view
WHERE campaign.advertising_channel_type = 'VIDEO'
  AND segments.date BETWEEN '{start_date}' AND '{end_date}'
  AND campaign.status != 'REMOVED'
```

### PMax YouTube channel slice

Reuse the network-segment decomposition query from `pancake_pmax_workshop`, filtering on `segments.ad_network_type = 'YOUTUBE'`.

---

## When API access is not available

The same data can usually be pulled from the UI:

1. **Campaigns tab** filtered to Video type — Campaign, Type, Impressions, Views, View Rate, Avg. CPV, Cost, Conversions, View-through Conv.
2. **Videos tab** inside a Video campaign — Video, Impressions, Views, View Rate, Avg. CPV, quartile completion percentages.
3. **Audiences tab** filtered to Video campaigns — Segment, Impressions, Views, View Rate, Conversions, Cost.
4. **Locations tab** filtered to Video campaigns for geographic data.

Things the API cannot give you cleanly:

- Earned actions (subscribes, shares, likes from ads): visible in the UI; API field support depends on version. Try `metrics.earned_views` and `metrics.earned_subscribes`.
- Brand Lift study results: UI only, under Measurement > Lift measurement.
- Search lift: a manual exercise that joins branded keyword data from Search to YouTube flight dates.
- Inside PMax: audience-level and placement-level YouTube data is not exposed.

---

## Worked example

**Account.** SkillBridge Academy, an online professional-development course platform. Average course price $299, business model is direct enrollment. Established maturity, around 85 conversions per month across all channels. Three dedicated YouTube campaigns have been live for eight weeks, plus a PMax campaign with video assets.

**Campaign roster.**

| Campaign | Stage | Format | Bidding | Audience |
|---|---|---|---|---|
| SB - Awareness - Brand Intro | Awareness | Bumper (6s) | Target CPM | Affinity "Education Enthusiasts" + In-Market "Online Education" |
| SB - Consideration - Course Preview | Consideration | Skippable in-stream (30s) | Max CPV | Custom segment "online course searchers" + remarketing on awareness viewers |
| SB - Action - Enroll Now | Action | Video Action (skippable + CTA) | tCPA $45 | Remarketing on 50%+ consideration viewers + In-Market "Online Education" |

All three classifications check out: CPM/bumper → Awareness, CPV/skippable → Consideration, tCPA+CTA → Action. Full three-stage funnel, appropriate for the maturity.

**Awareness format read.** CPM at $3.50 sits comfortably inside the $2-6 bumper band. Reach grew 4.6% period-over-period — modest, suggesting saturation. The flag: frequency reached 5.2 per week against the 4/week ceiling. Recommendation: tighten the frequency cap to 4 and widen the affinity audience to recover headroom.

**Consideration format read.** View rate of 8.0% sits well below the 15-30% benchmark — either the opening hook is weak or the targeting is too broad. CPV of $0.065 is fine. Quartile completion: 42% → 28% → 19% → 12%, meaning most of the loss happens between the 25% and 50% marks, somewhere around seconds 8-15 of the video. Meanwhile the remarketing pool expanded to 25,400 users (+39.6%), which is healthy fuel for the action stage. Recommendation: rebuild the first five seconds, examine the mid-video content, and try an in-feed variant to attract higher-intent viewers.

**Action format read.** Direct CPA of $38.22 is comfortably under the $45 target. VTC volume (120) ran 2.7x direct conversions (45) — a typical YouTube pattern. Weighted at 50%, effective CPA falls to $16.38. Conversions grew 40.6% as the consideration remarketing pool scaled. Recommendation: scale budget 15-20%.

**Audience read.** Lowest CPA ($32.10) came from the 50%+ consideration viewers remarketing pool, confirming the funnel hand-off is working. The custom "online course searchers" segment ran at 9.8% view rate in consideration, feeding remarketing well. The in-market audience converted but at $44.80, near the ceiling.

**Cross-channel.** Branded search rose from a 12,225 weekly baseline to 16,500 in week 8 — a 35% lift since launch. At a 4.2% branded conversion rate, that adds roughly 180 incremental branded clicks and ~7.5 incremental conversions per week. VTC share of action campaign attribution: 72.7%. Full-impact calculation:

| Component | Value |
|---|---|
| Direct conversions | 45 |
| VTC at 50% weight | 60 |
| Search-lift conversions (monthly) | 30 |
| **Total attributed impact** | **135** |
| Total YouTube spend | $4,441 |
| **Effective CPA** | **$32.90** |

**Dashboard summary.**

- Awareness frequency above benchmark (5.2 vs. 4/week) — saturation risk
- Consideration view rate well below benchmark (8% vs. 15-30%) — creative or targeting issue
- Action campaign outperforming tCPA target with strong VTC
- 35% branded search lift since launch, ~30 incremental search conversions per month
- Remarketing-driven funnel hand-off proven by lowest CPA in the account

**Priority actions.**

1. Drop awareness frequency cap to 4/week and broaden the affinity targeting
2. Rebuild consideration creative (new 5-second hook); pilot an in-feed variant
3. Scale action budget 15-20% to ride the growing remarketing pool
4. Stand up a monthly search-lift baseline process to keep measuring cross-channel impact
