---
name: pancake_evaluate_shopping
description: Action skill that executes Shopping campaign analysis for Google Ads accounts. Covers both Standard Shopping and Shopping-eligible PMax campaigns. Classifies products into performance tiers, audits feed quality, evaluates campaign structure, analyzes competitive positioning, and produces product reports and structure recommendations. Loads pancake-shopping-playbook as its analytical foundation. Use when analyzing Shopping campaigns, reviewing product performance, auditing product feeds, or deciding between Shopping structures. Do NOT use for PMax product performance analysis (use pancake-pmax-workshop) or general account performance review (use pancake-orchestrator).
triggers:
  - "analyze shopping"
  - "shopping analysis"
  - "shopping audit"
  - "product performance"
  - "product tier analysis"
  - "feed audit"
  - "shopping structure"
---

# Shopping Campaign Analysis

This is the action skill for end-to-end Shopping analysis on a Google Ads account. It works on Standard Shopping, Shopping-eligible PMax, and hybrid setups that run both at once. The skill walks through product tiering, feed quality, structure fit, competitive positioning, and search-term hygiene, and ships five deliverables that a practitioner can act on.

The work is sequenced. Each phase ends in a checkpoint where you stop and confirm what was found before moving on. The user can ask to skip an area ("the feed is fine, skip it") or to narrow the scope to a single phase ("just do the tier analysis") — note the truncation in the summary dashboard and adjust the deliverables accordingly.

---

## Companion Skills Loaded Up Front

Three skills carry the analytical foundations. Load them at the start.

- **`pancake_shopping_playbook`** — the structure decision tree, feed-pillar scoring framework, product tier classification, and competitive positioning metrics (impression share, lost IS budget vs. rank, click share, benchmark CPC).
- **`pancake_account_foundations`** — brand terms, KPI targets (ROAS or CPA), maturity tier, business model, campaign naming patterns, Merchant Center flag, and any account-specific notes.
- **`pancake_account_foundations`** — used to calibrate how deep each analysis phase actually goes for this account.

If the pancake-account-foundations config does not exist, do not proceed — route the user to set up account conventions first and stop.

---

## Phase 0 — Establish the Foundation

The first phase is purely setup. No data queries yet.

### What to load

1. The pancake-account-foundations config (default location `pancake_account_foundations/config.yaml`). From it, pull: brand-term list, KPI and target, maturity tier, business model, naming patterns, special handling notes, and the `has_merchant_center` flag. If that flag is false or absent, feed-level analysis will be limited to whatever the Google Ads API surfaces.
2. The shopping methodology — confirm you have the structure decision tree (Standard vs. PMax vs. Full PMax vs. Hybrid), the feed-optimization pillars, the tier classification rules, and the competitive positioning fields.
3. The maturity methodology — read the tier and apply the calibration table below.

### Maturity-calibrated thresholds

| Threshold | Nascent | Developing | Established | Advanced |
|---|---|---|---|---|
| Minimum spend before a non-converting product is classified as Zombie | $20 | $50 | $100 | $200 |
| Minimum conversions to qualify as a Hero | 2 | 3 | 5 | 10 |
| Granularity of analysis | Product type only | Product type primary, top products called out individually | Full product-level | Full product-level plus SKU |
| Feed audit depth | Errors only | Errors plus titles | Full multi-pillar audit | Full audit plus competitive title comparison |
| Structure evaluation depth | Basic recommendation | Recommendation plus migration path | Full evaluation including hybrid | Full plus cross-campaign overlap audit |

### Confirm with the practitioner

Show: account name and CID, maturity tier, primary KPI and target, current Shopping structure (Standard / PMax / Hybrid / unknown), Merchant Center access status, analysis window (default trailing 30 days), and any specific products or categories that should be the focus.

**Checkpoint:** confirm everything before continuing.

> **First-five-runs mode:** during the first five runs of this skill, every checkpoint includes expanded methodology explanation and reasoning chains. After that it streamlines to confirmation only. The practitioner can request the expanded mode at any time by saying "explain your reasoning."

---

## Phase 1 — Pull the Data

The skill is agnostic about where the data comes from. The `data_source.method` field in the account config tells you which path to take (API, CSV export, manual paste).

### Data the analysis needs

1. **Product-level performance** — clicks, cost, conversions, conversion value, ROAS, CPA per product. Source: `shopping_performance_view`.
2. **Product group / listing group performance** — same metrics but rolled up to the listing group. Source: `asset_group_listing_group_filter` (PMax) or ad-group product groups (Standard Shopping).
3. **Impression share** — Shopping IS, lost IS to budget, lost IS to rank, at campaign and product-group level.
4. **Shopping search terms** — queries that triggered Shopping ads. Source: `search_term_view` filtered to Shopping and PMax channels.
5. **Feed diagnostics** — product approval status, disapproval reasons, item counts (only if Merchant Center access is configured).
6. **Campaign metadata** — names, types, bidding strategies, daily budgets, status.

### Normalization rules

- `cost_micros` divided by 1,000,000 yields actual currency.
- `campaign_budget.amount_micros` divided by 1,000,000 yields the daily budget.
- Calculate ROAS as conversion_value / cost and CPA as cost / conversions. Guard against divide-by-zero on both.
- Compute CTR as clicks / impressions and conversion rate as conversions / clicks.
- Products with zero conversions are kept in the dataset but flagged separately so they do not skew averages.
- If the account is hybrid (both Standard Shopping and PMax run together), merge the datasets before tiering.
- Impression-share fields (`metrics.search_impression_share`, `metrics.search_budget_lost_impression_share`, `metrics.search_rank_lost_impression_share`) come back as decimals — multiply by 100 to get percentages.

### Reference: column normalization map

| Raw API field | Analysis column | Transform |
|---|---|---|
| segments.product_item_id | product_id | none |
| segments.product_title | product_title | none |
| segments.product_brand | brand | none |
| segments.product_type_l1 | product_type_l1 | none |
| segments.product_custom_attribute0 | custom_label_0 | none |
| metrics.clicks | clicks | none |
| metrics.impressions | impressions | none |
| metrics.cost_micros | cost | divide by 1,000,000 |
| metrics.conversions | conversions | none |
| metrics.conversions_value | conversion_value | none |
| metrics.search_impression_share | impression_share | multiply by 100 |
| metrics.search_budget_lost_impression_share | lost_is_budget | multiply by 100 |
| metrics.search_rank_lost_impression_share | lost_is_rank | multiply by 100 |
| campaign_budget.amount_micros | daily_budget | divide by 1,000,000 |

### Sample GAQL: product-level performance

```sql
SELECT
  segments.product_item_id,
  segments.product_title,
  segments.product_brand,
  segments.product_type_l1,
  segments.product_type_l2,
  segments.product_type_l3,
  segments.product_custom_attribute0,
  segments.product_custom_attribute1,
  segments.product_custom_attribute2,
  segments.product_custom_attribute3,
  segments.product_custom_attribute4,
  segments.product_channel,
  campaign.name,
  campaign.id,
  campaign.advertising_channel_type,
  metrics.clicks,
  metrics.impressions,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM shopping_performance_view
WHERE segments.date BETWEEN '{start}' AND '{end}'
  AND campaign.status = 'ENABLED'
  AND metrics.impressions > 0
ORDER BY metrics.cost_micros DESC
```

This single query covers both Standard Shopping and PMax. Filter on `campaign.advertising_channel_type` if you want to split them — `SHOPPING` for Standard, `PERFORMANCE_MAX` for PMax. Custom attributes 0 through 4 map to feed `custom_label_0` through `custom_label_4`.

### Sample GAQL: campaign IS

```sql
SELECT
  campaign.name,
  campaign.id,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  campaign_budget.amount_micros,
  metrics.clicks,
  metrics.impressions,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date BETWEEN '{start}' AND '{end}'
  AND campaign.status = 'ENABLED'
  AND campaign.advertising_channel_type IN ('SHOPPING', 'PERFORMANCE_MAX')
ORDER BY metrics.cost_micros DESC
```

For Standard Shopping, `search_impression_share` is Shopping IS, not Search IS. PMax IS is exposed differently — use the PMax-specific IS fields or auction-insight queries when available.

### Sample GAQL: campaign metadata

```sql
SELECT
  campaign.name,
  campaign.id,
  campaign.status,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  campaign_budget.amount_micros,
  campaign.start_date,
  campaign.shopping_setting.merchant_id,
  campaign.shopping_setting.feed_label,
  campaign.shopping_setting.campaign_priority
FROM campaign
WHERE campaign.advertising_channel_type IN ('SHOPPING', 'PERFORMANCE_MAX')
  AND campaign.status != 'REMOVED'
```

`shopping_setting.campaign_priority` returns 0 (Low), 1 (Medium), or 2 (High) for Standard Shopping; PMax campaigns do not have this setting. `shopping_setting.merchant_id` confirms Merchant Center linkage.

### Sample GAQL: search terms

```sql
SELECT
  search_term_view.search_term,
  campaign.name,
  campaign.id,
  campaign.advertising_channel_type,
  ad_group.name,
  metrics.clicks,
  metrics.impressions,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM search_term_view
WHERE segments.date BETWEEN '{start}' AND '{end}'
  AND campaign.advertising_channel_type IN ('SHOPPING', 'PERFORMANCE_MAX')
  AND metrics.impressions > 0
ORDER BY metrics.cost_micros DESC
```

Standard Shopping returns full search-term visibility. PMax surfaces a subset only.

### Sample GAQL: listing-group performance (Standard Shopping)

```sql
SELECT
  ad_group.name,
  ad_group.id,
  ad_group_criterion.listing_group.type,
  ad_group_criterion.listing_group.case_value.product_brand.value,
  ad_group_criterion.listing_group.case_value.product_type.value,
  ad_group_criterion.listing_group.case_value.product_item_id.value,
  metrics.clicks,
  metrics.impressions,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM ad_group_criterion
WHERE segments.date BETWEEN '{start}' AND '{end}'
  AND campaign.advertising_channel_type = 'SHOPPING'
  AND ad_group_criterion.type = 'LISTING_GROUP'
  AND ad_group_criterion.listing_group.type = 'UNIT'
  AND metrics.impressions > 0
ORDER BY metrics.cost_micros DESC
```

For PMax listing groups, swap to `asset_group_listing_group_filter` and filter on `campaign.advertising_channel_type = 'PERFORMANCE_MAX'`.

### Trend analysis

Add `segments.date` or `segments.week` to any of the queries above to get time-series rows. For PMax in particular, daily data is noisy — aggregate to weekly.

### Merchant Center feed export

If the account has Merchant Center access, export the full product feed (CSV or Content API). The columns you need for feed analysis are id, title, description, image_link, gtin, brand, product_type, google_product_category, custom_label_0 through custom_label_4, availability, price, and sale_price. Without Merchant Center access, the `shopping_performance_view` query still gives you titles, brands, and custom attributes — enough for a basic title and label sanity check but not a full feed audit.

**Checkpoint:** report number of products with data, total spend, total conversions, and the date range covered. Confirm before tiering.

---

## Phase 2 — Tier Every Product

Every product (or product group, depending on maturity) gets put into one of four behavioral buckets.

### The four tiers

- **Heroes** — high spend, strong conversion volume, ROAS above target. The protect-and-scale group.
- **Sidekicks** — moderate spend, moderate conversions, acceptable ROAS. Reliable performers but not the engine.
- **Zombies** — spend above the maturity-tier threshold but few or no conversions, and often low impression share. They consume budget without producing.
- **Villains** — meaningful spend with extremely poor ROAS (well below target). Actively losing money on every dollar.

### How to tier

1. Compute account averages first: average conversions per product, average ROAS, average cost per product.
2. Apply classification rules in this order: Villains first (catch the active money-losers), then Zombies (catch the dead spend), then split the rest into Heroes vs. Sidekicks.
3. Handle edge cases explicitly:
   - Products launched inside the runway period: tag as "New, Insufficient Data" rather than tiering them.
   - Seasonal products: flag with seasonal context if you can detect it from titles or custom labels.
   - Long-tail products with spend below the Zombie threshold and zero conversions: tag as "Insufficient Data" rather than declaring them Zombies — there is not enough signal.
4. Produce a tier distribution summary: count per tier, percentage of catalog, revenue share, cost share.

### Maturity calibration

At Nascent and Developing, classify at the product-type level rather than per-product — individual products do not have enough data to be meaningful. At Established and Advanced, classify per product, with product-type rollups available for context.

**Checkpoint:** present the tier distribution. Confirm the practitioner is comfortable with the thresholds before generating the full per-product report.

---

## Phase 3 — Feed Quality Audit

The feed is what Google matches queries against. A weak feed limits everything downstream.

### The six pillars and their weights

The feed score is a weighted composite out of 100 with these slots:

- **Title Optimization (25 points)** — sample the top 20 products by spend. Score the percentage with keyword-optimized titles vs. raw manufacturer text. Note examples for the report.
- **Image Quality (20 points)** — disapproved images, image warnings, the use of generic category shots versus product-specific photography, plus white-background and resolution compliance. A complete image audit needs Merchant Center access.
- **GTIN Coverage (15 points)** — percentage of products with valid GTINs. Flag categories where GTINs are expected but missing.
- **Attribute Completeness (15 points)** — percentage of products with all recommended attributes filled (product_type, google_product_category, description, etc.). Identify the most common missing attributes.
- **Error Rate (15 points)** — count and percentage of disapproved products. Break errors down by severity: critical, warning, suggestion. Identify the top three error categories with resolution steps.
- **Custom Label Usage (10 points)** — which of the five custom_label slots are in use, what strategy each implements, and whether the labeling supports the desired campaign structure.

### Maturity calibration

- Nascent: error count and basic title check only.
- Developing: errors, titles, and GTIN coverage.
- Established: full six-pillar audit.
- Advanced: full audit plus a competitive title comparison.

### Output

A feed score out of 100 with a one-sentence interpretation, sub-scores for each pillar, and a top-five list of prioritized feed improvements — each annotated with the count of affected products and the expected performance impact.

**Checkpoint:** present the score and the top three findings. Confirm before generating the full feed report.

---

## Phase 4 — Structure Fit Evaluation

Walk the decision tree to determine whether the account is on the right structure.

### Steps

1. Document the current structure. Possibilities: Standard Shopping only, PMax only, Feed-Only PMax (PMax campaign with feed but no creative assets), Full PMax (PMax with full creative), or Hybrid (Standard plus PMax).
2. Run the five-question decision tree from `pancake_shopping_playbook/references/structure_decision_framework.md`, answering each question with actual data from this account:
   - What is the monthly conversion volume?
   - What is the feed quality?
   - Is product-level bid control needed?
   - What creative assets are available beyond the feed?
   - What is the budget relative to catalog size?
3. Compare the recommended structure to the current one. If they line up, name that. If they don't, spell out the gap and the changes required to close it.
4. If Hybrid is in play or being recommended, evaluate using the hybrid framework — auction priority rules, budget allocation, and overlap analysis between the Standard and PMax sides.

### Maturity calibration

- Nascent: basic structure recommendation, no migration plan.
- Developing: recommendation plus migration path.
- Established: full evaluation including hybrid analysis.
- Advanced: full evaluation plus a cross-campaign overlap audit.

### Output

Current structure documented, decision-tree answers shown, a single recommendation ("maintain", "migrate to X", or "test hybrid"), and — if recommending change — a step-by-step migration plan with timeline, budget adjustments, monitoring metrics, and rollback criteria.

**Checkpoint:** present the structure recommendation. If proposing change, include the migration path and an effort estimate (low if under 2 hours, medium if 2 to 4 hours, high if more than 4 hours).

---

## Phase 5 — Competitive Positioning

Use impression share and benchmark data to understand where products stand against competitors.

### What to measure

1. **Overall Shopping IS** — total impression share, lost IS to budget, lost IS to rank.
2. **IS by product tier** — broken out for Heroes, Sidekicks, and Zombies. This shows where additional visibility investment would yield the most return.
3. **Benchmark CPC comparison** — actual CPC by product group against the benchmark CPC. Products paying significantly above benchmark while performing poorly are signaling a quality or relevance problem.
4. **Click share** — where available, compare click share to IS. A product that wins the impression but not the click is losing the SERP-side bake-off to competitors — pricing, image, or title is the likely culprit.
5. **Budget vs. rank diagnosis** — for any product losing meaningful impression share, separate the cause. Budget loss is fixable by spending more; rank loss is not, and requires lifting the bid or improving feed quality. A product whose lost IS is concentrated on the rank side will not benefit from a budget increase.

### Maturity calibration

- Nascent: skip this phase — not enough data for competitive benchmarking to be reliable.
- Developing: overall IS only.
- Established: IS by product tier plus benchmark CPC.
- Advanced: the full set plus click share and IS trends over time.

**Checkpoint:** present the competitive positioning summary, including the single biggest IS opportunity.

---

## Phase 6 — Search Term Analysis

Pull Shopping queries and figure out what is wasting money, what is converting, and whether the right products are being matched to the right queries.

### Steps

1. Use the Shopping search-term data pulled in Phase 1.
2. Classify each term into one of five buckets from `pancake_query_intelligence`:
   - **URGENT_NEGATIVE** — bleeding money, add as a negative now.
   - **EXPAND** — converting well, consider promoting to an exact-match keyword or extracting to a dedicated campaign.
   - **COVERED_BY_PARENT** — already captured by a broader term, no separate action.
   - **MONITOR_NEGATIVE** — borderline, watch for the next window before negating.
   - **REVIEW_MANUALLY** — ambiguous, needs human judgment.
3. Check product-query alignment for top-spend queries. If a high-spend query is triggering a Zombie product rather than a Hero product, that is a feed or structure problem, not a query problem.
4. Run n-gram analysis. Tokenize queries into unigrams, bigrams, and trigrams; aggregate spend and conversion rate per n-gram; flag any with high spend and low conversion rate. Cross-reference n-grams against product tiers — if a particular n-gram disproportionately triggers Zombies, that is the root cause to chase.

### Maturity calibration

- Nascent: identify obviously irrelevant terms only.
- Developing: four-category classification.
- Established: full five-category classification plus product-query alignment checks.
- Advanced: everything in Established plus n-gram analysis cross-referenced to tiers.

**Checkpoint:** present the search-term summary — top waste terms, top opportunities, and any product-query misalignment findings.

---

## Phase 7 — Deliverables

Five outputs come out of this skill. Generate them per the format specs below.

### 1. Product Tier Report

A markdown table and a CSV export.

The markdown side has the tier distribution summary table at the top (Tier, Products, % of Products, Revenue, % of Revenue, Cost, % of Cost) followed by a per-product table sorted by tier (Villains first, then Zombies, Sidekicks, Heroes) and by descending cost within each tier. Columns: Product ID, Product Title, Brand, Product Type, Tier, Clicks, Cost, Conv, Conv Value, ROAS, CPA, Action. Cap the markdown table at the top 50 products by spend.

The full list ships as a CSV: same columns, every product, no row limit, UTF-8, header row included, numbers unformatted (no currency symbols or percent signs). Filename pattern: `{account_name}_product_tiers_{date_range}.csv`.

The "Action" column is a single-line recommendation from the tier-specific action list — for example "Increase bids, protect budget" for a Hero or "Pause immediately" for a Villain.

### 2. Feed Audit Report

A markdown document. Open with the feed health score out of 100 and a one-sentence interpretation. Then a section for each of the six pillars showing the sub-score and its findings:

- Title Optimization (out of 25): sample size, percentage optimized vs. manufacturer default, top five title rewrite examples (current, recommended, rationale).
- Image Quality (out of 20): disapprovals, warnings, common issues. If no Merchant Center access, note the audit is limited.
- GTIN Coverage (out of 15): total products, products with GTINs, percentage, categories with expected-but-missing GTINs.
- Attribute Completeness (out of 15): coverage percentage and most commonly missing attributes.
- Error Rate (out of 15): disapproval count and percentage, breakdown by severity, top three error categories with resolution steps.
- Custom Label Usage (out of 10): which slots are in use, what each implements, recommendations for unused slots.

End with a prioritized list of the top five feed improvements — each annotated with the number of products affected and the expected performance impact.

### 3. Structure Recommendation

A markdown document with these sections:

- Current structure: campaign types in use, count of Shopping campaigns, bidding strategies, percentage of the catalog active in Shopping.
- Decision-tree results: each of the five questions with the answer derived from data, and the recommended structure that follows.
- Recommendation: one of "maintain current structure", "migrate to [structure]", or "test hybrid", with two to three sentences of rationale tying the decision-tree answers to the verdict.
- Migration plan (only if recommending change): step-by-step process, week-by-week timeline, budget adjustments, monitoring metrics during the migration, and rollback criteria.
- Effort estimate: setup effort (low / medium / high) and the change in ongoing management load (reduced / similar / increased).

### 4. Shopping Search Terms CSV

A CSV compatible with the `pancake_query_intelligence` output. Columns: search_term, campaign, clicks, impressions, cost, conversions, conversion_value, classification, recommended_action, match_type, notes.

The classification column uses URGENT_NEGATIVE, EXPAND, COVERED_BY_PARENT, MONITOR_NEGATIVE, or REVIEW_MANUALLY. The recommended_action column is concrete — for example "Add as negative [exact]" or "Add as exact match keyword" or "Monitor next 30 days". The match_type column carries the recommended negative match type (exact / phrase / broad) or N/A for non-negatives. The notes column carries any extra context such as "triggering wrong product type" or "brand misspelling".

Sort by classification priority (URGENT_NEGATIVE first), then by descending cost within each classification. Filename pattern: `{account_name}_shopping_search_terms_{date_range}.csv`.

### 5. Summary Dashboard

A single-page markdown overview designed to convey the whole picture in under a minute of reading. Layout:

- Title with account name.
- Header block: date range, account maturity.
- Overview: total products analyzed, total Shopping spend, total Shopping conversions, overall Shopping ROAS.
- Tier distribution table (count, revenue share, cost share per tier).
- Feed health score out of 100 with a one-sentence summary.
- Structure verdict: current vs. recommended, with a one-sentence rationale.
- Competitive position: overall IS, lost IS to budget, lost IS to rank.
- Top three priority actions, each with its expected impact described.
- Search term highlights: count of terms classified, urgent negatives and estimated waste in dollars, expansion opportunities count.

---

## Maturity Calibration Reference

| Analysis component | Nascent | Developing | Established | Advanced |
|---|---|---|---|---|
| Product tier classification | Product-type level | Product-type primary | Product level | Product level plus SKU |
| Feed audit | Errors only | Errors plus titles plus GTINs | Full six-pillar audit | Full plus competitive title comparison |
| Structure evaluation | Basic recommendation | Recommendation plus migration | Full plus hybrid analysis | Full plus cross-campaign overlap |
| Competitive positioning | Skip | Overall IS only | IS by tier plus benchmark CPC | Full competitive including click share and trends |
| Search term analysis | Basic irrelevant terms | Four-category classification | Full plus product-query alignment | Full plus n-gram plus tier cross-reference |

---

## Checkpoint Discipline

A mandatory checkpoint sits at the end of every phase. At each one:

1. Summarize what the phase found.
2. Confirm the practitioner is comfortable with the findings and the thresholds used.
3. Ask whether any area deserves a deeper dive before continuing.
4. Proceed only after explicit confirmation.

If the practitioner asks to skip a phase ("our feed is fine, skip the audit"), note the skip in the summary dashboard so the deliverable is honest about what was and was not examined. If the practitioner narrows scope to a single phase ("just give me the tier analysis"), run Phases 0 through 2 and ship only the Product Tier Report and the Summary Dashboard.

---

## Worked Example: TrailPeak Outfitters

This example illustrates how the phases come together on a real-shaped account. Use it to anchor expectations for output format and depth.

### Account snapshot

- TrailPeak Outfitters, a fictional outdoor-gear DTC eCommerce store on Shopify.
- 50 active SKUs across six categories: tents, footwear, hydration, accessories, apparel, clearance.
- Current structure: a single Standard Shopping campaign on manual CPC bidding.
- Trailing 30 days: 60 conversions, $4,200 spend, $18,900 revenue, 4.5x ROAS.
- Established maturity (50–200 conversions / month). Target ROAS: 4.0x.

### Phase 2 output

Account averages: 1.2 conversions per product, 3.8x ROAS, $84 spend per product. Zombie threshold at Established: $100.

| Tier | Count | % of catalog | Revenue | % of revenue | Cost | % of cost |
|---|---|---|---|---|---|---|
| Heroes | 5 | 10% | $16,700 | 88% | $1,945 | 46% |
| Sidekicks | 12 | 24% | $1,700 | 9% | $590 | 14% |
| Zombies | 25 | 50% | $380 | 2% | $1,175 | 28% |
| Villains | 8 | 16% | $120 | 1% | $490 | 12% |

The takeaway lands hard: roughly $1,665 — 40% of the monthly budget — is being burned on products that return only about 3% of revenue. The biggest move on the table is reclaiming that spend and pointing it at the Heroes and Sidekicks.

Hero examples: TrailPeak Summit 4P Tent (14 conversions, 6.2x ROAS), TrailPeak Ridge Hiking Boot Men's (12 conversions, 5.8x), TrailPeak Basecamp 2P Tent (9 conversions, 6.8x). Action: protect budget, raise bids.

Villain examples: TrailPeak Pro Mountaineering Boot Clearance ($185 spend, 0.8x ROAS — pause), TrailPeak Winter Expedition Tent Clearance ($155 spend, 0.6x — pause), TrailPeak Carbon Trekking Poles ($150 spend, 1.2x — investigate pricing and add negatives).

### Phase 3 output

Feed quality score: 42/100 (weak).

- Titles 8/25 — about 60% of the catalog still carries raw manufacturer strings ("TP-TENT-4P-GRN" where it should read "TrailPeak Summit 4-Person Camping Tent Green"). Only 12 of the 50 products are keyword-optimized. The Heroes are in decent shape (4 of 5 optimized); the Zombies are where the damage concentrates (2 of 25).
- Images 14/20 — no disapprovals; 8 products using generic category images.
- GTINs 5/15 — only 15 of 50 products (30%) have GTINs; tents and footwear are covered, accessories and apparel mostly are not. 20 products should have GTINs and do not.
- Attribute completeness 8/15 — product type mapped everywhere, but Google product category is missing on 18 products and the description field is empty on 12.
- Error rate 7/15 — 3 disapprovals (6%), made up of 2 price mismatches and 1 landing-page 404; 5 products with GTIN-expected warnings.
- Custom labels 0/10 — no labels in use, no margin tiers, no seasonality tags, no performance tiers.

Highest-leverage feed action: rewrite those 30 default titles. On this account specifically, the SKUs already running keyword-optimized titles convert click-through at roughly 2.3x the rate of the ones still relying on raw manufacturer strings.

### Phase 4 output

Decision tree answers:

1. Conversion volume: 60/month — all structures are viable.
2. Feed quality: 42/100 — too weak for any PMax-heavy approach until feed is fixed.
3. Product-level bid control needed: yes — five Heroes drive 88% of revenue and deserve dedicated bids.
4. Creative assets: feed only; no video, no lifestyle.
5. Budget relative to catalog: $4,200 / 50 = $84 per product per month, or $2.80 per product per day — generous.

Recommendation: hybrid — Standard Shopping for top performers, Feed-Only PMax for the long tail — but only after the feed is fixed.

Migration plan: spend weeks 1–2 cleaning up the feed (titles, GTINs, custom labels) and aim for a feed score north of 65. In week 3, stand up two campaigns — one Standard Shopping holding the 5 Heroes and the 5 best-performing Sidekicks in their own product groups, and a Feed-Only PMax covering everything else. Set budgets at $2,500/month for Standard Shopping and $2,000/month for PMax through weeks 3–4. From weeks 4 through 10, keep an eye on the split and rebalance products between the two campaigns as a fresh tier analysis dictates. At the 10-week mark, do the formal hybrid-vs-single-structure comparison.

Effort: medium — 3 to 4 hours for the feed fixes plus 1 to 2 hours for the campaign builds.

### Phase 5 output

| Segment | IS | Lost IS (Budget) | Lost IS (Rank) |
|---|---|---|---|
| Overall Shopping | 45% | 18% | 37% |
| Heroes (5 products) | 65% | 10% | 25% |
| Sidekicks (12 products) | 40% | 22% | 38% |
| Zombies (25 products) | 15% | 25% | 60% |

Interpretation: the Heroes — sitting at 65% IS with only 10 points lost to budget — could likely add roughly 10 IS points on the highest-value products for about $200/month more spend. The Zombies tell the opposite story: 15% IS and 60 points lost to rank says the issue is relevance and quality, not money — more budget changes nothing. The Sidekicks losing 22 points to budget read as collateral damage, with Zombie overspend eating the share they could otherwise hold.

### Phase 6 output

The "camping gear" n-gram showed up across 47 distinct queries and burned 340 clicks and $480 for one conversion (0.3% conversion rate, 0.4x ROAS). Around 40% of the traffic landing on Zombie products was arriving through these broad "camping gear" searches — and the auction was matching them to clearance items and accessories instead of the tents and boots that actually close. Root cause: the Zombie products carry broad, unoptimized titles that leave them eligible for these generic searches.

| Classification | Terms | Cost | Conversions |
|---|---|---|---|
| URGENT_NEGATIVE | 23 | $620 | 0 |
| EXPAND | 8 | $310 | 18 |
| MONITOR_NEGATIVE | 34 | $180 | 0 |
| REVIEW_MANUALLY | 12 | $95 | 2 |

Urgent negatives include "camping gear cheap", "outdoor equipment wholesale", "camping supplies bulk", "free camping gear", "camping gear near me". Expansion candidates include "4 person camping tent", "men's hiking boots waterproof", "women's hiking boots", "2 person backpacking tent".

### Final actions

1. **Rewrite the 30 manufacturer-default titles.** Anticipate a 15–25% CTR lift on the rewritten products, tighter alignment between queries and products, and a reduction in wasted spend on the wrong searches. Nothing else on this account moves the needle as much.
2. **Shut down the Villains and load the urgent negatives.** Killing the 8 Villain SKUs takes about $490/month off the bill. The 23 urgent-negative keywords reclaim another estimated $620/month. Together, around $1,110/month flows back toward Heroes and Sidekicks.
3. **Roll out custom labels for margin and performance tier.** This is the unlock for the hybrid migration — listing-group filters can then cleanly route products between Standard Shopping (Heroes / Sidekicks) and PMax (everything else) — and it also sets up future bid alignment by margin.

Projected combined impact: ROAS climbing from 4.5x into the 5.5–6.0x range as the recovered budget gets spent at Hero-tier efficiency, with the feed score lifting from 42 into the 65–70 band — which is what makes the structural change worth doing.
