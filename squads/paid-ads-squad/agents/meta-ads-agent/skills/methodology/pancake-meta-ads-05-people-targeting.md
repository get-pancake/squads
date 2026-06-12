---
name: pancake-meta-ads-05-people-targeting
description: How targeting decisions stack by maturity, lookalike sizing, exclusion layering, audience overlap, and saturation signals. Load when auditing audiences or making any targeting change.
---

# Audience Strategy

The right targeting depends on how much data the pixel has and what business you're in. The core insight: as the algorithm gets smarter, your targeting should get simpler, not more elaborate.

## How targeting decisions stack

From most scalable to least, and from most mature-account-friendly to least:

```
Broad (no targeting) → Advantage+ Audience → Lookalike → Interest → Custom (warm)
```

This is not a quality ranking. It is a maturity-dependent hierarchy. The right approach depends on conversion volume and business model.

## Targeting by maturity stage

### Nascent (0–50 conversions/month)

Problem: pixel doesn't know who your customer is.

- **Primary:** interest targeting in 3–5 well-researched stacks
- **Secondary:** lookalikes from a customer list if available (need at least 1,000 person seed)
- **Warm:** custom audiences from email list and website visitors
- **Avoid:** broad targeting (algorithm has nothing to optimize against), Advantage+ Audience (same reason)

Budget split: ~70% interest prospecting, ~30% warm retargeting.

### Developing (50–200 conversions/month)

- **Primary:** lookalikes (1–3% from purchasers or signups)
- **Secondary:** refined interest targeting based on what worked at Nascent
- **Test:** Advantage+ Audience with interest suggestions on one ad set
- **Warm:** expanding retargeting pools

Run a broad ad set alongside the interest/lookalike targeting and compare CPA over 14 days. The winner often surprises.

### Established (200–500 conversions/month)

- **Primary:** broad targeting or Advantage+ Audience
- **Secondary:** 3–5% lookalikes for incremental reach
- **Reduced:** interest targeting only for specific use cases (launches, niche)
- **Warm:** full-funnel retargeting consolidated to 2–3 audiences

This is the stage where consolidation matters. If you have 10 interest-targeted ad sets, test merging them into 2–3 broader groups. The algorithm beats manual segmentation here.

### Advanced (500+ conversions/month)

- **Primary:** broad targeting for prospecting; Advantage+ Shopping for ecommerce
- **Minimal:** audience restrictions only for specific business reasons (compliance, geography)
- **Warm:** streamlined to one retargeting campaign in most cases
- **Testing:** new market expansion, international audiences

Trust the algorithm. Your pixel data is your targeting.

## Audience type deep dives

### Broad targeting (open targeting)

No interest or behavior targeting. Only age, gender, and location restrictions. Meta finds converters using pixel data, ad engagement, and conversion patterns.

When to use: established accounts with 200+ monthly conversions; as a control test against any targeted strategy; when targeted audiences fatigue or plateau; Advantage+ Shopping.

When not to use: new accounts with under 50 conversions; hyper-niche B2B; when geographic restrictions are critical (broad may leak).

Setup: age 18–65+ unless genuinely irrelevant. Single country/region. Single language only if the landing page is single-language. Custom audiences only for exclusions.

What to expect:

- Days 1–7: CPA 20–40% higher than targeted campaigns
- Days 7–21: algorithm learns, CPA approaches or beats targeted
- Day 21+: if CPA hasn't reached parity, broad may not suit your account yet

Troubleshooting: CPA 2× target after 14 days → switch back to interests, return when you have 200+ conversions. Wrong demographics in delivery → improve creative; the creative is attracting the wrong audience.

### Advantage+ Audience

Meta's AI targeting. You provide "audience suggestions" (interests, demographics, custom audiences) as signals, but Meta expands beyond them to find converters.

The shift in mental model: old model says "show ads to people who like X, Y, Z" (restrictions). New model says "people who like X, Y, Z are a good starting point" (suggestions). Over time, 40–70% of impressions may go outside your defined suggestions.

When to use: Developing-to-Established accounts; when you want algorithmic optimization with directional guidance; for prospecting where you have a hypothesis about your audience.

When not to use: strict audience control needed for compliance or geo; A/B tests where audience purity matters; retargeting (use custom audiences directly).

What to provide as suggestions: best-performing custom audiences as seeds, 2–3 broad interest categories, lookalike seeds from highest-quality source audiences, age ranges where the product converts. What not to provide: dozens of narrow interests, conflicting suggestions, competitor brand names (unreliable), or nothing (works only for very mature accounts).

### Lookalike audiences

Meta finds users similar to a source audience you provide. The percentage controls similarity (1% = most similar, 10% = broadest).

| LAL % | US audience size (approx) | Best for |
| --- | --- | --- |
| 1% | ~2.1M | Precision prospecting, limited budgets |
| 1–2% | ~4.2M | Primary scaling audience |
| 2–3% | ~6.3M | Scale when 1% saturates |
| 3–5% | ~10.5M | High-spend scale |
| 5–10% | ~21M | Maximum reach, approaches broad |

**Source audience quality matters most.** A 1% LAL from your top 100 customers will beat a 1% LAL from all website visitors.

Source quality ranking (best to weakest):

1. Top 25% customers by LTV
2. All purchasers (last 180 days)
3. High-intent website visitors (add-to-cart, pricing page, signup started)
4. Trial-to-paid converters
5. Engaged email subscribers
6. Video viewers (75%+ completion)
7. All website visitors
8. Page/profile engagers

Source size:

- Hard minimum: 100 people
- Recommended minimum: 1,000 for quality
- Optimal: 5,000–50,000
- Above 50K: quality dilutes — use a more selective subset

Refresh cadence: rebuild lookalikes monthly. Lookalikes are snapshots — they don't auto-update when the source audience grows. Name them with dates ("LAL 1% Purchasers 2026-03"). Transition campaigns gradually — run old and new in parallel for 3–5 days.

You can also stack multiple lookalikes in one ad set using OR logic (e.g. "LAL 1% Purchasers OR LAL 1% High-Value Leads"), which broadens reach while keeping quality signals.

### Interest targeting

Targeting based on Meta's categorization of user interests, behaviors, and demographics.

When to use: Nascent accounts (primary method); new market or vertical launches; specific campaigns (competitor targeting); when algorithmic targeting isn't performing.

Stacking strategies:

- **Broad stacks (OR logic):** five related interests grouped thematically. Larger audience, more scale. Recommended default.
- **Narrow stacks (AND logic):** "must match A AND B." Smaller, more qualified. Use when your product serves a specific intersection. Risk: too small to scale.
- **Exclusion stacks (NOT logic):** "include SaaS, exclude Enterprise." Useful for cleanly defining a sub-segment.

Where to find interests: Meta's Audience Insights tool, competitor brand names and products, industry publications, related software your audience uses, job titles and professional behaviors.

### Custom audiences (warm and retargeting)

Built from your first-party data: website visitors, customer lists, app users, platform engagers.

| Source | Typical lookback | Use case |
| --- | --- | --- |
| All website visitors | 30–180 days | General retargeting, LAL source |
| Specific high-intent pages | 7–30 days | Hot retargeting (pricing, signup) |
| Add-to-cart | 7–14 days | Cart abandonment |
| Customer list | N/A | Upsell, exclusion, LAL source |
| Video viewers (25%+) | 30–365 days | Mid-funnel nurture |
| Video viewers (75%+) | 30–365 days | High-intent warm, good LAL source |
| Lead form openers (no submit) | 30–90 days | Form abandonment |
| IG/FB engagers | 30–365 days | Social-first retargeting |
| App activity | 30–180 days | Re-engagement |

Retargeting window strategy:

- 0–3 days: hottest intent, smallest audience, highest CVR
- 3–7 days: strong intent, good balance
- 7–14 days: moderate intent, primary retargeting window
- 14–30 days: cooling, broader messaging needed
- 30–180 days: cold re-engagement only

Customer list match rates depend on which fields you include:

| Data points | Expected match rate |
| --- | --- |
| Email only | 30–50% |
| Email + phone | 50–65% |
| Email + phone + name | 55–70% |
| All fields (DOB, address, etc.) | 60–75% |

## Exclusion strategy

Exclusions prevent paying to acquire people who are already your customers.

### The three-layer exclusion model

**Layer 1 — pixel-based exclusions (highest match):**

- Purchase event, 180-day lookback → exclude from all prospecting
- CompleteRegistration, 90 days → exclude from all prospecting
- InitiateCheckout, 30 days → exclude from top-of-funnel prospecting
- AddToCart, 14 days → exclude from top-of-funnel prospecting

**Layer 2 — customer list exclusions (broadest coverage):**

- All paying customers, refreshed weekly → exclude from all prospecting
- All registered users, refreshed weekly → exclude from all prospecting
- Active trial users, refreshed daily if possible → exclude from prospecting
- Churned customers → optional; you may want to win them back

Match rate reality: email-only lists hit 30–50%. So 50–70% of your customers are not being excluded by Layer 2 alone — that's why Layer 1 + Layer 2 combined is the design.

**Layer 3 — engagement-based (supplementary):**

- Lead form submitters (90 days) → exclude from lead-gen prospecting
- IG/FB followers → optional exclude from cold prospecting
- Video viewers 95% (365 days) → optional, high awareness

### Architecture by campaign type

**Prospecting:** exclude Layer 1 (purchase + registration + lead events) and Layer 2 (paying customers + registered users + trial users).

**Retargeting (warm):** include website visitors, video viewers 50%+, lead form openers, IG/FB engagers. Exclude purchasers (Layer 1 + Layer 2).

**Retention/upsell:** include paying customers. Exclude recent purchasers (7–14 days, avoid buyer's remorse), churned, and top-tier customers if upselling.

**Advantage+ Shopping:** cannot apply manual exclusions. Use the existing-customer budget cap (5–10% for SaaS, 10–20% default).

### Common exclusion mistakes

- **No exclusions at all:** 10–30% of prospecting budget wasted on existing customers.
- **Customer list only, no pixel:** 50–70% leak due to low match rates.
- **Short lookback:** customers who converted 60+ days ago re-enter prospecting.
- **Excluding from retargeting:** retargeting audience becomes too small to exit learning.
- **Over-excluding from ASC:** ASC needs some existing customer data to understand the ideal buyer. Use budget cap, not hard exclusion.
- **Never refreshing lists:** new customers keep seeing prospecting ads.

Expect 5–15% residual leakage even with everything set up correctly — that's the practical floor given match rate realities. Above 20% warrants investigation.

## Audience overlap

Run Meta's Audience Overlap tool on every pair of active audiences.

| Overlap | Interpretation | Action |
| --- | --- | --- |
| Under 10% | Distinct | Run separately |
| 10–20% | Minor | Monitor, generally acceptable |
| 20–30% | Moderate | Consider consolidation if similar performance |
| 30–50% | Significant | Consolidate into one ad set |
| 50%+ | Essentially the same audience | Merge — you're bidding against yourself |

Why overlap hurts:

- Your ad sets compete against each other in the auction (CPM goes up)
- Algorithm gets confused (inconsistent signals)
- Budget fragments across redundant ad sets
- Reporting becomes misleading (same person counted in multiple audiences)

### Consolidation protocol

1. Identify overlapping pairs
2. Compare CPA/ROAS of each
3. Keep the better performer; pause the other
4. If both perform similarly, merge into a broader ad set
5. Increase the surviving budget to the combined previous total
6. Monitor for 7 days

Consolidated ad sets often outperform the sum of the parts because the learning signal is stronger.

## Saturation signals

Even the best audience eventually saturates. Watch for:

| Signal | Threshold |
| --- | --- |
| Rising frequency (prospecting) | Above 3 |
| Rising frequency (retargeting) | Above 7 |
| Declining CTR | Drop of 15%+ over 14 days |
| Increasing CPM | 20%+ above baseline |
| Flattening conversions | Plateau despite budget increases |
| Increasing CPA | Gradual upward trend over 2+ weeks |

Saturation responses, in order of preference:

1. Expand the audience (raise LAL %, broaden interests, test Advantage+ or broad)
2. Refresh creative (often re-engages a "saturated" audience)
3. Change the offer (different angle, landing page, CTA)
4. Expand geography (new countries, new languages)
5. Accept the ceiling and shift budget elsewhere

## Quarterly audience refresh

| Audience type | Action | Cadence |
| --- | --- | --- |
| Customer list audiences | Re-upload latest CRM export | Monthly, or when cohort grows 20%+ |
| Lookalike source audiences | Rebuild source + rebuild LAL | Quarterly |
| Website retargeting audiences | Auto-update; verify lookback window | Quarterly review |
| Exclusion audiences | Re-upload purchaser/churned lists | Monthly |
| Overlap check across all active audiences | Run audience overlap tool | Quarterly, plus before launching anything new |

## Audience size guidelines

| Campaign type | Minimum | Recommended | Maximum effective |
| --- | --- | --- | --- |
| Prospecting (interest) | 500K | 2M–20M | 50M+ (effectively broad at that point) |
| Prospecting (LAL) | 1M | 2M–10M | 20M |
| Prospecting (broad) | N/A | Total country population | N/A |
| Retargeting | 1,000 | 10K–500K | 1M+ (use as LAL source instead) |
| Custom list | 1,000 | 5K–100K | 500K (use as LAL source for larger) |

If your audience is under 1,000, you can't run ads to it effectively — use it as a LAL source. If it's over 50M for an interest-targeted ad set, you're effectively running broad with extra steps — switch to actual broad targeting.

## Decision matrix by maturity and business model

| Monthly conversions | Primary | Secondary | Avoid |
| --- | --- | --- | --- |
| Under 50 | Interest stacks | Customer list LALs | Broad, Advantage+ |
| 50–200 | LAL 1–3% | Advantage+ Audience | Over-segmented interests |
| 200–500 | Broad or Advantage+ | LAL 3–5% | Narrow interests |
| 500+ | Broad | ASC | Manual restrictions |

## Audience lifecycle for the full funnel

Four stages, with exclusions chained to prevent overlap:

**Awareness (prospecting):** broad/Advantage+/LAL audiences, exclude trial users, paid subscribers, churned (if re-engagement is separate).

**Trial (activation):** custom audience from CompleteRegistration or TrialStarted pixel event, 30-day window. Exclude paid subscribers.

**Purchaser (retention/upsell):** custom audience from Purchase pixel event or customer list, 180-day window. Exclude churned, cross-sell to other SKUs if applicable.

**Churned (re-engagement):** customer list of churned segment. Exclude active subscribers and very recent churns (under 14 days to avoid buyer's-remorse messaging).

Each stage should exclude all lower-funnel audiences from higher-funnel campaigns. Awareness campaigns should exclude Trial + Purchaser + Churned audiences to avoid paying to prospect users already in the funnel.
