---
name: pancake-meta-ads-13-operational-routines
description: Step-by-step routines for launching campaigns, briefing creative, investigating regressions, optimizing budgets, and auditing each subsystem. The playbook library — loaded for every concrete operational action.
---

# Action Playbooks

This file consolidates the operational routines — step-by-step procedures for the work the agent runs day-to-day. Each playbook is a sequence the agent follows without re-deriving it every time.

## How the playbooks treat approval

The agent executes the actions a playbook surfaces. There is no pre-execution review gate. The single exception is the budget-commitment rule: any action that would raise total committed spend (a budget increase, a Cost Cap or Bid Cap lift, a Minimum ROAS floor reduction, a new campaign or ad set with net-new spend) is held back and packaged as an approval request that surfaces in the daily digest.

Everything else — pauses, budget reductions, Cost Cap lowering, audience refreshes, bid-strategy switches at current cost levels, Custom Conversion creation, audience consolidation within existing budget — runs autonomously. Every autonomous action is written to the audit log with the trigger that fired it and the before/after state.

Below, the phrase "queue for approval" means the budget-commitment route. Anything not flagged that way executes directly.

## Playbook: Launch a new campaign

Use when you have creative ready and need to push something live, regardless of campaign type (testing, winners, ASC, lead gen, awareness).

### Inputs to collect first

If any of these is missing, ask before continuing:

- Account ID (from account profile)
- Campaign type (testing / winners / ASC / lead gen / awareness)
- Objective (conversions, leads, traffic, etc.)
- Budget (daily or lifetime, amount)
- Bid strategy (Lowest Cost / Cost Cap / Bid Cap / Min ROAS)
- Audience (cold / warm / retargeting; existing audience or build new)
- Placements (Advantage+ or manual)
- Creative assets (images/videos, headlines, primary text, CTAs, destination URL)
- Flight dates
- UTM parameters

### Step-by-step

1. **Load account config:** extract ad_account_id, naming convention, pixel_id, custom_conversion_ids, KPI targets, default placements, exclusion lists, maturity level
2. **Match brief to campaign type** and load the appropriate template (testing ABO, winners CBO, ASC, etc.)
3. **Validate inputs:**
   - Budget in cents (USD example: $50/day = 5000). Flag if under $20/day per ad set for testing
   - Bid cap at or above 1.5× historical CPA
   - Cold audience reach above 1M, retargeting reach above 10K
   - Creative count: 5–20 for testing, 5+ for ASC
   - Confirm dynamic creative intent if enabled (can't be changed after creation)
   - Dayparting requires lifetime budget
   - If CBO at campaign level, no ad-set-level budgets
4. **Generate names** using the account's naming convention. Default pattern:
   - Campaign: `{ACCOUNT}_{OBJECTIVE}_{TYPE}_{AUDIENCE}_{DATE}`
   - Ad Set: `{CAMPAIGN_PREFIX}_{AUDIENCE_DETAIL}_{BUDGET}_{DATE}`
   - Ad: `{ADSET_PREFIX}_{FORMAT}_{CONCEPT}_{VARIANT}_{DATE}`
5. **Run the pre-launch checklist:**
   - Pixel firing on destination URL
   - Custom conversion active and receiving events
   - Tracking template / UTMs set
   - Cold audience reach above 1M
   - Exclusions set (past purchasers, current customers)
   - Creative refreshed since last campaign
   - Bid cap appropriate
6. **Block on FAIL items.** WARN items proceed but get flagged. A failing pre-launch check is not overridable autonomously; if the agent itself triggered the launch (e.g. as part of a recommended expansion), the FAIL kills the launch. If the user requested the launch directly, the FAIL surfaces as a blocker in the digest.
7. **Produce the Launch Plan:** full parameter set for the record — campaign, ad set, ad — before any API call
8. **Queue for approval.** Launching a new campaign or ad set commits new spend by definition, so this playbook always routes through the budget-commitment gate. The approval request includes the Launch Plan, the incremental daily and monthly budget added, and the expected impact.
9. **On approval, execute creation in order:** campaign → ad set → creatives → ads. Status PAUSED at creation so the agent does a final correctness pass before activating.
10. **Confirm successful creation, record IDs in the audit log, and activate.** A failed creation step is logged and surfaces in the next digest.

## Playbook: Generate creative brief

Use after creative analysis surfaces fatigue or format gaps, or when starting a new production sprint.

### Process

1. **Load context:** account KPI targets, testing framework, weekly volume target, active creative types, current concepts in rotation, maturity stage
2. **Pull active creative inventory:** every active ad with format, age, performance metrics, format/concept tags parsed from naming convention
3. **Pull performance over the last 14 days** at the ad level: spend, impressions, clicks, CTR, conversions, CPA, video metrics
4. **Identify gaps:**
   - Fatiguing ads needing direct replacements (same angle, new execution)
   - Format gaps vs the recommended mix for the business model
   - Concept gaps from the 10-angle rotation list (problem-solution, social proof, comparison, before/after, behind-the-scenes, founder story, urgency, listicle, myth-busting, UGC demonstration)
   - Winning concepts that need more variants (target 3–5 per winning concept)
5. **Generate prioritized brief:**
   - Priority 1: fatiguing replacements
   - Priority 2: format gaps
   - Priority 3: concept gaps
   - Priority 4: variant expansion on winners
6. **For each concept, produce a brief** with: format, hook type, value proposition, body content direction, CTA, success metric, target variants, deadline

### Brief template

```
Concept: [name, e.g. UGC Testimonial - Time Savings]
Priority: P1–P4
Format: UGC video / Static / Carousel / Founder talking head / etc.
Opening pattern: Headline-with-a-number / Scroll-breaker / Mirror the frustration / Lead with proof / ...
Length: [seconds for video, words for static copy]
Variants needed: [count]
Primary message: [one sentence]
Body direction: [2–3 sentences of guidance]
Required elements: [social proof, demo screenshot, founder face, etc.]
CTA: [specific button + supporting text]
Success metric: CPA below $X, CTR above Y%, Hook rate above Z%
Aspect ratios needed: 1:1, 4:5, 9:16 as applicable
Deadline: [date]
```

## Playbook: Investigate underperforming campaign

When a campaign is underperforming, use the 8-branch diagnostic tree from file 12.

### Setup

1. Define the symptom precisely: which metric, how long, isolated to one campaign or account-wide
2. Establish baseline: compare against the campaign's own history, not arbitrary benchmarks
3. Use rolling 7-day windows for comparison
4. Identify any recent changes (budget, creative, audience, LP, season, platform update)

### Diagnostic flow

Work through the branches sequentially. Each branch has specific data to pull and thresholds to check. Don't jump branches based on a hunch — the discipline is the point.

Branches in order: Measurement → Delivery → Audience → Creative → Landing Page → Budget → Bidding → External.

### After diagnosis

1. Stop at the first root cause found
2. Make a single change (don't try to fix three things at once)
3. Monitor for 48–72 hours
4. Re-diagnose if the fix didn't work
5. Document what was tried so the next investigator doesn't repeat the same path

## Playbook: Optimize budgets

Use weekly to ensure budget is allocated across campaigns in line with their performance and maturity.

### Process

1. **Load account context:** KPI targets, monthly spend, three-tier allocation model
2. **Pull campaign-level performance** over last 7 and 14 days: spend, CPA, ROAS, conversions, frequency, CPM trend
3. **Classify each campaign** into Tier 1 (Core), Tier 2 (Growth), Tier 3 (Experiment) based on:
   - Tier 1: profitable 2+ weeks, post-learning, CPA/ROAS in target
   - Tier 2: 1–2 weeks of data, CPA within 20% of target
   - Tier 3: new tests, less than 1 week of data
4. **Check tier movement triggers:**
   - Promote T3 → T2: within 20% of target for 7+ days, exited learning, 20+ conversions
   - Promote T2 → T1: at or below target for 14+ days, consistent delivery, 50+ conversions
   - Demote T1 → T2: 20–30% over target for 7+ days, frequency over 3, fatigue signals
   - Kill: 50%+ over target for 14+ days, no improvement after creative refresh
5. **Compute current allocation** by tier and compare to recommended (60–70% Core / 20–30% Growth / 10–20% Experiments)
6. **Classify each move:** which campaigns to scale up (20% per step), hold, reduce, or kill
7. **Generate scaling plan** for any vertical scaling — follow the 20% rule, 3–4 day spacing
8. **Split actions by budget direction:**
   - Reductions and kills: execute autonomously, one at a time, recording the pre-change baseline in the audit log
   - Scale-up steps (budget or cap increases): queue for approval with the rationale, expected impact, and rollback trigger packaged in the request
9. **Execute the autonomous actions**, spaced per the bid-strategy rules (one bid change per 48 hours per campaign, etc.)
10. **Set follow-up checks** to confirm CPA stability 48–72 hours after each executed move; queued scale-ups execute on approval and follow the same monitoring window

## Playbook: Audit audiences

Use bi-weekly to detect overlap, saturation, and expansion opportunities.

### Process

1. **Load audience config** from account profile: warm audiences, exclusions, lookalike sources
2. **Pull ad-set-level data** over 14 days: targeting details, audience size, reach, frequency, CPA, CTR, CPM
3. **Pull custom audience inventory:** name, size, type, last update date
4. **Run overlap analysis** on every pair of active ad sets:
   - Same custom audience in multiple ad sets → critical overlap
   - Same lookalike seed at different percentages → high overlap
   - Shared interest categories above 50% → high overlap
   - Broad targeting overlaps with everything by definition
5. **Score each overlap pair:** Critical (>50%), High (30–50%), Moderate (15–30%), Low (<15%)
6. **Estimate CPM tax** from auction self-competition (compare CPMs of overlapping pairs vs non-overlapping)
7. **Run saturation analysis** per ad set:
   - Frequency vs thresholds (prospecting: 3.0, retargeting: 7.0)
   - Reach penetration of audience size
   - CPM and CPA trends
8. **Audit Advantage+ Audience behavior** (if enabled): expansion share of spend, expansion CPA vs defined audience CPA
9. **Audit exclusions:** verify purchaser exclusions are applied to prospecting, lists are fresh, match rates reasonable
10. **Identify expansion opportunities** ranked by tier:
    - Tier 1: high confidence (test this week)
    - Tier 2: medium confidence (test next sprint)
    - Tier 3: exploratory
11. **Produce audience health report** with map, overlap matrix, consolidation list, expansion list
12. **Execute consolidations** that keep total committed budget flat or lower — merging overlapping ad sets, redirecting budget to the better performer within the same campaign, refreshing stale audiences, adding exclusions. Log each move to the audit log.
13. **Queue expansion opportunities for approval** if they add a new ad set or campaign with incremental spend. Tier 1 (high confidence) expansions get the cleanest approval request; Tier 2 and Tier 3 surface in the digest without urgent framing.

## Playbook: Audit bidding

Use bi-weekly to ensure each campaign's bid strategy matches its maturity and performance.

### Process

1. **Load context:** KPI targets, naming conventions, maturity level, recommended default strategy
2. **Pull campaign-level config:** objective, bid strategy, bid amount, budgets, special ad categories
3. **Pull 14-day daily performance:** spend, CPA, CPM, CPC, CTR, conversions
4. **Pull ad-set-level data:** optimization goal, bid strategy/amount, learning phase info
5. **Build strategy-fit matrix:** for each campaign, current strategy vs recommended for stage + purpose
6. **Classify fit:**
   - Optimal: matches recommended + performance on target
   - Acceptable: one tier off but within targets
   - Mismatch: inappropriate for maturity or significantly underperforming
   - Legacy: was correct at previous maturity, needs upgrade
7. **Score performance** per campaign on an A–F grade based on CPA vs target, budget utilization, daily variance
8. **Audit learning phase status:** active learning, learning limited, graduated, re-entered learning
9. **Audit cost controls:** is the cap set correctly? Is delivery consistent?
10. **Generate sequenced migration plan:** one change per 48-hour window, smallest campaign first, baseline recorded for each
11. **For each move, record pre-change baseline, success criteria, and rollback trigger in the audit log**
12. **Execute the moves by classification:**
    - Lowering a Cost Cap, lowering a Bid Cap, or switching from Lowest Cost to Cost Cap at the current average CPA: execute autonomously, one change per 48-hour window per campaign
    - Raising a Cost Cap, raising a Bid Cap, lowering a Minimum ROAS floor, or moving to Lowest Cost without a cap: queue for approval — each lifts the spend ceiling

## Playbook: Audit structure

Use monthly to detect fragmentation, mis-applied CBO/ABO, naming compliance, and ASC fit.

### Process

1. **Load context:** naming conventions, capability flags, maturity, monthly conversion volume
2. **Pull full campaign and ad set inventory** including paused (paused still counts as complexity)
3. **Build account structural map:** campaigns by objective, ad sets per campaign, ads per ad set
4. **Run fragmentation detection:**
   - Same-objective campaigns above the threshold for stage
   - Ad sets per campaign above CBO/ABO ceilings
   - Ad sets below the 50 weekly conversions / 5× CPA daily budget floor
   - Ads per ad set outside the 3–20 sweet spot
5. **Compare to recommended structure** for this maturity and spend level
6. **CBO/ABO audit:** flag misfits (CBO with 1 ad set, CBO with too many ad sets, ABO on scaling campaigns)
7. **Ad set consolidation candidates:** below-threshold conversion volume, overlapping audiences, low effective budget
8. **Estimate consolidation impact:** combined budget, projected conversion volume, expected CPA effect
9. **Run naming convention audit** parsing each entity name against the convention; report compliance rate
10. **ASC adoption check** if has_advantage_plus = true: should ASC be running, scaling, fixed, or skipped given maturity and volume?
11. **Generate restructure plan** with phased timeline (one phase per week minimum, allowing stabilization)
12. **Each phase records pre-change baseline, success criteria, and rollback trigger to the audit log**
13. **Execute by classification:**
    - Consolidations, pauses, renames, and budget-flat restructures: execute autonomously phase by phase
    - Any phase that introduces a new campaign or ad set with net-new spend (e.g. launching an ASC test): queue for approval as a separate Launch Plan via the launch-campaign playbook

## Playbook: Audit measurement

Use monthly to catch tracking issues before they corrupt decisions.

### Process

1. **Load context:** pixel_id, dataset_id (CAPI), attribution window, business model, monthly spend
2. **Pull pixel health data:** status, last event timestamp, events firing with 7d and 28d volumes, page coverage, active errors
3. **Pull CAPI status:** active, last server event, events covered, deduplication count vs total
4. **Pull EMQ scores** per event from Events Manager → CAPI settings
5. **Pull attribution settings** per campaign; compare windows (1d, 7d, 7d+1d view) for the same period
6. **Sample 10+ active ad URLs** and check UTM consistency
7. **Pull GA4 source/medium data** and compare conversions vs Meta-reported
8. **Pull third-party tool data** if connected; compare conversion counts to Meta and to backend
9. **Score the stack** on six components with weights:
   - Pixel health (20%)
   - CAPI implementation (25%)
   - EMQ (20%)
   - Attribution setup (15%)
   - Event configuration (10%)
   - UTM / third-party (10%)
10. **Generate remediation priorities** sorted P0 (data at risk) → P1 (optimization degraded) → P2 (improvement opportunity) → P3 (quarterly review)
11. **Produce EMQ improvement plan** with specific parameter additions and expected point lift per step
12. **Execute remediations autonomously.** Measurement fixes (creating Custom Conversions for orphan custom events, sending CAPI test events, updating attribution-window settings, refreshing the customer-list audience) do not commit new spend, so they run without approval. Each is logged with the before/after state. The user sees the changes in the daily digest.

## Playbook: Audit compliance

Use quarterly. Specific to Special Ad Categories, privacy regulation, ad review history, and data handling.

### Process

1. **Load context:** business model, compliance flags (special category, GDPR, CCPA applicability), geographic targeting
2. **Check Special Ad Category declarations:**
   - Does declaration match ad content?
   - Are targeting restrictions enforced correctly?
   - Are disclaimers present for political/social ads?
   - Is the category consistent across all relevant campaigns?
3. **GDPR audit** if applicable:
   - CMP in place
   - Consent obtained before tracking
   - Granular categories offered
   - Consent signal passing to Meta
   - Right to erasure process documented
   - Privacy policy mentions Meta tracking
4. **CCPA audit** if applicable:
   - "Do Not Sell or Share" link visible
   - GPC signal detected and honored
   - LDU flag applied for opted-out California users
   - Right to delete process in place
5. **Pull ad review status:** active, in review, not approved, partially approved, account quality warnings
6. **For each disapproved ad:** name, ID, violation reason, recommended fix, appeal vs revise
7. **Check Account Quality score** in Business Manager
8. **Data handling audit:**
   - Customer lists refreshed within retention window
   - All Custom Audiences have consent basis
   - CAPI sends only necessary parameters
   - Hashing is correct (SHA-256, lowercase, trimmed)
   - No sensitive data categories being sent
9. **Generate compliance scorecard** across four domains: Ad Policy, Privacy, Data Handling, Account Health
10. **Produce remediation plan** prioritized P0 (account at risk) → P1 (compliance gap) → P2 (best practice)

## Playbook: Analyze creative

Use weekly. The most frequently-run audit.

### Process

1. **Load context:** KPI targets, testing framework, weekly volume target, active formats, naming conventions for parsing
2. **Pull ad-level performance** over 14 days at daily granularity: impressions, reach, frequency, CTR, CPC, CPM, spend, conversions, video metrics (3s views, 50%/75%/100% view, average watch time)
3. **Pull placement breakdown** at 7 days for format analysis
4. **Pull ad configuration details:** name, status, creative, created_time
5. **Score every active ad** on 6 dimensions (efficiency, CTR, frequency, spend capacity, hook rate, hold rate); skip ads with under 1,000 impressions or under $50 spend
6. **Classify** as Star (4.0+) / Solid (3.0–3.9) / Underperformer (2.0–2.9) / Kill (under 2.0) / Insufficient Data
7. **Run fatigue detection** on every scored ad: CTR trend, CPA trend, frequency, spend trend, hook rate decline
8. **Classify fatigue:** Healthy / Early Warning / Active Fatigue / Critical Fatigue
9. **Analyze format mix** vs recommended for the business model
10. **Analyze testing velocity:** ads launched in last 7 days vs target, win rate over last 30 days
11. **Identify concept gaps** from the 10-angle rotation list
12. **Produce 4 deliverables:**
    - Creative scorecard
    - Fatigue alert list
    - Refresh priority list (P1 fatiguing replacements, P2 format gaps, P3 concept gaps, P4 variant expansion)
    - Next sprint test plan
13. **Execute the pause/activate actions autonomously.** Pausing a fatigued ad does not commit new spend; activating a prepared replacement creative within an existing ad set does not commit new spend. Both run without approval and are logged. The "next sprint test plan" deliverable is a brief for the creative team — it does not execute anything by itself.

## Playbook: Analyze Advantage+ campaigns

Use weekly when ASC or unified Advantage+ campaigns are running.

### Process

1. **Verify Advantage+ is active** (has_advantage_plus = true and at least one A+ campaign)
2. **Identify A+ campaigns:** ASC, Advantage+ App, unified A+. Capture budget, customer cap, optimization event, country targeting, active ad count
3. **Pull performance** for comparison vs manual campaigns:
   - CPA, ROAS, CPM, reach, frequency, CTR, conversion rate per campaign type
4. **Run incrementality check:** compare total account conversions before and after A+ launch
5. **Customer split analysis:** existing vs new customer share of spend, CPA per segment, ROAS per segment, conversion rate per segment
6. **Evaluate customer cap setting:** is it too high (over-indexing on existing), too low (constraining volume), or appropriate?
7. **Audience expansion inference:** demographic breakdown, placement distribution, geo distribution, time-of-day delivery
8. **Creative performance within A+:** which ads receive meaningful spend (>5% of campaign), spend concentration, format distribution, creative age
9. **Catalog performance** if has_catalog: top products by spend, ROAS by product set, feed completeness, feed freshness
10. **Execute or queue by budget classification:**
    - Customer cap adjustments, audience suggestion tweaks (unified A+), and creative additions (briefs for the creative team): execute or hand off autonomously — none of these commit new spend
    - Budget rebalances between manual campaigns and ASC: autonomous when total committed budget stays flat (the budget moves between campaigns within the same envelope); queue for approval when the rebalance increases total spend

## Playbook: Analyze catalog

Use quarterly. Specific to catalog and DPA performance.

### Process

1. **Verify catalog is connected** and pull catalog structure: catalog ID, product sets, products
2. **Pull product-level performance:** impressions, clicks, spend, purchases, value, ATC, VC, CTR, CPA, ROAS
3. **Classify every product** into one of four tiers (Heroes, Sidekicks, Zombies, Villains) based on spend and ROAS quadrant
4. **Confidence flags:** mark products with fewer than 5 conversions as low confidence
5. **Feed quality audit:**
   - Field completeness (required, recommended)
   - Title quality scoring (sample 50+ products)
   - Image quality scoring (sample 50+ images)
   - Feed freshness (last update timestamp)
   - Price accuracy vs site
6. **Product set analysis:** performance per existing set, recommended set structure (broad prospecting, Hero scaling, retargeting, category, exclusion)
7. **Retargeting funnel analysis:** VC → ATC → IC → Purchase conversion rates and benchmarks
8. **Generate prioritized action list:**
   - P0: out-of-stock cleanup, disapprovals
   - P1: title optimization on top 100, custom labels, sale_price
   - P2: additional images, description optimization, supplemental feed
   - P3: cross-border setup
9. **Update custom_label_0 with tier assignments** via supplemental feed
10. **Produce catalog CSV export** for the merchandising team

## Playbook: Manage automated rules

Use bi-weekly.

### Process

1. **Pull existing rule inventory:** name, status, entity, trigger, action, schedule, applied campaigns
2. **Pull rule execution history** per rule: last fired, times fired in last 30 days, execution failures
3. **Flag rules with issues:**
   - Never fired (may be misconfigured)
   - Firing too frequently (threshold too sensitive)
   - Execution failed (API error, permission)
   - Tied to deleted campaigns
4. **Gap analysis:** check each active campaign against the six rule categories from file 13 (kill switches, pacing guards, fatigue alerts, learning protection, anomaly alerts, scale triggers)
5. **List gaps with priority** (P1 / P2 / P3)
6. **Propose new rules** per gap using the template; threshold calibrated by maturity stage
7. **Plan rule modifications** for issues found in step 3
8. **Classify each new or modified rule by budget impact:**
    - Kill switches, pacing guards that reduce budget, fatigue alerts, learning-phase alerts, anomaly alerts, and any rule whose action is "notify" or "pause" or "reduce budget": create or update autonomously, log to the audit log
    - Scale triggers (rules that raise budgets or caps automatically when CPA falls below target): queue for approval — these delegate budget-commitment decisions to the rule, so they need explicit user sign-off before activation
9. **Execute autonomous rule changes**, recording the prior config in the audit log for rollback
10. **Produce final inventory** of active rules post-audit, including any pending scale-trigger rules awaiting approval
