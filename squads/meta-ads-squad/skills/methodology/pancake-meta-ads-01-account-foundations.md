---
name: pancake-meta-ads-01-account-foundations
description: Profile a Meta ad account — identity, capabilities, KPI targets, and the four maturity stages that calibrate every other recommendation. Load this first; every other playbook reads it.
---

# Account Setup and Maturity Stages

Every recommendation in the rest of these files assumes you know what kind of account you are working on. This file is how you answer that question.

## Account identity sheet

For each Meta ad account under management, capture the following before doing any analysis. Treat this as the configuration that every other workflow reads.

### Identity

- Account name and short slug for file naming
- Meta ad account ID (format `act_` followed by digits)
- Currency (ISO 4217, e.g. USD, GBP, EUR)
- Timezone (IANA, e.g. `America/New_York`)
- Business model: e-commerce, lead gen, SaaS, app, local, or dual
- Status: active, paused, onboarding, offboarding

### Tracking and data

- Meta Pixel ID
- Conversions API dataset ID (if running CAPI Gateway)
- Whether CAPI is implemented (server-side events firing)
- Whether a product catalog is connected
- Whether Advantage+ Shopping is enabled
- Whether value-based optimization is active
- Whether any custom conversions are defined beyond standard events
- Which campaign objectives are currently running

### KPI configuration

Define the primary KPI (one of CPA, ROAS, CPL, CPV, CPM) and set numerical targets for each metric you care about: CPA, ROAS, CPL, CPV, CPM, CTR, hook rate (3-second video view rate as a decimal), hold rate (ThruPlay rate as a decimal), frequency cap, CPC.

Then define flag thresholds at two severity levels. The defaults below are a reasonable starting point — tighten them for high-volume mature accounts and loosen them for nascent ones.

| Threshold | Critical default | Warning default |
| --- | --- | --- |
| CPA over target | +50% | +20% |
| ROAS under target | −40% | −20% |
| Frequency | above 4.0 | above 2.5 |
| CTR | below 0.5% | below 1.0% |
| Hours spending with zero conversions | 48 | 24 |

### Creative configuration

- Testing framework in use: dynamic creative testing, manual A/B, or structured (Faris-style)
- Target number of new creatives per week
- Which creative formats are in rotation (static, video, UGC, carousel, catalog, collection)

### Audience configuration

- Warm audiences available for retargeting (name, type, lookback window)
- Exclusion audiences for prospecting
- Lookalike seed audiences with recommended percentage ranges
- Whether Advantage+ Audience is the default targeting method

### Naming conventions

Use token-based naming patterns so downstream automation can parse names and segment performance. Reasonable defaults:

- Campaign: `{objective}_{audience}_{geo}_{launch_date}` — e.g. `CONV_PROS_US_2026-03`
- Ad set: `{targeting}_{placement}_{bid_strategy}_{budget}` — e.g. `LAL3-LTV_AUTO_LCAP50_D50`
- Ad: `{creative_type}_{concept}_{variant}_{format}` — e.g. `VID_TESTIMON_V3_9x16`

### Measurement

- Attribution window (default to 7-day click; broaden to 7-day click plus 1-day view only when justified by business model)
- Third-party attribution tool, if any (Triple Whale, Northbeam, Hyros)
- UTM template: source `meta`, medium `paid-social` or `cpc`, and dynamic campaign/ad-set/ad name parameters

### Compliance flags

- Special Ad Category (none, housing, credit, employment)
- GDPR applicable (any EU/EEA/UK targeting)
- CCPA applicable (any California audiences)

### Reporting

- Default reporting period (last 7 days, last 14 days, last 30 days, MTD, last month)
- Comparison period (preceding period, same period last month, same period last year)
- Output path for generated reports

## When to update the account profile

Refresh this profile whenever any of these happen:

- A new client or brand is onboarded
- A new pixel, CAPI integration, or catalog connection goes live
- KPI targets are revised (often seasonal or after a major test)
- The campaign mix changes — adding ASC, lead forms, catalog sales, etc.
- A new market or currency is added
- Attribution setup changes

## The four maturity stages

Account maturity is the single biggest calibration variable. The same advice that helps a $50K/month account will sink a $2K/month account. Classify accounts into one of four stages by **monthly conversion volume** combined with **monthly spend**.

### Stage 1: Nascent

**Definition:** fewer than 30 conversions per month, or less than $3,000 in monthly spend.

The pixel barely has signal. Every dollar is at least as much about gathering data as it is about acquiring customers.

- **Bidding:** Lowest Cost only. Cost Cap, Bid Cap, and Minimum ROAS all require more conversion volume than the account has.
- **Structure:** 1–2 campaigns. ABO so you keep manual control over which audiences get budget. CBO is wasted at this stage because the algorithm has no signal to allocate on.
- **Creative volume:** 3–5 new ads per week. Stick to static images and short video (under 30 seconds). Manual A/B testing only — DCT will produce noise with this little data.
- **Audiences:** Interest stacks (3–5 stacked categories per ad set) plus a broad ad set as a control. Lookalikes only if you have a 1,000+ person seed audience. Skip Advantage+ Audience entirely.
- **Measurement:** 7-day click attribution. Watch link clicks, landing page views, and add-to-carts — conversion CPA/ROAS is too noisy to act on weekly. Verify pixel and CAPI installation; this is the highest-leverage action at this stage.
- **Avoid:** Advantage+ Shopping (needs 50+ weekly conversions to optimize), value-based optimization, scaling daily budget by more than 20% at once, complex multi-campaign structures, dynamic product ads.

### Stage 2: Developing

**Definition:** 30–100 conversions per month and $3,000–$15,000 in monthly spend.

There is enough conversion history for the algorithm to start understanding who converts. This is the experimentation stage.

- **Bidding:** Lowest Cost as the default, but begin testing Cost Cap on the highest-volume campaign. Set the cap 20% above current average CPA, run for at least 7 days, then tighten by 10% if delivery is stable.
- **Structure:** Three campaigns: a prospecting CBO (2–4 ad sets), a retargeting ABO with separate budget control, and a dedicated testing campaign in ABO so experiments don't disrupt proven campaigns. This is the stage where CBO starts to pay off for prospecting.
- **Creative volume:** 5–8 new ads per week. Add UGC and carousel formats alongside static and video. Begin dynamic creative testing in the testing campaign — each DCT test needs 50+ conversions to identify winning element combinations.
- **Audiences:** Broad targeting plus 1–3% lookalikes built from purchasers. Test Advantage+ Audience on one ad set. Set proper exclusions (30-day purchasers excluded from prospecting, all purchasers excluded from retargeting).
- **Measurement:** Keep 7-day click. CPA and ROAS become meaningful enough to track weekly. Confirm Event Match Quality is above 6.0. Consider a third-party attribution tool once cross-channel spend exceeds about $10K/month.
- **Avoid:** Advantage+ Shopping until you can sustain 50+ weekly conversions, full Advantage+ Audience on every ad set, scaling budgets by more than 20% per day, over-segmented retargeting (e.g. 10 retargeting ad sets at $5/day each).

### Stage 3: Established

**Definition:** 100–300 conversions per month and $15,000–$50,000 in monthly spend.

The algorithm now has strong enough signal to outperform most manual judgment. The job changes shape — less about prescribing what to do and more about feeding good inputs and stepping back.

- **Bidding:** Cost Cap as the default on prospecting. Lowest Cost on retargeting. Begin testing Minimum ROAS on your highest-value campaign once you have 100+ value-tracked conversions. Use Meta's Experiments tool to run controlled bid strategy splits.
- **Structure:** A portfolio of 4–6 campaigns: Advantage+ Shopping (primary scaling vehicle), prospecting CBO, retargeting CBO, catalog sales, a testing campaign, and optionally a seasonal/promo campaign. Merge any campaign with fewer than 20 conversions per week.
- **Creative volume:** 8–15 new ads per week. Run all formats. DCT is now the default testing method. Build a creative performance database — by concept, format, hook type, CTA, and product.
- **Audiences:** Advantage+ Audience as the default prospecting method, with 1–2 manual targeting ad sets retained as controls. Lookalikes in the 3–10% range are now viable. Consolidate retargeting to 2–3 audiences maximum. Set ASC's existing-customer budget cap to 25–30% to start.
- **Measurement:** Broaden to 7-day click plus 1-day view. Implement a third-party attribution tool. Begin Meta Conversion Lift studies (requires $50K+ spend during the test window). Implement value tracking on every conversion event.
- **Avoid:** Micro-managing ad sets — manage at the campaign level. Manual bid changes without using Experiments. Skipping ASC. Letting creative volume stagnate.

### Stage 4: Advanced

**Definition:** 300+ conversions per month and $50,000+ in monthly spend.

This is a scaled operation. Every Meta feature is potentially useful. Focus shifts to optimizing the machine and measuring true incremental impact.

- **Bidding:** A portfolio approach. ASC uses Lowest Cost or Cost Cap. High-value prospecting uses Minimum ROAS. Retargeting uses Lowest Cost. Testing uses Lowest Cost. Always have one bid strategy experiment running.
- **Structure:** A tiered portfolio of 6–10+ campaigns. Recommended budget split: 40–50% to ASC (Tier 1, Scale), 25–30% to prospecting CBO (Tier 2, Growth), 15–20% to retargeting and catalog (Tier 3, Efficiency), 5–10% to testing (Tier 4), and a conditional tier for seasonal pushes. Apply the 70/20/10 principle: 70% to proven, 20% to scaling experiments, 10% to pure tests.
- **Creative volume:** 15–30+ new ads per week (100+ per month). Multiple testing tracks run simultaneously: concept, format, hook, and iteration on winners.
- **Audiences:** Fully algorithmic targeting with strategic overrides. Advantage+ Audience everywhere with audience suggestions used as direction rather than constraint. Value-Based Lookalikes from the top 10% LTV segment. ASC existing-customer cap at 15–25%. Run incrementality holdout tests quarterly. Automate audience syncs.
- **Measurement:** Multi-touch attribution via a third-party tool is essential. Run Conversion Lift quarterly. Build a blended ROAS model: roughly 40% weight on Meta-reported, 35% on third-party, 25% on incremental. At $600K+ annual Meta spend, invest in marketing mix modeling (Robyn, Meridian, or paid tools).
- **Avoid:** Over-reliance on a single campaign, ignoring incrementality, manual processes that could be automated, treating Meta in isolation from Google, email, organic, and brand.

## How accounts move between stages

Re-assess maturity monthly while an account is Nascent or Developing, and quarterly once Established or Advanced. Promote when:

- Nascent → Developing: 30+ conversions in a 30-day window and $3K+ monthly spend sustained for two or more months.
- Developing → Established: 100+ conversions per month sustained for three or more months, plus $15K+ monthly spend, plus verified CAPI.
- Established → Advanced: 300+ conversions per month sustained for three or more months, plus $50K+ monthly spend, plus a third-party attribution tool in place.

Accounts can also regress. The usual causes are seasonal volume drops, budget cuts, pixel/CAPI degradation (treat as Nascent until fixed), or a major platform change.

## Reassessment scoring

When the volume thresholds are borderline, score the account across these modifier dimensions and combine with the base stage:

- **Data infrastructure:** pixel completeness, CAPI, Event Match Quality, catalog connection, custom conversion definitions.
- **Campaign sophistication:** active campaign count, bid strategies in use, ASC adoption, audience strategy.
- **Creative maturity:** weekly creative output, format diversity, testing framework.
- **Measurement maturity:** attribution window, third-party tools, history of lift studies.

A strongly negative modifier (e.g. pixel/CAPI broken) caps the account at Nascent regardless of spend. A strongly positive modifier can promote an account one stage above its base classification. A spend of more than $100K/month with fewer than 100 conversions stays Developing — spend alone doesn't equal maturity.

## Operating habits that survive every transition

Five habits that hold whichever stage you're in:

1. **Concentrate the signal.** A few large campaigns will outperform many small ones because algorithmic optimization needs density to work.
2. **Outwork the targeting on creative.** The targeting lever shrinks each year; the creative lever grows. Volume and quality of creative is where most accounts have the most upside.
3. **Trust the data only in proportion to your spend.** Meta's native reporting is acceptable at $3K/month and increasingly misleading by $50K/month — invest in third-party measurement as you scale.
4. **Respect the learning window.** Most meaningful edits restart the ~50-conversion learning cycle. Group your changes so you don't burn that runway repeatedly.
5. **Move budgets in small steps.** Hold daily budget changes to 20% or under per edit. Larger jumps trigger delivery recalibrations that destabilize performance.
