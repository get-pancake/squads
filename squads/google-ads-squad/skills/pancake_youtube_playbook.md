---
name: pancake_youtube_playbook
description: Knowledge base for designing, structuring, and measuring YouTube advertising inside Google Ads. Defines the staged-funnel logic, format trade-offs, audience construction patterns, and YouTube-specific measurement model used by the pancake_evaluate_youtube action skill. Reference-only — does not execute anything.
triggers:
  - "youtube methodology"
  - "youtube ads framework"
  - "youtube campaign strategy"
  - "video ads methodology"
---

# YouTube Advertising Methodology

## How to Read This Skill

This document is a methodology library, not a runnable procedure. It captures the way YouTube campaigns should be evaluated and shaped inside a Google Ads account. The companion action skill `pancake_evaluate_youtube` pulls account data and produces findings — it relies on the rules and benchmarks documented here to interpret what it sees.

Two questions are answered separately:

- *This skill*: what does a healthy YouTube setup look like, and how do we judge it?
- *The action skill*: what is actually present in this account, and where does it diverge from the model?

The rest of this document walks the model top-down: the staged funnel, then the formats that populate each stage, then how to build audiences across them, then how to measure the whole system, then how all of this scales with account maturity.

---

## The Staged Funnel

YouTube performance is best understood as three stages that pass audiences forward. Each stage uses different campaign types, formats, KPIs, and bids — but the real point of the model is that each upstream stage is what feeds the next. Skipping a stage means the next stage is forced to acquire viewers cold, which usually means worse CPAs and lower volume.

### Stage A — Awareness

| Aspect | Configuration |
|---|---|
| Campaign type | Video Reach |
| Formats | Bumper (6s) and non-skippable in-stream (15s) |
| Bidding | Target CPM |
| Headline KPIs | CPM, reach, unique reach, frequency |
| Supporting KPIs | Ad recall lift, brand awareness lift |

**What this stage is for.** Place the brand or product in front of users with no prior exposure. Optimize for efficient reach within a broad-but-relevant pool. Precision is not the goal here — scale is.

**Audience width.** Wide: in-market audiences, affinity audiences, broad demographics.

**Creative posture.**
- One idea per ad — there is no time for a second one.
- Brand identity must register inside the first 2 seconds.
- No CTA. You are not asking for anything yet.
- Treat audio as primary; most YouTube viewing happens with sound on.

**Sizing the budget.** Because awareness is CPM-priced, budget follows reach: `(target reach × CPM) / 1000`. Expect CPMs in the $2–10 range depending on competition and targeting breadth.

**What it produces.** Video viewer audiences. These become the seed for Stage B.

### Stage B — Consideration

| Aspect | Configuration |
|---|---|
| Campaign type | Video View |
| Formats | Skippable in-stream (15s–3min) and in-feed |
| Bidding | Max CPV |
| Headline KPIs | CPV, view rate, watch time |
| Supporting KPIs | Consideration lift, earned subscribes, earned playlist adds |

**What this stage is for.** Take the people you reached in awareness and warm them up — demonstrate, explain, prove, or tell a story. The conversion is engagement, not purchase.

**Audience width.** Narrower than awareness. Combine remarketing from Stage A (viewers of your awareness ads) with custom segments (competitor URLs, recent search terms) and tighter in-market categories.

**Creative posture.**
- The first 5 seconds is the *only* guaranteed exposure on a skippable ad — open with the hook.
- Mention the brand by the 5-second mark so even skippers leave with brand recall.
- After the hook, follow a problem → solution → proof arc.
- For in-feed placements, longer videos are fine because the user actively clicked.
- Close on a low-friction CTA like "Learn more" or "See how it works."

**Sizing the budget.** CPV-priced. You only pay when a user reaches 30 seconds (or the end of the ad if it is shorter) or interacts with it. Typical CPV: $0.03–0.10.

**What it produces.** Deeper engagement lists — 50%+ watchers, interactors, subscribers — which seed Stage C.

### Stage C — Action

| Aspect | Configuration |
|---|---|
| Campaign type | Demand Gen (preferred) or Video Action |
| Formats | Skippable in-stream with CTA overlay + sitelinks; in-feed with CTA |
| Bidding | Target CPA or Maximize Conversions (with optional tROAS in Demand Gen) |
| Headline KPIs | CPA, conversions, conversion value, ROAS |
| Supporting KPIs | View-through conversions, search lift |

**What this stage is for.** Convert. This is the only stage of YouTube that resembles classic direct response.

**Audience width.** Tightest. Stage B remarketing (especially 50%+ watch lists and channel engagers), Customer Match files, and high-intent in-market segments.

**Creative posture.**
- A direct, unambiguous CTA: "Shop now", "Get a quote", "Start free trial."
- Add urgency or specificity — a particular product, a time-limited offer, a concrete benefit.
- Social proof helps: reviews, testimonials, results.
- Aim for 15–30 seconds. Brevity converts.
- Reinforce the CTA in the overlay and the companion banner.

**Sizing the budget.** `target conversions × target CPA = monthly budget`. Smart bidding needs at least 15 conversions per campaign per month to optimize reliably — do not deploy tCPA below that threshold.

**What it produces.** Direct conversions, view-through conversions, and measurable search lift.

### Stage Sequencing and Timing

The three stages chain. The chain matters more than the individual campaigns:

```
Broad pool
   ↓ (Bumper / Non-skip)
Awareness viewer list
   ↓ (Skippable / In-feed)
Engaged viewer list (50%+ watched, interacted)
   ↓ (Demand Gen / Video Action)
Conversions + view-through conversions + search lift
```

Practical ordering:

- Launch awareness 2–4 weeks before consideration so the viewer pool exists.
- Launch consideration 1–2 weeks before action.
- Once all three pools exist, run the stages concurrently.
- Refresh awareness creative every 4–6 weeks to avoid frequency fatigue.

---

## Ad Format Reference

YouTube has five primary formats. Each one has a distinct mechanic — what you pay for, how long the ad runs, whether the user can skip, and what kind of message it can support.

### Bumper — 6 seconds, non-skippable

- **Length:** exactly 6 seconds.
- **Skip:** not available.
- **Placement:** pre-roll, mid-roll, post-roll.
- **Pricing:** Target CPM; you pay per 1,000 impressions.
- **Typical CPM:** $2–6.

Bumpers exist for one job: a single, memorable beat. There is no room for setup, story, or persuasion — only a brand cue or a one-line reinforcement of a longer ad you already showed.

**Use when:**
- You need broad reach at a low CPM.
- You want to ladder a 15-second message into reminder touches.
- You are running an event or seasonal push that benefits from frequency.

**Avoid when:**
- The product requires explanation or demonstration.
- You expect a response from the viewer — there is no time to ask.

Creative discipline: brand cue inside the first 2 seconds, audio carries the message, do not try to land two ideas.

### Non-skippable in-stream — 15 seconds

- **Length:** 15 seconds, fixed.
- **Skip:** not available.
- **Placement:** pre-roll, mid-roll.
- **Pricing:** Target CPM; you pay per 1,000 impressions.
- **Typical CPM:** $4–10.

When the message has to land in full — a launch, a promotional window, a key brand moment — non-skippable buys you that guarantee, at roughly two to three times the cost of a bumper.

**Use when:**
- The message cannot afford to be skipped.
- You have a tight, brand-forward 15-second cut.
- Awareness is the explicit objective.

**Avoid when:**
- Budget is tight (the CPM premium is real).
- Your video really wants to be longer than 15 seconds.

Creative discipline: the brand should be present throughout, not held until the end card. Build a small arc: setup, message, brand.

### Skippable in-stream — 15 seconds to 3 minutes

- **Length:** 15 seconds to 3 minutes. Sweet spot: 30 seconds to 2 minutes.
- **Skip:** after 5 seconds.
- **Placement:** pre-roll, mid-roll.
- **Pricing:** Max CPV for consideration; tCPA / Max Conversions for action.
- **You pay when:** a viewer reaches 30 seconds (or the end of the ad if shorter) *or* interacts (CTA click, card click, companion banner click).
- **Typical CPV:** $0.03–0.10.

This is the workhorse format for both consideration and action. It is the only format where you can tell a story, demonstrate a product, or drive a click.

**Use when:**
- You want to pay only for engaged viewers, not for impressions.
- You need a CTA — Demand Gen and Video Action campaigns run on this format.
- You have a story or demo that rewards more than 15 seconds of attention.

**Avoid when:**
- Your idea fits in 6 seconds (use a bumper).
- You cannot tolerate a skip — there is no way to prevent one.

Creative discipline: open with the hook in the first 5 seconds because that is your only guaranteed window. Mention the brand by second 5 so the skip is not a total loss. Build the arc — problem, solution, proof, CTA.

### In-feed — user-initiated thumbnail ads

- **Length:** any.
- **Skip:** moot — the user has to click to start.
- **Placement:** YouTube search results, the home feed, the Watch Next rail.
- **Pricing:** Max CPV; you pay when the user clicks the thumbnail and the video begins.
- **Typical cost:** varies widely with audience and competition.

In-feed flips the model: instead of forcing exposure, you compete for clicks against organic videos. The thumbnail and headline are doing the heavy lifting, not the first second of the video.

**Use when:**
- The content is educational, demonstrational, or testimonial — things that reward intent.
- You want high-quality, opted-in views from genuinely curious users.
- The video is too long for in-stream to make sense.

**Avoid when:**
- You need scale and reach. In-feed delivers fewer, higher-quality views.
- Brand awareness is the goal — there is no exposure unless the user clicks.

Creative discipline: invest in the thumbnail and the headline. Inside the video, you have permission to go long.

### Shorts — vertical, up to 60 seconds

- **Length:** up to 60 seconds.
- **Aspect ratio:** 9:16 vertical, mandatory.
- **Skip behavior:** depends on placement.
- **Placement:** between organic Shorts in the Shorts feed.
- **Pricing:** Target CPM or tCPA depending on campaign type.
- **Typical cost:** generally lower CPMs than the standard formats — inventory is still growing.

Shorts are mobile-native and skew young. The format does not tolerate ads that look like ads — the goal is to feel native.

**Use when:**
- The audience skews mobile or 18–34.
- You already have vertical short-form content (or can repurpose easily).
- You want to extend reach at efficient CPMs.

**Avoid when:**
- You only have horizontal assets.
- The audience skews 45+.
- The product needs careful explanation.

Creative discipline: grab attention in the first 2 seconds, keep cuts fast, layer text overlays for the sound-off scrollers.

### Picking a Format

Walk the choice in this order:

1. **What is the objective?**
   - *Awareness:* Bumper or non-skippable. Add Shorts if the demo is younger.
   - *Consideration:* Skippable in-stream for scale, in-feed for high-intent.
   - *Action:* Skippable in-stream with a CTA inside a Demand Gen or Video Action campaign; supplement with in-feed.
2. **What creative do you actually have?**
   - Only sub-10-second clips → bumper.
   - Polished 15-second to 3-minute horizontal video → skippable in-stream.
   - Vertical short-form → Shorts.
   - Strong thumbnail and educational long-form → in-feed.
3. **What is the monthly YouTube budget?**
   - Under $5K/month: pick one format.
   - $5K–$20K/month: two formats — usually one awareness, one action.
   - Above $20K/month: full multi-format funnel.

---

## Audience Strategy

YouTube audience-building moves from wide to narrow as the funnel deepens. The same logic applies to frequency: more touches early, fewer touches late.

### Audience Types Available

**In-market audiences.** Users with active, recent purchase signals in a category (searches, site visits, content consumption). High intent. Best for consideration and action. Niche categories may not have enough volume.

**Affinity audiences.** Long-term interest patterns — cooking enthusiasts, technophiles, green living. Large and stable but lower-intent. Best for awareness.

**Custom segments.** You define the audience using:
- *URL signals* — visitors to specific sites (competitor product pages, industry publications, review sites).
- *Search signals* — recent Google searches for terms you specify.
- *App signals* — users of specified apps.

Best for consideration and action when there is a clean competitive or intent signal to encode. Make them too narrow and reach evaporates.

**Life events.** Major life moments: moving, marrying, starting a new job, graduating, founding a business, buying a home, having a baby, retiring. Strong purchase intent during the event window. Narrow and not available in every market.

**Detailed demographics.** Household income, parental status, education, homeownership, marital status. Use as a layer on top of other audience types, not as the primary signal. Self-reported and inferred, so accuracy is uneven.

### YouTube-Channel Remarketing

When your YouTube channel is linked to Google Ads, engagement audiences populate automatically. These tend to be the strongest-performing audiences in the account because the users already touched your brand.

Available lists include:

- Anyone who viewed any video from the channel (broadest).
- Viewers of a specific video.
- Viewers who saw a video as an ad — separates paid from organic.
- Quartile watchers: 25%, 50%, 75%, and 97%. Higher percentage = stronger intent signal.
- Channel subscribers.
- Channel page visitors (visited the page, not a specific video).
- Video likers.
- Users who added a video to a playlist (strong interest signal).
- Sharers (advocacy signal).

How to apply them stage-by-stage:

- **Awareness → Consideration:** point this campaign at the "viewed any video as an ad" list built by your awareness stage.
- **Consideration → Action:** point this campaign at the "watched 50%+" list built by your consideration stage.
- **Reactivation:** point a campaign at channel subscribers whose last conversion is old.

Sizing rules:

- 1,000 users is Google's floor for using a list on YouTube.
- 10,000+ is where optimization actually has signal to work with.
- Set membership duration to match the purchase cycle — 30 days for impulse, 90–180 days for high-consideration purchases.
- Awareness campaigns are the engine that fills these lists; do not expect remarketing to work if no upstream stage is feeding it.

### Customer Match

First-party email or phone files uploaded to Google for targeting or exclusion.

Use cases:

- Suppress your existing-customer base from prospecting campaigns.
- Re-engage that same base with upsell or cross-sell offers.
- Seed similar audiences from the file (where available).

What to expect:

- Match rates of 30–60% are typical on YouTube — lower than Search, because matching depends on whether the customer's email aligns with a Google account.
- Upload raw (unhashed) data — Google hashes on ingest.
- Layering phone numbers on top of email files lifts the match rate noticeably.
- Refresh active customer lists at least monthly.
- 1,000 matched users is the floor for targeting.

### Layering by Stage

| Stage | Primary audience | Secondary audience | Mode | Frequency cap |
|---|---|---|---|---|
| Awareness | In-market + Affinity | — | Targeting | 3–4/week |
| Consideration | YouTube remarketing (awareness viewers) + custom segments | Narrower in-market | Targeting | 2–3/week |
| Action | YouTube remarketing (50%+ watchers) + Customer Match | Highest-intent in-market | Targeting | 1–2/week |

### Observation vs. Targeting

- **Observation** lets ads serve to everyone while you collect per-audience performance data. Use this when you do not yet know which audiences convert.
- **Targeting** restricts delivery to the audiences you specify. Use it once you have evidence.
- Practical pattern: open in observation for 2–4 weeks, then promote the winners to targeting.

### Frequency Discipline

Unmanaged frequency burns money, fatigues creative, and damages brand perception. Caps should match stage and format:

| Configuration | Cap | Why |
|---|---|---|
| Awareness — Bumper | 3–4/week | Six seconds absorbs repetition without burning attention |
| Awareness — Non-skip | 2–3/week | A forced 15-second spot wears out fast |
| Consideration | 2–3/week | Deeper engagement is driven by curiosity, not by repeat exposure |
| Action | 1–2/week | One or two shots to close, then leave the warm list alone |

When several YouTube campaigns run simultaneously, individual caps stack on overlapping users. A 4/week awareness cap plus a 3/week consideration cap can produce 7 ad impressions per week on the overlap pool. Monitor account-level reach and frequency, and lower individual caps if the stacked total is uncomfortable.

Warning signals that frequency has gone wrong:

- View rate trending down week over week with no targeting change (fatigue).
- CPV creeping up without a corresponding change in audience or bid.
- Total YouTube frequency above ~5 impressions per user per week.
- Climbing skip rate on skippable formats.

---

## Measurement

YouTube measurement does not work on Search reflexes. Judging YouTube on last-click CPA alone will almost always make it look weak, because it is rarely the closing channel — it is the channel that creates the demand the closer captures.

### The Core Metrics

**CPV (cost per view).** What you paid when a user watched 30 seconds (or the full ad if shorter) or interacted with the ad. Applies to skippable in-stream and in-feed. Typical range $0.03–0.10. Bumpers and non-skip ads do not produce CPVs — they are CPM-priced.

**View rate.** The share of impressions that became views. Benchmark for skippable in-stream is 15–30%. Below 15% suggests creative or targeting weakness. Above 30% suggests both are working. In-feed view rates run higher than in-stream because users opt in by clicking.

**Watch time.** Total minutes watched across all viewers. Aggregate, not per-user. Most useful for comparing creative variants — which version actually holds attention. Watch time correlates with brand recall and consideration lift.

**Earned actions.** Organic actions taken within 7 days of a paid view: free subscribes, playlist adds, shares, likes. High earned-action volume means the creative is doing work beyond the impression you paid for. Useful ratio: earned actions ÷ paid views.

**Video quartile metrics.** How many users hit 25%, 50%, 75%, and 100% of the video. A healthy creative shows a gradual decline; a cliff at one quartile (often 25%, which lines up with the 5-second skip point) marks where the ad is losing people.

### View-Through Conversions

A view-through conversion (VTC) is a user who saw your video, did not click, and converted on your site later within the attribution window.

VTC matters on YouTube because most viewers never click. They watch, then a few hours or days later they search for the brand and convert through Search or Direct. Without VTC, those conversions look like they came from somewhere else, and YouTube looks like it produced nothing.

Attribution windows:

- Default is 1 day after the view.
- The window can be widened to 7 or 30 days.
- Wider windows pull in more conversions and more noise alongside them — start at 1 day, only stretch it if volume demands it.

How to use VTC in analysis:

- Report it as its own line, distinct from click-through conversions.
- For ROI math, weight a VTC at 50–75% of a click-through conversion to reflect lower confidence.
- VTC is most diagnostic for awareness and consideration campaigns, where CTRs are naturally low.

### Brand Lift Studies

Google Brand Lift studies are survey-based incrementality tests. A control group (not exposed to the ads) and an exposed group (saw the ads) are surveyed, and the delta is reported on:

- Ad recall — "Do you remember seeing an ad for [brand]?"
- Brand awareness — "Have you heard of [brand]?"
- Consideration — "Would you consider [brand]?"
- Purchase intent — "How likely are you to buy from [brand]?"

Eligibility:

- Roughly $5,000 in spend over 10 days at minimum (thresholds vary by market and by metric).
- YouTube video formats only.
- The study has to be wired up *before* the campaign goes live — there is no retroactive option.
- The first metric per study is free; adding more metrics raises the spend bar.

Reading the output:

- Ad recall lift: 4–8% is typical, 10%+ is strong.
- Consideration lift: 1–3% is typical, 5%+ is strong.
- Purchase intent lift: 0.5–2% is typical, 3%+ is strong.

Brand Lift is the cleanest single justification for upper-funnel YouTube budget, and it pairs naturally with search lift for a full upper-funnel picture.

### Search Lift

The mechanism: people see your YouTube ad, then later go to Google and search for your brand or product. Search lift measures that incremental branded search volume.

Three measurement approaches, ordered by rigor:

1. **Time-based baseline.**
   - Establish a baseline of branded search volume at least 4 weeks before launch.
   - Measure during-campaign and post-campaign volume.
   - `(during − baseline) / baseline = % lift`.
   - Watch out for seasonality and concurrent marketing.

2. **Geographic holdout.**
   - Run YouTube only in some regions; leave others dark.
   - Compare branded search between exposed and unexposed regions.
   - Cleaner than time comparison because it controls for external swings.
   - Requires enough budget to concentrate in specific geos.

3. **Google's Search Lift Study (beta).**
   - Uses Google's own data to estimate incremental queries directly.
   - Most rigorous, but availability is limited and the campaign has to qualify.

Why search lift is often YouTube's strongest argument:

- A 20–50% branded search lift during YouTube campaigns is common.
- Branded search converts at 3–10× the rate of non-branded search.
- The incremental conversions from those extra branded searches frequently exceed YouTube's direct conversions on their own. A campaign that looks like a CPA disaster on last-click can be paying for itself entirely through search lift.

### Cross-Channel Attribution

YouTube's natural role in the conversion path is initiator or assistant, not closer.

- **Assisted conversions** are paths where YouTube appeared but another channel (often Search or Direct) captured last-click credit. Pull these from Google Ads attribution reports or the multi-channel funnels in Google Analytics.

The full impact calculation:

```
YouTube total = direct conversions
              + view-through conversions
              + assisted conversions
              + search-lift conversions
```

Confidence by component:

| Component | Source | Confidence |
|---|---|---|
| Direct (click-through) | Google Ads conversion tracking | High |
| View-through | Google Ads VTC | Medium |
| Assisted | Attribution reports | Medium |
| Search lift | Search lift measurement | Medium-low |

How to communicate the result:

1. Anchor on direct conversions and click-through CPA — that is the conservative floor.
2. Stack VTC on top at a 50–75% weight.
3. Pull in assist paths from the attribution report.
4. If search lift was measured, fold it in last.
5. State the spread: "Click-through CPA lands at $X; once view-through and assists are credited, effective CPA is $Y."

### Common Measurement Mistakes

- **Last-click CPA as the only judge.** YouTube serves a different funnel stage. Compare its cost to other awareness/consideration media (TV, display, social), not to Search.
- **Excluding VTC.** Without it, YouTube looks like it produces almost nothing. Always include it, distinguished from click-through.
- **Click windows that are too short.** Holding the click window at 1 day cuts out anyone who researches before pulling the trigger. A sensible starting point is a 7-day click window paired with a 1-day view window.
- **No search lift baseline.** If you never measured branded search before the campaign, you cannot demonstrate lift after it. Capture the baseline before launch.
- **Treating YouTube like Search.** YouTube generates demand, it does not capture it. Holding it to Search CPA targets will underfund or kill it prematurely. Set stage-appropriate KPIs.

---

## Dedicated YouTube vs. Performance Max

Performance Max distributes spend across eight Google surfaces, YouTube being one of them. When PMax is putting meaningful spend into YouTube, the question becomes whether a dedicated YouTube campaign would do the job better.

What PMax gives you on YouTube:

- Automatic budget allocation across channels.
- Cross-channel optimization decisions.
- Lower management cost.

What only a dedicated YouTube campaign gives you:

- Format choice (bumper, skippable, etc.).
- Precise audience targeting.
- Frequency management (PMax offers none).
- Creative testing by format and audience.
- Granular measurement, including Brand Lift and search lift studies.

### When PMax YouTube Is Enough

- YouTube is under 15% of PMax spend.
- You only have one or two video assets.
- Management bandwidth is the binding constraint.
- PMax is the entire account.
- YouTube is playing a side-dish role rather than carrying its own strategic weight.

### When to Run Dedicated YouTube Instead (or Alongside)

- YouTube has crossed 15% of PMax spend.
- The asset library has several videos at different durations.
- The account has explicitly signed up for an awareness or consideration outcome.
- Frequency needs to be actively managed.
- Creative needs to be tested against named audience segments.
- Brand Lift or search lift studies are on the table (those only run on dedicated campaigns).
- Performance data needs to be sliced by format.

The 15% threshold doubles as a trigger: if YouTube is over 15% of PMax spend *and* you have video assets, it is worth testing dedicated campaigns side-by-side.

### Running Both Without Cannibalizing

- Keep an eye on audience overlap while both are live.
- Where the UI allows, exclude the audiences used by the dedicated campaigns from PMax's video asset groups (your controls here are thin).
- Sum video-driven conversions across both surfaces and ask whether the second one is adding incremental conversions or just rerouting credit.
- PMax usually drinks from the warmest remarketing pools first, which pushes the dedicated campaigns toward prospecting work.

### When to Skip YouTube Entirely

- No video and no budget to make any. (PMax's auto-generated videos are weak.)
- Account is nascent (<15 conversions per month). Not enough data for YouTube to optimize against.
- Pure demand-capture lead gen with no consideration window — emergency plumbers, locksmiths, urgent services.
- Every available dollar is already needed by Search and Shopping to harvest existing intent.

---

## Cross-Channel Effects to Watch

YouTube's value in many accounts is what it does to *other* channels.

**Search lift on branded queries.** As above — the strongest single argument for YouTube spend in most accounts. Pull branded query volume across pre-launch, in-flight, and post-flight windows; layer a geographic holdout on top when you can.

**Shopping uplift.** Awareness on YouTube tends to drive product-level search, which feeds Shopping campaigns. When YouTube is running, check whether Shopping conversion volume rises — both as a confirmation of the YouTube halo and as part of the ROI story.

**Reuse in Display and Demand Gen.** YouTube engagement audiences travel. Share remarketing lists with Display and Demand Gen campaigns so warm video viewers are retargeted across surfaces.

---

## Account-Maturity Calibration

The depth of YouTube strategy should scale with the account's conversion volume. The same maturity tiers used elsewhere (`pancake_account_foundations`) apply here.

### Nascent — under 15 conversions/month

- Do not run YouTube unless brand awareness is an explicit goal with a separate budget.
- Default behavior: put the budget into Search and Shopping until conversion volume is sufficient.
- Exception: a brand with strong video assets and an explicit brand-building mandate.

### Developing — 15–50 conversions/month

- Test exactly one format: a Video Action campaign aimed at in-market audiences.
- Cap YouTube at 15% of total account spend.
- Use search lift as the primary success metric — not last-click CPA.
- Do not attempt a multi-stage funnel yet.

### Established — 50–200 conversions/month

- Run a two-stage setup where an awareness tier (bumper or non-skip) feeds into a conversion tier (Video Action or Demand Gen).
- Build YouTube remarketing audiences and actually use them.
- Begin reporting view-through and assisted conversions next to the click-through line.
- Consider a Brand Lift study once budget can clear the $5K-over-10-days minimum.

### Advanced — 200+ conversions/month

- Run the full three-stage funnel: awareness, consideration, action.
- Sequence audiences explicitly across stages.
- Use Brand Lift for upper-funnel measurement.
- Use search lift (geographic holdout preferred) for incrementality.
- Manage frequency across campaigns at the account level.
- Periodically evaluate dedicated YouTube vs. PMax YouTube allocation.
- Run creative tests by format and by audience.

---

## Reference Files Loaded by `pancake_evaluate_youtube`

When the action skill runs, it may load these companion documents for deeper detail:

| Reference | Path | What it covers |
|---|---|---|
| Full-funnel framework | `references/full_funnel_framework.md` | Stage definitions, sequencing, audience flow, PMax vs. dedicated |
| Format selection guide | `references/format_selection_guide.md` | Format specs, costs, creative requirements, decision tree |
| Audience strategy | `references/audience_strategy.md` | Audience types, remarketing, Customer Match, layering, frequency |
| Measurement framework | `references/measurement_framework.md` | YouTube KPIs, VTC, Brand Lift, search lift, cross-channel attribution |
