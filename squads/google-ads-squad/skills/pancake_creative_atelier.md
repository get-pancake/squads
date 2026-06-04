---
name: pancake_creative_atelier
description: End-to-end workshop for the creative and landing experience layer of a Google Ads account. Carries the analytical framework (intent–copy–page triangle, ABCD video model, headline diversity rubric, PMax completeness scoring, fatigue mechanics, frequency benchmarks), runs the audit workflows for RSAs, Performance Max asset groups, and video creative, and evaluates landing pages on three-dimension alignment against keywords, search terms, and ad copy. Produces creative scorecards, refresh lists, test plans, and landing-page alignment and Quality-Score-experience reports. Use when auditing ad creative, evaluating RSA performance, reviewing PMax assets, scoring videos against ABCD, detecting creative fatigue, planning creative tests, auditing landing pages, checking keyword-to-page alignment, or diagnosing low Quality Score landing page experience.
triggers:
  - "audit creative"
  - "creative audit"
  - "ad creative review"
  - "rsa audit"
  - "asset review"
  - "creative fatigue"
  - "ad copy review"
  - "creative testing plan"
  - "creative methodology"
  - "creative evaluation framework"
  - "ad creative framework"
  - "rsa methodology"
  - "analyze landing pages"
  - "landing page audit"
  - "landing page quality"
  - "quality score landing page"
  - "keyword landing page alignment"
  - "page content analysis"
  - "landing page review"
---

# Creative & Landing Experience Atelier

This skill is the workshop for everything an ad shows the user — the copy, the pictures, the video, and the page they land on once they click. It bundles three things into a single coherent body of work:

1. The analytical framework that defines what "good" looks like across every Google Ads creative surface.
2. The audit procedure that walks an account's RSAs, Performance Max asset groups, and video creative, scores them, flags fatigue, and queues tests.
3. The landing-page evaluation that scores each page against the keywords, search terms, and ads pointing at it, and reads Google's own `landing_page_experience` signal.

Creative quality and landing quality are inseparable. A perfect ad pointing at a misaligned page wastes spend; an excellent page starved of intent-matching copy never gets the traffic it could convert. The two halves are run together so the diagnosis is whole.

## Dependencies and adjacent skills

Before any audit runs, pull in three companion modules:

- `pancake_account_foundations` — the account's CID, name, naming patterns, brand vocabulary, business model, KPI targets, data-source tier (Tier 1 = Google Ads API), and maturity stage, plus the nascent / developing / established / advanced definitions used to scale how deep the audit goes. If this is missing, halt and tell the user to run that skill first — there is no sensible way to scope creative or landing work without it.
- `pancake_query_intelligence` — alignment scores from Part III feed its three-way cross-reference (search term × landing page) in Check 3.
- `pancake_root_cause_lab` — invokes the landing-page workflow from diagnostic Branch 5, and its gray-area decision tree calls the landing-page workflow at Step 3.

**Teaching mode.** The first five runs of this skill expand every checkpoint with extended teaching commentary — methodology explanations, how scores were arrived at, how to use each report. After five runs the checkpoints tighten to a confirmation style. The user can reopen the verbose mode at any time by asking "explain your reasoning."

---

# Part I — The Framework

This section is the analytical backbone. Everything in Parts II, III, and IV is grounded here. Treat it as the rules-of-the-game reference: thresholds, rubrics, and structural models the audits apply.

## I.1 The Intent–Copy–Page Triangle

Three things must agree for a paid search experience to perform: the searcher's intent, the ad copy, and the landing page.

```
     Keyword Intent
         /    \
        /      \
    Ad Copy ---- Landing Page
```

Three pairwise checks pin down whether the triangle holds:

1. **Intent ↔ Copy.** A pricing query should hit pricing-related headlines.
2. **Copy ↔ Page.** If the headline promises a free trial, the trial offer must be visible on the page.
3. **Intent ↔ Page.** The page content must match the keyword theme. This is the Quality Score relevance dimension.

Misalignment manifests as low Quality Score, inflated CPCs, low conversion rate, and wasted spend on clicks that never convert. The audit phases in this document each interrogate one or more sides of the triangle.

## I.2 Responsive Search Ad evaluation

### Asset performance labels

Google attaches a relative label to each headline and description after impressions accumulate. The labels compare assets to each other *within the same RSA* — a "Best" headline in a weak ad isn't necessarily strong creative in absolute terms.

| Label | Interpretation | Action |
|---|---|---|
| Best | Top performer for its serving position | Preserve; treat as the benchmark |
| Good | Solid relative performance | Keep; watch for drift |
| Low | Lagging the rest of the pool | Replace with a fresh angle |
| Learning | Insufficient data yet | Wait for more impressions |
| Pending | System hasn't begun evaluating | Wait; recently added or unserved |
| Not applicable | Cannot be scored in current context | Investigate — usually a pin or eligibility issue |

### Ad Strength

Google grades each RSA on a four-tier scale (Excellent / Good / Average / Poor) based on asset quantity, message diversity, and keyword relevance. What it captures: number of unique headlines and descriptions, real diversity (not synonym swaps), keyword relevance, and whether popular keyword themes show up in headlines. What it does *not* capture: actual CTR, conversion rate or quality, landing page experience, competitive context.

Operating rule: never let a Poor-rated RSA serve — the asset pool is too thin to optimize against. Don't chase Excellent as if it guarantees results; Google's own data shows weak correlation between Ad Strength and real outcomes. Use it diagnostically to surface missing categories or repetitive copy, then judge real performance from CTR and conversion data.

### Asset quantity

| Asset | Minimum | Recommended | Maximum |
|---|---|---|---|
| Headlines | 8 | 15 | 15 |
| Descriptions | 2 | 4 | 4 |

The math: 15 headlines paired with 4 descriptions yields thousands of viable combinations. Running 3 headlines and 2 descriptions starves the system of combinations to test and tailor.

### Pinning

Pinning forces a specific asset into a specific position.

- **No pins (default).** Maximum flexibility for Google's optimization. This is the baseline.
- **Pin to Position 1.** Use for brand requirements, regulatory copy, or a non-negotiable proposition that must always lead.
- **Pin to Position 2.** Less common; for structured message sequences.
- **Pin to Position 3.** Rare — Position 3 doesn't always display, so a Position-3-pinned asset may not appear at all.
- **Multiple assets pinned to one position.** Google rotates among them; the best compromise when control is required but testing should still happen.

Pinning every position collapses an RSA into a static ad and defeats the format. Governing rule: pin only when there is a real business reason; never pin by default. Acceptable patterns: brand in H1 with everything else unpinned; brand H1 + offer H2 + CTA H3 (only when message order is genuinely critical); multiple assets per pinned position.

### Headline diversity — the seven-category rubric

A strong RSA pulls from most or all of these categories. Use them as the checklist when judging diversity.

1. **Distinct value propositions.** Five rewordings of "save money" provide no diversity.
2. **Keyword-anchored phrasing.** At least 2–3 headlines should contain primary keywords from the ad group, which strengthens Quality Score relevance.
3. **Variety of calls to action.** At least 2–3 headlines should carry a CTA, and they shouldn't all be the same one ("Book a Demo" vs. "Compare Plans" vs. "Get Pricing").
4. **Balance between benefits and features.** Mix outcome-led ("Cut Two Hours From Your Week") with capability-led ("Built-In Calendar Automation"). Benefits typically win but features support.
5. **Brand-name presence.** At least 1–2 headlines naming the brand for recognition and trust; more important for established brands.
6. **Promotions and offers.** Discounts, free trials, guarantees, price anchors — when the offer is real and relevant, they lift CTR.
7. **Social proof.** Customer counts, ratings, awards, certifications ("Trusted by 8,500+ Teams").

Score the RSA as **Strong** (5+ categories present), **Moderate** (3–4), or **Weak** (1–2).

### Description quality

- Each description allows 90 characters — short descriptions waste real estate.
- At least one description should carry an explicit, specific CTA ("Free same-week shipping on orders placed by Thursday" beats "Learn more").
- Use descriptions for supporting detail that won't fit in a headline: specs, guarantees, trust signals, shipping terms, differentiators.
- Outcomes for the user typically outperform raw product features.

### Per-ad-group RSA strategy

A single generic RSA running across every ad group wastes the format. Each ad group should have an RSA whose headlines reference the specific product, service, or intent that defines it. When weekly volume supports it (roughly 100+ clicks per ad group), run 2–3 RSA variants per ad group, varying value-proposition emphasis, benefit-vs.-feature framing, or CTA style. For low-volume ad groups, one well-built RSA is enough — splintering traffic across variants only delays learning.

## I.3 Performance Max evaluation

PMax campaigns assemble ads on the fly from asset groups that span text, image, video, and logo. Auditing them has two distinct layers: **completeness** (do you have enough assets in the right formats?) and **quality** (do they actually work together?).

### Asset inventory requirements

| Asset type | Minimum | Recommended | Maximum |
|---|---|---|---|
| Headlines (text) | 3 | 11–15 | 15 |
| Long headlines | 1 | 3–5 | 5 |
| Descriptions | 2 | 4–5 | 5 |
| Business name | 1 | 1 | 1 |
| Landscape image (1.91:1) | 1 | 10–15 | 20 |
| Square image (1:1) | 1 | 10–15 | 20 |
| Portrait image (4:5) | 0 | 3–5 | 20 |
| Landscape logo (4:1) | 1 | 3–5 | 5 |
| Square logo (1:1) | 1 | 3–5 | 5 |
| Video | 0 | 3–5 | 5 |
| Call to action | 1 | 1 | 1 |

### The auto-generated video trap

Video is technically optional in PMax — but when none is uploaded, Google stitches one together from your images plus transitions and text overlays. The result is reliably underwhelming: lower production quality than a purpose-built video, no narrative, no real audio beyond a music bed, and a generic feel that strips out brand voice. The standing rule: upload at least one purpose-built video. Even a basic product demo or brand intro beats the auto-generated stand-in.

### Completeness scoring (0–100)

Each asset family contributes a weighted share of the total. For each row, divide the actual count by the recommended count, multiply by the weight, and sum. Cap the total at 100.

| Asset family | Weight | Why |
|---|---|---|
| Headlines | 20% | Primary text, highest impact |
| Long headlines | 10% | Used in display and discovery placements |
| Descriptions | 15% | Context and supporting copy |
| Images (all ratios) | 25% | Visual drives engagement on most channels |
| Video | 15% | Avoids the auto-generation trap |
| Logos | 10% | Brand identification across placements |
| Business name + CTA | 5% | Required foundation |

Score interpretation:

| Score | Status | Top priority |
|---|---|---|
| 90–100 | Fully kitted out | Focus on quality and testing |
| 70–89 | Sound foundation | Fill the weakest asset family |
| 50–69 | Material gaps | Asset completion is the dominant priority |
| Below 50 | Under-resourced | Delivery is materially constrained by missing assets |

**Completeness and quality are independent.** A 100/100 score on poor-quality assets is worse than 70/100 on excellent ones. Always report both — e.g., "Completeness 85/100; quality strong on text coherence, weak on image variety (all stock photos, no product shots)."

### Quality checks beyond completeness

- **Text coherence.** PMax recombines headlines and descriptions dynamically, so every headline must read sensibly with every description. Audit test: pick a random headline and a random description and read them as a single message. Repeat several times. If any combinations produce contradictions or confusion, the text pool needs work.
- **Image variety.** A strong group blends lifestyle imagery (product in real-world use), product imagery (clean shots, detail views), brand imagery (logo treatments, brand-forward creative), and — when relevant — seasonal/promotional graphics. The set should look like it belongs to the same brand; mixing pro photography with low-res screenshots breaks the experience.
- **Image quality checklist.** Meets Google's per-ratio minimum resolution; composition is intentional with no awkward crops; text overlays legible at mobile sizes; brand colors and identity consistent; no watermarks, stock-photo logos, or placeholder text; critical content kept away from the edges (Google may crop).
- **Real vs auto-generated video.** If no video is uploaded, the auto-stitched version almost always underperforms a purpose-built one.
- **Video quality.** Professional or semi-professional production (raw phone footage only if it matches the brand); core message lands in the first five seconds; length fits the placement (15–30 seconds for most PMax video surfaces); brand identifiers visible; audio works both with and without sound (captions or text overlays).
- **Logo legibility.** Recognizable at small sizes (logos appear at very small dimensions in many PMax placements); both landscape and square versions uploaded; avoid text-heavy logos that become illegible when scaled; transparent backgrounds preferred.

### Theme coherence — the one-sentence test

Each asset group should target one focused audience or product proposition. Diagnostic: can you describe the asset group's target audience and product focus in a single sentence?

- Pass: "Mineral SPF for outdoor athletes who want daily sun protection without a chalky finish."
- Fail: "Our whole catalog, marketed to anyone who'll buy it."

Catch-all asset groups dilute performance because Google can't learn what resonates with whom, messaging drifts too generic to land with anyone in particular, and signals from unrelated products and audiences blur into noise.

**Asset-group architectures and tradeoffs:**

| Approach | Best when | Risk |
|---|---|---|
| One per product category | Clear product lines with sufficient per-category volume | Splintering into too many low-volume groups |
| One per audience segment | Same product, distinct buyer personas | Asset overlap between groups |
| One per offer/promo | Seasonal and promotional campaigns | Short lifespan, frequent maintenance |

**Within-group coherence checks.** All headlines tie to the same theme; all images depict the same product category or audience context; descriptions support rather than contradict the headlines; video content aligns with image and text messaging; final URL maps to the asset-group theme (not a generic homepage).

### Brand guidelines

PMax leans on brand guidelines whenever it auto-creates or auto-formats assets. Missing guidelines push Google into default styling, which produces off-brand outputs.

| Setting | Effect when missing |
|---|---|
| Business name | Used in many ad formats; required |
| Landscape logo | Used in display and video end cards |
| Square logo | Used in mobile placements and favicons |
| Brand colors | Applied to auto-created assets and overlays |
| Fonts (where supported) | Applied to overlays in auto-generated assets |

### Listing groups (Shopping-eligible PMax)

For PMax campaigns connected to a Merchant Center feed, listing groups control which products serve in which asset group.

- Organize products into logical groups — by category, brand, price band, or margin tier.
- Listing groups should match the corresponding asset group themes (a "Trail Running" asset group should only serve trail-running SKUs).
- Avoid a single catch-everything listing group spanning the whole catalog — it strips out targeted messaging and makes per-segment analysis impossible.
- Available segmentation dimensions: product type (from the feed), brand, custom labels (custom_label_0 through custom_label_4), product ID, Google product category, and condition (new/used/refurbished).
- Watch for: a single generic listing group, listing-group-to-asset-group mismatches (patio chairs serving inside a cookware-themed group), and missing exclusions (low-margin or out-of-stock SKUs still serving).

## I.4 Video creative — the ABCD model

Google's published research distills video effectiveness into four properties, in this order.

**A — Attention.** Hook inside the first five seconds. For skippable formats these five seconds decide whether the user stays. Make the brand or the problem visible right away. Open with motion, not a static frame. Use an audio hook — voice, music, or sound effect — that complements the visual. Avoid the slow cinematic build-up; most viewers will be gone before the reveal.

**B — Branding.** The brand name or logo should appear inside the first five seconds **and** at the end. Spoken brand mentions raise recall further. Hold the brand colors and visual identity throughout. In short-form (e.g., 6-second bumpers), the brand needs to be present across the entire ad, not just at the close. In longer formats, weave the brand throughout rather than bookending only.

**C — Connection.** Lean into an emotional hook or a scenario the target audience recognizes. Human faces tend to lift attention and connection (this is supported by eye-tracking studies). Match the story arc to the format — a 6-second spot is a single moment, a 15-second spot is setup-and-payoff, anything 30 seconds or longer can carry a full narrative. Audio and visual should reinforce each other, not contradict or duplicate. Humor, surprise, and empathy are the dependable connection drivers.

**D — Direction.** End with a clear CTA. Spell out the next step — for example, "Book a demo," "Get your quote," or "Start your free month." The CTA must match the campaign objective; an awareness CTA looks different from an action CTA. Hold the end card with URL or button for at least three seconds. Don't bury the CTA mid-video where viewers have already dropped off.

Score each video against ABCD as **Present / Partial / Missing** per element.

### Format specifications

| Format | Length | Aspect | Skippable | Best for |
|---|---|---|---|---|
| Bumper | 6s | 16:9 | No | Awareness, frequency, recall |
| In-stream skippable | 15s–3min (skip after 5s) | 16:9 | Yes (after 5s) | Consideration, action, remarketing |
| In-stream non-skippable | 15s | 16:9 | No | Awareness, reach, key messages |
| In-feed | Any (thumbnail-initiated) | 16:9 or 1:1 | N/A | Consideration, education |
| YouTube Shorts | Up to 60s | 9:16 | N/A | Awareness, reach, younger viewers |

**Choosing format by objective:**

- Awareness: bumper for frequency plus non-skippable for reach.
- Consideration: in-stream skippable, 15–30 seconds, for story and education.
- Action/conversion: in-stream skippable, 15–60 seconds, with a strong CTA.
- Remarketing: in-stream skippable, shorter (15–30 seconds), offer-led.

### Duration by objective

| Objective | Length | Why |
|---|---|---|
| Awareness | 6–15s | Short, high-frequency; single message and visual; brand recall over detail |
| Consideration | 15–30s | Room for problem → solution → proof; demos and testimonials |
| Action | 15–60s | Problem + solution + social proof + CTA; longer formats allow objection handling; multiple CTAs (mid-roll and end); remarketing audiences tolerate longer runs because they already know the brand |

### View-rate benchmarks

Identify the hook type used (question, problem, surprise, social proof, direct) and check it matches the audience temperature. Then benchmark the view rate:

- **25%+** → strong.
- **15–25%** → average.
- **Under 15%** → weak; needs creative work.

### First-five-seconds hook library

Five hook archetypes that reliably earn the next view:

1. **Question hook.** "Tired of [familiar frustration]?" — engages curiosity when it lands on a real pain point. Generic questions don't work.
2. **Problem hook.** Open in the middle of the pain — frustration, failure, inconvenience. No setup. Jump into a scenario the viewer immediately recognizes.
3. **Surprise hook.** A startling stat, a counter-intuitive claim, or a visual that breaks expectations.
4. **Social-proof hook.** "Over 2,400 teams moved to [product] last quarter." Specific numbers and named entities beat vague claims.
5. **Direct hook.** Lead with the offer — for example, "Two weeks free, today only." No story, no buildup. Works best for warm/remarketing audiences who already know the brand.

**Hook-to-audience mapping:**

- Cold audiences → question or problem hook (establish relevance first).
- Warm audiences → social-proof or surprise hook (build credibility).
- Hot/remarketing audiences → direct hook (just make the offer).

### Thumbnails for in-feed ads

In-feed creative lives or dies on the thumbnail.

**What works:** high contrast that holds up against light or dark backgrounds; imagery legible at small mobile sizes; short text overlay (3–5 words max) readable at thumbnail scale; a human face or tight product crop for specificity; an emotional or curiosity trigger; brand cues consistent with the rest of the visual system.

**What fails:** too much text (illegible at small sizes); low contrast (bleeds into the page); generic stock imagery (no differentiation); clickbait disconnected from the video (drives views but kills conversion).

### Variation strategies for testing

When testing video creative, isolate one dimension at a time:

- **Same body, different hooks** — keep CTA and middle identical; test which hook archetype lifts view-through and conversion.
- **Same hook, different CTAs** — opening and middle held constant; for example, swap among "Start Free Trial," "See Pricing," and "Claim Your Sample."
- **Same product, different benefit emphasis** — one version leads with convenience, another with price, another with quality.
- **Same content at different lengths** — produce 6s, 15s, and 30s versions of the same idea and measure cost-per-result by length and objective.
- **Format adaptation** — same content shaped for 16:9 vs. 9:16 to see whether Shorts-style outperforms traditional for the audience.

## I.5 Creative fatigue

### Definition and disambiguation

Creative fatigue is the point where ad performance degrades because the audience has seen the creative so many times that it no longer compels them. The creative itself hasn't changed — its effectiveness has eroded through overexposure. Distinguish from **audience fatigue** (the segment itself is exhausted — too small, too narrowly targeted, already worked over): symptoms look similar but creative fatigue calls for new assets while audience fatigue calls for new audiences.

### Four primary signals

1. **CTR decay.** A rolling four-week CTR that falls 20% or more while impressions hold steady. If both CTR and impressions drop, the problem is likely bidding or competition, not fatigue.
2. **Frequency creep.** Average frequency crossing the channel-specific warning or critical thresholds (see below). Past a point, additional exposures stop adding value and start eroding perception.
3. **CVR drop with stable CTR.** Subtler than CTR decay. Users still click — the hook is still working — but they don't convert. Often a sign that the receptive segment has already converted, leaving less-qualified clickers behind, or that the experience feels repetitive on arrival.
4. **CPC inflation without a market cause.** CPC rising in the absence of new competitors, seasonal shifts, or bidding changes. Google bids harder to defend volume as creative decays, inflating CPC even as CTR holds or slides.

### Frequency benchmarks

| Channel | Healthy weekly | Warning | Critical |
|---|---|---|---|
| Search | N/A — intent-driven | N/A | N/A |
| Display | 2–4 | 5–7 | 8+ |
| YouTube (awareness) | 2–3 | 4–5 | 6+ |
| YouTube (action) | 1–2 | 3–4 | 5+ |
| Demand Gen | 2–4 | 5–6 | 7+ |
| PMax (Display channel) | 3–5 | 6–8 | 9+ |

**Search is exempt** — a user typing "emergency plumber near me" wants relevant ads however many times they've seen one. **PMax is awkward** — its serving spans multiple channels, each with its own norms, and reporting aggregates across them.

A campaign that sits above the warning band for two or more consecutive weeks gets flagged.

### Measurement procedure

Rolling four-week CTR comparison:

1. Compute average CTR for weeks 1–4 (baseline window).
2. Compute average CTR for weeks 5–8 (comparison window).
3. Percent change = ((comparison − baseline) / baseline) × 100.
4. If the drop exceeds 20%, flag for review.

Fatigue is a diagnosis of exclusion. Before attributing a decline to it, rule out: **seasonality** (compare year-over-year); **bidding changes** (strategy or target shifts during the window); **landing-page changes** (updates that could shift conversion or relevance); **new competition** (check auction insights); **budget moves** (reductions clipping volume or shifting serving patterns).

### Refresh triggers

| Trigger | Condition | Response |
|---|---|---|
| CTR decline | 20%+ over 4 weeks with stable impressions | Replace lowest performers |
| Frequency warning | Above warning threshold for 2+ consecutive weeks | Add new variants |
| Asset age | Display/Video asset unchanged for 60+ days | Proactive refresh |
| CVR decline | 15%+ drop with stable CTR | Audit creative-to-landing-page alignment |

**Proactive vs. reactive cadence.** Proactive refreshes run on a calendar — typically every 60–90 days for Display and Video — regardless of whether signals have appeared, and prevent fatigue from ever reaching thresholds. Reactive refreshes only fire when signals breach. The recommended posture is proactive scheduling as the baseline with reactive triggers as a safety net.

### How rotation works per channel

- **RSAs (Search).** Google auto-rotates combinations. To address fatigue: replace Low-rated assets, add new headline and description variants, or pause weak RSAs and launch replacements.
- **PMax.** Google auto-rotates within asset groups. Drop new image, text, and video assets into existing groups; let Low-rated assets age out (or remove them); spin up new asset groups with fresh themes when an entire group has fatigued.
- **Display.** Manual rotation required. Schedule every 60–90 days; upload new image and responsive variants; retire old variants once new ones have data.
- **Video (YouTube / Demand Gen).** Manual rotation required. Same 60–90-day cadence — new hooks, lengths, and CTAs; retire old videos after replacements have accumulated learnings.

### The 25–30% replacement rule

Never swap out the entire creative pool at once. Wholesale replacement forfeits all historical performance data, resets learning periods across the account, and creates a window where nothing proven is running.

The rule: rotate **25–30% of assets at a time**, lowest performers first. Keep top performers serving while replacements accumulate data.

Priority order for replacement:

1. Anything Google rates "Low".
2. Long-running assets whose engagement is sliding.
3. Assets inside the highest-spend campaigns (greatest leverage).
4. Hold "Best"-rated assets until they themselves show fatigue signals.

### What "new" must mean

Replacement creative must be **meaningfully different**, not lightly reworded:

- New value propositions (not just rephrased).
- New visual styles or imagery.
- New hooks or opening angles (especially for video).
- New offers or CTAs.

Minor rewordings of fatigued creative will fatigue at roughly the same rate. The audience needs something materially different.

## I.6 Testing methodology

### Google's campaign experiments

Google Ads ships a native experiment framework for controlled splits. Mechanics: build an experiment off an existing campaign, pick the variable, set the traffic split, Google randomly assigns users, run at least 14 days, evaluate at 95%+ confidence.

Configuration:

- **Split:** 50/50 is standard and the fastest path to significance. Use 70/30 (control/experiment) only to limit risk on the experimental variant.
- **Duration:** 14 days is the floor — it captures two full weeks of day-of-week variation.
- **Budget:** both arms share the campaign budget proportionally; no separate budget needed.
- **Stop condition:** end only when 95%+ confidence has been reached **and** the minimum duration has elapsed.

Limitations: native experiments are available only for Search and Display (not PMax, Shopping, or Video); one experiment per campaign at a time; no cross-campaign-type tests.

### What to test by campaign type

**Search / RSA**

| Variable | Method | Metric |
|---|---|---|
| Headlines | Experiment, two RSA variants | CTR, conversion rate |
| Descriptions | Experiment, two RSA variants | CTR, conversion rate |
| Landing pages | Experiment, different final URLs | Conversion rate, bounce |
| Ad extensions | Experiment or before/after | CTR |
| Pin strategy | Experiment, pinned vs. unpinned | CTR, conversion rate |

**PMax** (no native experiments)

| Variable | Method | Metric |
|---|---|---|
| Asset group themes | Run parallel groups | Conversions, ROAS per group |
| Audience signals | Add/remove signals, compare periods | Conversion rate, CPA |
| Final URLs | Test different URLs per group | Conversion rate |
| Asset variations | Add new assets, compare to existing | Asset performance labels |

**Shopping**

| Variable | Method | Metric |
|---|---|---|
| Product titles | Feed update, before/after | CTR, impression share |
| Product images | Feed update, before/after | CTR |
| Custom labels | Segment differently, compare | ROAS by segment |

**Display**

| Variable | Method | Metric |
|---|---|---|
| Images | Experiment | CTR, conversion rate |
| Headlines | Experiment | CTR |
| CTA buttons | Experiment | CTR, conversion rate |
| Landing pages | Experiment | Conversion rate |

**YouTube / Video**

| Variable | Method | Metric |
|---|---|---|
| First-five hook | Parallel ad groups | View rate, view-through rate |
| Video length | Parallel ad groups | View rate, CPV, conversion rate |
| CTA placement | Parallel ad groups | CTR |
| Thumbnail (in-feed) | Parallel ad groups | View rate |

**Demand Gen**

| Variable | Method | Metric |
|---|---|---|
| Format | Image vs. video vs. carousel | CTR, conversion rate |
| Audience segments | Parallel ad groups | CPA, conversion rate |
| Headlines | A/B within campaign | CTR |

### Sample size

| Test type | Minimum per variant | Why |
|---|---|---|
| CTR | 100 clicks | Sufficient to detect 20%+ CTR gaps |
| Conversion rate | 30 conversions | Sufficient to detect meaningful CVR gaps |
| ROAS | 50 conversions | Revenue variance demands larger samples |

If the account can't deliver these numbers in 14 days: extend the test to 30–60 days rather than relaxing sample requirements; test at the campaign level rather than the ad group level for a larger pool; concentrate on fewer, higher-impact tests; accept that some tests will end inconclusive — that's still useful information.

For precise sample sizing, plug into a standard calculator: baseline conversion rate, minimum detectable effect, statistical power (use 80%), significance level (use 95%).

### Statistical significance discipline

The 95% threshold means there's only a 5% probability the observed difference is random. The standard bar for action.

1. **Do not end early.** A "clearly winning" variant at day three is likely noise.
2. **Run the full 14-day minimum.** Day-of-week behavior matters — weekday winners may collapse on weekends.
3. **Don't peek and pull.** Daily checks with willingness to stop inflate false-positive rates. Set a check date and respect it.
4. **Always report the confidence level.** "Variant B won at 97% confidence" is decision-grade. "Variant B had higher CTR" is not.

If a test reaches its planned duration without crossing 95%, the practical reading is that the variants are too similar to matter. Pick either and move on.

### Sequential, concurrent, multivariate

- **Sequential** (default for most accounts): test variable A, ship the winner, then test variable B. Cleanly isolates each variable.
- **Concurrent** (high-volume only): multiple tests across different campaigns simultaneously. Requires 1,000+ clicks per day per tested campaign, completely separate campaigns with no audience overlap, and never the same variable in two places.
- **Multivariate**: multiple variables within a single ad. Requires roughly 10,000+ impressions per combination and is impractical for most Google Ads accounts. Stick to sequential A/B for typical volumes.

### Test documentation

Every test should leave a record: test name, hypothesis ("We believe [change] will improve [metric] because [reason]"), variable tested, start date, end date, sample size (clicks and conversions per variant), results (metric values for control and experiment), confidence level reached, decision taken, and learnings — even from inconclusive tests. A maintained log prevents re-testing the same variable, builds institutional knowledge, tracks cumulative impact, and surfaces cross-test patterns ("benefit-led headlines reliably win in this account").

### Common testing mistakes

1. **Stopping too early** — the most frequent error; small-sample false positives drive bad decisions.
2. **Testing too many variables at once** — you can't tell which one moved the result.
3. **Not testing at all** — leaning on Ad Strength or asset labels in place of controlled experiments; labels only describe relative performance within the existing set, not whether something better exists.
4. **Testing on samples that are too small** — 20 clicks is noise; wait or don't test.
5. **Ignoring inconclusive results** — "no significant difference" is a finding; pick by brand fit or messaging preference and move on.
6. **Testing trivial differences** — one-word headline swaps usually can't produce a detectable lift; test meaningfully different approaches.

## I.7 Cross-campaign consistency

When an account runs several campaign types simultaneously, the messaging must agree across surfaces:

- **Core proposition.** Same fundamental message on Search, PMax, Display, and Video.
- **Offer alignment.** Promotions consistent across channels — no conflicting discounts running in parallel.
- **Brand voice.** Tone holds up across creative surfaces (formal vs. casual, "we" vs. "you").
- **CTA target.** Users pushed toward the same destination or action.
- **Social-proof and factual claims.** Numbers identical everywhere — you can't claim "10,000 customers" in Search and "5,000 customers" in Display. Different customer counts, contradictory "rated #1 by ___" badges, different years-in-business numbers are immediate fixes because they surface side-by-side in AI Overviews and competitor comparisons.

**Adaptation is not inconsistency.** Format-driven adaptation is expected — a 6-second bumper can't carry the detail an RSA carries. What must hold steady across formats is the **core proposition and the verifiable claims**. The delivery adapts; the substance does not.

## I.8 Landing page alignment scoring

Each landing page receives three independent dimension scores plus an overall.

### Dimension 1 — Page content vs. keywords

For every keyword pointed at the page, look for the keyword's core concept in: page title, H1, H2/H3 subheadings, the first 200 words of body content, the primary CTA, and the meta description.

- **HIGH** — the core concept appears in the H1 or title tag AND in the body. The page clearly serves the keyword's intent.
- **MEDIUM** — the concept is present in the body, but the page does not lead with it; headings and title are about something else.
- **LOW** — the concept is absent or mentioned only in passing. The page is not really about this keyword.

**Aggregation.** Score every keyword individually, then summarize the spread ("six HIGH, three MEDIUM, one LOW" for a ten-keyword page). The page's dimension score is the most frequent rating in that spread. Exception: if LOW-rated keywords account for more than a fifth of the page's incoming click volume, the dimension score is forced to LOW even when another rating dominates the count.

### Dimension 2 — Page content vs. top search terms

Look at the ten highest-click search terms that have routed visitors to this page. For each, ask: does the page answer the question the search term implies? Does it use the language and terminology from the search term? Are there clusters of terms the page leaves completely unanswered?

- **HIGH** — 8 or more of those 10 terms get a clear answer on the page.
- **MEDIUM** — between 5 and 7 do.
- **LOW** — 4 or fewer. The page is out of step with the traffic landing on it.

**Content gap detection.** Run an n-gram analysis across the search terms hitting the page. Any theme that appears in **three or more** search terms but is **not represented** on the page is logged as a content gap. These feed the content-gap deliverable.

### Dimension 3 — Page content vs. ad copy

For every RSA pointing at the page — both headlines and descriptions — ask: are the ad's promises delivered on the page? Does the page's CTA line up with the ad's CTA? Is the ad's value proposition reflected in the page copy?

- **HIGH** — what the headline pitches is what the visitor encounters. No bait-and-switch.
- **MEDIUM** — broadly aligned, but at least one ad claim or CTA does not show up on the page.
- **LOW** — a meaningful gap. Someone who clicked the ad would land on a page that does not deliver what the creative led them to expect.

### Composing the overall score

| Keywords | Search terms | Ad copy | Overall |
|---|---|---|---|
| HIGH | HIGH | HIGH | **STRONG** |
| Any HIGH, rest MEDIUM | Any HIGH, rest MEDIUM | Any HIGH, rest MEDIUM | **GOOD** |
| Any LOW | Any | Any | **NEEDS ATTENTION** |
| Any | Any LOW | Any | **NEEDS ATTENTION** |
| Any | Any | Any LOW | **NEEDS ATTENTION** |
| LOW | LOW | Any | **CRITICAL** |

In words: a page is STRONG only when all three dimensions are HIGH. GOOD allows MEDIUM scores as long as there's at least one HIGH in each dimension position. A single LOW anywhere drops the page to NEEDS ATTENTION. Two LOWs across keywords and search terms push it to CRITICAL.

### Cross-referencing with the QS landing-page-experience signal

Once the alignment score is set, read it alongside the `landing_page_experience` rating from Google Ads (`ABOVE_AVERAGE`, `AVERAGE`, `BELOW_AVERAGE`):

| Alignment | QS landing page | Reading |
|---|---|---|
| STRONG / GOOD | ABOVE_AVERAGE | Confirmed healthy. Every signal points the same way. |
| STRONG / GOOD | AVERAGE | The copy side is fine, so something non-content is capping the rating. Audit load times, mobile render, and any interstitials. |
| STRONG / GOOD | BELOW_AVERAGE | Almost certainly a non-content problem. Since alignment is solid, look at performance, mobile UX, HTTPS, or interstitials. |
| NEEDS ATTENTION | AVERAGE | Room to improve via copy work. Closing the alignment gap will likely move the rating up. |
| NEEDS ATTENTION | BELOW_AVERAGE | The alignment gap is the most credible explanation for the rating. Fix the copy before chasing technical causes. |
| CRITICAL | BELOW_AVERAGE | Highest priority. Two failures stack: the page does not match its traffic and Google's own signal confirms it. Either rewrite the page from scratch or repoint the traffic. |

## I.9 Calibrating to account maturity

Maturity governs how deep the audit goes. Higher stages inherit everything from the stage below.

| Maturity | Creative scope | Test cadence |
|---|---|---|
| Nascent | Baseline RSA hygiene — asset counts, Ad Strength, obvious gaps | 0–1 tests; fundamentals first |
| Developing | Add pin-strategy review, PMax completeness, headline-angle diversity | 1–2 per month |
| Established | Add fatigue detection, message alignment across campaign types, A/B test recommendations | 2–4 per month |
| Advanced | Add multivariate testing, multi-month creative roadmap, sophisticated fatigue modeling accounting for seasonality | 4+ per month, scheduled on a rolling calendar |

The principle: nascent accounts need a foundation in place before they benefit from optimization work; advanced accounts need the testing programs and refresh cadences that match the sophistication they've already built.

---

# Part II — Ad Creative Audit Workflow

This part runs the end-to-end review of every piece of ad creative inside a Google Ads account: search ad copy, Performance Max asset groups, video assets, and the fatigue patterns that affect Display, YouTube, Demand Gen, and PMax. It returns a scorecard, a list of assets that should be refreshed, a queue of creative tests, and a one-page executive view.

## Phase 0 — Frame the engagement

Pull and keep handy from the workspace blueprint: Customer ID and friendly account name; maturity classification; business model (DTC eCommerce, lead generation, SaaS trial, etc.); campaign and ad-group naming conventions; brand terms.

### Checkpoint C1 — Confirm the frame

Show the user account name, CID, and maturity stage; which campaign types have creative the audit will touch (Search RSAs, PMax asset groups, Video, Demand Gen); whether any creative tests are already running (or "none detected"); the audit depth that maturity implies. Then ask whether the scope looks right and whether any campaigns or creative types should be dropped or promoted.

**Teaching addendum (first five runs).** Include a short explanation of why the scope shrinks or grows with maturity. Example: "We stop at asset counts for nascent accounts because there isn't enough data to make fatigue calls — fatigue analysis kicks in when an account reaches established maturity."

## Phase 1 — Pull the data

All queries below are the canonical set. The full GAQL reference, CSV fallbacks, and column-name mapping live in Part IV.

**RSA performance (last 30 days)**

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_ad.ad.id,
  ad_group_ad.ad.responsive_search_ad.headlines,
  ad_group_ad.ad.responsive_search_ad.descriptions,
  ad_group_ad.ad.strength,
  ad_group_ad.ad.type,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.conversions,
  metrics.cost_micros
FROM ad_group_ad
WHERE ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'
  AND ad_group_ad.status = 'ENABLED'
  AND campaign.status = 'ENABLED'
  AND metrics.impressions > 0
  AND segments.date DURING LAST_30_DAYS
```

**Asset-level ratings and pin positions**

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_ad_asset_view.field_type,
  ad_group_ad_asset_view.performance_label,
  ad_group_ad_asset_view.pinned_field
FROM ad_group_ad_asset_view
WHERE campaign.status = 'ENABLED'
  AND ad_group_ad.status = 'ENABLED'
  AND segments.date DURING LAST_30_DAYS
```

**Every asset in every PMax asset group**

```sql
SELECT
  campaign.name,
  asset_group.name,
  asset_group.status,
  asset_group_asset.field_type,
  asset_group_asset.performance_label,
  asset_group_asset.status
FROM asset_group_asset
WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX'
  AND campaign.status = 'ENABLED'
  AND asset_group.status = 'ENABLED'
```

**Video performance (skip if no Video or Demand Gen campaigns)**

```sql
SELECT
  campaign.name,
  ad_group.name,
  metrics.impressions,
  metrics.video_views,
  metrics.video_view_rate,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpv,
  metrics.conversions,
  metrics.cost_micros
FROM ad_group
WHERE campaign.advertising_channel_type IN ('VIDEO', 'DEMAND_GEN')
  AND campaign.status = 'ENABLED'
  AND metrics.impressions > 0
  AND segments.date DURING LAST_30_DAYS
```

**Frequency exposure on channels where fatigue shows up**

```sql
SELECT
  campaign.name,
  campaign.advertising_channel_type,
  metrics.impressions,
  metrics.average_frequency_per_user
FROM campaign
WHERE campaign.advertising_channel_type IN ('DISPLAY', 'VIDEO', 'DEMAND_GEN', 'PERFORMANCE_MAX')
  AND campaign.status = 'ENABLED'
  AND segments.date DURING LAST_7_DAYS
```

### Checkpoint C2 — Data inventory

Summarize what arrived: count of RSAs and ad groups containing them; count of PMax asset groups and parent campaigns; number of video assets, if any; anything that couldn't be retrieved (e.g., "PMax asset-level ratings unavailable for this account", "no video campaigns active"); the actual date window that was pulled. Ask whether the user can fill any gaps with manual exports or whether to proceed with what we have.

**Teaching addendum (first five runs).** Add a sentence per dataset explaining what it unlocks — RSA data drives the diversity check, PMax asset data drives the completeness score, video data drives ABCD scoring.

## Phase 2 — Inspect every RSA

Walk every enabled ad group and rate its RSAs against the Part I.2 framework:

- **Headline and description counts.** Note the gap to 15 headlines / 4 descriptions. Anything under 8 headlines or 2 descriptions is below the floor and gets flagged.
- **Asset rating mix.** Tally Best / Good / Low / Learning / Pending. Two thresholds matter: **more than 30% Low-rated assets in a single RSA = flag**; **more than 50% still Learning** = flag for "not enough data yet" rather than poor copy.
- **Pin behavior.** Capture every pin and its position. All three headline positions pinned → the ad is effectively static and cannot be optimized by Google — always flag. Some pins are legitimate (locked-in legal copy, mandatory brand position); distinguish those from defensive over-pinning.
- **Headline diversity.** Use the seven-category rubric (Part I.2). Score the RSA as Strong (5+ categories present), Moderate (3–4), or Weak (1–2).
- **Description quality.** Feature/benefit mix; at least one CTA-bearing description; full 90-character allowance used; concrete supporting detail rather than fluff.
- **Ad Strength.** Record Google's value. Every Poor RSA is an immediate action item. Every Average RSA is logged as an improvement opportunity. Excellent doesn't mean the ad will perform — never treat it as a quality guarantee, only as a signal that Google's asset-variety checks passed.
- **Message-to-keyword alignment.** Compare the keywords inside the ad group to the language inside the headlines. If the ad group is about "retinol serums" and the headlines all say "skincare", flag the disconnect. The same logic applies to obvious gaps versus the likely landing page content — the Copy ↔ Page side of the triangle.

## Phase 3 — Inspect every PMax asset group

Apply the Part I.3 framework to each enabled asset group:

- **Completeness score (0–100).** Apply the weighted formula. Cap at 100.
- **Asset quality, not just quantity.** Check combinatorial sense (read a few random headline + description pairings as ad copy and verify they're coherent); image mix (lifestyle, product, brand — is everything one type?); real vs. auto-generated video (the auto-generated stand-in almost always underperforms a real video); logo legibility at smallest rendered sizes.
- **One-sentence theme test.** Can the asset group's focus be described in a single sentence? If not, it's a catch-all and should be split. For Shopping-eligible PMax, also check that the listing groups attached to the asset group match its theme.
- **Brand presence.** Business name field filled; both landscape and square logos uploaded; brand colors configured where the option exists.

## Phase 4 — Inspect video creative

Skip this entire phase if no Video or Demand Gen campaigns are active.

For each running video, rate the four ABCD elements as Present / Partial / Missing (Part I.4). Check format and duration against the objective table; identify the hook archetype and benchmark the view rate (25%+ strong, 15–25% average, <15% weak); confirm aspect ratio matches placement (16:9 for in-stream, 9:16 for Shorts).

## Phase 5 — Fatigue analysis

Fatigue runs on Display, Video, Demand Gen, and PMax — not on Search, where ad rotation works differently.

- **Rolling CTR comparison.** Compare the most recent 4-week CTR to the 4-week window immediately before it. If CTR has fallen by 20% or more **while impressions stayed roughly flat**, that campaign is fatiguing. If impressions also dropped, the issue is probably auction pressure or budget, not creative.
- **Frequency thresholds.** Compare current weekly frequency to the channel-specific bands from Part I.5. A campaign sitting above its warning band for two or more consecutive weeks gets flagged.
- **Calendar-age refresh trigger.** Any creative running unchanged for 60 days or more goes on the refresh list regardless of whether performance numbers have slipped yet. By the time fatigue shows in the metrics, you've already lost weeks.

## Phase 6 — Cross-campaign consistency

Once individual campaigns have been scored, zoom out and read the account as a whole using the Part I.7 checks: message alignment (core value proposition the same across Search, PMax, and Video?), offer alignment (no conflicting discount amounts or contradictory expiry dates?), brand voice (formal vs. casual, "we" vs. "you"), CTA destinations (pointing the user to the same action?), and factual claims (different customer counts, different "rated #1 by ___" badges, different years-in-business numbers are immediate fixes because they surface side-by-side in AI Overviews and competitor comparisons).

### Checkpoint C3 — Walk the findings

Summarize what came out of Phases 2–6: diversity verdict across all RSAs with the top finding called out (e.g., "4 of 8 RSAs lack CTA variety and social proof"); average PMax completeness with the worst offenders named; count of campaigns showing fatigue with the strongest signal called out; any cross-campaign contradictions discovered. Ask the user whether anything is surprising and whether anything needs to be double-checked before recommendations are built.

**Teaching addendum (first five runs).** For each finding category, expose the scoring method that produced it. The user needs to learn the rubrics so they can self-audit later.

## Phase 7 — Build the test plan

Every recommendation gets a priority, a hypothesis, a method, a runtime, and a winner-declaration rule.

**Priority bands.**

- **P1 (do now)**: Poor ad strength on RSAs, critical fatigue, major asset gaps that block delivery.
- **P2 (this month)**: Low-rated assets, moderate fatigue, PMax asset groups that are incomplete but functional.
- **P3 (next month)**: Optimization-grade tests, consistency cleanups, proactive refreshes ahead of the 60-day mark.

**Recommendation shape.** Each entry: **What** (the specific variable being changed and where it lives), **Hypothesis** ("We believe [change] will improve [metric] because [reason]"), **Method** (Google Ads experiment, parallel ad group, or simple before/after), **Runtime** (minimum days before reading results), **Win condition** (the metric, the lift, the confidence level).

**Volume scaled to maturity** — see Part I.9.

### Checkpoint C4 — Walk the recommendations

Lay out P1 / P2 / P3 lists with rationale per item, the count of proposed tests, and the refresh calendar summary. Ask whether priorities need shuffling.

**Teaching addendum (first five runs).** Explain *why* something is P1 vs P2 — Poor ad strength caps auction competitiveness in real time, while a slightly incomplete PMax asset group only caps long-term ceiling.

## Phase 8 — Produce the deliverables

See Part IV for full output specifications. Four files: **Asset Scorecard** (Markdown), **Refresh List** (CSV), **Test Plan** (Markdown), **Summary Dashboard** (Markdown).

### Checkpoint C5 — Hand off

Tell the user which files exist, what the headline creative health score is, and how to use each deliverable. The CSV briefs the creative team. The test plan is operational. The dashboard is the version a client should see.

**Teaching addendum (first five runs).** Walk through each file in turn, naming the next action it enables.

---

# Part III — Landing Page Evaluation Workflow

This part scores how well each landing page in a Google Ads account actually matches the keywords, search terms, and ads pointing at it — and reads Google's own `landing_page_experience` signal to flag pages dragging Quality Score down.

This is the first-generation version. Phase 2 (gated on `ga4.available: true` in the workspace blueprint) will layer GA4 behavioral data on top: per-page conversion rate, funnel drop-off, bounce rate and engagement time, mobile-vs-desktop breakdown, and PageSpeed/Core Web Vitals — but everything documented here works without GA4.

## Cadence

- Run **monthly** as part of the orchestrator's standard skill rotation.
- Run **ad hoc** when `pancake_root_cause_lab` reaches diagnostic Branch 5.
- Run **ad hoc** when the gray-area decision tree needs landing-page data at Step 3.

## Step 0 — Load configuration

Read the workspace blueprint config; pull the list of accounts to analyze; note maturity; identify the data source tier in use (Tier 1 = Google Ads API).

### Checkpoint L1 — Context confirmation

Show the user:

| Field | Value |
|---|---|
| Account | {name} ({cid}) |
| Maturity | {level} |
| Campaign types | {active types} |
| Data source | {method} (Tier {tier}) |
| Analysis scope | {number of campaigns / ad groups with unique landing page URLs} |

Ask whether this is the right account and scope, and whether there are specific pages they want focused attention on.

**Teaching addendum (first five runs).** Add an orientation: this skill compares page content to keywords and ad copy, looks at Quality Score landing-page experience ratings, and outputs per-page alignment scores plus a list of pages that may be hurting QS. It does **not** evaluate conversion rate by page — that requires GA4 data and is on the Phase 2 roadmap.

## Step 1 — Collect data

### 1a. Identify the unique landing pages

From Google Ads data, pull every distinct final URL across active campaigns and ad groups. For each URL, record: the campaigns and ad groups that point to it; the keywords associated with it; the top search terms (by volume from the most recent search-term report) that have triggered ads pointing at it; the ad copy (RSA headlines and descriptions) that runs against it.

### 1b. Pull the Quality Score landing-page experience field

On Tier 1 (API-backed) accounts, pull `landing_page_experience` at the keyword level. Possible values: `ABOVE_AVERAGE`, `AVERAGE`, `BELOW_AVERAGE`. Roll the keyword-level ratings up to the page level. For each page, report what share of its keywords fall into each rating bucket.

### 1c. Fetch the page content itself

For each landing page (cap at 50 pages per run to keep scope manageable), use the available browser automation tooling to load the page and pull its content. Consult the browser-automation API reference for the full signature.

A minimal extraction script:

```python
from sdk.utils.browser import get_browser, close_browser

browser = await get_browser("landing-page-audit")
await browser.goto(url, timeout=15000)

page = browser.page
title = await page.title()
h1 = await page.locator("h1").first.text_content() if await page.locator("h1").count() > 0 else None
h2s = await page.locator("h2").all_text_contents()
meta_desc = await page.get_attribute("meta[name='description']", "content")
body_text = await page.locator("main, article, .content, body").first.text_content()

has_viewport = await page.locator("meta[name='viewport']").count() > 0

print({"title": title, "h1": h1, "h2s": h2s, "meta_description": meta_desc, "has_mobile_viewport": has_viewport})
await close_browser("landing-page-audit")
```

Capture per page: title tag; H1; all H2s; meta description; main body text; primary CTA; whether a mobile viewport meta tag is present; page load time if it can be inferred from the fetch.

### Checkpoint L2 — Data quality gate

Surface to the user:

| Metric | Value |
|---|---|
| Unique landing pages found | {N} |
| Pages successfully fetched | {N} |
| Pages with fetch errors | {N} (with URLs listed) |
| Keywords with QS landing-page data | {N} of {total} |
| Date range of search-term data | {dates} |

Ask whether there are pages they couldn't reach that they want to supply content for manually. Pages that couldn't be fetched (blocked, redirect loop, server error) get flagged but cannot be scored.

**Teaching addendum (first five runs).** Explain what the fetch is for: the skill cross-references each page's content against keywords, search terms, and ad copy to produce alignment scores.

## Step 2 — Three-dimension alignment scoring

For each landing page, produce three independent scores plus an overall using the Part I.8 framework.

### Checkpoint L3 — Interpretation check

Present the top pages by traffic volume in a table:

| Landing Page | Keyword Alignment | Search Term Alignment | Ad Copy Alignment | Overall | QS Landing Page Experience |
|---|---|---|---|---|---|
| {url} | {score} | {score} | {score} | {score} | {rating} |

Follow with three to five key findings, each with supporting evidence, and ask the user whether the findings match their understanding of the pages.

**Teaching addendum (first five runs).** Include the reasoning behind each score, e.g.: "The keyword alignment on {url} came out LOW: '{keyword}' is about '{theme}', yet the page is built around '{different theme}'. Its H1 reads '{H1}' and never touches '{keyword concept}'."

## Step 3 — Quality Score diagnostic

For any page rated `BELOW_AVERAGE` on landing-page experience, cross-reference with the alignment score to figure out what kind of problem it is.

### 3a. Diagnostic matrix

| Alignment | QS landing page | Most likely cause | Action |
|---|---|---|---|
| HIGH | BELOW_AVERAGE | Non-content cause (load time, mobile UX, HTTPS, interstitials) | Run PageSpeed Insights by hand, exercise the mobile flow, check the certificate |
| LOW | BELOW_AVERAGE | Page does not match its intent | Rebuild the page's copy around the keyword and search-term intent |
| LOW | AVERAGE | Upside available from copy work | Closing the alignment gap should pull the rating up a tier |
| HIGH | ABOVE_AVERAGE | Working as intended | Hands off — keep the page as-is and defend it from regressions |

The logic: if the content is already aligned but Google still rates the page poorly, the problem is technical. If alignment is poor, the page is the problem.

### 3b. Pattern detection

Step back and look at the population of below-average pages:

- **Every page is below average** → site-wide technical issue. Speed, mobile, certificate, or interstitials.
- **A specific set of pages is below average** → content issue on those pages.
- **Pages tied to a specific campaign type are below average** → structural misalignment between how the account is built and what those pages cover.

## Step 4 — Content gap analysis

Combine the search-term data with the page content to surface gaps that per-page scoring misses:

- Search terms driving meaningful click volume to pages that don't address their intent.
- Keyword themes with no dedicated landing page anywhere on the site.
- Pages receiving traffic from campaigns that don't match the page's theme.

### Checkpoint L4 — Recommendations review

Prioritize the recommendations into three buckets:

- **Critical (low QS + low alignment).** Each item lists the page, the specific action, and what business capability gets unlocked.
- **High (content gaps with meaningful traffic volume).** Same shape.
- **Medium (alignment improvements without urgency).** Same shape.

Ask the user whether any priorities should shift, or whether they have context that changes the ordering.

## Step 5 — Generate the deliverables

The skill ships three Markdown documents:

1. **Landing Page Alignment Report** — per-page scores across the three dimensions, the QS landing-page experience rollup, the content gaps, and prioritized recommendations.
2. **QS Diagnostic Report** — every page rated `BELOW_AVERAGE`, classified as either a content issue or a technical issue using the alignment cross-reference, plus the site-wide-vs.-page-specific pattern read.
3. **Content Gap List** — a table of search terms or themes with no matching page content, the estimated traffic volume in play, and the recommended action (modify an existing page or build a new one).

### Checkpoint L5 — Output confirmation

Tell the user what was produced ("{N} pages scored", "{N} pages flagged", "{N} gaps identified") and confirm the save location.

**Teaching addendum (first five runs).** Explain how to use each report. The Alignment Report prioritizes page-rewrite work. The QS Diagnostic separates content fixes (which copy changes solve) from technical fixes (which need PageSpeed or mobile work). The Content Gap List points at where new pages or page expansions would catch traffic that is currently mismatched.

---

# Part IV — Deliverables, Data Reference, and Worked Example

## IV.1 Creative audit output specifications

Every creative audit returns four deliverables.

### Output 1 — Asset Scorecard (Markdown)

Top of the document carries account name, audit date, maturity stage, and the overall account creative health score (0–100). Below that, three sections.

**Search section.** For every ad group with active RSAs:

```markdown
### [Campaign Name] > [Ad Group Name]
| Metric | Value | Status |
|--------|-------|--------|
| Headlines | [X] of 15 recommended | [OK/Warning/Critical] |
| Descriptions | [X] of 4 recommended | [OK/Warning/Critical] |
| Ad Strength | [Excellent/Good/Average/Poor] | [OK/Warning/Critical] |
| Asset Ratings | [X] Best, [X] Good, [X] Low, [X] Learning | [OK/Warning/Critical] |
| Pin Usage | [None/Partial/Full] | [OK/Warning/Critical] |
| Headline Diversity | [Strong/Moderate/Weak] | [OK/Warning/Critical] |
| Message Alignment | [Aligned/Partial/Misaligned] | [OK/Warning/Critical] |
```

**PMax section.** For every asset group:

```markdown
### [Campaign Name] > [Asset Group Name]
| Metric | Value | Status |
|--------|-------|--------|
| Completeness Score | [X]/100 | [OK/Warning/Critical] |
| Headlines | [X] of 15 recommended | [OK/Warning/Critical] |
| Long Headlines | [X] of 5 recommended | [OK/Warning/Critical] |
| Descriptions | [X] of 5 recommended | [OK/Warning/Critical] |
| Images (all ratios) | [X] total | [OK/Warning/Critical] |
| Video | [X] of 5 recommended | [OK/Warning/Critical] |
| Logos | [X] total | [OK/Warning/Critical] |
| Theme Coherence | [Strong/Moderate/Weak] | [OK/Warning/Critical] |
| Brand Guidelines | [Complete/Partial/Missing] | [OK/Warning/Critical] |
```

**Video section** (only if video is in play):

```markdown
### [Campaign Name]
| ABCD Element | Rating | Notes |
|-------------|--------|-------|
| Attention (hook) | [Present/Partial/Missing] | [description] |
| Branding | [Present/Partial/Missing] | [description] |
| Connection | [Present/Partial/Missing] | [description] |
| Direction (CTA) | [Present/Partial/Missing] | [description] |
| Format | [Appropriate/Needs adjustment] | [description] |
| View Rate | [X]% ([Strong/Average/Weak]) | benchmark: 25%+ strong |
```

**Fatigue and consistency tables.** Append two small tables for any signals found:

```markdown
| Campaign | Signal | Severity | Detail |
|----------|--------|----------|--------|
| [name] | CTR decline | [Warning/Critical] | [X]% decline over 4 weeks |
| [name] | High frequency | [Warning/Critical] | [X] avg/week vs [Y] benchmark |
| [name] | Creative age | [Info] | Running [X] days unchanged |
```

```markdown
| Check | Status | Detail |
|-------|--------|--------|
| Value proposition alignment | [Consistent/Inconsistent] | [description] |
| Offer alignment | [Consistent/Inconsistent] | [description] |
| Brand voice | [Consistent/Inconsistent] | [description] |
| CTA consistency | [Consistent/Inconsistent] | [description] |
```

**Status legend.** OK — at or above best practice. Warning — below the recommended level but the unit still functions. Critical — under the floor, or actively hurting performance.

### Output 2 — Refresh List (CSV)

One row per flagged asset.

| Column | What goes in it | Example |
|---|---|---|
| Campaign | Campaign name | Brand Search |
| Ad_Group_or_Asset_Group | Ad group for RSA rows, asset group for PMax rows | Rain Jackets |
| Asset_Type | Headline, Description, Image, Video, Logo, etc. | Headline |
| Current_Asset | Text or filename of the asset today | "Buy Our Gear Today" |
| Issue | Plain-English description of the problem | Low rating, repetitive messaging |
| Priority | P1 / P2 / P3 | P1 |

Example rows:

```csv
Campaign,Ad_Group_or_Asset_Group,Asset_Type,Current_Asset,Issue,Priority
Brand Search,Rain Jackets,Headline,"Buy Our Gear Today",Low rating + generic messaging,P1
PMax - Hiking,Winter Layering,Video,(none),No video uploaded - auto-stitched output serving,P2
```

### Output 3 — Test Plan (Markdown)

```markdown
# Creative Test Plan
**Account:** [Account Name]
**Period:** [Month/Quarter]

## P1 Tests (Immediate)

### Test 1: [Descriptive Name]
- **Campaign/Ad Group:** [location]
- **Variable:** [what is being tested]
- **Hypothesis:** We believe [change] will improve [metric] because [reason]
- **Method:** [Experiment / Parallel ad group / Before-after]
- **Duration:** [X] days minimum
- **Success Criteria:** [metric] improves by [X]% at 95% confidence

## P2 Tests (This Month)
[same shape]

## P3 Tests (Next Month)
[same shape]
```

### Output 4 — Summary Dashboard (Markdown)

```markdown
# Creative Audit Summary
**Account:** [Account Name] | **Date:** [Date] | **Maturity:** [Level]

## Creative Health Score: [X]/100

## Key Findings
1. [Most important finding]
2. [Second finding]
3. [Third finding]
4. [Fourth finding, if applicable]
5. [Fifth finding, if applicable]

## Immediate Action Items (P1)
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

## Quick Wins
- [ ] [Highest impact, lowest effort improvement 1]
- [ ] [Quick win 2]

## Creative Refresh Calendar
| Asset/Campaign | Last Updated | Next Refresh Due | Priority |
|---------------|-------------|-----------------|----------|
| [name] | [date] | [date] | [P1/P2/P3] |
```

## IV.2 Landing-page deliverables

The three Markdown documents produced by Part III: Landing Page Alignment Report, QS Diagnostic Report, Content Gap List. Their shapes are defined inside Step 5 above.

## IV.3 GAQL data reference

### Query 1 — RSA performance, last 30 days

(Shown in Part II, Phase 1.) Things to know:

- The headlines and descriptions fields return arrays of `{text, pinned_field}` objects, not flat strings.
- `ad.strength` is one of: EXCELLENT, GOOD, AVERAGE, POOR, UNSPECIFIED.
- `cost_micros` is denominated in millionths of the account currency. Divide by 1,000,000.

### Query 2 — Per-asset ratings and pins

(Shown in Part II, Phase 1.) Things to know:

- `field_type` resolves to HEADLINE or DESCRIPTION at this layer.
- `performance_label` is one of: BEST, GOOD, LOW, LEARNING, PENDING, NOT_APPLICABLE.
- `pinned_field` is one of: HEADLINE_1, HEADLINE_2, HEADLINE_3, DESCRIPTION_1, DESCRIPTION_2, UNSPECIFIED.

### Query 3 — PMax asset inventory

(Shown in Part II, Phase 1.) PMax exposes a wider set of `field_type` values: HEADLINE, LONG_HEADLINE, DESCRIPTION, MARKETING_IMAGE, SQUARE_MARKETING_IMAGE, PORTRAIT_MARKETING_IMAGE, LOGO, LANDSCAPE_LOGO, YOUTUBE_VIDEO, BUSINESS_NAME, CALL_TO_ACTION_SELECTION. Performance labels at this level are BEST, GOOD, LOW, LEARNING, PENDING.

### Query 4 — Video and Demand Gen metrics

(Shown in Part II, Phase 1.)

### Query 5 — Frequency exposure, last 7 days

(Shown in Part II, Phase 1.)

### Query 6 — Ad Strength across the account

```sql
SELECT
  campaign.name,
  campaign.advertising_channel_type,
  ad_group.name,
  ad_group_ad.ad.strength,
  ad_group_ad.ad.type
FROM ad_group_ad
WHERE ad_group_ad.status = 'ENABLED'
  AND campaign.status = 'ENABLED'
```

### When the API isn't available — UI exports

**Responsive Search Ads.** Navigate: Ads & assets → Ads → filter to Responsive search ads. Export Campaign, Ad group, Ad ID, Ad strength, Headlines, Descriptions, Impressions, Clicks, CTR, Conversions, Cost. The standard Ads export will not include per-asset performance labels — switch to the Assets tab for those.

**Asset performance.** Navigate: Ads & assets → Assets → Asset details. Export Campaign, Ad group, Asset type, the asset text or filename, and Performance rating. Pinned positions often don't survive the CSV export cleanly — verify in the UI.

**PMax asset groups.** Navigate: Asset groups → select the PMax campaign → view asset group details. PMax data is poorly served by CSV exports; budget time for manual UI review.

**Frequency.** Navigate: Campaigns → Columns → modify columns → Reach metrics → Avg. impr. freq. per user. Export Campaign, Channel type, Impressions, and Avg frequency.

### Column normalization

Both API and CSV sources should be mapped onto these standard column names so downstream logic doesn't branch on source:

| Standard column | GAQL field | CSV column |
|---|---|---|
| campaign_name | campaign.name | Campaign |
| ad_group_name | ad_group.name | Ad group |
| ad_id | ad_group_ad.ad.id | Ad ID |
| ad_strength | ad_group_ad.ad.strength | Ad strength |
| asset_type | field_type | Asset type |
| asset_rating | performance_label | Performance |
| impressions | metrics.impressions | Impressions |
| clicks | metrics.clicks | Clicks |
| ctr | metrics.ctr | CTR |
| conversions | metrics.conversions | Conversions |
| cost | metrics.cost_micros / 1000000 | Cost |
| frequency | metrics.average_frequency_per_user | Avg. impr. freq. per user |

## IV.4 Worked example — "TrailHaus" Outdoor Gear

A fictional walkthrough so the patterns above feel concrete. TrailHaus is a mid-market outdoor gear retailer selling through its own site and a Merchant Center feed. The account runs Search, PMax, and YouTube, and sits at **Developing** maturity (roughly 70 monthly conversions, conversion tracking installed but no offline import).

**At a glance.** Outdoor apparel and gear retailer, owned site plus Merchant Center feed. ~$22,000/month total spend, split roughly $9K Search / $10K PMax / $3K YouTube. Four Search ad groups, two PMax asset groups, one YouTube awareness campaign.

### RSA review (Phase 2)

**Ad group "Rain Jackets".** Headlines: 6 (below the 8 floor — Critical). Descriptions: 2 (meets floor — OK). Ad Strength: Poor. Asset labels: 3 Learning, 2 Good, 1 Low. Pin usage: all three positions pinned — the RSA has no room to optimize. Headline diversity: Weak (1 category). The six headlines all restate the category in slightly different ways — "Buy Rain Jackets", "Rain Jackets For Sale", "Top-Rated Rain Jackets", "Affordable Rain Jackets", "Rain Jackets Online", "Order Rain Jackets". No keyword anchors beyond the category itself, no CTAs of substance, no benefits, no proof. **Verdict:** total rebuild. Add 9 headlines across at least five diversity categories. Strip every pin. Replace the Low asset.

**Ad group "Hiking Boots".** Headlines: 13 of 15 (OK). Descriptions: 4 of 4 (OK). Ad Strength: Good. Asset labels: 4 Best, 3 Good, 3 Learning, 2 Low. Pin usage: only the brand name pinned to H1 — sensible. Headline diversity: Strong (6 categories) — keyword anchor ("Waterproof Hiking Boots"), outcome ("Stay Dry on a 20-Mile Trail"), social proof ("Backed by 4,200+ Hikers"), CTA ("Try Them for 60 Days"), brand ("TrailHaus Trail Gear"), promo ("Free Shipping & Returns"). **Verdict:** in good shape. Replace the two Low assets, add 2 more headlines to reach 15, leave the structure alone.

**Ad group "Camping Tents".** Headlines: 11 of 15 (OK). Descriptions: 3 of 4 (OK). Ad Strength: Average. Asset labels: 1 Best, 6 Good, 2 Learning, 2 Low. Pin usage: none. Headline diversity: Moderate (4 categories) — missing social proof, offers, and CTA variety. **Verdict:** solid base. Replace Low assets, add social-proof and offer headlines, add a fourth description.

**Ad group "Trail Running Shoes".** Headlines: 9 of 15 (OK). Descriptions: 3 of 4 (OK). Ad Strength: Average. Asset labels: 2 Best, 4 Good, 2 Learning, 1 Low. Pin usage: none. Headline diversity: Moderate (3 categories) — missing offers, CTAs, social proof. **Verdict:** add 4–6 headlines covering the missing categories. Replace the Low asset. Add a fourth description.

### PMax review (Phase 3)

**Asset group "Hiking Essentials" — Completeness 92/100.** Headlines 13/15, long headlines 4/5, descriptions 5/5. Images: landscape 11/20, square 9/20, portrait 3/20. Logos: 4 total (landscape + square covered). Video: 3 of 5. Business name and CTA both set. *Quality read:* text recombinations are coherent, video consists of three semi-professional 20-second trail demos, logos hold up at small sizes. But the entire image pool is generic stock outdoor scenery — no actual TrailHaus product photography and no lifestyle shots of customers using the gear. Theme coherence is strong: "all-day hiking gear for adults tackling weekend day-hikes." **Verdict:** the largest single quality unlock is replacing the stock landscape photos with real product and on-trail lifestyle shots.

**Asset group "Winter Layering" — Completeness 38/100.** Headlines 5/15, long headlines 1/5, descriptions 2/5 (all just above floor). Images: landscape 4/20, square 2/20, portrait 0/20. Logos: 2 total. Video: 0/5 — Google is auto-stitching one from the 6 product images. Business name and CTA set. *Quality read:* with only 5 headlines, very few coherent recombinations are available. The image set is all flat product-on-white shots. The theme is unclear — base layers, mid-layers, and insulated shells are all mixed together with no unifying audience or use-case. **Verdict:** running with severe asset gaps across every category. Upload at least one purpose-built video, add 6+ headlines, add 3 descriptions, add 10+ images across the three ratios. Decide whether to keep all layering categories together or split into separate themed groups by garment type.

### Video review (Phase 4)

YouTube awareness campaign, 15-second non-skippable spot.

| ABCD element | Rating | Note |
|---|---|---|
| Attention | Present | Opens on a hiker cresting a ridge — motion, contrast, visual interest |
| Branding | Partial | Logo appears at the end (seconds 12–15); absent from the first 5 seconds; no audio brand mention |
| Connection | Present | Authentic-feeling trail footage with a recognizable scenario |
| Direction | Missing | No CTA. Ends on the logo with no "visit trailhaus.com" or "shop now" |

Format: 15s, 16:9, non-skippable — appropriate for an awareness goal. Fatigue signal: CTR slid from 3.1% to 2.1% across four weeks while impressions held near ~60K/week. A 32% decline, well past the 20% trigger. **Verdict:** strong on Attention and Connection, but Branding placement is wrong and Direction is missing entirely. The creative has also fatigued. Refresh with a corrected opening and an explicit CTA.

### Fatigue review (Phase 5)

| Campaign | Signal | Detail |
|---|---|---|
| YouTube Brand Awareness | CTR decline | 32% drop over 4 weeks (3.1 → 2.1%), impressions stable |
| YouTube Brand Awareness | Creative age | The same video has been running 84 days, well past the 60-day refresh trigger |
| PMax - Hiking | Display frequency | 6.5/week, inside the warning band |

Other channels were either exempt (Search) or didn't carry enough volume to read (PMax Winter Layering).

### Cross-campaign consistency (Phase 6)

| Check | Status | Detail |
|---|---|---|
| Value proposition | Inconsistent | "Tested by AT thru-hikers" is a Best-rated headline in Search but appears nowhere in PMax or YouTube |
| Offer alignment | Consistent | "Free shipping & returns" appears everywhere it should |
| Brand voice | Consistent | Outdoor-enthusiast tone across the account |
| CTA consistency | Inconsistent | Search uses "Shop Now", PMax uses "Learn More", YouTube has no CTA |

The "tested by AT thru-hikers" gap is the costly one — Search has discovered a winning credibility angle that PMax and Video are leaving on the table.

### Deliverables that result

**Summary Dashboard.** Creative Health: **56/100.**

Key findings:

1. The Rain Jackets RSA is effectively frozen: 6 headlines, all pinned, Poor Ad Strength. The single most urgent fix in the account.
2. PMax "Winter Layering" sits at 38/100 completeness — auto-stitched video and almost no text variety.
3. The YouTube spot has fatigued 32% after 84 days with no refresh.
4. "Tested by AT thru-hikers" lives only in Search; PMax and Video are missing the credibility cue entirely.
5. PMax "Hiking Essentials" has strong copy but the image pool is entirely stock scenery.

Immediate (P1): rebuild the Rain Jackets RSA (9 fresh headlines, all pins removed, target Good+ Ad Strength); upload at least one real video to PMax "Winter Layering" to stop the auto-stitched version from serving; replace the YouTube creative with a version that brands inside the first 5 seconds and ends on an explicit CTA.

Quick wins: add "Tested by AT thru-hikers" headlines into both PMax asset groups; swap the two Low-rated assets in the Hiking Boots RSA; align CTA copy across the account ("Shop Now" everywhere).

**Test Plan.**

- **P1 — Rain Jackets RSA rebuild.** Variable: full rewrite, pins removed. Hypothesis: a diverse, unpinned set will lift CTR because Google can recombine assets per auction. Method: before/after (the current ad is too weak to split-test against). Duration: 14 days post-launch. Win: CTR up 15% vs. the prior 30-day baseline.
- **P2 — Real photography vs. stock in PMax Hiking.** Variable: replace stock scenery with product and on-trail lifestyle shots. Hypothesis: authentic imagery sets accurate expectations and builds recognition. Method: add the new images as additional assets and monitor performance labels for 30 days. Win: new images reach Good or Best while stock drifts toward Low.
- **P2 — YouTube refresh.** Variable: a new 15-second spot with branding fixed and a CTA added. Hypothesis: fresh creative restores CTR because the audience has saturated on the current spot. Method: launch new, pause old after 7 days. Duration: 21 days. Win: CTR back to 2.8%+ (close to the pre-fatigue 3.1%).
- **P3 — Winter Layering PMax completion.** Variable: bring completeness from 38 to 80+. Hypothesis: a fully equipped asset group widens placement coverage. Method: add all missing assets and compare 30 days before to 30 days after. Win: conversions from the Winter Layering asset group up 20%+.
