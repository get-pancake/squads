---
name: pancake_root_cause_lab
description: Unified root cause skill for underperforming Google Ads campaigns. Carries both the analytical foundation — the eight-branch diagnostic tree, funnel and ratio decomposition, attribution diagnostics, and auction insights interpretation — and the procedural workflow that walks an operator from a reported symptom to a written diagnosis, an evidence chain, and a prioritized resolution plan with monitoring and escalation. Designed for targeted, campaign-scoped investigations where the goal is to isolate the actual mechanical cause of a performance shift rather than reacting to whichever metric happened to move. Not for routine WoW reporting (use pancake-orchestrator) or account-wide bid strategy audits (use pancake-inspect-bidding).
triggers:
  - "investigate campaign"
  - "diagnose campaign"
  - "why is this campaign not working"
  - "why is my campaign underperforming"
  - "campaign underperforming"
  - "campaign diagnostics"
  - "campaign troubleshooting"
  - "underperformance diagnosis"
  - "root cause analysis"
  - "performance dropped"
  - "CPA increased"
  - "ROAS dropped"
---

# Google Ads Root Cause Lab

A combined methodology and action skill for diagnosing why a specific Google Ads campaign is missing its targets. The first half of this document is the analytical model the lab is built on. The second half is the procedural pipeline that uses it. Both are designed around a single operating discipline: **figure out what actually broke before you touch anything**.

The expensive failure mode in paid search is acting on a metric without understanding why it moved. Lowering tCPA because conversions look weak, when a tag stopped firing, quietly throttles the campaign while leaving the real defect alone. Pausing keywords that "stopped converting", when the landing page is throwing a 500 on mobile, buys nothing but lost time. Every section below exists to interrupt that reflex.

---

# PART I — The Diagnostic Model

## 1. The Eight Branches

When a campaign degrades, there are eight candidate categories of cause. Investigations walk them in a fixed sequence, because the validity of every later branch depends on having cleared the ones above it.

1. **Measurement** — is the number you are reacting to even real?
2. **Auction** — has the competitive surface shifted?
3. **Targeting** — is the campaign reaching the intended audience?
4. **Creative** — are the ads themselves doing their job?
5. **Landing Page** — does post-click experience hold up?
6. **Budget** — is the campaign starved or mis-paced?
7. **Bidding** — is the automation healthy?
8. **External** — has the world outside the account changed?

### Why the order is fixed

Measurement sits first because everything else assumes the data is trustworthy. If conversion tracking is silently broken, the "CPA spike" is a phantom — and lowering tCPA in response will compound the damage. The same hazard applies further down: bidding diagnostics are meaningless if budget is the real constraint; auction analysis is moot if the landing page started 404ing two Tuesdays ago. Skipping a branch is not allowed even when one looks obviously responsible; negative findings are evidence too, and they harden the eventual diagnosis.

### Branch 1 — Measurement

**Pull.** Conversion action status under Tools > Conversions (record status and last conversion date); tag firing via Tag Assistant or GTM diagnostics; change history filtered to conversion action edits during the window of interest; GA4 realtime to confirm events are flowing; Consent Mode diagnostics — has the consent rate moved?

**Signals.** A sudden cliff in conversions rather than a taper. Conversion action showing "no recent conversions". A change-history entry editing the conversion action's name, counting rule, attribution window, or value. GA4 sessions present but goal completions missing. Tag Assistant reporting the tag absent or firing on the wrong page.

**Confirm.** Submit a manual test conversion and verify it lands. Triangulate Google Ads against GA4 against the CRM — divergence across all three points at tracking. Align the timing of the drop against the conversion-action change log; exact alignment is conclusive.

**Resolve.** Repair or reinstall the tag and fix the trigger. Roll back unintended changes to the conversion action. Adjust Consent Mode setup if consent rates collapsed. If lag is to blame, hold off on conclusions until the window matures. Document the failure mode and add alerting so the next outage is caught fast.

### Branch 2 — Auction

**Pull.** Auction Insights for the current and prior periods; weekly average CPC; Quality Score components (expected CTR, ad relevance, landing page experience); Search Impression Share, Lost IS (rank), Lost IS (budget).

**Signals.** A new domain in Auction Insights. An existing competitor's IS up by ten percentage points or more. CPC rising even though bids and targeting are unchanged. QS components — especially expected CTR — falling. Lost IS (rank) climbing without bid moves.

**Confirm.** Auction Insights clearly shows the new or expanding rival. CPC trend correlates with IS movement, not with your own bid history. The Quality Score change log reflects component declines.

**Resolve.** Lift Quality Score by tightening relevance, improving the page, and strengthening expected CTR. Differentiate creative to escape direct messaging collision. Find less crowded targeting pockets. If CPC has crossed the efficient threshold, take a lower position rather than overpaying. React on strategy, not pride.

### Branch 3 — Targeting

**Pull.** Search terms report current vs prior; performance by geography; performance by device; audience segment performance for exhaustion signals; hour-of-day and day-of-week breakdowns.

**Signals.** A spike in irrelevant queries in search terms. One region degrading badly while others hold. Mobile sliding while desktop holds, or vice versa. Declining CTR or CR on specific audience lists over time. Performance concentrating in time windows that shifted from prior periods.

**Confirm.** Quantify the share of spend going to irrelevant queries — if that share grew, drift is real. Segment the funnel by geo, device, and time; if one segment is responsible for the total drop, you have found the lever.

**Resolve.** Add negatives to filter irrelevant queries. Tighten match types if broad is pulling junk. Adjust geo bids or exclude regions outright. Refresh stale audience lists, or broaden when exhaustion is the pattern. Reshape ad scheduling if temporal patterns shifted.

### Branch 4 — Creative

**Pull.** Weekly CTR trend by ad group; ad disapproval status; RSA asset ratings (best / good / low); ad strength scores; competitor ad copy via the Ad Preview tool.

**Signals.** CTR sliding gradually across three to four weeks — the classic creative fatigue curve. Disapprovals taking ads (sometimes your top ads) out of rotation. Asset ratings degrading from "best" toward "low". Ad strength falling from "excellent" downward. New competitor creative directly attacking your positioning.

**Confirm.** Combine impression trend with CTR trend — rising impressions plus falling CTR is audience exhaustion; falling impressions plus falling CTR is creative fatigue or a targeting shift. Check whether disapproved ads were top performers; the loss of a leading ad has disproportionate impact.

**Resolve.** Rotate fresh headlines and descriptions. Pin headlines if the RSA is combining badly. Appeal disapprovals that look incorrect. Test genuinely new angles, not minor rewrites of the same message. Inspect competitor creative for messaging gaps you can fill.

### Branch 5 — Landing Page

**Pull.** Weekly landing page conversion rate trend; page speed via PageSpeed Insights or CrUX; bounce rate from GA4's landing page report; mobile vs desktop conversion rate split; the page itself — eyes on it.

**Signals.** Conversion rate down while upstream metrics (CTR, search terms) hold. Page load slower than before. Bounce rate jumping. Mobile conversion dropping disproportionately to desktop. Visible breakage on the form, checkout, or CTA.

**Confirm.** Load the page and submit a real test conversion; try it on mobile. If conversion rate moved but every upstream metric is stable, the page is the prime suspect. Ask the web team for the deploy log over the window.

**Resolve.** Fix broken forms, CTAs, or checkout flows immediately. Roll back changes that correlate with the regression. Improve load speed, prioritizing mobile. Pause A/B tests that are clearly losing. Enforce message match between ad and page.

### Branch 6 — Budget

**Pull.** Lost IS (budget); daily spend against daily budget; budget change history; allocation across campaigns on shared budgets.

**Signals.** Lost IS (budget) above 20%, indicating meaningful constraint. Daily spend repeatedly hitting cap. A recent reduction in the change history. One campaign eating disproportionate share of a shared budget.

**Confirm.** If Lost IS (budget) is high while per-conversion efficiency is fine, the campaign is simply under-funded. On shared budgets, check whether other campaigns on the same budget lost impressions when one scaled up.

**Resolve.** Add budget where the campaign is efficient and constrained. Move efficient campaigns off shared budgets onto dedicated ones for control. Re-pace if budget is front-loading and exhausting early in the day. Shift budget from less efficient campaigns to more efficient ones.

### Branch 7 — Bidding

**Pull.** Bid strategy status — is it in "Learning"? Bid strategy change history. Conversion action change history (these can quietly trigger relearning). Target CPA or ROAS vs realized. Conversion volume — does the campaign clear the smart-bidding threshold?

**Signals.** "Learning" status, typically lasting 7–14 days after a meaningful change. Target CPA materially below actual — the target is too tight. Fewer than 15–30 conversions per month, which is below the working volume for smart bidding. A recent bid strategy change. A conversion action edit that quietly reset learning even though the bid strategy itself didn't change.

**Confirm.** Cross-check the change history for bid or conversion edits in the two to three weeks before the dip. If the campaign is in learning, expect degradation in that window — it is not a deeper problem.

**Resolve.** If learning is in progress, leave it alone — stacking changes prolongs it. If the target is too aggressive, loosen tCPA by 15–20% or relax tROAS to give the algorithm room. If volume is below threshold, consider manual CPC or maximize conversions without an explicit target. If conversion edits caused the relearn, minimize future edits to conversion actions. During recovery, set a relaxed target temporarily and tighten as performance stabilizes.

### Branch 8 — External

**Pull.** YoY data to test for seasonality; Google Trends for category terms; industry news for regulatory or macro shifts; Google Ads status pages for known platform issues; competitor sites for visible promotional changes.

**Signals.** YoY shows the same period was historically weak — seasonality. Trends shows category interest dropping. A regulatory or macro event coincides with the dip. A competitor launched a major sale or price cut. Google had a known platform bug or release in the window.

**Confirm.** YoY shows a repeating pattern. The external event's timing aligns precisely with the dip. Other advertisers in the same vertical report the same thing — strong evidence of a platform or market-wide cause.

**Resolve.** For seasonality, recalibrate expectations and budgets; don't fight the season with spend. For competitor promotions, decide whether to counter or wait — short-lived sales are rarely worth matching. For platform issues, document the window, exclude it from analysis, and escalate to Google support if material. For market shifts, adapt rather than try to force the old performance level back into existence.

## 2. Decomposing Performance

Aggregate metrics hide where the actual break is. Decomposition cracks the funnel open and asks: *which stage stopped working?*

### The five funnel stages

```
Impressions --> Clicks --> Visits --> Conversions --> Value
```

Each stage answers a different question and implicates a different family of causes.

- **Impressions** are about whether you are showing up. Drops implicate budget caps, auction position, or narrowed targeting.
- **Clicks** are about whether the ad earns the action. CTR changes implicate creative or relevance.
- **Visits** are about whether the click survives into a real session. Gaps implicate tracking, bots, or page load failures.
- **Conversions** are about whether traffic completes the desired action. Drops implicate the landing page, the offer, qualification, or tracking.
- **Value** is about whether conversions are worth what they used to be. Drops implicate product mix, AOV, or lead quality.

Misdiagnosis happens when an operator sees a problem at stage N and chases it there, when the real failure is at stage N-1 or N+1.

### Stage thresholds

**Impressions.** Metrics: count, Search IS, Lost IS (budget), Lost IS (rank), eligible impressions. If Lost IS (budget) climbed, budget is the bottleneck. If Lost IS (rank) climbed, Quality Score or bid is the bottleneck. If both are stable and impressions still dropped, targeting narrowed or search demand fell. A near-zero cliff usually means paused, disapproved, or a billing issue. Normal WoW noise is 5–15%, more for small campaigns; investigate at >20% WoW decline.

**Clicks.** Metrics: clicks, CTR, top and absolute-top impression rates as position proxies. Stable impressions with CTR down points to creative — fatigue, disapproval, or a competitor winning. Impressions down with CTR stable points to visibility — budget, bids, targeting. Both down suggests an auction or targeting shift hitting reach and relevance together. Normal CTR noise is 0.5–1.0 percentage points WoW on Search; Display is inherently noisier. Investigate at >15% WoW CTR decline on Search; use 4-week rolling averages for Display and Video.

**Visits.** Metrics: GA4 sessions vs Google Ads clicks, bounce rate, engaged session rate. Clicks up with sessions flat means a tracking issue or bot traffic. A bounce-rate spike points to landing page, message mismatch, or wrong audience. An engaged-session drop points to load speed, mobile experience, or relevance. Normal gap between Google Ads clicks and GA4 sessions is 5–10%; investigate when it exceeds 25%, or when bounce rate jumps more than 10 percentage points WoW.

**Conversions.** Metrics: conversions, CR, CPA, by-interaction vs by-conversion time. CR down with traffic quality holding points to landing page, offer, tracking, or qualification. Count down with CR holding points upstream to a volume issue. A drop to zero is almost certainly tracking, not the campaign. Normal CR variance is 10–15% WoW for campaigns with fewer than 50 monthly conversions; investigate at >25% WoW CR decline on campaigns above that threshold.

**Value.** Metrics: conversion value, ROAS, AOV for eCommerce, lead quality for lead gen. Stable conversions with value down means a value-side problem — product mix, smaller orders, lower-quality leads. ROAS down with CPA stable is a value-side problem. AOV drops often reflect promotions or audience mix. Normal AOV noise is 10–20% WoW; investigate a >20% ROAS decline that holds for two or more weeks.

### Splitting rate from volume

Every aggregate KPI (CPA, ROAS, CPC) is a ratio. When the ratio changes, the numerator and denominator both have stories.

A CPA that moves from $50 to $75 has at least three possible causes:

- The denominator collapsed — conversions are down roughly a third while spend held flat. Conversion-side: page, offer, qualification, or tracking.
- The numerator inflated — cost rose ~50% while conversions held. Cost-side: CPC pressure, broader targeting, more competition, a bid change.
- Both shifted — prioritize whichever moved further.

The symptom looks identical from the dashboard. The cause and the fix are not the same conversation. Always pull the raw counts, not just the ratio.

The decomposition tables:

CPA = Cost / Conversions

| Cost | Conversions | Direction |
|------|-------------|-----------|
| Flat | Down | Conversion-side: page, tracking, offer, qualification |
| Up | Flat | Cost-side: CPC, targeting widened, competition |
| Up | Down | Both; tackle the bigger mover first |
| Down | Down more | Conversion-side dominates even though spend fell |

ROAS = Value / Cost

| Value | Cost | Direction |
|-------|------|-----------|
| Down | Flat | Value-side: AOV, product mix, lead quality |
| Flat | Up | Cost-side: CPC, competition, budget without proportional return |
| Down | Up | Both; tackle the bigger mover first |

CPC = Cost / Clicks

| Cost | Clicks | Direction |
|------|--------|-----------|
| Up | Flat | Auction pressure: competition or QS decline |
| Flat | Down | Visibility: budget constraint or targeting narrowed |

**Application order:** pull the raw numbers (not the ratio) for both periods, compute percentage change for each component, identify which component moved more, and aim the investigation at that side. Committing to either the cost side or the conversion side before walking the tree is what keeps investigations from wandering.

### Comparison windows

| Window | Best for | Watch for |
|--------|----------|-----------|
| WoW | Sudden moves, post-change monitoring | Day-of-week effects, holidays, noise |
| MoM | Trend identification, strategy evaluation | Within-month seasonality, month lengths |
| YoY | Seasonal baselining, long-horizon trend | Market changes, account changes year over year |

### Variance bands

| WoW magnitude | Read | Action |
|---------------|------|--------|
| Under 10% | Normal noise | Monitor; do not act |
| 10–20% | Possible signal | Investigate; check for correlating changes |
| Over 20% | Significant | Diagnose now |
| Over 50% | Critical | Almost always a specific event; check measurement first |

These bands assume adequate volume. Small campaigns need different handling.

### Small-campaign statistical guidance

Click volume:

| Weekly clicks | Use | Notes |
|---------------|-----|-------|
| Under 20 | 4-week rolling average | A single week is pure noise |
| 20–50 | 2-week rolling | WoW unreliable |
| 50–200 | WoW directional | Confirm against a 2-week trend |
| 200+ | WoW reliable | Standard analysis applies |

Conversion volume:

| Monthly conversions | Use | Notes |
|---------------------|-----|-------|
| Under 10 | Quarterly | Monthly is noise for conversion metrics |
| 10–30 | MoM | WoW conversion data unreliable |
| 30–50 | 2-week rolling | WoW directional only |
| 50+ | WoW reliable | Standard analysis applies |

Three classic small-campaign errors: calling a single bad week a "problem" (five conversions to three is a 40% drop that could be entirely random); tuning bids on insufficient data (smart bidding wants 15–30 conversions a month minimum); and comparing two equally-noisy periods (the arithmetic is fine, the conclusion is meaningless). For low-volume campaigns, prefer longer comparison windows, focus on direction over precision, weight conversion-rate moves less heavily, demand corroborating signals across multiple metrics, and when uncertain, wait another week of data.

## 3. Attribution: The Main Source of False Alarms

A huge fraction of reported "performance problems" turn out to be attribution artifacts. Before treating a degradation as real, clear it through the attribution checklist.

### Lag

Click and conversion are rarely the same event. Different verticals have very different distributions:

| Vertical | Click-to-conversion gap | Full attribution window |
|----------|-------------------------|--------------------------|
| Impulse eCommerce | Same day to 1 day | 7 days |
| Considered eCommerce | 1–7 days | 14 days |
| Lead generation | 3–14 days | 30 days |
| B2B / high consideration | 7–30+ days | 30–90 days |

A "last 7 days" view of a lead-gen account will *always* look worse than reality because the tail of conversions hasn't landed yet. The fix is to anchor comparisons to fully-attributed windows: lead gen against periods that ended at least 30 days ago; eCommerce against periods at least 7 days old. Label recent data explicitly as incomplete and expect it to improve. Never make budget or bid moves off partially-attributed numbers.

To diagnose lag specifically:

1. Toggle Google Ads between *by interaction time* and *by conversion time*. A wide gap is your lag, visualized.
2. Check the conversion action's actual attribution window under Tools > Conversions > Settings.
3. Compare the current period to one fully outside the window (for a 30-day window, five-plus weeks back), not to "last week", which is also incomplete.
4. Build a lag curve: segment conversions by days-to-conversion to see how they distribute.

If lag is the explanation, the "problem" will partially or fully self-resolve.

### Cross-device

The dominant pattern is mobile click, desktop conversion. Last-click reporting makes mobile campaigns look like under-performers and desktop campaigns look like heroes when the truth is they're collaborating.

Google models cross-device conversions, but only for signed-in users, and modeling quality varies by vertical. Cross-device estimates appear in the conversions column when the conversion action opts into them.

To diagnose: look at device-segmented conversion rate (a strong mobile CTR with a collapsed mobile CR is a tell); check the *Cross-device conversions* column (a meaningful share means real cross-device behavior); use GA4 path exploration to confirm with user-level data.

Implications: do not declare mobile a loser based on last-click device data; evaluate mobile on assisted plus cross-device contribution; be very careful with mobile bid adjustments, because cutting them can reduce desktop conversions that originated on mobile.

### Data-Driven Attribution

DDA spreads conversion credit across the path using a learned model. Inputs include touchpoint position, time between touches, path length, device per touch, and interaction type (click vs view).

When credit is redistributed, campaigns appear to shift performance without anything operational having changed. Typical patterns:

| Campaign type | DDA vs last-click |
|---------------|-------------------|
| Brand Search | Receives less credit; last-touch was being inflated |
| Non-Brand Search | Mixed; depends on where it sits in paths |
| Display / Video | Receives more credit; upper-funnel finally counted |
| Shopping | Slightly less credit |
| Remarketing | Receives less credit; last-click overvalues it |

Three diagnostic implications: a campaign that "got worse" after the account moved to DDA didn't get worse — credit was reallocated; comparing a DDA window to a last-click window is invalid (compare within the same model only); a campaign strong under last-click but weak under DDA is often a closer that wasn't doing the heavy lifting.

DDA can mislead when the model retrains and shifts allocations on its own, when the account doesn't have enough paths for stable modeling, or when the conversion window is too short to give the model meaningful path data.

### Assisted vs last-click

A campaign can have zero last-click conversions and still carry its weight. Top-funnel campaigns earn assisted credit on the path before some other campaign closes. Killing the assister does not redirect those conversions — it removes them.

To check: open *Attribution > Top Paths* for the multi-campaign sequences leading to conversion; add the *Assisted conversions* column to the campaign view; compute the assist-to-last-click ratio (below 1 = primarily a closer; around 1 = balanced; above 1 = primarily an assister, upper-funnel by nature).

**The rule:** never conclude a campaign is dead weight on last-click alone. Pull assists. Evaluate total contribution.

### Recurring attribution traps

Six patterns that catch operators repeatedly:

1. **Judging YouTube or Display on last-click CPA against Search.** Category error. Those channels are upper-funnel; evaluate on assisted, view-through, and brand-lift signals.
2. **Ignoring view-throughs.** For Display and Video, view-through conversions are real. Include them, typically weighted at 10–25% of a click-through.
3. **Making same-day budget calls off lagged data.** If lag is 14 days, this week's CPA is a fiction. Cuts based on it are self-inflicted wounds.
4. **Cross-model comparisons.** Comparing a DDA period to a last-click period creates phantom shifts. Always normalize.
5. **Trusting brand-search last-click ROAS.** Brand often takes credit for clicks of users who were already going to convert. Run incrementality tests before scaling on this signal.
6. **Over-crediting remarketing.** Remarketing closes users that other campaigns recruited. Last-click hands it too much credit; DDA partially fixes this.

### Pre-diagnosis attribution checklist

Before declaring a campaign genuinely broken:

- [ ] Comparison windows are fully attributed.
- [ ] No attribution model change inside the comparison window.
- [ ] Cross-device conversions accounted for, especially for mobile-heavy campaigns.
- [ ] Assisted conversions reviewed, especially for upper-funnel.
- [ ] View-throughs included for Display and Video.
- [ ] DDA credit shifts considered as an alternative explanation.
- [ ] Conversion actions have not been edited recently.

If attribution mechanics explain the apparent drop, the verdict is "no real change, allow data to mature" rather than a campaign defect.

## 4. Competitive Impact

Competitive shifts cause a great deal of degradation that is invisible from inside the account unless you specifically look for it. The instrument is the Auction Insights report.

### The six metrics

- **Impression Share** — actual impressions divided by eligible impressions. Declines mean ground lost via budget, bid, or Quality Score.
- **Overlap Rate** — how often a competitor showed in the same auctions where you also showed. High overlap means head-to-head competition.
- **Position Above Rate** — how often a given competitor outranked you when you both appeared. A rising number from one advertiser is a direct signal they're winning more frequently.
- **Top of Page Rate** — how often your ad sat above organic results. Falling rates mean you're being demoted.
- **Absolute Top of Page Rate** — how often your ad was the very first ad. The most volatile measure, the most sensitive to bid and Quality Score.
- **Outranking Share** — how often you either outranked a competitor or showed when they didn't. The most complete competitive signal because it bundles position and impression share.

### Reading competitive shifts

**A new competitor showing up.** Auction Insights surfaces a domain that wasn't there last period. Your IS falls without you having changed bids or budget. CPC rises without a corresponding Quality Score change. Confirm by checking the new domain's overlap rate (a meaningful one is above 20%), correlating the appearance date to your performance shift, and verifying live ads via search. Typical signature: IS down 5–15%, CPC up 10–25%.

**An existing competitor doubling down.** A known competitor's IS climbs ten percentage points or more, position-above-rate rises, your outranking share against them falls, and CPCs inflate. Confirm that the change is sustained for two-plus weeks (not a one-week blip), that the same fingerprint shows across multiple campaigns, and that CPC inflation tracks their IS growth specifically.

**A competitor pulling out.** Their IS drops or vanishes, your IS rises without bid or budget changes, CPCs ease, metrics may improve. Confirm with two-plus weeks of sustained absence and check whether their site is still live (they may have paused ads, not folded). This is a window of opportunity, not a permanent change in the landscape.

**Quality Score erosion masquerading as competition.** Sometimes the auction looks pressured when really your own ads got worse. Signature: CPC up but no competitor IS surge; lost-IS-rank up without a competitive trigger; declining ad relevance and landing page experience scores; expected CTR component dropped. Confirm by pulling Quality Score history segmented by time — if the components themselves declined, this is internal, not external.

### CPC inflation signatures

How CPC moves tells you what is happening:

- **Gradual creep, 5–10% per month.** Normal market drift. Improve Quality Score, tighten targeting, accept the rest as the price of admission.
- **Sudden jump, 20%+ in a week.** A discrete event — new competitor, strategy change, or Quality Score incident. Diagnose immediately. Determine if temporary or structural.
- **CPC up while IS is down.** You are being outbid. Either improve Quality Score so effective CPC drops, accept a lower position, or selectively raise bids on segments that justify it.
- **CPC up while IS is flat.** Quality Score likely dropped, raising the bid required to hold position. Diagnose the QS components.
- **CPC down.** A competitor exited, demand softened seasonally, or your Quality Score improved. A chance to grab volume cheaply.

### Response strategies

Six ways to respond, in roughly decreasing order of sustainability:

1. **Raise Quality Score.** The most durable lever. Tighten keyword-to-ad alignment, lift RSA headlines, improve page speed and mobile usability, ensure landing page content matches the query, and write copy that earns clicks (extensions, value props, strong CTAs).
2. **Differentiate creative.** Head-to-head messaging on identical claims collapses the auction into a bid war. Lead with a different angle, use proof points competitors don't, or surface an offer they can't easily match.
3. **Shift targeting to less crowded ground.** Geographic pockets where competitors are weak, dayparts with thinner participation, devices where you convert better, longer-tail queries with lower density.
4. **Increase budget — but only with discipline.** Justified only when the campaign is already inside efficiency targets, Lost IS (budget) is the dominant constraint, and incremental spend is expected to hold efficiency. Never raise budget to "fight" a competitor as an emotional response.
5. **Take a lower position deliberately.** If position 1 CPC is above your efficient bound, bid for position 2–3, watch whether CR holds (it often does), and pocket the savings.
6. **Do nothing.** Not every shift warrants a reaction. A short-lived test campaign or seasonal promotion may evaporate before any of your changes have time to bed in. Distinguish structural from temporary before moving.

### Cadence for watching competition

| Cadence | Focus | Why |
|---------|-------|-----|
| Weekly | Top-line IS, CPC trend in Auction Insights | Catch sharp moves early |
| Monthly | Full Auction Insights comparison, QS trend, position metrics | Spot developing patterns |
| Quarterly | Strategic landscape review, market trends, new entrants | Long-horizon positioning |

### Competitive principles

- Separate competitive pressure from internal decay using Quality Score data.
- Respond strategically. A competitor raising spend does not automatically obligate you to.
- Trust trends over snapshots. Wait two to four weeks of sustained signal before acting.
- A competitor in position 1 may be the one overpaying. Their pain is not always your problem.

## 5. Recurring Misdiagnosis Patterns

The reflexive diagnosis almost always treats a symptom downstream of the actual cause. Recognize the pattern early:

| What it looks like | The reflexive read | What it usually is |
|--------------------|--------------------|--------------------|
| CPA spike | "Bidding broke" | Conversion tracking changed or lag is hiding conversions |
| CTR collapse | "Creative fatigue" | Query mix has drifted toward irrelevant search terms |
| ROAS decline | "Campaign is inefficient" | A new competitor entered and pushed CPCs up |
| Conversion drop | "Landing page issue" | Consent Mode is suppressing tag fires |
| Lost impression share | "Need more budget" | Quality Score declined and raised effective CPCs |
| Learning-period weirdness | "The algorithm is broken" | A conversion action was edited, resetting learning |

## 6. Operating Principles

- Earlier branches must be cleared before later branches can be blamed. Measurement disguises itself as every other branch.
- Timestamps are diagnostic gold. Real causes nearly always have a timestamp that aligns with the performance shift.
- Start every diagnosis with the change history. Most degradations trace back to a specific change — yours or someone else's.
- Diagnose one cause at a time. Multiple problems can co-exist; resolve the dominant one before chasing the secondary.
- Write findings down. A short evidence chain — symptom, data, cause, fix — prevents the same investigation from being re-run in three months.

---

# PART II — The Investigation Workflow

The skill is purpose-built for a defined diagnostic task. It does not apply fixes inside the ad account — every recommendation requires explicit user sign-off. It does not sweep an entire account in a single pass — investigations are campaign-scoped. It does not replace ongoing monitoring rituals — trigger it only when a real performance question exists. And it does not produce a working hypothesis tree without supporting numbers.

For routine week-over-week reporting, use `pancake-orchestrator`. For bid strategy review across the full account, use `pancake-inspect-bidding`.

## Required context

Before launching the investigation, the following modules must be available in the session:

- **pancake-account-foundations** — inventory of accounts, KPI targets, naming patterns, and maturity classifications. The maturity tier controls how aggressively each branch is explored.

The investigation is a ten-step pipeline with three formal checkpoints (C2, C3, C5) where user confirmation is required before continuing.

### Step 0 — Frame the investigation

Resolve the basics before touching the API:

- Which campaign (or small set of campaigns) is in scope?
- What account is it in, and what conventions apply?
- What is the account's maturity tier?
- What did the user actually see — a CPA spike, a conversion drop, ROAS erosion?

If the user has not named a campaign, ask. Account-wide diagnostics happen only when explicitly requested.

### Step 1 — Pull the data

Two periods are always required: the **problem period** where degradation appears, and a **comparison period** that serves as the baseline.

Comparison period defaults:

- **Standard:** match the duration of the problem period and place it immediately before (typical WoW).
- **Seasonality check:** same calendar dates from the previous year.
- **Low-volume:** four-week rolling averages.

Low-volume thresholds that change how you compare:

- Fewer than 50 clicks per week → switch to 28-day comparison windows.
- Fewer than 10 conversions per month → use month-over-month or quarterly comparisons.

At minimum, pull:

1. **Campaign-level metrics** for both windows: impressions, clicks, CTR, average CPC, cost, conversions, conversion value, conversion rate, CPA, ROAS, search impression share, IS lost to budget, IS lost to rank.
2. **Daily performance trend** for the problem period plus the days immediately before — used to distinguish a cliff drop (technical/tracking) from a gradual slide (creative/competitive/targeting).
3. **Search terms** for the problem period, sorted by spend, with attention to queries that spent but did not convert and terms that appeared only in the problem window.
4. **Auction insights** for both windows: impression share, overlap rate, position-above rate, outranking share, top IS.
5. **Change history** for the past 30 days, with special focus on conversion action edits, bid strategy edits, budget edits, ad status flips, and targeting changes.
6. **Conversion lag distribution** by lag bucket (same day, 1 day, 2–3, 4–5, 6–7, 8–14, etc.).
7. **Segment splits** by device, geography, day-of-week, and hour-of-day when relevant.
8. **Ad group / ad performance** when CTR moved.

#### Handling raw API values

- Costs come back as micros. Divide by 1,000,000 to get the actual currency amount.
- Currency is not assumed; consult pancake-account-foundations.
- CTR and conversion rate are decimals (0.05 → 5%).
- Impression share is decimal. `NULL` indicates insufficient impressions to compute.
- If conversions are zero, CPA and ROAS are undefined — surface this explicitly rather than dividing by zero.
- Dates must be `YYYY-MM-DD`.

### Checkpoint C2 — Data inventory

Before analyzing, show the user a coverage map for each branch:

- **Measurement:** conversion action config? change history?
- **Auction:** auction insights? IS metrics?
- **Targeting:** search terms? geography? audiences?
- **Creative:** ad metrics? CTR trend?
- **Landing Page:** bounce / page speed (may need GA4 access)?
- **Budget:** daily spend? IS lost to budget?
- **Bidding:** bid strategy status? change history?
- **External:** YoY data? industry context (usually limited)?

List any data gaps that will reduce confidence, declare the two periods that will be compared, and ask the user for any additional context or data sources they can contribute.

**First five runs:** spell out the role of each data source — why auction insights matter for the competitive branch, why change history catches tracking and bidding edits, and which branches degrade if they are missing.

### Step 2 — State the problem precisely

Quantify the shift before diagnosing it:

- Which metric moved?
- By how much, in both absolute and percentage terms?
- Over what window?
- Is this outside normal noise?

Apply the variance bands from Part I (under 10% = noise; 10–20% = soft signal; above 20% = material; above 50% = critical). Then commit the problem statement in writing — campaign name, metric, magnitude, periods, variance verdict, and volume sufficiency — and ask the user to confirm before continuing.

### Step 3 — Funnel decomposition

Determine where in the funnel the break occurred by comparing each stage side by side:

| Stage | Metric |
|-------|--------|
| Visibility | Impressions, Search IS |
| Engagement | Clicks, CTR |
| Traffic Quality | Bounce rate |
| Conversion | Conversions, conversion rate |
| Value | Conversion value, ROAS |

Whichever stage shows the largest deviation is where the investigation focuses next.

### Step 4 — Rate vs volume split

Decompose the headline KPI using the tables in Part I:

- **CPA = cost / conversions.** Did cost rise, did conversions fall, or both? Which moved more?
- **ROAS = value / cost.** Did value collapse, did cost balloon, or both?
- **CPC = cost / clicks.** Same logic.

The point is to commit to either the **cost side** or the **conversion side** before walking the tree. In nearly every degradation, one side does the bulk of the damage; aiming the investigation at the wrong half wastes time.

### Step 5 — Walk the eight-branch tree

Branches are walked in order (Part I). Skipping is not allowed even when one branch looks obvious — negative findings are evidence too.

For each branch:

1. Pull the data specific to that branch.
2. Test it against the indicators in Part I.
3. Either confirm it or rule it out.
4. Document the finding either way.

#### When to stop walking

Once a branch shows strong confirming evidence, that is the primary candidate. You may keep walking the remaining branches to surface secondary contributors, but the action plan is anchored to the primary diagnosis. Resist the temptation to declare "everything is broken" — most degradations have one dominant cause.

### Step 6 — Attribution reality check

Before locking the diagnosis, verify the data itself is not lying. Use the lag, cross-device, modeling, and assisted-conversion checks in Part I. If attribution mechanics explain the apparent drop, the verdict becomes "no real change, allow data to mature" rather than a campaign defect.

### Step 7 — Competitive read

Compare auction insights between the two windows using the framework in Part I. Look for new competitors, existing competitors increasing share, CPC inflation patterns even when IS held steady, and position-above and overlap rate shifts. If a competitive shift is the primary driver, classify it as temporary (likely a competitor promo or seasonal push) or structural (a sustained new entrant). The classification changes the recommended response.

### Step 8 — Identify the root cause

#### Checkpoint C3 — Diagnosis

Walk the user through the branch-by-branch verdict, then present the evidence chain in this shape:

```
Symptom    → what the user observed
Data       → what the numbers actually show
Evidence   → which branch the data confirmed
Root Cause → the specific underlying mechanic
Confidence → High / Medium / Low based on evidence strength
```

Then ask whether they agree with the eliminations, whether the root cause matches their understanding, and whether they have additional context that should change the picture (a landing page push, a third-party freeze, an internal policy change).

**First five runs:** for each branch, articulate the elimination logic explicitly — for example, why a noticeable jump in off-strategy search queries pins the diagnosis to targeting, or why a flat auction insights comparison clears the auction branch.

### Step 9 — Recommend resolution

Every action recommendation must contain:

- **Action:** the specific change to make.
- **Rationale:** how it addresses the root cause, not the surface metric.
- **Expected impact:** what should improve and by roughly how much.
- **Timeline:** when improvement should become visible.
- **Priority:** Critical / High / Medium / Low.

Priority definitions:

- **Critical:** do it now; it blocks further recovery.
- **High:** do it within 48 hours; it materially accelerates recovery.
- **Medium:** do it within a week; supports recovery or prevents recurrence.
- **Low:** do it when capacity allows; preventive or optimizing.

Group actions into three horizons:

- **Immediate fixes:** measurable within days.
- **Short-term improvements:** measurable within two to four weeks.
- **Structural changes:** measurable within one to three months.

### Step 10 — Produce deliverables

Three artifacts come out of every investigation.

#### Artifact 1 — Diagnostic Report

Markdown, titled `[Campaign Name] - Diagnostic Report - [Date]`. Sections in order:

1. **Problem Statement** — one paragraph capturing campaign, metric, magnitude, periods, and variance verdict.
2. **Funnel Decomposition Summary** — table with each stage, both periods, change, and whether it triggered a signal.
3. **Rate vs Volume Analysis** — short narrative plus raw numbers identifying the side of the equation that broke.
4. **Diagnostic Tree Walkthrough** — for each of the eight branches: branch name, status (Confirmed / Contributing / Ruled Out / Insufficient Data), 1–2 sentences of reasoning, supporting data.
5. **Attribution Assessment** — verdict on whether lag, cross-device, or model issues are distorting the picture, with expected impact if so.
6. **Competitive Assessment** — auction insights summary.
7. **Root Cause Identification** — the evidence chain (Symptom → Data → Evidence → Root Cause → Confidence).
8. **Caveats** — data gaps, partial attribution windows, unverifiable externals.

#### Artifact 2 — Action Plan

Markdown, titled `[Campaign Name] - Action Plan - [Date]`. Sections:

1. **Root Cause Summary** — one paragraph restating the diagnosis.
2. **Resolution Steps** — table with columns Priority, Action, Rationale, Expected Impact, Timeline, Owner.
3. **Monitoring Plan** — table with columns Metric, Current Value, Target Value, Check Frequency, Timeframe.
4. **Escalation Triggers** — bullets describing the conditions that would invalidate the diagnosis ("if metric X has not improved by Y% within Z days, reopen branch N").

#### Artifact 3 — Summary

Three to five sentences suitable for Slack, email, or meeting notes. Sentence-by-sentence structure:

1. Campaign investigated and problem observed.
2. Root cause identified.
3. Primary recommended action.
4. (Optional) Expected timeline for recovery.
5. (Optional) Key caveat or what to watch.

#### Output formatting rules

- Use tables for any comparison of numbers. Do not bury comparisons inside prose.
- Round percentages to one decimal; currency to two decimals.
- Always pair absolute values with percentage change — for example `$60.67 → $107.85 (+77.8%)` rather than the percentage alone.
- Bold the headline finding and the root cause sentence.
- Keep each section tight; sections longer than ~10 lines usually contain analysis that belongs elsewhere.
- Do not include raw GAQL in deliverables; queries are internal.
- Include the date and comparison periods in every title.

### Checkpoint C5 — Delivery

When the artifacts are ready, present:

- Which files have been produced (Diagnostic Report, Action Plan, Summary).
- The root cause in one sentence.
- The primary recommended action in one sentence.
- The monitoring plan in one sentence ("watch metric X for Y days; if A, the fix is working; if B, re-investigate").
- The preferred output format for the action plan: task list, Slack-ready message, or email.

Ask whether the user wants to convert the action plan into tasks or adjust any of the resolution steps.

**First five runs:** explicitly teach the user how to read the monitoring plan and escalation triggers. The monitoring plan defines what to watch after implementation; escalation triggers define when to come back and reopen the investigation.

## Recurring investigation archetypes

### "CPA spiked this week"

By far the most common case. Order of operations:

1. Conversion lag check — is the period fully attributed yet?
2. Funnel decomposition — which stage broke?
3. Rate vs volume — cost up or conversions down?

### "ROAS has been sliding for weeks"

A trend investigation, not a spike investigation. Compare four to six rolling windows. Patterns to look for: competitive pressure (visible in auction insights), creative fatigue (CTR trending down), or audience exhaustion (targeting drift, declining IS without competitive change).

### "Campaign suddenly stopped converting"

Cliff-edge stops are almost always measurement or landing page. Check conversion tracking status first; then test the landing page for breakage, redirects, or recent content changes. Gradual campaign decay does not produce a cliff.

### "New campaign isn't performing"

A different problem from a decline — there is no baseline to compare against. Run through:

- Is the campaign still in its learning period?
- Is targeting reasonable for the audience the strategy expects?
- Is conversion tracking confirmed end-to-end?
- Is there enough volume for the bid strategy to learn?

Set expectations: the first two to four weeks of a new campaign are inherently noisy.

### "Performance is fine, the client thinks it is bad"

This is expectation management, not diagnosis. Pull YoY data to contextualize seasonality, show historical performance bands, and demonstrate that current numbers are inside normal variance. The "root cause" here is misaligned expectations.

## Calibrating to account maturity

Investigation depth should match the sophistication of the account being investigated.

| Maturity | Where to focus |
|----------|----------------|
| Nascent | Lean hard on measurement and tracking — most issues are upstream setup. |
| Developing | Walk the full tree; common offenders are targeting fit, bidding strategy fit, and creative. |
| Established | Foundation is solid; emphasize competitive, attribution, and bidding fine-tuning. |
| Advanced | Look at marginal causes — attribution model retraining, audience saturation, micro-competitive shifts. |

---

# PART III — GAQL Reference

Assumes Google Ads API v20 and the standard ADC authentication described in pancake-account-foundations.

### Window conventions

- **Problem Period:** the recent window where degradation appears (typically the last 7 or 14 days).
- **Comparison Period:** the same duration immediately preceding the problem period.
- **Seasonality check:** the same calendar dates from one year prior.
- **Low-volume override:** if the campaign has fewer than 50 clicks per week, switch from 7-day to 28-day windows.

### Campaign-level performance

Pulled for both periods.

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
  metrics.average_cpc,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value,
  metrics.cost_per_conversion,
  metrics.conversions_from_interactions_rate,
  metrics.value_per_conversion,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share,
  metrics.search_top_impression_share,
  metrics.search_absolute_top_impression_share
FROM campaign
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
```

Derived metrics:

- `total_cost = cost_micros / 1,000,000`
- `CPA = total_cost / conversions`
- `ROAS = conversions_value / total_cost`

### Daily trend

```sql
SELECT
  segments.date,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
ORDER BY segments.date
```

Used to pinpoint the day the shift occurred. A cliff-edge drop usually means tracking or a technical break; a gentle slope usually means competitive, creative, or targeting drift.

### Search terms

```sql
SELECT
  search_term_view.search_term,
  search_term_view.status,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM search_term_view
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
ORDER BY metrics.cost_micros DESC
```

Inspection focus: the top 20 spend-driving queries — are they on-strategy? Queries with spend and zero conversions — likely waste. Diff the query mix across the two windows — has anything new appeared?

### Auction insights

For Search campaigns:

```sql
SELECT
  metrics.auction_insight_search_impression_share,
  metrics.auction_insight_search_overlap_rate,
  metrics.auction_insight_search_position_above_rate,
  metrics.auction_insight_search_top_impression_share,
  metrics.auction_insight_search_outranking_share
FROM campaign
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
```

Note: the API often does not expose per-competitor domain breakdowns. If competitor identity matters, pull the report from the Google Ads UI instead.

### Change history

```sql
SELECT
  change_event.change_date_time,
  change_event.change_resource_type,
  change_event.changed_fields,
  change_event.old_resource,
  change_event.new_resource,
  change_event.user_email
FROM change_event
WHERE change_event.change_date_time BETWEEN '{START_DATE}' AND '{END_DATE}'
  AND campaign.id = {CAMPAIGN_ID}
ORDER BY change_event.change_date_time DESC
```

Flag in particular: any conversion action change; bid strategy type or target value changes; daily budget changes; ad pauses, removals, or disapprovals; keyword, audience, or location edits.

### Conversion lag

```sql
SELECT
  segments.conversion_lag_bucket,
  metrics.conversions,
  metrics.conversions_value
FROM campaign
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
```

The bucket distribution reveals how much of the problem period is likely still pending attribution.

### Device segmentation

```sql
SELECT
  segments.device,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_from_interactions_rate,
  metrics.conversions_value
FROM campaign
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
```

Used to test whether a single device is responsible for the campaign-wide swing.

### Geographic segmentation

```sql
SELECT
  geographic_view.country_criterion_id,
  geographic_view.location_type,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM geographic_view
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
ORDER BY metrics.cost_micros DESC
```

Pull when geo targeting is central to the strategy or when other branches have already been ruled out.

### Ad group detail

```sql
SELECT
  ad_group.id,
  ad_group.name,
  ad_group.status,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.cost_micros,
  metrics.conversions,
  metrics.conversions_value
FROM ad_group
WHERE campaign.id = {CAMPAIGN_ID}
  AND segments.date BETWEEN '{START_DATE}' AND '{END_DATE}'
ORDER BY metrics.cost_micros DESC
```

Useful once the funnel break is at engagement (CTR) so you can localize which ad group is dragging the average.

---

# PART IV — Worked Example: "Roof Repair - Search"

A fictional but realistic case study illustrating how the diagnostic walk plays out in practice, including how the obvious-looking branch turns out to be a red herring.

### Setup

- **Account:** SkylineRoofers (fictional, lead generation).
- **Campaign:** "Roof Repair - Search" (Campaign ID 98231445).
- **Bid strategy:** Target CPA at $60.
- **Maturity:** Developing — roughly 28 conversions per month, one conversion action, baseline tracking.
- **User report:** "CPA went from $60 to almost $110 over the last week. Something is wrong."

### Step 0 — Frame

Campaign and KPI confirmed. The reported observation is an effective doubling of CPA week over week.

### Step 1 — Pull

- Problem period: June 9–15 (Week 24).
- Comparison period: June 2–8 (Week 23).

### Step 2 — Problem statement

| Metric | Week 23 | Week 24 | Change |
|--------|---------|---------|--------|
| Impressions | 5,840 | 5,790 | -0.9% |
| Clicks | 412 | 395 | -4.1% |
| CTR | 7.1% | 6.8% | -0.3pp |
| Avg CPC | $5.30 | $5.46 | +3.0% |
| Cost | $2,184 | $2,157 | -1.2% |
| Conversions | 36 | 20 | -44.4% |
| Conv. Rate | 8.7% | 5.1% | -3.6pp |
| CPA | $60.67 | $107.85 | +77.8% |

A 77.8% CPA move sits far above the 20% significance threshold. With ~28 conversions per month, WoW comparison is at the edge of reliability, but the magnitude of the swing makes the signal credible on its own.

> **Problem statement:** Roof Repair - Search CPA climbed from $60.67 to $107.85 (+77.8%) WoW. Cost barely budged (-1.2%); conversions fell sharply (-44.4%). This is conversion-side, well outside any defensible noise band.

### Step 3 — Funnel decomposition

Visibility metrics (impressions, search IS) moved under one percentage point. Engagement metrics (clicks, CTR) moved less than five percent. Conversion stage collapsed — conversions down 44.4%, conversion rate down 3.6 percentage points. The break is squarely at conversion.

### Step 4 — Rate vs volume

`CPA = cost / conversions`. Cost moved -1.2%; conversions moved -44.4%. Conversion-side problem. Cost mechanics are intact.

### Step 5 — Walk the tree

**Branch 1 — Measurement.** Conversion action is Active. Tag fires correctly on the lead confirmation page. Change history surfaces three relevant edits:

| Date | Change | User |
|------|--------|------|
| May 26 | Counting changed from "One" to "Every" | ppc-lead@skylineroofers.example |
| Jun 10 | Counting changed from "Every" back to "One" | ppc-lead@skylineroofers.example |
| Jun 10 | Conversion action renamed from "Quote Request" to "Roof Quote Lead" | ppc-lead@skylineroofers.example |

For a quote request form, "One" is the correct counting setting — repeated submissions from one click are not new leads. The May 26 switch to "Every" would have padded counted conversions for roughly two weeks. The June 10 revert + rename happens to land right at the start of the problem window. Status: **contributing** — not the direct reason conversions fell (the tag still fires), but heavy context for the bidding branch.

**Branch 2 — Auction.**

| Domain | IS W23 | IS W24 | Change |
|--------|--------|--------|--------|
| SkylineRoofers | 58% | 57% | -1pp |
| rival-roofing.example | 42% | 44% | +2pp |
| metro-shingles.example | 35% | 33% | -2pp |

No new entrants; movements are within noise. Status: **ruled out.**

**Branch 3 — Targeting.** Search term mix and match-type distribution are stable across both windows. No new irrelevant clusters. Status: **ruled out.**

**Branch 4 — Creative.** CTR slipped 0.3 percentage points (within variance). No ad disapprovals. RSA asset ratings unchanged. Status: **ruled out.**

**Branch 5 — Landing Page.** Given the funnel finding, this is where intuition wants to point. But page load is steady at 1.9 seconds, manual form submission completes, no visual changes are visible, and no A/B test is in flight. Status: **ruled out.**

**Branch 6 — Budget.** IS lost to budget sits at 7% in both windows. Budget is not the constraint. Status: **ruled out.**

**Branch 7 — Bidding.** Bid strategy is Target CPA at $60. Strategy type and target are unchanged in the change log. However, the bid strategy **status flipped to "Learning" on June 10.** Google treats any conversion action edit as a meaningful signal change for Smart Bidding, which sends the strategy into a fresh learning period — even when the strategy itself was untouched.

While Smart Bidding learns, the system probes more aggressively, allocates less efficiently, and tolerates wider auction variance. Effective CPA rises while the model recalibrates. The compounding twist: for the two weeks before June 10, the algorithm was training against inflated conversion counts (the May 26 "Every" setting). When the data was reverted, the model had to throw out the padded history and rebuild against accurate signals.

Status: **confirmed root cause.**

**Branch 8 — External.** YoY data shows no seasonal dip for this date range. No notable market events. Status: **ruled out.**

### Step 6 — Attribution check

Lead generation in this vertical typically carries a 7–14 day conversion lag. Week 24 data is only 4–7 days old at the time of investigation, so an estimated 4–6 additional conversions are likely to land, which would bring realized CPA down to roughly $80. Lag softens the magnitude but does not move the diagnosis.

### Step 7 — Competitive analysis

Already covered in Branch 2. No competitive factors found.

### Step 8 — Root cause chain

```
Symptom    → CPA up 77.8% in one week ($60.67 → $107.85)
Data       → Conversions -44.4%, cost flat; break is at conversion stage
Evidence   → May 26 conversion action edit padded counts for 2 weeks;
             Jun 10 revert + rename forced a tCPA learning period
             built on a model trained against contaminated data
Root Cause → Conversion action edits forced Smart Bidding into learning
             on top of a corrupted historical baseline
Confidence → High (timing matches the performance shift exactly;
             every other branch ruled out)
```

### Step 9 — Resolution plan

| Priority | Action | Rationale | Expected Impact | Timeline |
|----------|--------|-----------|-----------------|----------|
| Critical | Freeze the campaign — no further edits | Additional changes prolong learning | Stops the disruption from extending | Immediate |
| High | Temporarily lift tCPA to $72 (≈20% above historical target) | Gives the algorithm room while it rebuilds the model | Earlier exit from learning | 7–10 days |
| High | Brief ppc-lead@skylineroofers.example: no conversion action edits without ads-team review | Removes the underlying failure mode | Eliminates recurrence | This week |
| Medium | Once learning ends, step tCPA back down in $4 weekly increments to $60 | Avoids re-triggering aggressive learning via a sharp target cut | Smooth glide path back to target | 2–4 weeks post-recovery |
| Low | Set up a change-history alert for conversion action edits | Early warning the next time this happens | Faster detection | When capacity allows |

**Monitoring plan:** check CPA daily for ten days. Expect CPA to trend toward $72 by days 7–10, and to approach $60 by days 20–25.

**Escalation trigger:** if CPA has not improved by day 10, reopen Branch 1 — the conversion action edits may have introduced a deeper tracking issue the initial check missed.

### Step 10 — Summary paragraph

> The Roof Repair - Search campaign's CPA jumped 78% in Week 24, driven entirely by a 44% conversion drop while cost stayed flat. The cause was conversion-action churn: counting was switched from "One" to "Every" on May 26 (padding Smart Bidding's training data for two weeks), then reverted and renamed on June 10, which pushed the tCPA strategy into a fresh learning period built on a corrupted baseline. Recommended path: hold all edits, raise tCPA to $72 temporarily, and let learning complete over 7–10 days. To prevent recurrence, require ads-team review before any conversion action change.

### Takeaways

1. **The break point is not always near the root cause.** The funnel snapped at conversion, which points at the landing page. The landing page was fine; the actual fault was a measurement edit that disrupted bidding.
2. **Change history is the highest-leverage diagnostic surface.** Pull it early; the smoking gun is usually visible there before any deeper analysis is needed.
3. **Stacked changes create stacked problems.** The May 26 edit was the original mistake. The June 10 fix had the right intent but produced a new, larger problem because the model was already corrupted. Each edit compounds the last one.
4. **In a learning period, doing nothing is often the best action.** The instinct to "fix" a struggling campaign by changing things actively extends the learning state.
5. **Account for lag before reacting.** The headline $107.85 CPA will mature toward $80 as remaining conversions land. Still bad, but not the catastrophe the raw number implied on day one.
