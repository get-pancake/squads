---
name: pancake_pmax_workshop
description: End-to-end Performance Max workshop — combines the conceptual framework for analyzing PMax (eight-channel decomposition, asset group evaluation, search term mining, feed-as-targeting, and channel distribution benchmarks by business model) with the procedural workflow that runs the analysis on a live account, sequences the phases, gates progress through checkpoints, and produces channel breakdowns, asset audits, search term findings, product tiering, and an executive summary. Calibrates depth to account maturity. Use when analyzing PMax campaigns, evaluating channel distribution, auditing asset groups, reviewing PMax search terms, or grounding any PMax decision in the methodology. Do not use for Shopping-only analysis (use pancake_evaluate_shopping) or standalone search term mining (use pancake_query_intelligence).
triggers:
  - "analyze pmax"
  - "pmax analysis"
  - "pmax audit"
  - "pmax channel breakdown"
  - "pmax asset review"
  - "performance max analysis"
  - "pmax search terms"
  - "pmax methodology"
  - "performance max methodology"
  - "pmax framework"
  - "pmax analysis framework"
---

# Performance Max Workshop

This document is both the analytical foundation and the execution playbook for any Performance Max engagement. Read the first half — the framework — to learn how to think about a PMax campaign: what it actually is, how to pull it apart, what each piece is supposed to do, and what "healthy" looks like for the business model in front of you. Read the second half — the workflow — when you have an account on your screen and need to convert that thinking into queries, tables, checkpoints, and deliverables.

The two halves are designed to interlock. Every phase of the workflow leans on a specific section of the framework, and the framework is calibrated to make the workflow's outputs actually mean something.

---

## Part I — The Framework

### The Core Problem PMax Creates for Analysts

Performance Max is a single campaign that runs on top of eight Google ad networks at once. It auto-generates creative, picks landing pages, decides bids, and shuffles budget across networks invisibly. The analyst's job is to reverse-engineer that black box into something diagnosable.

The methodology tackles this in five layers, in roughly the order you would investigate a campaign:

1. Decompose spend across the 8 channels PMax can serve.
2. Audit the asset groups feeding the creative engine.
3. Inspect the search terms PMax was actually pulled into.
4. For Shopping-eligible accounts, treat the product feed as the dominant targeting input.
5. Benchmark the resulting channel mix against the business model.

Each layer has its own thresholds, red flags, and remediation levers, covered below.

---

### Layer 1 — Decomposing Spend Across the 8 PMax Channels

#### Why decomposition is non-negotiable

PMax reports as a single campaign in default views. Without decomposition, the campaign is a black box. Two API segmentation fields together expose where every impression actually served:

- `segments.ad_network_type` — which Google network handled the impression
- `segments.ad_using_product_data` — whether the impression used a product from the Merchant Center feed

The crucial nuance: a `SEARCH` network impression can be either Shopping (product listing ad) or Search (text ad). The product-data flag is what tells them apart.

#### Channel resolution logic

| `ad_network_type` | `ad_using_product_data` | Resolved channel |
|---|---|---|
| SEARCH | TRUE | Shopping |
| SEARCH | FALSE | Search |
| CONTENT | either | Display |
| YOUTUBE | either | YouTube |
| GMAIL | either | Gmail |
| DISCOVER | either | Discover |
| MAPS | either | Maps |
| SEARCH_PARTNERS | either | Partners |

This mapping originates from the Mike Rhodes PMax script (v94.4) and is the de facto industry standard for decomposing PMax spend.

#### Four-dimensional per-channel read

For every channel that surfaces, evaluate the same four properties:

1. **Cost share** — its slice of total PMax spend, compared to the business-model benchmark.
2. **Conversion contribution** — volume for lead gen, value for eCommerce.
3. **Efficiency** — channel-level CPA or ROAS. Compare channels against each other inside the same campaign, not against external benchmarks; PMax's allocation logic is internal.
4. **Trajectory** — is the channel's share rising, flat, or falling across the last 4–8 weeks?

#### Per-channel profiles

Each channel has its own role, healthy spend share, and failure modes. Treat the ranges as investigation triggers, not optimization targets.

**Shopping (SEARCH + product_data=TRUE).** Revenue engine for retail PMax. Product listing ads driven by the Merchant Center feed.

- Watch: ROAS, conversion value, impression share, click share
- Healthy on eCommerce: 60–80% of PMax spend
- Warning: under 50% with a feed connected — budget is escaping to lower-intent networks
- Critical: under 30% with a healthy, active feed — something is structurally broken

**Search (SEARCH + product_data=FALSE).** Auto-generated text ads built from the asset group's headlines and descriptions.

- Watch: CTR, conversion rate, CPA, search impression share
- Healthy on eCommerce: 10–20%; healthy on lead gen: 30–50%
- Warning: unusually high or unusually low CTR — both signal weak auto-generated copy
- Critical: meaningful spend with zero conversions — landing-page mismatch or audience-signal drift

**Display (CONTENT).** Banner and responsive display placements across the GDN.

- Watch: cost share, view-through vs click-through conversions, placement quality
- Healthy on eCommerce: 5–15%; healthy on lead gen: 20–35%
- Warning: over 25% on eCommerce — PMax is leaking into cheap Display inventory
- Critical: over 30% on any account without an explicit awareness mandate

**YouTube (YOUTUBE).** Video ads (and some companion display) across YouTube placements.

- Watch: view rate, cost per view, assisted-conversion contribution
- Healthy on eCommerce: 2–8%; healthy on lead gen: 15–25%
- Warning: over 15% on eCommerce when no real video assets exist — auto-stitched videos are eating budget
- Critical: high spend on auto-generated videos with no view-through conversions

**Gmail (GMAIL).** Promoted placements inside the Gmail inbox.

- Watch: click-through proxy, conversion contribution
- Healthy: 1–5%
- Warning: above 8% — Gmail rarely carries meaningful conversion volume
- Critical: double-digit share with zero conversions

**Discover (DISCOVER).** Mobile Discover feed, image-driven.

- Watch: CTR, engagement quality, conversion contribution
- Healthy: 1–5%
- Warning: above 10% without strong portrait/lifestyle imagery
- Critical: high spend paired with bounce rates above 80%

**Maps (MAPS).** Local-focused placements inside Google Maps.

- Watch: store visits, direction clicks, location actions
- Healthy for local businesses: 5–15%; for pure eCommerce: near 0%
- Warning: any Maps spend without a connected Google Business Profile
- Critical: material Maps spend on a non-local account

**Partners (SEARCH_PARTNERS).** Search ads on Google's network of partner sites — variable quality.

- Watch: CPA relative to the Search channel, conversion quality
- Healthy: 1–5%
- Warning: Partners CPA more than 2x the Search channel CPA
- Critical: high partner spend with suspicious click patterns or low-quality conversions

#### Red-flag patterns by channel

The thresholds above are summaries. These are the diagnostic patterns to actively hunt for:

- **Shopping:** below 50% on a healthy-feed account → suspect feed quality, listing group structure, or asset group theming. Week-over-week decline with no budget change → feed disapprovals, increased competition, or Google reweighting. High impressions but soft click volume → titles or product images aren't winning the comparison.
- **Search:** over 30% on eCommerce → PMax is generating text ads in place of Shopping placements (almost always a feed problem). CTR under 2% on auto-generated copy → revisit headlines and descriptions. Clicks happening, conversions not → landing-page selection has drifted.
- **Display:** over 25% on eCommerce → the canonical "PMax budget leak" pattern. Over 30% on any account without an awareness mandate → PMax can't find efficient inventory upstream. Large slice of view-through conversions → discount the headline number; look at click-through conversions in isolation.
- **YouTube:** over 15% with no uploaded video → auto-stitched videos underperforming. Spend logged but zero view completions → audience-signal misalignment or unwatchable creative. Cost climbing while conversion lift stays flat → diminishing returns.
- **Gmail:** over 8% share → PMax exhausting better inventory and falling back. Big impression volume, almost no clicks → format isn't a fit.
- **Discover:** over 10% without strong imagery → poor visual matching. Clicks landing then bouncing → creative-to-landing-page mismatch.
- **Maps:** any spend on non-local businesses → mismatch by definition. Maps spend without a GBP link → cannot deliver the actions Maps is for.
- **Partners:** CPA above 2x Search CPA → incremental reach isn't paying for itself. Suspicious CTR or click-volume anomalies → low-quality partner inventory.

---

### Layer 2 — Asset Group Evaluation

Asset groups bundle creative, audience signals, and (for Shopping-eligible PMax) listing groups into a thematic package. They are the most important unit PMax actually lets you control.

#### Three evaluation dimensions

Every asset group is judged on:

1. **Completeness** — how much of Google's recommended creative inventory is present
2. **Quality** — what Google's rating engine thinks of each asset
3. **Coherence** — whether the assets hang together as one campaign idea

#### Completeness scoring

PMax cannot run ads it doesn't have raw material for. Completeness is the floor.

| Asset type | Minimum | Recommended | Score weight |
|---|---|---|---|
| Headlines (30 char) | 3 | 15 | 15% |
| Long headlines (90 char) | 1 | 5 | 10% |
| Descriptions (90 char) | 2 | 5 | 10% |
| Landscape images (1.91:1) | 1 | 15 | 15% |
| Square images (1:1) | 1 | 15 | 10% |
| Portrait images (4:5) | 0 | 5 | 5% |
| Landscape logo (4:1) | 1 | 5 | 5% |
| Square logo (1:1) | 1 | 5 | 5% |
| YouTube videos | 0 | 5 | 15% |
| Call to action | 1 | 1 | 5% |
| Business name | 1 | 1 | 5% |

Scoring formula:

```
for each asset type:
    type_score = min(actual_count / recommended_count, 1) * weight

completeness_score = sum(type_scores) / sum(weights) * 100
```

The cap matters: stuffing 30 headlines into a group does not earn extra credit. The recommended count is the ceiling.

A simpler operational rollup the workflow also uses — weighted by channel impact — is: Images 25%, Headlines 20%, Descriptions 15%, Video 15%, Long Headlines 10%, Logos 10%, Business Name + CTA 5%. A group sitting at 60% under this rollup is missing enough asset types that PMax cannot fully serve on every surface; this is one of the most common reasons Display spend balloons.

Interpreting completeness:

- **90–100:** fully armed; PMax has maximum creative latitude
- **70–89:** strong; closing the remaining gaps is incremental
- **50–69:** real gaps; PMax is constrained in at least one channel
- **Below 50:** so undersupplied that no optimization work makes sense before asset creation

#### Quality ratings

Google labels each asset with one of: **Best, Good, Low, Learning, Pending, Not Applicable**. The rating is relative to other assets in the same group, not an absolute judgment.

| Rating | Meaning | What to do |
|---|---|---|
| Best | Carries the most conversions/engagement | Protect; clone its pattern when adding new assets |
| Good | Solid contributor, not the leader | Keep; monitor for drift |
| Low | Underperforming relative to peers | Replace — stage a replacement first, don't strip and leave a gap |
| Learning | Not enough data to rate | Wait 14 days; if still Learning after 14, the group lacks volume |
| Pending | Just added, not yet scored | Wait 7 days |
| Not applicable | Asset type cannot be rated (logos, business name) | No action |

Distribution reads on a single group:

- **Healthy:** at least 20% Best, fewer than 20% Low
- **Acceptable:** mixed ratings, no obvious cluster of Lows
- **Concerning:** over 30% Low, or under 10% Best
- **Stale:** mostly Goods, no Bests — typically creative fatigue where everything is performing equally mediocrely

#### Theme coherence

The most common failure mode is the catch-all asset group that tries to sell everything to everyone.

- **Sentence test:** write the group's purpose as one declarative sentence. If a second conjunction sneaks in to keep it honest, the group is covering too much ground and needs to be split.
- **Alignment audit:** headlines, descriptions, images, audience signals, and landing pages should all point at the same idea. The classic failure is creative that markets one buyer (deal-driven shoppers) while audience signals tell PMax to find a different one (high-AOV repeat customers). The contradiction is invisible in the UI and corrosive in the auction.
- **Landing-page audit:** final URLs inside a single group should belong to the same content family. Mixing product detail pages with editorial content sends two incompatible signals to PMax's matching engine.

Split a group when:

- Audience splits into clearly different shopper modes (self-purchase vs. gifting)
- Price band is wide enough that messaging can't honestly cover both ends (low-ticket accessories alongside four-figure furniture)
- Group spans more than one conversion event (purchase flow alongside a lead-capture flow)
- Catchment area changes (local-only vs. national)
- Holiday or seasonal SKUs are mixed with the year-round catalog

#### Text asset specifics

**Headlines (30 char):** mix angles — brand, benefit, urgency, social proof, price. At least 3 should contain primary keywords. Blend informational and action-oriented copy. Anything under 20 characters is wasting space. Flag near-duplicates.

**Long headlines (90 char):** each should communicate a distinct value prop. Avoid generic claims; include numbers, brand names, or specific benefits. These surface mostly in Display and Discover — write for scanning, not search intent.

**Descriptions (90 char):** should expand on headlines, not echo them. Balance feature claims with benefit framing. At least one should carry a clear call to action.

#### Image asset specifics

PMax needs three aspect ratios to serve everywhere:

- Landscape 1.91:1 → Display banners, YouTube companion ads
- Square 1:1 → social-style placements, Discover, Gmail
- Portrait 4:5 → mobile-first feeds, Discover

A missing ratio either forces awkward crops or removes the campaign from those placements entirely.

Resolution minimums: 1200×628 landscape, 1200×1200 square, 960×1200 portrait. Content mix target: roughly 40% product shots, 30% lifestyle, 20% brand-forward, 10% promotional. Quality flags: heavy text overlay (Google may downrank), stretched/pixelated images, inconsistent brand styling.

#### Video asset specifics

When no video is uploaded, PMax stitches one out of your images and text. The output is predictably weaker than real video on every axis that matters — engagement is lower, the visual treatment looks stock, anything beyond a simple product flash is impossible to communicate, and PMax still spends YouTube budget against it.

Upload at least one or two real videos. If video production is genuinely off the table, the honest question is whether YouTube allocation belongs in the campaign at all.

Duration mix: ~15s for top-of-funnel or quick product reveal; ~30s for a single-feature highlight or clipped testimonial; 60s+ for narrative, demos, and tutorials. Format coverage: landscape 16:9 (standard YouTube), square 1:1 (mobile feeds and Discover), vertical 9:16 (Shorts).

#### Listing groups (Shopping-eligible campaigns)

For retail PMax, the listing group decides which products are eligible to serve from the asset group.

- **All Products vs. subdivided:** the "All Products" default trades precision for breadth. Breaking the listing group out by category, brand, or custom label is what lets each asset group serve its own subset.
- **Exclusions:** confirm that off-strategy SKUs — thin margin, out-of-stock, not part of this campaign's story — are removed.
- **Group alignment:** the listing group should match the creative narrative above it. If the asset group sells running shoes, the listing group should not be quietly carrying dress shoes alongside them.

#### Brand guidelines

The brand-settings panel feeds auto-generated creative across several channels. Confirm it is actually populated:

- Business name spelled correctly and used consistently
- Logos uploaded in both square and landscape ratios
- Brand colors set (those colors flow into auto-built creative)
- Font selected — drives typography of auto-generated display and video

When this panel is empty, PMax doesn't fail loudly — it substitutes off-brand defaults. One of the easiest quality leaks to miss.

---

### Layer 3 — PMax Search Term Analysis

#### Why PMax search terms break the old playbook

Standard Search campaign analysis runs on a clean chain: keyword → search term → ad → landing page → conversion. Each link is observable and bid-controllable.

PMax cuts that chain in several places at once. Keywords don't exist as a unit of analysis. Search terms report at the campaign level — sometimes asset group level — and never tie back to a specific ad, asset, or bid. The downstream consequences are concrete: no way to know which asset or landing page a query was served against; no per-query bidding; no match types (exact, phrase, broad); no term-level A/B testing.

The analysis isn't useless — its purpose changes. The work stops being about tuning individual terms and starts being about reading patterns across them, then deciding which patterns deserve to be lifted out of PMax entirely.

#### Where the data comes from

- **Search Terms Report (campaign level):** individual queries with clicks, impressions, cost, conversions. Available via API and UI. Low-volume terms are suppressed.
- **`campaign_search_term_insight` resource:** Google-defined category groupings rather than raw terms. Useful for broad query themes. The resource provides category label, category ID, and campaign association; per-term metrics still come from the standard report.
- **Search term insights (UI):** the UI equivalent of the category resource — clusters terms into themes with aggregate metrics.

#### Three anchors that replace keywords

With no keyword to compare against, evaluate each term against:

1. **The asset group's intended theme** — aligned, adjacent (related but not core), or misaligned (targeting leak)
2. **Product feed titles** (Shopping-eligible) — titles act as quasi-keywords; check whether high-volume terms appear in title vocabulary
3. **The actual landing page reached** — does the page content match the query intent?

#### Brand vs. non-brand segmentation

Split every term using a brand-term list that includes:

- The canonical brand name plus common misspellings
- Brand-anchored product phrases (brand + flagship SKU name)
- Short forms, initialisms, in-market nicknames
- For local accounts, brand-and-city phrasings

Interpretation:

- **Brand share > 70%:** PMax is mostly harvesting existing demand. A dedicated brand Search campaign would likely be cheaper.
- **Brand share 30–70%:** balanced. Audit non-brand quality.
- **Brand share < 30%:** PMax is primarily prospecting. Validate non-brand conversion economics.

#### N-gram analysis (higher value than single terms in PMax)

Because PMax suppresses low-volume terms and each individual term carries less data than in Search campaigns, n-grams reveal patterns the term list alone hides.

Procedure:

1. Pull all PMax search terms from the last 4–8 weeks (4 minimum)
2. Split each term into unigrams, bigrams, trigrams
3. Sum clicks, cost, and conversions for each n-gram across every term containing it
4. Sort descending by cost
5. Classify each high-cost n-gram as aligned, adjacent, or misaligned

Volume floors:

- 4-week minimum window for any PMax search term analysis
- 10+ clicks per term before drawing individual-term conclusions
- 20+ clicks per n-gram before treating a pattern as reliable
- 50+ clicks per week as the bar for extraction candidacy

Patterns commonly worth flagging:

- Discount-seeking modifiers (price qualifiers, bargain language, freebie hunts) that spend reliably and convert poorly — usually negative-keyword material
- Rival brand names. Decide deliberately: intentional conquest, or budget bleeding to comparison shoppers?
- Question-form queries that read like research sessions rather than purchases — low conversion intent; often a content-team problem rather than a campaign one
- City, region, or neighborhood-bound terms that quietly map where demand actually lives

#### Extraction decision: when to move a term to dedicated Search

A term or pattern earns extraction when:

**Must extract:**

- 50+ weekly clicks sustained over the last four-plus weeks
- At least three conversions logged during the evaluation window
- CPA volatility wide enough that you genuinely need a per-keyword bid lever
- A purpose-built landing page would outperform whatever PMax routes the click to today
- The right ad copy is a deliberate choice, not whatever the asset shuffler stitches together

**Monitor — not yet extraction-grade:**

- Weekly clicks in the 20–50 band with some converting traffic
- Adjacent-theme terms that would only pay off with copy written specifically for them
- Competitor names where bespoke ad copy is the call

**Leave inside PMax:**

- Anything under 10 clicks per week
- Terms PMax is already handling cleanly (efficient CPA, healthy conversion rate)
- Long-tail queries that benefit from PMax's looser matching behavior

#### Differences from Search campaign term analysis

Five practical adjustments:

- Stretch the analysis window to a four-week minimum (Search would read at one or two)
- Each term carries less volume; lean less on individual rows
- N-grams replace term-by-term review as the unit of analysis
- Supplement the raw term list with the category-level groupings from `campaign_search_term_insight`
- Levers move structurally — asset groups, feed, audience signals — rather than at the term-bid level

---

### Layer 4 — The Product Feed as Targeting (Shopping-Eligible PMax)

For any retail PMax campaign, the Merchant Center feed is the most powerful targeting lever you have. Feed attributes determine which queries match which products, how Shopping ads are built, and how much budget flows into Shopping vs. Display.

**One-line rule:** good feed quality pushes spend into Shopping. Poor feed quality pushes it into Display.

#### How each attribute affects matching

**Title (most important).** Titles function like keywords. Google weights the leading words more heavily, so keyword-first structure applies:

- Weaker: "BrandX Premium Series Wireless Noise-Cancelling Headphones, Over-Ear, Slate"
- Stronger: "Wireless Noise-Cancelling Headphones, Over-Ear, Slate, BrandX Premium Series"

The stronger version leads with the words users search for. Brand drops to the back.

**Description.** Secondary matching signal. Good for longer-tail queries and context. Include natural variations of key product terms; cover use cases and occasions (gifting, seasonal, professional); avoid stuffing.

**GTIN.** Enables exact-product identification. Products with GTINs match on brand+model queries, appear in compare-prices results, and become eligible for more Shopping placements.

**Brand.** Enables brand-query matching. Use the brand string users actually type ("FLIR", not "FLIR Systems, Inc.").

**Product type.** Free-text taxonomy you define. Use a hierarchy ("Home > Bedding > Throw Blankets > Cotton"); map to how users think, not how the warehouse is organized; depth gives Google more matching signal.

**Google product category.** Google's predefined taxonomy. Required in many markets. Pick the most specific applicable node.

**Custom labels (0–4).** These don't influence matching — they influence segmentation. Conventional assignments:

- Label 0 → margin tier (high / medium / low)
- Label 1 → seasonality (evergreen / Q4 / summer / back-to-school)
- Label 2 → product lifecycle (new / best seller / clearance)
- Label 3 → price range (under $25 / $25–75 / $75–150 / $150+)

#### Attribute priority for optimization

| Attribute | Matching impact | Priority |
|---|---|---|
| Title | Critical — primary signal | Must optimize |
| GTIN | High — enables exact-product matching | Must include when available |
| Brand | High — enables brand queries | Must include |
| Product type | Medium — drives categorization | Should include with depth |
| Google product category | Medium — required in many markets | Should include at the most specific level |
| Description | Medium — secondary signal | Should optimize |
| Custom labels | None for matching, high for segmentation | Should use to structure campaigns |
| Color / size / material / pattern | Low-medium — enables filtered Shopping | Include where applicable |

#### Supplemental feeds

A supplemental feed sits on top of the primary feed and adds or overrides attributes without anyone touching the CMS export. Common reasons to reach for one:

1. **Title rewrites** — replace CMS output with keyword-first phrasing the agency controls
2. **Custom-label tagging** — apply margin, seasonality, or lifecycle labels from a merchandising sheet
3. **Filling gaps** — backfill GTINs, product types, or descriptions missing from the primary feed
4. **Controlled tests** — change titles or descriptions on a slice of the catalog to measure lift

Implementation notes: the join key back to the primary feed is the item `id`; supplemental feeds can introduce or overwrite attributes but cannot create new SKUs; a shared Google Sheet is usually the path of least resistance.

#### Feed quality → channel allocation

| Feed signal | Shopping impact | What goes wrong when this is poor |
|---|---|---|
| Title relevance | Drives query-match precision | PMax shifts to Display (visual matching, no text precision needed) |
| Image quality | Affects Shopping CTR and quality | Lower Shopping impression share, more Display |
| GTIN coverage | Enables competitive benchmarking | Reduced Shopping eligibility on product queries |
| Attribute completeness | Enables filtered Shopping results | Excluded from filtered searches |
| Feed freshness | Affects availability accuracy | Disapproved products, shrinking Shopping inventory |
| Price competitiveness | Affects Shopping auction ranking | Lower impression share; PMax reallocates |

#### Title testing methodology

Because titles are the dominant matching signal, systematic title testing is the highest-ROI feed work.

1. **Baseline.** Capture pre-test numbers on the SKUs you'll touch: Shopping-channel cost share, conversion rate, ROAS.
2. **Segment.** Carve out a 20–50 SKU test cohort — large enough to read, small enough to keep the rest as a clean control.
3. **Change.** Ship keyword-first titles through a supplemental feed; leave the primary feed alone.
4. **Wait.** Give PMax 2–4 weeks to re-train before reading.
5. **Measure.** Compare test vs. control on the same three metrics.

What should happen when titles are actually better: Shopping cost share climbs as reworded products start winning more product-listing auctions, that share comes out of Display, CTR moves up because the title sits closer to what the user typed, conversion rate improves, and CPC may tick up too (not a regression — the product is competing in auctions the old title couldn't reach).

Retitling resets some of what PMax has learned about a product. Expect the first 1–2 weeks to be noisy. Don't read the test mid-flight.

---

### Layer 5 — Channel Distribution Benchmarks by Business Model

These ranges are directional — investigation triggers, not targets to optimize toward. Actual distribution depends on assets supplied, audience signals configured, feed quality, bid strategy, competitive landscape, and seasonality.

#### eCommerce (DTC / Retail)

| Channel | Healthy range | Out-of-range read |
|---|---|---|
| Shopping | 60–80% | Below 50%: feed quality or asset group misconfiguration |
| Search | 10–20% | Above 30%: PMax over-generating text ads — investigate feed |
| Display | 5–15% | Above 25%: classic budget leak to cheap inventory |
| YouTube | 2–8% | Above 15%: check if auto-generated videos are eating budget |
| Gmail | 0–3% | Above 5%: unlikely conversion path |
| Discover | 0–3% | Above 5%: check image asset quality and landing page fit |
| Maps | 0–1% | Any meaningful spend: not a fit for pure eCommerce |
| Partners | 0–3% | Above 5%: compare CPA against Search channel |

#### Lead Generation (B2B, Services, Education)

| Channel | Healthy range | Out-of-range read |
|---|---|---|
| Search | 30–50% | Below 20%: PMax not capturing high-intent queries |
| Display | 20–35% | Above 40%: check conversion quality (view-through inflation) |
| YouTube | 15–25% | Above 30% without uploaded video: auto-generated waste |
| Gmail | 2–5% | Above 8%: low conversion probability |
| Discover | 2–5% | Above 10%: check image asset relevance |
| Maps | 0–5% | Above 10% for non-local: mismatch |
| Partners | 1–5% | Above 8%: audit conversion quality from partner sites |
| Shopping | 0% | Any spend: no product feed should be connected |

#### Local Business (Retail, Services, Restaurants)

| Channel | Healthy range | Out-of-range read |
|---|---|---|
| Search | 25–40% | Below 15%: PMax missing local intent queries |
| Display | 15–25% | Above 35%: excessive awareness spend |
| Maps | 10–20% | Below 10%: check GBP linking and profile completeness |
| YouTube | 5–15% | Above 25% without video: auto-generated waste |
| Gmail + Discover + Partners (combined) | 5–15% | Above 20%: low local conversion probability, audit placements |
| Shopping | 0–15% | Present only if a local inventory feed is connected |

> When a local account has GBP connected, Maps below 10% is itself a flag — check GBP link, location assets, profile completeness.

#### Hybrid accounts (eCommerce + Lead Gen)

- 70%+ of conversions are eCommerce → use eCommerce benchmarks
- 70%+ of conversions are leads → use lead-gen benchmarks
- Roughly evenly split → use midpoint ranges and evaluate each campaign individually

#### Seasonal patterns

Before flagging a distribution as problematic, check whether the calendar explains it.

- **eCommerce in Q4:** Shopping share rises 5–10 pts; Display compresses; Search may tick up on gift queries.
- **Local in summer:** Maps rises 3–5 pts (travel, outdoor); Display may rise on seasonal-service awareness; Search roughly flat or compressed.
- **B2B across the year:** Q1 budget-flush — Search peaks, Display compresses; Q2–Q3 stable; Q4 — some advertisers pull back, reduced competition can improve efficiency.

#### Reading distribution trajectory over time

Track distribution weekly. Movement means something.

- **Sudden shift (>10 pts in one channel within a week):** feed issue (Shopping drops first), asset change (new video lifts YouTube), competitive shift (lost auction position), budget change (increases expand marginal channels first).
- **Gradual drift (5–10 pts over 4+ weeks):** PMax learning toward better-performing channels (healthy), creative fatigue in one channel, market or seasonal shift, slow feed degradation.
- **Static distribution over 8+ weeks:** PMax has stabilized — fine if performance is healthy. If results are weak and distribution refuses to budge, the optimizer has settled into a corner of the search space it cannot exit on its own. The unlock is structural — reshape asset groups, swap in new audience signals, give PMax a different problem to solve.

#### Asset gaps → allocation consequences

| Missing input | Channel consequence |
|---|---|
| No video assets | YouTube allocation near zero, or auto-generated only |
| No product feed | Shopping allocation = 0; Display and Search absorb the budget |
| No landscape images | Display reduced, more text-based placements |
| No portrait images | Discover and mobile placements reduced |
| No audience signals | Distribution skews toward cheaper inventory (Display) |
| Single asset group | Cannot differentiate allocation by theme or product |

---

### What to Do When the Distribution Is Wrong

You cannot tell PMax which channels to use. Every adjustment is indirect. Work the levers in this order:

1. **Investigate before reacting.** Misalignment has multiple possible causes — don't yank levers blind.
2. **Assets first.** Missing or low-quality assets are the most common cause of misallocation.
3. **Feed second.** For eCommerce, feed quality is the dominant Shopping-channel driver.
4. **Audience signals third.** Thin or absent signals push the algorithm toward the widest, cheapest pool of inventory.
5. **Bid strategy last.** Tighter target funnels budget into channels PMax already finds efficient. Looser target fans spend across the surface area.

#### The full lever set for channel misalignment

- **Asset group restructuring** — split broad groups into tighter themes; give each a clear product or audience focus; eliminate catch-all groups.
- **Audience signal adjustment** — strengthen signals to guide PMax toward higher-intent inventory; add first-party data; refine custom segments.
- **URL exclusions** — exclude irrelevant URLs from final-URL expansion; limit landing pages to high-converting ones; consider "Use URLs from your final URL only" when appropriate.
- **Feed quality** — keyword-first titles, fill missing attributes (GTIN, brand, product type), better images, supplemental feed data.
- **Asset type additions or removals** — adding video raises YouTube allocation; removing images lowers Display and Discover; adding a feed unlocks Shopping. You cannot directly suppress a channel, but asset availability controls allocation.
- **Bid strategy** — raising tROAS pulls budget into the most efficient channels (usually Shopping and Search). Lowering tROAS opens room for Display and YouTube. Moving between Maximize Conversions and tROAS reshapes the internal channel ranking entirely.

#### How channels interact

Inputs cascade. The common cascades:

- **Better feed → more Shopping.** Improved titles and images pull spend from Display and YouTube into Shopping. The single highest-leverage change for eCommerce PMax.
- **Real video uploaded → YouTube grows.** PMax may shift from Display into YouTube on similar reach with better engagement.
- **Tighter audience signals → more Search and Shopping.** Higher intent gets more share; Display and YouTube compress.
- **URL expansion restricted → Shopping and Search concentrate.** Limiting target pages reduces PMax's surface area.
- **Budget increased → marginal channels expand first.** High-performing channels are often at the point where extra dollars wouldn't earn their keep. Fresh budget tends to flow into the tail — Gmail, Discover, Partners — before showing up anywhere else. After every budget move, re-pull the channel mix.

---

### When PMax Should Not Run Alone

PMax is rarely the right standalone answer. Pair it with dedicated campaigns when:

- **Brand protection** — dedicated brand Search gives bid control PMax can't
- **High-value non-brand terms** — proven converters deserve keyword-level bids
- **Specific match-type needs** — exact for high-CPA terms, broad for discovery
- **Landing page control** — PMax auto-selects; dedicated campaigns let you choose
- **Budget guarantees** — when specific products or services need a minimum spend floor
- **Reporting granularity** — when stakeholders require keyword-level attribution PMax cannot supply

---

## Part II — The Workflow

The workflow is opinionated about sequencing. Each phase produces findings the next phase relies on, so do not rearrange or merge them. Each phase ends in a synchronization point where you stop and confirm before moving on — this is what prevents the workflow from generating twenty pages of analysis on top of bad data or the wrong scope.

### Required Skills to Load First

Before any data work, pull in the companion skill:

- **`pancake_account_foundations`** — account roster, brand-term lexicon, KPI targets, business-model classification, campaign naming patterns, and the maturity tier (Nascent, Developing, Established, Advanced) used to set analysis depth. If this isn't configured, route the user there first.

The framework above (Part I) is the analytical reference; the workflow below applies it.

---

### Phase 0 — Scoping the Run

Establish what you're looking at before you query anything.

1. Pull the account config from `pancake_account_foundations`.
2. Identify every PMax campaign on the account. Filter: `campaign.advertising_channel_type = 'PERFORMANCE_MAX'`.
3. Negotiate scope with the user:
   - All PMax campaigns or specific ones?
   - Analysis window — default to trailing 30 days; comparison window — the 30 before that.
   - Any presenting concern that should set priority ("ROAS dropped two weeks ago", "I think Display is eating us")?
4. Read the maturity tier from account config — this gates which queries you bother running and how deep each step goes.

#### Checkpoint C1 — Confirm Scope

Show the user a compact context block:

- Account name, customer ID, maturity tier
- Number of PMax campaigns found and their names
- Analysis window and comparison window
- Business model (eCommerce, lead-gen, marketplace), primary KPI (CPA or ROAS), target value
- Whether campaigns are Shopping-eligible (i.e., have a product feed attached)

Ask: "Does this scope look right? Anything specific to prioritize?"

**For the first five runs,** also expand on what the analysis covers — PMax allocates spend across eight surfaces automatically, and the workflow's job is to make that allocation visible, judge whether the asset side gives PMax the raw material it needs to compete on each surface, mine queries for waste and high-intent extraction opportunities, and (if there's a feed) split products into tiers.

---

### Phase 1 — Pulling the Data

GAQL queries are the preferred source. CSV exports from the UI or pasted data are accepted as fallbacks; normalize columns into the canonical names listed at the end of this document.

#### Queries that run on every account

1. **Campaign-level network segments** — the eight-channel decomposition query. Segments by `ad_network_type` and `ad_using_product_data`. Returns cost, conversions, conversion value, impressions, clicks. Run twice — analysis window and comparison window.
2. **Asset group performance** — cost, conversions, conversion value, impressions, clicks rolled up to each asset group.
3. **Asset group asset inventory** — count and quality rating of each asset inside each asset group.

#### Queries that activate at Developing+ maturity

4. **PMax search-term insights** — category insights, and individual terms via `search_term_view` when available.
5. **Date-segmented network data** — adds `segments.date` to the eight-channel query for weekly trend views.

#### Queries that activate at Established+ maturity

6. **Listing-group / product performance** — only if a feed is attached.
7. **Placement performance** — top placements by cost.
8. **Geographic performance** — segmented by location.

#### Notes on the queries

- `cost_micros` always divides by 1,000,000.
- The asset details query does not accept a date range — it returns current state.
- `field_type` values you'll see: HEADLINE, LONG_HEADLINE, DESCRIPTION, BUSINESS_NAME, MARKETING_IMAGE, SQUARE_MARKETING_IMAGE, PORTRAIT_MARKETING_IMAGE, LOGO, LANDSCAPE_LOGO, YOUTUBE_VIDEO, CALL_TO_ACTION_SELECTION.
- `performance_label` values: BEST, GOOD, LOW, LEARNING, PENDING, NOT_APPLICABLE.
- `campaign_search_term_insight` only exposes category-level insight. For per-query data on PMax, query `search_term_view` filtered to PMax campaigns — expect Google to surface only a subset.
- Daily noise inside PMax is high. Aggregate to weekly before drawing trend conclusions.

#### Example GAQL — eight-channel decomposition

```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.bidding_strategy_type,
  segments.ad_network_type,
  segments.ad_using_product_data,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.impressions,
  metrics.clicks,
  metrics.all_conversions,
  metrics.all_conversions_value
FROM campaign
WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
  AND campaign.status != 'REMOVED'
  AND segments.date BETWEEN '{start}' AND '{end}'
```

A simpler date-windowed variant uses `segments.date DURING LAST_30_DAYS`. Add `AND campaign.status = 'ENABLED'` to drop paused campaigns. Add `segments.date` to `SELECT` for week-over-week trend tables.

#### Example GAQL — asset group inventory

```sql
SELECT
  asset_group.id,
  asset_group.name,
  asset_group_asset.asset,
  asset_group_asset.field_type,
  asset_group_asset.performance_label,
  asset_group_asset.status,
  asset.type,
  asset.text_asset.text,
  asset.image_asset.full_size.url,
  asset.youtube_video_asset.youtube_video_id
FROM asset_group_asset
WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
  AND campaign.status != 'REMOVED'
```

#### Example GAQL — placements

```sql
SELECT
  group_placement_view.display_name,
  group_placement_view.placement,
  group_placement_view.target_url,
  group_placement_view.placement_type,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.conversions_value
FROM group_placement_view
WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
  AND segments.date BETWEEN '{start}' AND '{end}'
ORDER BY metrics.cost_micros DESC
LIMIT 100
```

#### If you only have UI exports

Most of this is available in the UI:

- Channel split: open the campaign → Segments → Network (with search partners)
- Asset groups: download from the Asset groups tab
- Search terms: Insights → Search terms
- Placements: Content → Where ads showed
- Products: the Products tab inside the PMax campaign (only present when Shopping-eligible)

#### Checkpoint C2 — Data Inventory

Report what was loaded and what is missing. Tie missing data to which analytical steps it disables. Ask whether to proceed with what's available or fill the gaps first.

**For the first five runs,** also explain which queries are required at each maturity tier and what each unlocks downstream.

---

### Phase 2 — Decomposing PMax Across the Eight Surfaces

PMax doesn't give a clean channel report by default. Construct one from `ad_network_type` and `ad_using_product_data` using the mapping in Layer 1.

#### Steps

1. Map each network query row into one of: Shopping, Search, Display, YouTube, Gmail, Discover, Maps, Partners.
2. Aggregate cost, impressions, clicks, conversions, and conversion value per channel.
3. Derive per channel: cost share of total PMax spend, CPA, ROAS, CTR, conversion rate.
4. If you have the comparison window, calculate percent change on each metric.
5. Compare each channel's actual cost share against the business-model benchmarks from Layer 5. Tag each channel as Healthy, Warning, or Critical.

#### Output

A single eight-row markdown table — one row per surface — with columns for cost, cost share, clicks, conversions, CPA or ROAS (whichever matches the account's KPI), trend vs. prior window, and the Healthy/Warning/Critical verdict. Totals row at the bottom.

#### Checkpoint — Channel Decomposition

Present the table. Surface any results that surprise you. Confirm whether a specific channel deserves deeper investigation before moving on.

---

### Phase 3 — Asset Group Audit

Walk each asset group one at a time. For each, answer: does PMax have the raw material to compete on every surface, and is the theme tight enough that Google's matching can do its job?

#### Per asset group

1. **Inventory by type** — count each asset type and compare to minimums and recommended counts from Layer 2.
2. **Completeness score (0–100)** — the weighted composite (see Layer 2 for the formula and weights).
3. **Quality distribution** — what percentage sit at Best, Good, Low, Learning, Pending. Flag any group where more than 30% of assets are rated Low.
4. **Theme coherence** — does the group point at a single, identifiable product or service line? Catch-all groups are red-flagged.
5. **Listing-group structure** — if Shopping-eligible, confirm products are segmented sensibly.
6. **Brand assets** — business name, logos, brand colors and fonts must all be configured.

#### Output

A summary table with one row per asset group covering completeness score, quality distribution, theme verdict (Focused / Broad / Misaligned), and the single highest-impact improvement.

#### Checkpoint C3a — Asset Audit Findings

Tell the user:

- Average completeness across asset groups, plus the worst offender and why
- Aggregate quality mix, and any groups where more than 30% of assets are Low-rated
- Any catch-all groups that need to be split
- The single most impactful missing asset type — for example: "three of four asset groups have no uploaded video, so PMax is auto-generating videos and spending on YouTube with them."

Ask whether the assessment lands before proceeding.

**For the first five runs,** explain the completeness scoring weights explicitly so the user understands why a 60% score is meaningful.

---

### Phase 4 — Search Term Investigation

PMax exposes less search-term data than Search campaigns, but what it does expose is enough to find waste and to spot queries paying for their own dedicated Search campaign.

#### Steps

1. Pull search terms for at least a four-week window — anything shorter is too noisy.
2. Apply brand vs non-brand segmentation using the brand-term list from `pancake_account_foundations`. Calculate the cost split and conversion split.
3. Run an n-gram pass: tokenize each term into unigrams, bigrams, and trigrams; aggregate cost, clicks, and conversions per n-gram; sort by cost descending.
4. Flag any n-gram with high cost and zero conversions.
5. Flag any n-gram that's misaligned — not matching either the asset group themes or the product feed.
6. Identify extraction candidates: terms pulling 50+ clicks per week with proven conversion history. These are paying their own way; dedicated landing pages, custom ad copy, or specific bid control could outperform PMax's auto-generated treatment.

#### Output

- Brand vs non-brand split table (cost, cost share, conversions, conversion share, CPA, ROAS per side)
- Top 20 n-grams by cost, each labeled Aligned, Adjacent, or Misaligned
- Extraction-candidates table with rationale for each (bid control, dedicated LP, ad copy)
- Negative-keyword candidates table for misaligned high-spend terms, with recommended match type
- CSV block at the end with both lists in import-ready format

#### Checkpoint C3b — Search Term Findings

Report the brand/non-brand split, whether brand cannibalization is visible, the count and top-three extraction candidates, the count and top-three negative-keyword candidates, and the most significant n-gram pattern found.

Confirm before moving on — extraction and negatives are strategic decisions, not mechanical ones.

**For the first five runs,** walk through the extraction logic: the 50-clicks-per-week threshold combined with proven conversions separates "PMax should keep handling this" from "this term deserves a dedicated Search campaign."

---

### Phase 5 — Product Performance (Skip if No Feed)

If no product feed is attached, jump past this phase. Otherwise classify every product into one of four behavioral tiers:

- **Heroes** — high spend, high conversions, strong ROAS. PMax is correctly leaning into these. Protection strategy: don't let the next round of feed changes or asset shuffles disrupt them.
- **Sidekicks** — moderate spend, moderate conversions, acceptable ROAS. Solid contributors, not the engine.
- **Zombies** — little or no spend, few impressions. PMax has decided not to serve them. Diagnose *why*: feed quality, listing-group exclusion, weak titles, low underlying search volume, price out of market.
- **Villains** — high spend, low or zero conversions, poor ROAS. Actively losing money. Investigate price competitiveness, feed attribute quality, competitive pressure, landing-page experience. The right action is often to fix the feed or exclude from PMax and re-test inside a dedicated Shopping campaign with tighter bid control.

#### Output

A tier-distribution summary (count and cost share per tier), then detailed lists: Heroes (protect), Villains (fix or exclude with root-cause notes), and a Zombies summary with batch-fix recommendations.

---

### Phase 6 — Placement Sanity Check

Pull the top placements by cost. You're looking for cheap inventory silently absorbing budget without converting.

#### Flag

- Any single placement consuming more than 2% of total PMax spend with zero conversions
- Mobile-app placements with suspicious click patterns — accidental clicks from gaming apps are a recurring offender
- Placements on sites obviously irrelevant to the business or low-quality

Also calculate the share of Display spend flowing to identifiable, brand-safe sites vs. unknown placements.

#### Output

A top-20 placements table with cost, clicks, conversions, and a quality verdict. For each flagged placement, recommend a specific action (URL exclusion, app category exclusion, etc.).

---

### Phase 7 — Synthesis Against Benchmarks

Weave the previous phases together. Compare actual channel distribution to the business-model benchmarks and explain *why* PMax has the distribution it has.

For each channel outside its healthy range, identify the most likely cause using Layer 5's "asset gaps → allocation consequences" table and the broader lever set:

- Asset gaps — missing video drives spend away from YouTube and into Display
- Feed quality — weak titles or missing attributes reduce Shopping competitiveness
- Audience signal weakness — thin or wrong signals push PMax toward broader inventory
- Bid strategy — a target ROAS set too low invites cheap Display clicks

Cross-reference findings from the asset audit (Phase 3) and search-term analysis (Phase 4). Prioritize recommendations by expected impact.

#### Checkpoint C4 — Recommendations

Present the top three to five prioritized recommendations with expected impact. Explicitly cross-reference: show how asset gaps in Phase 3 caused the channel skew in Phase 2, how search-term findings reinforce or modify the picture, and where product-level findings fit.

Confirm before producing final deliverables.

**For the first five runs,** model the cross-step reasoning out loud. For example: "The elevated Display spend in Phase 2 traces back to the empty video slots flagged in Phase 3. With no video inventory, YouTube placement is off the table, and that budget gets reallocated into Display — which is precisely why the benchmark comparison shows YouTube under-indexed and Display over-indexed at the same time."

---

### Phase 8 — Deliverables

The workflow produces five outputs. Each is built to be readable on its own.

#### 1. Channel Breakdown Report

Markdown document. Opens with the eight-row summary table (Channel, Cost, Cost Share, Clicks, Conversions, CPA/ROAS, vs Prior, Assessment) plus totals row. Then a per-channel write-up for every channel marked Warning or Critical: what the data shows, why it matters in business terms, recommended action, expected outcome. Closes with a benchmark-comparison table showing actual vs. healthy-range variance.

#### 2. Asset Audit Report

Markdown document with one section per asset group. Each section includes completeness score, quality summary (counts of Best/Good/Low/Learning), theme verdict, an asset-inventory table (counts vs. recommended counts for Headlines, Long Headlines, Descriptions, Landscape Images, Square Images, Portrait Images, Landscape Logos, Square Logos, YouTube Videos), and a prioritized list of improvement actions. Ends with a cross-group summary table.

#### 3. Search Term Analysis

Markdown plus CSVs:

- Brand vs non-brand split table
- Top 20 n-grams by cost with classification — flag any with zero conversions and cost above 2x target CPA
- Extraction candidates table with weekly clicks, conversions, current CPA, rationale
- Negative-keyword candidates with recommended match type
- Import-ready CSV block

#### 4. Product Performance Report (Shopping-eligible only)

Markdown document. Tier summary table, top-ten Hero list with protect/scale recommendations, full Villain list with root-cause notes and fix-or-exclude actions, Zombies summary with batch recommendations.

#### 5. Summary Dashboard

Single-page markdown overview. Account name, period, campaigns analyzed, maturity tier, a one-rating health score, a 2–3 sentence executive summary, a compact channel distribution view, the top three findings (each with concrete numbers), the top three prioritized actions (with expected impact and implementation complexity), follow-up recommendations.

#### Health rating scale

- **Strong** — all eight channels inside healthy ranges, asset completeness above 80%, no critical red flags
- **Moderate** — one or two channels outside healthy ranges, asset completeness 60–80%, minor optimization opportunities
- **Needs Attention** — three or more channels outside ranges, or asset completeness under 60%, or visible budget leakage
- **Critical** — structural problems. Examples: eCommerce account with Shopping below 30%, any account with Display above 40%, or a campaign with no video assets at all combined with significant YouTube spend

#### Checkpoint C5 — Output Delivery

Tell the user which deliverables were produced, the overall health verdict, the top three actions with projected impact, and how to actually use each deliverable. Confirm before closing.

**For the first five runs,** walk through each file and explain how to act on it.

---

## Maturity Calibration

The maturity tier read at Phase 0 determines what actually runs. (Formal maturity definitions live in `pancake_account_foundations`.)

### Nascent — under 30 conversions per month

Run Phase 0, Phase 1 (required queries only), Phase 3 with a completeness focus, and Phase 8 producing only the Asset Audit and Summary Dashboard. Skip the eight-channel breakdown (volume is too thin for the segments to mean anything), search terms, product tiering, and placement review. The goal at this tier is to get asset completeness above 70% before performance analysis is meaningful. Confirm the feed is connected and healthy if eCommerce. Do not over-interpret channel distribution — there isn't enough signal.

### Developing — 30 to 100 conversions per month

Run Phases 0 through 3 in full, plus Phase 4 limited to the brand vs non-brand split (skip the n-gram pass). Produce Channel Breakdown, Asset Audit, and Summary Dashboard. Begin pattern-level search term review. Evaluate asset quality ratings. Channel decomposition flags only major distribution red flags. Two-pronged objective: close the largest channel-mix problem on the table, and keep filling asset gaps until inventory reaches recommended counts.

### Established — 100 to 500 conversions per month

Run all eight phases at full depth: full channel decomposition with trend analysis, full asset evaluation, full n-gram search term analysis, product tiering, placement quality review. The framing shifts to optimization. Questions to answer in order: which channels are returning their spend, which are bleeding it, which queries inside PMax have outgrown the campaign and should move into their own structure.

### Advanced — 500+ conversions per month

Run everything in Established, then add:

- Marginal efficiency reads on each channel — at current spend levels, is the next dollar still earning a return?
- Overlap analysis between PMax and any dedicated Search campaigns, with query-level cannibalization quantified
- Incrementality testing (geo holdouts, conversion lift) on the channels absorbing the most budget
- Structured A/B tests on individual feed attributes (titles, descriptions, custom labels), one variable at a time
- Ongoing tuning of custom audience signals attached to each asset group

Framing question at this tier is precision: every channel, every asset group, every feed attribute is a place efficiency could still be tightened.

---

## Checkpoint Summary

| ID | Where | What it confirms |
|---|---|---|
| C1 | End of Phase 0 | Scope, campaigns, period, KPI, maturity |
| C2 | End of Phase 1 | Which data is loaded and which is missing |
| (after Phase 2) | Eight-channel decomposition table | Channel-level surprises, where to dig deeper |
| C3a | End of Phase 3 | Asset completeness and theme findings |
| C3b | End of Phase 4 | Brand/non-brand split, extraction and negative candidates |
| C4 | End of Phase 7 | Top-three-to-five prioritized recommendations |
| C5 | End of Phase 8 | Files produced, top actions, how to use them |

Skipping a checkpoint loses the ability to catch bad data or a misaligned scope before it propagates through the rest of the analysis.

---

## Diagnostic Playbooks

Quick paths when the user shows up with a specific symptom.

### "Why is PMax spending on Display instead of Shopping?"

1. Check feed quality — titles, images, attribute completeness.
2. Check listing-group structure — are the right products even eligible?
3. Look at asset group themes — too broad and Google routes to broad inventory.
4. Inspect the bid strategy — a target ROAS that's too lax invites cheap Display clicks.

### "PMax conversions dropped overnight."

1. Check for feed errors and product disapprovals.
2. Check for asset disapprovals.
3. Look for budget changes.
4. Check auction insights for competitor moves.
5. Look at landing-page health — speed, availability, recent deploys.

### "ROAS has been drifting down for weeks."

1. Is Display's share of spend creeping up?
2. Is non-brand share shifting toward lower-intent terms?
3. Is the Villain tier of products growing?
4. Are Best-rated assets aging out without replacements?
5. Has impression share been changing — are competitors increasing pressure?

### "Should we even be running PMax instead of Standard Shopping?"

1. Compare PMax's Shopping-channel ROAS to a Standard Shopping benchmark.
2. Check whether PMax is reaching incremental queries Standard Shopping would miss.
3. Evaluate the non-Shopping channels on their own merits — are they adding value or absorbing budget without return?
4. Recommend a structured test: run both at once with non-overlapping product sets and compare.

---

## Data Source Fallbacks and Normalization

When data does not come through the API:

### CSV / paste column normalization

| Canonical name | Common variants seen in exports |
|---|---|
| cost | Cost, Spend, Amount spent, cost_micros (divide by 1,000,000) |
| conversions | Conversions, Conv., All conv. |
| conversion_value | Conv. value, Conversion value, Revenue |
| impressions | Impr., Impressions |
| clicks | Clicks |
| ctr | CTR, Click-through rate |
| network_type | Network, Network (with search partners), ad_network_type |
| product_data | Not present in UI exports — infer from network-segment naming |

### Minimum column sets for pasted data

- Channel breakdown: `campaign_name, network_type, product_data, cost, impressions, clicks, conversions, conversion_value`
- Asset group: `asset_group_name, campaign_name, cost, impressions, clicks, conversions, conversion_value`
- Search terms: `search_term, campaign_name, impressions, clicks, cost, conversions, conversion_value`
