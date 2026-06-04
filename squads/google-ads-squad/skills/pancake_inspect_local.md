---
name: pancake_inspect_local
description: Action skill that audits Google Ads configurations for local businesses. Checks GBP integration, location targeting settings, offline conversion tracking, local campaign evaluation, and LSA performance. Produces local audit reports, GBP action items, and location targeting recommendations. Loads pancake-local-playbook as its analytical foundation. Use when auditing local business ad accounts, reviewing GBP integration, checking location targeting, or evaluating LSA performance. Do NOT use for general account settings audit (use pancake-inspect-settings) or non-local campaign analysis.
triggers:
  - "audit local"
  - "local audit"
  - "local business audit"
  - "gbp audit"
  - "location targeting review"
  - "lsa review"
  - "local ads review"
---

# Local Business Audit Skill

A workflow-driven audit for Google Ads accounts that serve a physical service area — whether the business has one storefront or several dozen. The skill inspects how the account is wired up to Google Business Profile, whether geographic targeting reflects where the business can actually serve customers, whether the conversion stack captures phone calls and in-person visits, whether the campaign mix is the right one for a local advertiser, and (when it applies) whether Local Services Ads are being run well.

The output is a written report, a list of GBP improvements, a set of targeting changes, and a one-page summary scoring the account on local-readiness.

---

## When to reach for this skill

- The account belongs to a business with a service area or storefront, single-location or multi-location.
- You need to assess whether GBP is feeding ads correctly.
- You want to know whether the campaigns are paying for clicks from people who will never become customers.
- You want a read on how completely calls, store visits, and CRM outcomes flow back into Google Ads.
- You want to confirm the campaign types are appropriate (Search vs PMax vs LSA vs Display).
- You want to evaluate LSA lead volume, lead quality, or profile health.

---

## Workflow

### Step 0 — Bring in the dependencies

Load, in this order:

1. The account-level config from `pancake_account_foundations`: at minimum `has_gbp`, `local_config`, the business model, KPI targets, and maturity level.
2. The substantive methodology from `pancake_local_playbook`: GBP integration logic, the geographic targeting frameworks, the campaign-type decision matrix, and the LSA evaluation method.
3. Maturity calibration from `pancake_account_foundations`.

If `pancake_account_foundations` has never been run, stop and route the user there first — the audit needs the config it produces.

### Checkpoint C1 — Confirm what's in scope

Show the user the framing before any deeper analysis runs:

- Account name, CID, and maturity stage.
- The number of locations on file, whether GBP is linked, and whether tourism applies.
- LSA status — running, not running, or under consideration.
- Which of the five audit sections will be executed (GBP, location targeting, offline conversions, campaign mix, LSA).
- An opening to surface specific concerns.

Then ask whether the scope is right and whether anything should be prioritized.

**First five runs only:** add a brief explanation of why each section exists. For example: "Location targeting determines whether the account is paying for clicks from people who live outside the service area. GBP integration determines whether ads can appear in Maps and other local placements at all."

---

### Step 1 — Pull the data

Full GAQL and column conventions live in `references/data_requirements.md`. The five buckets you need are:

**Location and GBP signals**
- Location extension performance (impressions, clicks, CTR by location).
- GBP link status — is the GBP account connected to the Ads account?
- For PMax, the location-asset-group status.

**Geography**
- Geographic report by distance ring from each business (requires location extensions to be live).
- Geographic report by city and region.
- Geographic report by zip/postal code where available.
- Spend and conversions falling outside the declared service area.

**Campaign settings**
- The location targeting method on every campaign — "Presence" vs "Presence or interest".
- Every positive and negative geographic target, with bid modifiers.
- Radii used and bid adjustments on top of them.
- Ad schedule vs the business's actual operating hours.

**Conversion stack**
- All conversion actions: type, status, counting method, whether they're included in the "Conversions" column.
- Call conversion mechanism: Google forwarding number vs third-party trackable number.
- Store visit conversions: eligible? active?
- Offline conversion import (OCI) status and enhanced conversions for leads.

**LSA data, only if LSA is running**
- Monthly lead volume by type — phone, message, booking.
- Cost per lead by service category.
- Dispute rate and the reasons given.
- Review score and review count on the LSA profile.

### Checkpoint C2 — Data inventory

Tell the user what arrived:

- Whether location-extension data was available, with the number of locations carrying performance data.
- GBP link state (linked with N locations / not linked).
- Which slices of geographic data exist (distance / city / zip / none).
- What offline conversion mechanisms are live (call tracking / store visits / OCI / nothing).
- LSA data status (available with N leads / unavailable / not active).
- Any gaps and the analytical impact of those gaps.

Ask whether anything can be filled in manually.

**First five runs only:** explain what each dataset unlocks. Geographic data is what makes out-of-area-spend estimates possible; GBP link status is what makes Maps-placement analysis possible.

---

### Step 2 — Inspect GBP integration

Three things to check.

**Linking state**
- Is GBP actually linked to Google Ads?
- How many GBP locations are linked vs how many the business has?
- Are location extensions toggled on for the campaigns that should carry them?

**GBP profile health (where visible)**
- Review score and review count per location.
- Photo count and photo quality.
- Whether GBP posts are being made on a regular cadence.
- Whether the Q&A section is populated.
- Whether opening hours (including special/holiday hours) are accurate.

**Severity rules**
- **Critical** — GBP is not linked at all. This shuts off location extensions and disables the local channels inside PMax.
- **Critical** — location extensions aren't enabled on any campaign.
- **Warning** — GBP is linked but fewer locations are connected than the business actually has.
- **Warning** — any location with a review score below 4.0 (hurts LSA ranking and erodes trust).
- **Warning** — any location with fewer than 20 photos.
- **Opportunity** — GBP posts are inactive (a weekly cadence is the working norm).
- **Opportunity** — the Q&A tab is empty (pre-seeding it with common questions is a quick win).

---

### Step 3 — Audit location targeting

This is where most local accounts leak money. Three sub-checks.

#### Targeting method — "Presence" vs "Presence or interest"

Pull the setting on every campaign.

- For a strictly local business, "Presence or interest" is the wrong setting. It serves the ad to anyone showing interest in the area from elsewhere, which sweeps in users who have no intention of physically coming. Flag every campaign that has it on.
- For tourism, hospitality, events, and destination businesses, "Presence or interest" is the right setting — those businesses want exactly that out-of-area research traffic.
- When geographic data is available, estimate the dollars going to out-of-area clicks. That number is what makes the recommendation actionable.

#### Radius and area

- Compare each campaign's current radius to the radius `pancake_local_playbook` recommends for the business type.
- Flag radii that are too wide (paying for users too far away to convert) and radii that are too narrow (leaving reachable customers untargeted).
- For multi-location accounts, look for **radius overlap** — when two locations' service areas cross, they end up bidding against each other in the overlap zone, inflating CPCs and creating internal auction competition.
- Check whether nested-radius bid adjustments are in place, and whether they reflect actual conversion data.

#### Geographic performance

- Pull spend and conversions broken out by distance ring (when available) or by city/zip.
- Find segments with high spend and zero conversions — candidates for exclusion.
- Find segments converting above account average — candidates for bid increases.
- Flag conversions coming from outside the declared service area; those represent either a targeting leak or evidence the service area is drawn wrong.

**Severity rules**
- **Critical** — "Presence or interest" on a strictly local business.
- **Critical** — no location targeting set at all (campaign serving nationally).
- **Warning** — radius materially wider than the business type calls for.
- **Warning** — radius overlap between multiple locations.
- **Warning** — any geographic segment with $100+ in spend and zero conversions.
- **Opportunity** — high-performing zip codes that have no bid adjustment.
- **Opportunity** — no nested-radius bid strategy in place.

---

### Step 4 — Audit the offline conversion stack

The point here is to figure out how much real-world value is invisible to the auction.

**Call tracking**
- Are call extensions live?
- Is call tracking set up at all? Google forwarding numbers or third-party?
- What's the minimum call duration threshold being treated as a conversion?
- Is call quality scored or recorded?

**Store visits**
- Is the account eligible for store visit conversions?
- If yes, is the conversion active?
- If no, document the reason (typically volume thresholds or insufficient locations).

**CRM and offline import**
- Is the GCLID being captured on lead forms?
- Is OCI configured? At what level of fidelity?
- Is "enhanced conversions for leads" on?
- What conversion values are flowing back — actual revenue, stage-based proxies, or flat values?

**Completeness levels**

| Level | What it means in practice |
| --- | --- |
| Minimal | Only online form fills are tracked. No calls, no visits. |
| Basic | Google forwarding call tracking is on. No quality scoring. No CRM import. |
| Intermediate | Third-party call tracking with quality scoring, **or** OCI configured. |
| Advanced | The full pipeline — call tracking, OCI, store visits (when eligible), and accurate per-conversion values. |

**Severity rules**
- **Critical** — a phone-driven business with no call tracking of any kind.
- **Critical** — Smart Bidding is on but no offline conversions are reaching the account, so the algorithm makes its bidding decisions on a fraction of the real signal.
- **Warning** — Google forwarding is on but there's no call quality signal.
- **Warning** — OCI is configured but GCLID capture rate is under 80%.
- **Opportunity** — enhanced conversions for leads are off (turning them on improves match rates).
- **Opportunity** — flat conversion values are being imported instead of stage-based values; value-based bidding can't do its job.

---

### Step 5 — Evaluate the campaign mix

**Are the right campaign types in play?**
- Search should be the default foundation for almost any local business.
- PMax with GBP assets makes sense once an account is doing 15+ conversions per month.
- LSA should be on if the business is in an LSA-eligible category and has competitive reviews.
- Any campaign type that doesn't make sense for this kind of business should be flagged.

**Local keyword coverage (Search)**
- Are "[service] near me" and "[service] [city]" patterns covered?
- For urban accounts, are neighborhood-level keywords present?
- Where relevant, are emergency / same-day / urgent variants covered?
- Are match types appropriate? Tight budgets should not be running broad match on a low-data campaign.

**Ad copy and extensions**
- Do the ads name the location, the service area, or some other local cue?
- Are call extensions on phone-driven campaigns?
- Are location extensions on every campaign?
- Does ad scheduling line up with operating hours, or is budget being spent when nobody can answer the phone?

**Severity rules**
- **Warning** — no Search campaigns at all.
- **Warning** — PMax running without GBP linked (missing Maps and other local placements).
- **Warning** — LSA-eligible but not running.
- **Warning** — no "[service] near me" keywords anywhere.
- **Opportunity** — call-only ads have never been tested for a phone-driven business.
- **Opportunity** — ad scheduling is out of sync with business hours.

### Checkpoint C3 — Walk the findings

Summarize what came out of steps 2–5:

- Targeting findings — how many campaigns are using "Presence or interest" on a local business, and the estimated dollar waste (or note that the geographic data needed to estimate is missing).
- GBP status — linked or not, and any major profile issues by location.
- Offline conversion completeness level and the biggest gap.
- Campaign-mix verdict — what's missing, what shouldn't be there.

Ask whether the picture matches the user's understanding and whether they have context to add.

**First five runs only:** spell out the reasoning behind each finding. Example: "The reason I marked the targeting setting as Critical is that the business only reaches customers inside a 15-mile service area, and the geographic report shows roughly $X going to clicks from users sitting 50+ miles outside it with zero conversions over the last 30 days."

---

### Step 6 — LSA review (only if active)

When LSA is running, evaluate it across three dimensions.

**Lead performance**
- Monthly lead totals by type.
- Cost per lead per service category.
- LSA CPL vs Search CPL for equivalent service queries.
- Trend (growing, flat, declining).

**Lead quality**
- Dispute rate — target under 10%, flag over 20%.
- Reasons given for disputes — is there a pattern?
- Lead-to-booking rate where the business can supply it.
- Average response time to new leads (response speed directly affects LSA ranking).

**Profile state**
- Review score and volume relative to local competitors.
- Profile completeness — every field filled, photos uploaded, description written.
- Whether every relevant service category is selected.
- Whether the configured service area matches reality.

**Severity rules**
- **Critical** — dispute rate above 30%; high enough to invite Google review and possibly suspension.
- **Warning** — dispute rate sitting between 20% and 30%; usually a targeting or category problem.
- **Warning** — review score under 4.0; significant ranking handicap.
- **Warning** — average response time over 30 minutes; hurts ranking.
- **Opportunity** — additional service categories could be added.
- **Opportunity** — review volume is low relative to competitors; the business needs an active review-solicitation process.

---

### Step 7 — Produce the deliverables

Four artifacts. Full format specs live in `references/output_specs.md`.

**Local Audit Report (Markdown)** — the long-form document. One section per audit area (GBP, location targeting, offline conversions, campaign evaluation, LSA when applicable). Every finding carries a severity tag and a specific recommendation.

**GBP Action Items** — a prioritized list of things to fix on GBP itself in order to improve Ads performance. Ordered by expected impact (high → medium → low), with the "what", the "why", and the "what improves" for each line. The recipient is the business owner or the in-house marketing person, not an Ads expert.

**Location Targeting Recommendations** — campaign-by-campaign concrete changes: targeting method swaps, radius adjustments with rationale, geographic bid adjustments, exclusions for dead zones, and an estimate of the budget saved from making the fixes.

**Summary Dashboard** — the one-pager. Overall local-readiness score on a 1–10 scale, GBP status, targeting status, tracking completeness level, the three highest-impact priorities, and the estimated monthly waste from current targeting issues (when calculable).

---

## Dependencies recap

| Skill | What it gives this audit |
| --- | --- |
| `pancake_account_foundations` | Account-level config, business model, KPI targets, maturity, `has_gbp`, `local_config` |
| `pancake_local_playbook` | GBP integration framework, targeting frameworks, campaign-type decision matrix, LSA methodology |
| `pancake_account_foundations` | Maturity calibration applied to all recommendations |
| `pancake_bidding_playbook` | Bidding context — local accounts frequently need a different bidding approach |
| `pancake_query_intelligence` | Local-keyword classification, including "[service] near me" handling |

---

## Reference: data_requirements.md

# Data Requirements for the Local Audit

## GAQL queries

### 1. Location extension performance

```sql
SELECT
  campaign.name,
  campaign.id,
  extensions.feed_item.target_type,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.conversions,
  metrics.cost_micros
FROM location_view
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```

Used to confirm location extensions are running and to attribute clicks and conversions to specific locations.

### 2. Geographic report

```sql
SELECT
  campaign.name,
  campaign.id,
  geographic_view.country_criterion_id,
  geographic_view.location_type,
  segments.geo_target_city,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.conversions,
  metrics.cost_micros,
  metrics.conversions_value
FROM geographic_view
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```

This is the source of truth for where users are when they see and click. It exposes both the out-of-area waste and the over-performing segments.

A few notes:
- Distance-based segmentation requires active location extensions.
- City-level data is available even without location extensions.
- For analysis, filter down to segments with $50+ in spend; below that the numbers are noisy.

### 3. Per-campaign targeting method

```sql
SELECT
  campaign.name,
  campaign.id,
  campaign.geo_target_type_setting.positive_geo_target_type,
  campaign.geo_target_type_setting.negative_geo_target_type
FROM campaign
WHERE campaign.status = 'ENABLED'
```

This is the single most consequential setting an audit can flip. Values to expect:

- `PRESENCE` — what most local-only businesses should be using.
- `PRESENCE_OR_INTEREST` — the platform default; almost always wrong for local-only.
- `SEARCH_INTEREST` — legacy, treated equivalently to "Presence or interest".

### 4. Geographic targets and bid modifiers

```sql
SELECT
  campaign.name,
  campaign.id,
  campaign_criterion.location.geo_target_constant,
  campaign_criterion.bid_modifier,
  campaign_criterion.negative
FROM campaign_criterion
WHERE campaign_criterion.type = 'LOCATION'
  AND campaign.status = 'ENABLED'
```

Exposes radii, DMA targets, excluded locations, and any geographic bid adjustments already in place.

### 5. Conversion action inventory

```sql
SELECT
  conversion_action.name,
  conversion_action.id,
  conversion_action.type,
  conversion_action.status,
  conversion_action.category,
  conversion_action.counting_type,
  conversion_action.include_in_conversions_metric,
  conversion_action.value_settings.default_value,
  conversion_action.value_settings.always_use_default_value
FROM conversion_action
WHERE conversion_action.status = 'ENABLED'
```

How to read the `type` field for local auditing:

- `UPLOAD_CALLS` — third-party call tracking imports.
- `GOOGLE_PLAY` / `STORE_VISIT` — store visit conversions.
- `UPLOAD` — offline conversion import (OCI).
- `WEBPAGE` — online form or page conversions.
- `PHONE_CALL` — Google forwarding number calls.

### 6. Call and call-only ad performance

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_ad.ad.type,
  metrics.impressions,
  metrics.clicks,
  metrics.phone_calls,
  metrics.conversions,
  metrics.cost_micros
FROM ad_group_ad
WHERE ad_group_ad.ad.type IN ('CALL_AD', 'RESPONSIVE_SEARCH_AD')
  AND campaign.status = 'ENABLED'
  AND segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC
```

Used to compare call-only ads against responsive search ads and quantify call volume from each.

---

## LSA data — getting it out of Google

The Google Ads API exposes only limited LSA data. Most lead-level detail lives in the Local Services Ads dashboard or mobile app. Some aggregate metrics are available via API for accounts where LSA has been linked.

When the API doesn't cover what's needed, ask the user (or pull from the LSA dashboard) for:

- Total leads in the last 30 days, by type (phone, message, booking).
- CPL by service category.
- Disputed lead count and the reasons given.
- Current weekly budget.
- Review score and review count on the LSA profile.
- Average response time.

The LSA dashboard offers a CSV export — request it when detailed analysis is needed.

---

## Column normalization

**Cost**
- Costs come back from the API in micros: 1,000,000 micros = $1.
- Divide `cost_micros` by 1,000,000 for the actual currency figure.
- The currency itself is whatever the account is billed in.

**Derived rates**
- CTR = clicks / impressions
- Conversion rate = conversions / clicks
- CPA = cost / conversions
- ROAS = conversions_value / cost

**Geographic quirks**
- City-level data references Google's geo target constants, which don't always map perfectly to civic boundaries.
- Distance is estimated from IP or device location signals — not GPS-grade.
- "Most specific location" in geographic reports represents the smallest unit Google could identify with confidence.
- Expect 5–15% of traffic to come back as "Unknown" location.

---

## Required data checklist

Before moving from data collection to analysis, confirm:

| Data point | Required? | Source |
| --- | --- | --- |
| Location extension status | Yes | Query 1 |
| Geographic performance by city | Yes | Query 2 |
| Per-campaign targeting method | Yes | Query 3 |
| Location targets and bid adjustments | Yes | Query 4 |
| Conversion action inventory | Yes | Query 5 |
| Call / call-only ad performance | Yes | Query 6 |
| LSA lead data | Only if LSA is active | Dashboard / export |
| GBP review score and count | Recommended | User or GBP dashboard |
| GBP photo count and post cadence | Optional | User or GBP dashboard |

If any required item is missing, note it explicitly in the report as a data gap and state which conclusions become unreachable without it.

---

## Reference: output_specs.md

# Output Specifications

Four deliverables. The shapes below.

## Output 1 — Local Audit Report

Long-form Markdown, sections aligned with the workflow.

```
# Local Audit Report: [Account Name]
## Date: [Date]
## Account ID: [ID]
## Business Type: [Type] | Locations: [Count]

---

### GBP Integration Status
- Linking status: [Linked / Not Linked / Partially Linked]
- Location extensions: [Active on X/Y campaigns]
- Review score: [Score] ([Count] reviews)
- Findings: [bullet list with severity tags]

### Location Targeting Configuration
- Targeting method: [table: campaign, method, status]
- Radius/area settings: [table: campaign, target, radius, bid adjustment]
- Geographic performance highlights: [top 5 segments by spend with CPA]
- Findings: [bullet list with severity tags]

### Offline Conversion Tracking
- Tracking methods active: [list]
- Tracking methods missing: [list]
- Completeness level: [Minimal / Basic / Intermediate / Advanced]
- Findings: [bullet list with severity tags]

### Campaign Evaluation
- Campaign types in use: [table: campaign, type, spend, conversions]
- Keyword strategy assessment: [summary]
- Extension usage: [summary]
- Findings: [bullet list with severity tags]

### LSA Review (if applicable)
- Lead volume: [X leads/month]
- Cost per lead: [$X average]
- Dispute rate: [X%]
- Review score: [X] ([Count] reviews)
- Findings: [bullet list with severity tags]

---

### All Findings Summary
[Table: Finding | Severity | Section | Recommendation]
```

### Severity tags

- `[CRITICAL]` — fix now; either real budget waste or a tracking failure that breaks bidding.
- `[WARNING]` — fix inside two weeks; meaningful impact but not breaking anything.
- `[OPPORTUNITY]` — performance upside, no urgency.

---

## Output 2 — GBP Action Items

A prioritized list, ordered by expected impact.

```
# GBP Action Items: [Account Name]

## High Impact
1. [Action]: [What to do specifically]
   - Why: [Business reason]
   - Expected impact: [What improves]

2. [Action]: ...

## Medium Impact
3. [Action]: ...

## Low Impact (Maintenance)
4. [Action]: ...
```

Standard items the audit pulls from when applicable:

- Link GBP to Google Ads (if not linked).
- Turn on location extensions for every campaign.
- Lift the review score on any location below 4.0.
- Solicit reviews on any location with fewer than 20.
- Upload photos to reach 20+ per location.
- Start a weekly GBP posts cadence.
- Pre-populate Q&A with 10+ common questions.
- Update hours, including holiday and special hours.
- Complete the service or product catalog.

---

## Output 3 — Location Targeting Recommendations

Campaign-by-campaign changes with rationale.

```
# Location Targeting Recommendations: [Account Name]

## Targeting Method Changes
| Campaign | Current Setting | Recommended | Rationale |
|---|---|---|---|
| [name] | Presence or interest | Presence | Local-only business, 15% out-of-area clicks |

## Radius Adjustments
| Campaign | Current Radius | Recommended | Rationale |
|---|---|---|---|
| [name] | 30 miles | 12 miles | Urban location, 80% of conversions within 10 miles |

## Bid Adjustments by Geography
| Campaign | Segment | Current Adj | Recommended | Rationale |
|---|---|---|---|---|
| [name] | 0-5 miles | None | +25% | 60% of conversions from this ring |

## Exclusion Recommendations
| Campaign | Area to Exclude | Spend (30d) | Conversions | Rationale |
|---|---|---|---|---|
| [name] | [city/zip] | $250 | 0 | No conversions in 60 days |

## Estimated Budget Impact
- Current monthly waste from targeting issues: $[X]
- Projected savings from targeting fixes: $[X]
- Reallocation recommendation: [where to redirect saved budget]
```

---

## Output 4 — Summary Dashboard

A scannable one-page view.

```
# Local Audit Summary: [Account Name]

## Overall Local Readiness: [X/10]

| Category | Status | Score |
|---|---|---|
| GBP Integration | [Linked/Partial/Not Linked] | [X/10] |
| Location Targeting | [Correct/Partially Correct/Incorrect] | [X/10] |
| Offline Tracking | [Advanced/Intermediate/Basic/Minimal] | [X/10] |
| Campaign Types | [Appropriate/Partially/Inappropriate] | [X/10] |
| LSA | [Active+Optimized / Active / Not Active / Not Eligible] | [X/10] |

## Top 3 Priorities
1. [Highest impact action with expected result]
2. [Second highest impact action]
3. [Third highest impact action]

## Budget Analysis
- Estimated waste from targeting issues: $[X]/month
- Estimated missed conversions from tracking gaps: [X]/month
- Recommended next investment: [what to do with recovered budget]

## Findings Count
- Critical: [X]
- Warning: [X]
- Opportunity: [X]
```

### Scoring rubric

| Score | What it represents |
| --- | --- |
| 9–10 | Well-optimized local account; minor opportunities only. |
| 7–8 | Solid foundation; two or three meaningful improvements still available. |
| 5–6 | Significant gaps in targeting or tracking; budget waste is likely. |
| 3–4 | Major configuration problems; substantial waste in play. |
| 1–2 | Fundamentals missing — no GBP link, no location targeting, no offline tracking. |

---

## Reference: worked_example.md

# Worked Example — Cedar Family Dental

Fictional three-office dental group operating across a mid-sized metro. The three offices:

- Office 1 — Riverside (urban core)
- Office 2 — Westgate (suburban)
- Office 3 — Lakeview (suburban/rural fringe)

Account ID: 845-221-9034. Monthly media spend: $9,200. Business is lead-gen — calls plus online intake forms. Developing maturity.

## Step 0 — dependencies loaded

Account config returns:
- `has_gbp`: true; three locations linked.
- `local_config`: radius targeting, 30 miles at every location.
- Business model: lead generation.
- Primary conversion events: calls and form submissions.
- LSA: not currently running; dental is an eligible category.

## Step 2 — GBP integration

**Linking**
- The three GBP listings are all connected to the Ads account. Healthy.
- Location extensions are enabled on the Riverside and Westgate campaigns but **missing** on Lakeview.

**Review state**

| Office | Score | Review count | Status |
| --- | --- | --- | --- |
| Riverside | 4.7 | 94 | Strong |
| Westgate | 3.9 | 28 | Below threshold |
| Lakeview | 3.5 | 14 | Below threshold |

**Profile state**
- Riverside: 41 photos, regular weekly posts, Q&A populated — well kept.
- Westgate: 9 photos, no posts in roughly two months, Q&A empty — neglected.
- Lakeview: 5 photos, no posts ever, Q&A empty, holiday hours stale — neglected.

**Classified findings**
- `[WARNING]` Westgate score sits at 3.9, just under the 4.0 floor. Erodes ad trust and would lower an LSA ranking.
- `[WARNING]` Lakeview at 3.5 with only 14 reviews — meaningful handicap for any local ad format.
- `[WARNING]` The Lakeview campaign is missing location extensions, despite covering Lakeview's territory.
- `[OPPORTUNITY]` Westgate and Lakeview are both well under 20 photos — bring each above 20.
- `[OPPORTUNITY]` Neither Westgate nor Lakeview has any GBP posts — establish a weekly cadence.
- `[OPPORTUNITY]` Q&A is blank on Westgate and Lakeview — seed ten common dental questions on each.

## Step 3 — location targeting

**Targeting method**

| Campaign | Setting | Verdict |
| --- | --- | --- |
| Riverside | Presence or interest | INCORRECT |
| Westgate | Presence or interest | INCORRECT |
| Lakeview | Presence or interest | INCORRECT |

Cedar Family Dental is a strictly local practice — patients physically visit the chair. The default setting is wrong on all three campaigns.

**Impact from the geographic report**
- 14% of total clicks (~$1,290/month) came from users sitting 100+ miles outside the metro.
- Zero conversions over the last 90 days from users beyond a 25-mile radius.
- Annualized: about $15,480 in waste.

**Radius evaluation**

| Campaign | Current | Recommended | Why |
| --- | --- | --- | --- |
| Riverside | 30 mi | 10 mi | Dense urban; ~85% of conversions are within 8 miles. 30 miles bleeds into Westgate's coverage. |
| Westgate | 30 mi | 18 mi | Suburban; ~75% of conversions within 15 miles. Some patients tolerate a longer drive in suburbs. |
| Lakeview | 30 mi | 22 mi | Sparser suburban/rural fringe with less competition; patients travel further. |

**Overlap issue:** With each campaign reaching 30 miles, Riverside and Westgate sit on top of each other across a wide swath. In the shared area, the same searcher can trigger both ads — the account ends up bidding against itself and CPCs drift upward.

**Geographic highlights**

| Zip | Campaign | 30-day spend | Conversions | CPA | Action |
| --- | --- | --- | --- | --- | --- |
| 53704 | Riverside | $1,310 | 19 | $68.95 | Strong — push bid up |
| 53718 | Riverside | $490 | 0 | n/a | Dead — exclude |
| 53711 | Westgate | $415 | 6 | $69.17 | Healthy — hold |
| 53726 | Riverside/Westgate overlap | $540 | 2 | $270.00 | Overlap — assign to nearest location |

**Classified findings**
- `[CRITICAL]` Every campaign is on "Presence or interest". 14% of clicks land outside the service area. About $1,290/month in waste.
- `[WARNING]` A 30-mile circle around the Riverside office is roughly three times the radius an urban dental practice should be running. It drags in suburban clicks that won't convert.
- `[WARNING]` Riverside and Westgate radius overlap creates self-bidding inside the shared zips.
- `[WARNING]` Zip 53718 carries $490 in spend with zero conversions across 30 days — exclusion candidate.
- `[OPPORTUNITY]` No nested-radius bid adjustments in place. Inner-ring patients convert at higher rates and could be bid up.

## Step 4 — offline conversion stack

**Current state**
- Form submissions: tracked as the primary conversion.
- Google forwarding call tracking: live on Riverside and Westgate, **not** Lakeview.
- Call duration threshold: 60 seconds (the default).
- Third-party call tracking: none.
- Store visit conversions: not eligible (3 locations is below the threshold).
- OCI: not configured.
- Enhanced conversions for leads: not on.

**Assessment** — completeness level: **Basic**.

The account captures form fills and the *start* of phone calls (Google forwarding), but call quality is invisible. A minute-long call could be a new patient scheduling a hygiene appointment or it could be a supply rep working their way through the directory — Smart Bidding treats both as the same conversion. And with no CRM signal flowing back, a lead form that converts into a paying patient is indistinguishable, to the algorithm, from one that never replies to a single follow-up.

**Classified findings**
- `[CRITICAL]` Smart Bidding (tCPA) is running while optimizing without call-quality data and without a CRM loop — partial inputs only.
- `[WARNING]` Call tracking is off on the Lakeview campaign — every phone call from that side of the metro is invisible.
- `[WARNING]` No third-party tracking, so spam and supplier calls cannot be filtered out of conversion data.
- `[OPPORTUNITY]` Enhanced conversions for leads would raise the form-submission match rate.
- `[OPPORTUNITY]` If average patient lifetime value can be approximated, stage-based values (lead → booked → attended) would give tCPA something real to optimize against.

## Step 5 — campaign mix

**Campaign list**

| Campaign | Type | Monthly spend | Conversions | CPA |
| --- | --- | --- | --- | --- |
| Riverside | Search | $3,800 | 45 | $84.44 |
| Westgate | Search | $3,200 | 30 | $106.67 |
| Lakeview | Search | $2,200 | 13 | $169.23 |

All Search. No PMax. No LSA. No Display.

**Keyword strategy**
- "dentist near me" is present across all three campaigns — good.
- City-level "dentist [city name]" terms are covered — good.
- No neighborhood-level keywords for Riverside — a missed opportunity in a dense urban core.
- No "emergency dentist" or "same day dental" variants — high-intent territory is uncovered.
- Broad match is running on Lakeview, the lowest-volume campaign. Wrong match type for that data environment.

**Extensions**
- Location and call extensions are live on Riverside and Westgate; both are missing on Lakeview.
- Sitelinks exist across all three but are generic — none are location-specific.

**Classified findings**
- `[WARNING]` LSA-eligible but not running. Riverside's 4.7 / 94 review profile would rank well.
- `[WARNING]` Lakeview is missing both location and call extensions — its ads serve without an address or phone number visible.
- `[WARNING]` Broad match on Lakeview, the lowest-volume campaign — almost certainly producing irrelevant clicks.
- `[OPPORTUNITY]` No neighborhood-level keywords for Riverside (e.g., "dentist [neighborhood]").
- `[OPPORTUNITY]` Emergency dental keywords are absent — high intent, high value.
- `[OPPORTUNITY]` Sitelinks are generic. Location-specific sitelinks (hours, directions, location-specific services) would lift relevance.

## Step 6 — LSA review

LSA is not running. This step records the launch recommendation.

**LSA readiness**
- Dental is an eligible category. ✓
- Riverside — 4.7 / 94 reviews — competitive for LSA.
- Westgate — 3.9 — would rank weakly.
- Lakeview — 3.5 — not recommended.

**Recommendation:** launch LSA for Riverside only. Westgate and Lakeview both need to clear 4.0 first.

## Summary Dashboard

### Overall Local Readiness: 4/10

| Category | Status | Score |
| --- | --- | --- |
| GBP Integration | Partially optimized (Riverside strong, others weak) | 5/10 |
| Location Targeting | Incorrect on every campaign | 2/10 |
| Offline Tracking | Basic — forms + forwarding only | 3/10 |
| Campaign Types | Search only; missing LSA | 4/10 |
| LSA | Not running, eligible | 3/10 |

### Top 3 priorities

1. **Switch every campaign from "Presence or interest" to "Presence".** Reclaims roughly $1,290/month ($15,480/year) of out-of-area waste.
2. **Cut Riverside's radius from 30 to 10 miles and resolve the Riverside/Westgate overlap.** Stops the self-bidding inside the shared zone and cuts the unconverting suburban tail.
3. **Launch LSA for Riverside.** A strong review profile (4.7 / 94) makes it competitive on day one and adds incremental leads on top of Search.

### Budget analysis

- Targeting waste today: roughly $1,290/month.
- Untracked Lakeview calls: estimated 8–12 missed conversions/month.
- Recommended redeployment: route the reclaimed $1,290 into the new LSA budget for Riverside.
