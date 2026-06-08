---
name: pancake-meta-ads-02-campaign-architecture
description: Three-campaign baseline (Testing, Winners, Advantage+), CBO vs ABO, consolidation rules, and naming conventions. Load before launching a new campaign or restructuring an account.
---

# Campaign Structure

Most underperforming accounts are not failing because of bad creative or bad audiences. They are failing because the algorithm cannot find enough signal in any one campaign to optimize against. This file is about how to organize an account so the machine has a chance.

## The three-campaign baseline

The most reliable starting architecture for any account, regardless of business model:

1. **Testing campaign** — a sandbox where new creative concepts compete. ABO so each test gets a fixed budget. About 25% of total account spend.
2. **Winners campaign** — your scaling vehicle, containing only proven creative graduated from Testing. CBO with Cost Cap. About 60–70% of total spend.
3. **Advantage+ campaign** — Meta's fully automated campaign type. Receives the remainder of budget and your best creative.

The first two campaigns are the testing-to-scaling pipeline. The third is the automation channel. They complement rather than replace each other.

### Testing campaign details

- One ad set per concept theme, so creative is the only variable
- Maximum 6–8 active ad sets at once — more than that fragments budget
- Budget per ad set: at minimum 3× the target CPA, in daily budget
- Each test runs 48–72 hours; statistical floor is 5 conversions per ad
- Use the audience that the Winners campaign uses, so the test environment matches the scale environment
- Graduate winners to the Winners campaign via the Post ID method (don't duplicate the ad — it loses social proof)

### Winners campaign details

- CBO at the campaign level
- Single broad or Advantage+ Audience ad set is usually best; add a second ad set only if it represents genuinely different targeting and the algorithm would over-concentrate without it
- Cost Cap set at target CPA + 15–25%
- Maintain 5–10 active ads per ad set; refresh roughly every 2–4 weeks
- Only Post ID winners enter; nothing untested lives here

### Advantage+ campaign details

- One ASC campaign per market/product line (Meta's own recommendation)
- Feed it 6–10 of your top performers plus catalog products if you have them
- Set existing-customer budget cap at 5–10% for SaaS, 10–20% for ecommerce default, higher for high repeat rate businesses
- Don't duplicate creative between ASC and manual campaigns — they will compete in the auction

## CBO vs ABO decision

Use **CBO (Campaign Budget Optimization)** when:

- The campaign has 2–5 ad sets with similar optimization goals
- Total campaign conversions exceed about 50 per week
- You trust the algorithm to allocate between audiences

Use **ABO (Ad Set Budget Optimization)** when:

- You are running controlled testing and need equal budget across cells
- Retargeting where pool sizes vary and you need precise per-audience budget
- Ad sets have very different audience sizes (CBO will over-index on the largest)
- The campaign has only one ad set (CBO adds nothing)

### CBO pathologies and fixes

- **CBO concentrates 80%+ of spend on one ad set:** usually correct behavior — Meta found the best opportunity. Only intervene by setting minimum spend per ad set if you have a strategic reason to keep budget flowing elsewhere.
- **CBO with one ad set:** the budget mechanism is pointless. Switch to ABO or add ad sets.
- **CBO with more than five ad sets:** budget is diluted. Consolidate to two to four ad sets.
- **ABO with three similar ad sets on a scaling campaign:** missing algorithmic optimization. Test converting to CBO.

## Account size guardrails

| Monthly spend | Max active campaigns | Max active ad sets |
| --- | --- | --- |
| < $10K | 2–3 | 4–6 |
| $10K–$50K | 3–4 | 6–12 |
| $50K–$150K | 4–6 | 10–20 |
| $150K–$500K | 5–8 | 15–30 |
| $500K+ | 6–10 | 20–40 |

Exceeding the ad set ceiling fragments learning. Every ad set should be able to generate ~50 weekly conversions at the account's target CPA, which means the minimum viable daily budget per ad set is roughly `target_CPA × 50 / 7`.

## Consolidation triggers

Audit your structure when any of these are true:

- More than five active campaigns share the same objective
- More than eight total active campaigns on a Developing-or-below account
- More than five ad sets in a single CBO campaign
- More than eight ad sets in an ABO campaign
- Any ad set generating fewer than 50 weekly conversions
- Any ad set with an effective budget under $10/day
- Audience overlap between ad sets above 30%
- A majority of ad sets stuck in "Learning Limited"

## Common anti-patterns

- **One campaign per audience.** "LAL 1% Campaign", "LAL 2% Campaign", "Interest A Campaign" — merge into one campaign with audiences as ad sets, or just go broader.
- **One campaign per creative type.** "UGC Campaign", "Video Campaign" — merge. Creative competes within ad sets, not across campaigns.
- **Duplicating to "restart" a campaign.** Performance dips, so the team clones and relaunches. This almost never works — the actual problem (fatigue, audience, bid) is unchanged.
- **Over-segmented retargeting.** Four separate retargeting ad sets by lookback window starve each other of learning data. One or two ad sets is usually plenty.

## Cascade risk when pausing top spenders

When you pause a high-spending ad or ad set, the rest of the campaign may not absorb that budget efficiently. The campaign can degrade as an indirect knock-on. Algorithms tune around the whole portfolio of ads inside the ad set, so yanking out one large player disrupts the equilibrium.

Before pausing anything taking more than 30% of campaign spend:

1. Check the spend share
2. Get a replacement ready before pausing
3. Activate the replacement, wait 24–48 hours
4. Then pause the underperformer
5. Monitor campaign-level metrics for 3–5 days

If a high-CPA ad keeps spending, do a 24–48 hour pause test. If campaign CPA improves, keep it paused. If campaign CPA worsens, the ad was contributing something — reactivate.

## Objective selection

Pick the campaign objective closest to the business goal, then pick the deepest optimization event that can still hit ~50 events per week per ad set.

| Goal | Objective | Optimization event |
| --- | --- | --- |
| Online purchase | Sales | Purchase |
| On-platform lead form | Leads | Lead |
| Website lead | Leads or Sales | Lead (website) |
| SaaS signup | Sales | CompleteRegistration or Purchase |
| App install | App Promotion | App Install or App Event |
| Website traffic | Traffic | Link Click or LP View |
| Video views | Engagement | ThruPlay |
| Brand reach | Awareness | Reach |

If the deepest event can't sustain 50 weekly events, move one step up the funnel.

## Naming conventions

Standardized naming makes filtering and automated parsing possible. Use underscores between tokens, hyphens within tokens, uppercase for token values, lowercase only when you need UTM alignment.

- **Campaign:** `[OBJECTIVE]_[TYPE]_[AUDIENCE-SUMMARY]_[YYYY-MM]`
  - `SALES_WINNERS_CBO_2026-03`
  - `SALES_TESTING_ABO_2026-03`
  - `SALES_ASC_2026-03`
- **Ad set:** `[AUDIENCE-TYPE]_[DETAIL]_[PLACEMENT]`
  - `BROAD_US-18-65_ALLPLACEMENTS`
  - `LAL-1PCT_PURCHASERS_ALLPLACEMENTS`
  - `RETARGET_WEB-30D_ALLPLACEMENTS`
- **Ad:** `[FORMAT]_[CONCEPT]_[HOOK]_[VERSION]`
  - `UGC_TESTIMONIAL_SLACK-CHAOS_V1`
  - `VIDEO_DEMO_30SEC-WALKTHROUGH_V3`

UTM template that aligns with the convention:

```
?utm_source=meta&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

Things to forbid: generic names ("Campaign 1"), person-dependent names ("John's test"), emojis (break some reporting tools), and spaces (break UTMs).

## Structure templates by business model

### SaaS / B2B at $5K–$15K/month

```
SALES_TESTING_ABO_2026-03 (~25% budget)
  AS: BROAD_US_ALLPLACEMENTS — 6–12 test ads
  AS: INTEREST_AI-SLACK-TOOLS_ALLPLACEMENTS — 6–12 test ads
SALES_WINNERS_CBO_2026-03 (~60% budget, Cost Cap)
  AS: BROAD_US_ALLPLACEMENTS — 5–8 Post ID winners
SALES_RETARGET_ABO_2026-03 (~15% budget)
  AS: RETARGET_WEB-30D_ALLPLACEMENTS — 3–5 retargeting-specific ads
```

### SaaS / B2B at $15K–$75K/month

Add a third prospecting interest stack, optionally a LAL ad set, and introduce ASC at about 15% of budget. Split retargeting into a high-intent ad set and a general one.

### Ecommerce at $15K–$75K/month

```
SALES_TESTING_ABO  (~15%)
SALES_WINNERS_CBO  (~40%, Cost Cap or Min ROAS)
SALES_ASC  (~30%, existing customer cap 10%, catalog connected)
SALES_RETARGET_CBO  (~10%, DPA + social proof)
SALES_RETENTION_ABO  (~5%, cross-sell to customers)
```

### Ecommerce at $75K+/month

ASC becomes the primary revenue driver at 35–50% of budget. Add an international ASC if expansion is on. Reduce manual prospecting to 30%. Run testing at about 10% so the pipeline stays full.

## Migration from a fragmented structure

If you inherit an account with 10+ campaigns, don't restructure overnight. Do it in phases over 2–3 weeks:

1. List every active campaign with objective, audience, performance
2. Identify which campaigns target the same audience with the same objective — these are merge candidates
3. Design the consolidated structure (usually 3–4 campaigns)
4. Identify the best-performing ads across all the existing campaigns by Post ID
5. Build the new structure and add the top performers via Post ID
6. Run the new structure alongside the old at split budget for 7 days
7. Compare total account performance, not campaign-by-campaign — total spend, total conversions, blended CPA
8. If the new structure matches or beats the old, pause old campaigns one at a time
9. If something breaks, you still have the old structure live

Pause campaigns rather than delete them — you want the historical data.
