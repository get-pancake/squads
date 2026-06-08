---
name: pancake_bidding_playbook
description: Universal methodology for evaluating and selecting Google Ads bidding strategies. Covers the complete bidding landscape (2025-2026), strategy selection framework calibrated by account maturity, manual CPC strategic use cases, portfolio bidding, visibility bidding (Target Impression Share), and learning period management. This is a reference skill loaded by pancake_inspect_bidding. Not an action skill.
triggers:
  - "bidding methodology"
  - "bidding strategy framework"
  - "bidding evaluation"
  - "smart bidding methodology"
---

# Bidding Methodology

## How to Read This Skill

This document is a knowledge base, not a runbook. It describes the analytical scaffolding used whenever a Google Ads account's bidding configuration is being reviewed, recommended, or restructured. The companion action skill `pancake_inspect_bidding` pulls live data and applies the rules captured here. If you are looking for the question "what should I run on this campaign?" you are in the right place. If you are looking for "go and execute the audit now," that lives in the action skill.

The mental model: every recommendation that comes out of an audit is the output of a function whose inputs are (1) data volume, (2) data reliability, and (3) business intent. This file describes that function.

---

## The Bidding Surface in 2025-2026

Google Ads exposes a relatively small set of bid strategies today, but the surface area shifts every year as Google retires older mechanics and reframes the survivors. The state of the world for this skill version is as follows.

### Active Strategies

| Strategy | Family | What It Optimizes | Volume Floor |
|---|---|---|---|
| Manual CPC | Manual | Click flow under bid ceilings you set | None |
| Maximize Clicks | Automated (non-Smart) | Number of clicks within budget | None |
| Maximize Conversions (open) | Smart Bidding | Conversion count, no cost ceiling | None (5+ helps the model) |
| Maximize Conversions + tCPA | Smart Bidding | Conversions priced at a target | 15-30/month |
| Maximize Conversion Value (open) | Smart Bidding | Total reported value | None, but value signal required |
| Maximize Conversion Value + tROAS | Smart Bidding | Value at a return-on-spend target | 30-50/month |
| Target Impression Share | Automated (non-Smart) | Frequency of appearance at a chosen position | None |

### Retired or Folded In

- **Enhanced CPC.** Withdrawn from Search in March 2024 and from Shopping in October 2024. Campaigns that already ran on eCPC continue to function, but the option no longer appears in the strategy picker for new campaigns. Any account still anchored on it should be on a migration path.
- **Standalone Target CPA.** No longer its own entry in the UI. The same algorithm now lives behind Maximize Conversions when an optional CPA target is set. The behavior did not change; only the surface did.
- **Standalone Target ROAS.** Same treatment. It is now a target inside Maximize Conversion Value.

### Newer Layers Worth Knowing

- **Value-Based Bidding (VBB).** The most ambitious layer on top of Smart Bidding. Instead of optimizing for revenue treated uniformly, VBB optimizes against the actual economic value of each conversion (profit, margin, predicted lifetime value). It requires a real value pipeline (conversion value rules, enhanced conversions, offline conversion import, or CRM integration) and at minimum 50-100 conversions per month with reliable variable value attached.
- **Broad match paired with Smart Bidding.** Google's current canonical pairing. Broad match without a bid algorithm to constrain it will pour spend into low-intent queries. Broad match with Smart Bidding is the only configuration where broad becomes financially defensible.
- **Campaign Experiments.** The standard testing vehicle whenever a bid strategy is being considered for change. Traffic is split between the existing setup and the candidate, with statistical significance tracked over the experiment window.

---

## The Governing Idea: Bidding Is Downstream of Maturity

Before any of the framework details matter, internalize this: **the appropriate bidding strategy is dictated by the data the account already has, not by what the operator wishes were true.** A nascent account that switches to tROAS will behave worse than the same account on Manual CPC, because the Smart Bidding model needs signal to make stable predictions and starving it of signal produces noise that is easy to misread as a model failure.

This is the single most common mistake in bidding audits: choosing a strategy because it sounds modern, then blaming the algorithm when results swing wildly. The algorithm is fine. The data isn't there.

Four maturity bands govern what is actually viable:

| Maturity Band | Monthly Conversions | Strategies in Play | Rationale |
|---|---|---|---|
| Nascent | Under 15 | Manual CPC, Maximize Clicks, open Maximize Conversions | Not enough signal for targets. Collect first. |
| Developing | 15-50 | Maximize Conversions + tCPA, open Maximize Conversion Value | Targets are usable but should be set with breathing room. |
| Established | 50-100 | tCPA, tROAS, portfolios | Reliable signal supports cost and value targeting plus cross-campaign coordination. |
| Advanced | 100+ | VBB, portfolios, structured experimentation | Enough volume to optimize for profit and to test rigorously. |

The full mapping of objective + volume + maturity to a recommended strategy lives in `references/strategy_selection_framework.md`.

---

## Strategy Profiles

The following profiles describe how each strategy behaves, what it needs to function, and where it goes wrong.

### Manual CPC

You pick a max CPC per keyword or per ad group, and that is the lid. No algorithmic adjustment. Volume floor is zero, which is precisely the point — it works at any maturity for specific reasons. The cost of that control is that it requires hands on the wheel: bids that fit last month may be too tight or too loose now. A weekly bid review is the minimum cadence.

Manual CPC is not a fallback for skeptics. It is a real tool with real use cases. Detail lives in `references/manual_cpc_use_cases.md`.

### Maximize Clicks

Google buys as many clicks as your budget allows. No conversion awareness at all. Useful for top-of-funnel traffic generation and for new keyword sets where you genuinely need volume to see what happens.

The non-negotiable configuration step is a **max CPC ceiling**. Without it, the algorithm will pay $20 for a single click if that maximizes click count. A reasonable starting cap is 1.5-2x what you expect the average CPC to be for the keyword set. Graduate when the campaign holds 15+ conversions per month for two months straight, at which point it is worth testing Maximize Conversions.

### Maximize Conversions (no target attached)

The algorithm aims for the most conversions inside your budget, with no cost ceiling. There is no volume floor to switch it on, though five or more recent conversions help the model find its feet. CPA will move around — without a target, the algorithm pursues any conversion regardless of price, bounded only by daily budget. That is fine when you are collecting data, but it stops being acceptable once efficiency is a real KPI.

Graduate by adding a tCPA target once you have 15-30 conversions per month and you can measure actual CPA. Set the initial target 15-20% above current actual CPA, not at or below it.

### Maximize Conversions + tCPA

A CPA target is laid over Maximize Conversions. The algorithm now throttles bids when efficiency demands it. Volume floor for stability is 15 per month at minimum, 30+ for results that don't wobble.

The most common way this strategy goes wrong is launching with too tight a target. Pin the target at or under current actual CPA and the algorithm will pull bids back hunting for sub-$X conversions that aren't actually in the market. Open 15-20% above today's actual CPA, then ratchet down 5-10% at a time on a two- to four-week cadence. Two indicators that the target is wrong: (a) actual CPA stays 30%+ above target for stretches at a time — the target isn't achievable; (b) volume collapses immediately after the target goes on — the target is choking delivery.

### Maximize Conversion Value (no target)

The same shape as Maximize Conversions, but the algorithm optimizes for the total value reported. Volume floor is zero, but **conversion value data must actually be flowing** — if every conversion is hardcoded to $1, this strategy collapses into Maximize Conversions.

Once you have validated that reported values match real values and the campaign holds 30-50 conversions per month, attach a tROAS target set 15-20% below current actual ROAS.

### Maximize Conversion Value + tROAS

A ROAS target sits on top. Volume floor for stable behavior is 30-50 per month; higher is better. The opening target should give the algorithm 15-20% of room below today's running ROAS — so if the campaign is currently delivering 5.0x, open the target near 4.0-4.25x. Setting it aggressively produces the same suppression pattern that aggressive tCPA targets do, except the symptom shows up as a drop in spend rather than a drop in conversions.

Two indicators to watch: actual ROAS consistently trailing target by 30%+ (the target is unachievable), and a sharp drop in spend right after the target goes on (the algorithm is rejecting auctions that don't clear its return threshold). Step the target tighter only 5-10% at a time on a two- to four-week cadence, and never tighten more than once inside any 14-day window.

### Value-Based Bidding

The frontier configuration. Built on top of Maximize Conversion Value + tROAS, but with real economic value flowing in — profit, margin, lead quality scores, predicted LTV. The algorithm optimizes for business outcome rather than revenue.

Requirements are strict:

- 50-100 conversions per month minimum
- Conversion values must be **dynamic and variable** (not static placeholders). If every conversion is worth the same, VBB has nothing to optimize over.
- A real pipeline must move value back into Google Ads: enhanced conversions, offline conversion import, CRM integration, or conversion value rules
- Reliable, ongoing data flow (not a one-time import)

Conceptually, VBB is less a bidding choice than a measurement program with a bidding interface. How clean and current the value feed is determines how good the optimization can ever get. VBB breaks down in these situations:

- Lead gen where every lead is genuinely worth the same amount
- Accounts under 50 conversions per month
- Conversion values that are wrong, stale, or arbitrary
- No reliable pipeline to keep values current

Suggested rollout:

1. Activate Maximize Conversion Value (open) to start collecting and validating value signal
2. Confirm that values in Google Ads match values in source systems
3. Add a tROAS target once accuracy and volume are confirmed
4. Layer conversion value rules to model margin/profit differences
5. Monitor and revise — VBB drifts as your value pipeline drifts

### Target Impression Share

A visibility tool, not a conversion tool. It answers "how often am I showing up?" rather than "how efficiently am I converting?" Volume floor is irrelevant; this strategy has no conversion dependency. Detail lives in `references/visibility_bidding.md`. The one universal rule: **a max CPC cap is mandatory**, no exceptions.

---

## When Manual CPC Is the Right Call

Manual CPC retains a legitimate seat at the table. It is the correct choice in any of the following situations.

### Brand Terms with Tight, Predictable CPCs

When CPCs barely move and conversion rates are reliably high, there is no complex auction to solve. Manual CPC gives clean cost control with no real downside.

### Conquest and Competitor Campaigns

Bidding on a competitor's brand is expensive and conversion-thin. Letting an algorithm chase conversions on these terms tends to overspend on clicks that never close. Manual CPC keeps the bid lid where you set it.

### New Markets, New Keyword Themes

The algorithm has nothing to learn from when there is no history. Without negative signal it overbids; without positive signal it underbids. Manual CPC removes the question.

### Low-Volume Campaigns (under 15 conversions/month)

The signal density is below what Smart Bidding needs for stable predictions. Manual CPC paired with bid adjustments produces less erratic results than asking the algorithm to extrapolate from sparse data.

### Single Conversions Worth $10,000+

When a single conversion is large enough to skew the algorithm's view of what worked, Smart Bidding can spend days trying to reproduce a pattern that was a one-off. Manual CPC keeps bids stable through the lumpy reality of high-ticket sales — enterprise software deals, professional services with five-figure engagements, luxury or premium retail.

### Geographic Expansion

When a new region's performance differs structurally from account averages, Smart Bidding's account-wide patterns can mislead. Manual CPC lets you set region-specific bids based on local data.

### Seasonal Pre-Positioning

Smart Bidding reacts; Manual CPC anticipates. Before Black Friday, before a known industry event, before a predictable demand spike, you can raise bids two to four weeks ahead of the spike rather than waiting for the algorithm to notice.

### The Hybrid: Manual CPC With Bid Adjustments

The reason Manual CPC stays competitive in 2025 is that bid adjustments fill in the precision that automation would otherwise provide.

- **Device adjustments.** When mobile's conversion rate runs roughly half of desktop's, a -30% to -50% mobile modifier is more nuanced than killing mobile traffic outright.
- **Location adjustments.** Push bids up where geo performance justifies it, pull them down where it doesn't. You need at least two to four weeks of per-geo data before the call is informed.
- **Ad schedule adjustments.** Lean into the hours and days that convert; lean out of the ones that don't. Especially useful for B2B with a weekday-business-hours pattern.
- **Audience adjustments (RLSA).** Apply remarketing lists to the Manual CPC campaign. The base bid is what everyone sees by default; positive modifiers lift the bid for searchers already on the lists.

### When to Graduate Off Manual CPC

Manual CPC is often a starting point rather than a permanent address. Move on when all of these conditions hold:

1. Conversions hold at 15+/month for two consecutive months
2. Conversion tracking has been confirmed correct and complete
3. CPC, conversion rate, and CPA patterns have stabilized over at least 60 days
4. A Campaign Experiment (50/50 split between Manual CPC and open Maximize Conversions) over 4-6 weeks confirms that automation matches or beats Manual CPC at equal-or-better volume

### Manual CPC Anti-Patterns

- Treating it as set-and-forget. Weekly bid review is the minimum.
- Skipping bid adjustments. Half the value of Manual CPC in 2025 is the adjustment stack on top of it.
- Staying on Manual CPC past 50 conversions/month. At that point automation typically wins; sticking with manual leaves efficiency unclaimed.
- Pinning the max CPC under what the auction actually clears at. Impression share slowly bleeds away. Sanity-check with Auction Insights and the Search IS column.
- Picking Manual CPC because you don't trust automation. A gut reaction isn't a justification. If the data supports automation, prove it with a Campaign Experiment rather than declining outright.

---

## Portfolio Bidding

Portfolio bidding takes several campaigns and pools their target. Each individual campaign is allowed to overshoot or undershoot, as long as the pool average lands on the target. The full framework lives in `references/portfolio_strategies.md`.

### What Portfolio Bidding Buys You

The flexibility to chase a high-value opportunity in one campaign (even at a worse-than-average cost) while another campaign in the pool runs efficiently and balances the books. In isolation, each campaign would refuse those uneven trade-offs; pooled, they net out to a better aggregate result.

### Variants

- **Portfolio tCPA.** Shared CPA target across campaigns hitting the same conversion goal. Common in lead gen where exact, phrase, and broad match campaigns all feed the same demo-request action.
- **Portfolio tROAS.** Shared ROAS target across campaigns. Common in eCommerce where Shopping or Performance Max campaigns are segmented by product category or margin tier. High-margin campaigns subsidize lower-margin ones inside the pool.
- **Portfolio Maximize Conversions.** No target, just shared volume optimization. Less common; used during pure data-collection phases.

### When to Pool, When Not to Pool

Pool when:

- Campaigns share the same conversion action
- Conversion values are within 3x of each other
- Campaigns serve the same business unit or product line
- Campaigns are at the same lifecycle stage (acquisition with acquisition, remarketing with remarketing)
- Account maturity is Established or above
- You're willing to let the algorithm reallocate across campaigns

Do not pool when:

- Brand and non-brand are being thrown into the same pool — the resulting average target will choke the non-brand side and give the brand side far too much room
- Different conversion goals are in play (purchase + newsletter is not a portfolio)
- Conversion values differ wildly (a $5 campaign and a $5,000 campaign in one pool produces erratic behavior)
- Any campaign in the candidate group is still in learning
- Different currencies are involved (unless your reporting currency setup handles the exchange cleanly)

### Shared Budgets: Use With Care

Pairing a portfolio target with a shared budget gives the algorithm full latitude over both bids and spend allocation. That can be powerful, but it makes per-campaign pacing harder to read, and one high-opportunity campaign can starve the others.

Default recommendation: start with shared target but separate budgets. Move to shared budgets only after watching how the pool distributes performance for a few weeks.

### Setting the Initial Portfolio Target

Calculate from the weighted average of the campaigns being grouped, then add the standard buffer:

```
tCPA target = sum of cost across campaigns / sum of conversions across campaigns
tROAS target = sum of conversion value across campaigns / sum of cost across campaigns
```

Set tCPA 15-20% above the weighted average, or tROAS 15-20% below it, so the algorithm has room during the first learning window. Tighten in 5-10% increments every two to four weeks once the pool is stable. Never tighten more often than once every 14 days; each adjustment kicks off recalibration.

### What to Monitor

At the portfolio level (this is where the target lives):

- Portfolio CPA vs target, portfolio ROAS vs target
- Total conversions trend
- Total spend pacing

At the campaign level (looking for structural problems, not target adherence):

- **Budget domination.** Flag any campaign consuming more than 80% of pool spend. The pool may be functionally a one-campaign strategy with overhead.
- **Zero delivery.** Flag any campaign with no impressions for 7+ consecutive days inside the pool. It may be structurally unable to compete.
- **Outlier performance.** Flag any campaign whose CPA is more than 3x the pool average, or whose ROAS is less than one-third of the pool average. Persistent outliers should usually be removed from the pool.

### When to Dissolve a Portfolio

- Two-plus straight weeks of target misses at the pool level with no trend reversal in sight
- A single campaign is now soaking up 90%+ of the spend — at that point you have a one-campaign strategy with a portfolio wrapper
- The campaigns' business objectives have diverged (different goals now)
- A 30+ day A/B test shows individual bidding outperforms pooled bidding

### Pre-Flight Checklist

Before creating a portfolio, confirm:

- All campaigns target the same conversion action
- Conversion values across campaigns are within 3x of each other
- No brand campaigns mixed with non-brand campaigns
- No campaigns currently in a learning period
- Combined volume meets the strategy floor (15+ for tCPA, 30+ for tROAS)
- Initial target derived from weighted average with a 15-20% buffer
- A monitoring cadence is in place (weekly portfolio review)
- A max CPC cap is set if the portfolio is on Maximize Clicks

---

## Visibility Bidding: Target Impression Share

Target Impression Share answers a presence question, not an efficiency question. It is not interchangeable with conversion-based strategies and should not be evaluated on conversion metrics. Full framework in `references/visibility_bidding.md`.

### Configuration

Three position options exist:

| Position Setting | Where Your Ad Lands | Typical Use |
|---|---|---|
| Anywhere on page | Anywhere on page 1 | Broad awareness, cheapest |
| Top of page | Above the organic results | Competitive positioning |
| Absolute top of page | First result on the page | Brand defense, premium positioning |

The impression share target is a percentage — the share of eligible auctions where you want to appear in the configured position. Practical ranges:

- 90-95% absolute top IS for core brand terms (you should own your name)
- 70-80% top IS for competitive positioning terms
- 50-60% anywhere IS for awareness plays
- 100% targets are technically possible but rarely cost-justified

### The Max CPC Cap Is Mandatory

The most expensive mistake possible with Target IS is launching it without a max CPC ceiling. Without one, Google will pay whatever the auction asks in order to hit the configured impression share. A single spike-priced auction can deliver a click that is twenty or thirty times the normal cost for that keyword, and the budget evaporates accordingly.

Cap-setting guidance:

- Start at 1.5-2x the historical average CPC for the keywords involved
- If the campaign is brand new with no history, take the high estimate from Keyword Planner and cap at 1.5x that
- Inspect actual CPC vs cap weekly. If actuals are pressed up against the cap on most auctions, the cap is the binding constraint — decide whether to raise it or accept lower delivered IS

### Where Target IS Earns Its Keep

- **Brand defense.** Holding absolute top on your own brand terms so competitors can't outrank you on your name. The most defensible use. Typical setup: absolute top, 90-95%, cap at roughly 2x brand average CPC.
- **Competitive positioning.** Maintaining presence on key category or competitor terms where being seen matters even when conversion economics are weak. Typical setup: top of page, 60-80%, cap calibrated to the category's CPC range.
- **Regulated industries.** Legal, medical, and financial verticals sometimes have compliance or strategic reasons to be present on specific terms regardless of conversion behavior. Setup varies by requirement.
- **Product or service launches.** Guaranteed visibility while the conversion data doesn't yet exist. Typical setup: top of page, 70-80%, with a planned end date to transition once data accumulates.
- **Seasonal and event-driven presence.** Trade shows, peak weeks, launch windows where being seen has outsized value. Run for the event, then revert to the prior strategy.

### Where Target IS Is the Wrong Tool

- **Performance-driven campaigns.** If conversions or revenue are the actual goal, use a conversion-based strategy. Visibility may or may not correlate.
- **Budget-constrained accounts.** A high IS target plus a limited budget produces partial-day delivery, then nothing. Visibility ends up inconsistent and the budget gets wasted.
- **Generic non-brand without a clear visibility rationale.** Almost always burns money.
- **Keywords where position doesn't change outcomes.** Don't pay the IS premium when it doesn't move the needle.

### What to Watch

| Metric | Question | Action If Wrong |
|---|---|---|
| Actual IS vs target IS | Are you hitting target? | Raise budget, raise the CPC cap, or lower the IS target |
| Actual CPC vs CPC cap | Is the cap limiting you? | If CPC = cap on most auctions, decide whether the cap moves |
| Lost IS (Budget) | Losing impressions to budget? | Raise budget before raising IS or cap |
| Lost IS (Rank) | Losing impressions to rank? | Improve QS, raise cap, or accept the level |
| Cost trend | Is spend climbing fast? | IS campaigns scale cost quickly — review weekly |
| Auction Insights | Who is competing for these auctions? | Track overlap and position rates over time |

### Exiting Target IS

Target IS often has a defined lifespan (launch period, seasonal event, testing phase). The transition path to a conversion-based strategy:

1. If feasible, run a Campaign Experiment alongside a conversion-based variant to compare
2. Confirm conversion tracking is wired up and accumulating data
3. Once 15+ conversions are on file, move to open Maximize Conversions
4. Once that stabilizes, add a CPA or ROAS target appropriate to the account's maturity

---

## Learning Periods

Any change to a Smart Bidding configuration sends the algorithm back into a calibration window. Performance during that window is volatile and that is fine. Mismanaging learning periods, however, can break an account. Detail lives in `references/learning_period_management.md`.

### What Triggers Learning

| Change | Triggers Learning? | Notes |
|---|---|---|
| Switching bid strategy (e.g., Manual CPC → tCPA) | Yes | The classic case |
| Changing the tCPA or tROAS target | Yes | Even small adjustments |
| Modifying the primary conversion action | Yes | Add, remove, or swap |
| Single-day budget change above 20% | Yes | Below 20%, generally not |
| Major audience restructure | Yes | Significant expansion or restriction |
| Structural change (ad groups, match types at scale) | Sometimes | Scale-dependent |
| New ad creatives | Usually not | Affects ad quality, not bidding |
| External demand shifts (seasonality) | No | But performance may move similarly |

### How Long It Takes

- Typical window: 7-14 days
- Sparse data: 21 days or longer is normal
- Strong signal: 5-7 days is possible
- Google displays a "Learning" status in the Bidding Strategy Report and drops the label once predictions stabilize

### What Performance Looks Like During Learning

Volatility is the default state, not a defect:

- CPA can run 15-30% above target
- ROAS can run 15-30% below target
- Impression volume swings day to day
- Click counts spike one day and dip the next while the algorithm explores its bid range
- Good days and bad days will alternate. Judge the strategy after the full window, not on day 4.

The most common failure mode is panicking mid-learning and reverting. Reverting discards the data the algorithm has been collecting and you start over from zero. **Do not abandon during the first 7 days** unless you discover that conversion tracking is broken — in which case fix tracking first, then let learning restart.

### Minimizing Disruption

- **Batch changes.** If you need to adjust the target, add an ad group, and swap the audience, do all three in the same session. One learning window beats three sequential ones.
- **Use Campaign Experiments.** Split traffic 50/50 between current and candidate. The experiment side enters learning; the control keeps producing. If the experiment wins, promote. If not, end with no harm done.
- **Avoid peak windows.** If Black Friday is the biggest week of the year, do not change strategies in mid-November. Make changes 3-4 weeks ahead of any known peak so learning completes before the spike.
- **Tighten targets gradually.** Move tCPA or tROAS by 5-10% at a time. Each tightening triggers a recalibration, but small moves yield short, gentle ones.

### "Learning (Limited)" Status

This appears when a campaign has been stuck in learning longer than expected and is not accumulating enough signal to exit. Common causes:

- Too few conversions (below the strategy's volume floor)
- Frequent changes that keep resetting the clock
- Targets so aggressive they suppress delivery
- Conversion tracking issues (broken tag, lagged reporting)
- Targeting too narrow to produce enough auctions

How to dig out:

1. Verify tracking. The tag fires correctly and conversions show up in reports without excessive lag.
2. Check volume. If the last 30 days have fewer than 15 conversions, the strategy itself may be a mismatch. Consider stepping down to a lower-threshold strategy.
3. Freeze changes for 14 days. Every change resets the clock; the only way out of a reset loop is to stop touching it.
4. Loosen targets that are tighter than actual performance by 15-20%. A target that is more aggressive than reality can produce a death spiral: low delivery → fewer conversions → less data → tighter constraint → even lower delivery.
5. Widen the audience or keyword set if it's too narrow to feed enough auctions.

### When to Stay vs Walk Away

Stay if:

- The campaign is inside its first 14 days
- Conversion volume is steady, not falling
- No tracking issue is detected
- Performance volatility is in the expected 15-30% variance band

Walk away if:

- 21+ days in learning with no improvement trend
- Tracking is confirmed broken (fix tracking first, then re-evaluate)
- Conversion volume is structurally insufficient for the strategy (not a learning problem, a fit problem)
- A negative spiral has set in: low delivery, fewer conversions, tighter bidding, lower delivery still

### Preventing Cascades

When several campaigns enter learning at once, the whole account destabilizes. Hold to these rules:

1. In accounts with fewer than 10 campaigns, change one campaign at a time. In larger accounts, cap simultaneous changes at 2-3.
2. Stagger changes by at least 2 weeks per campaign. Let one finish learning before starting the next.
3. **Cap account-wide learning exposure at 30% of total spend.** Push past that threshold — say, by triggering simultaneous learning in a handful of campaigns that together represent 40% or more of the account — and the entire account's performance will visibly degrade for the duration.
4. Sequence by impact. Change the highest-spend or highest-impact campaign first; let it stabilize before moving on.
5. Keep a written log of when each campaign entered learning, when it is expected to exit, and what is queued next. This is the only reliable defense against accidentally overlapping changes weeks later.

---

## The Decision Tree

When sitting in front of a campaign that needs a recommendation, work through these five questions in order.

### Q1. What is the business asking the campaign to do?

| Stated Objective | Path |
|---|---|
| Brand visibility / defense | Target Impression Share |
| Traffic or data collection | Maximize Clicks |
| Lead or signup volume | Conversion-count path (continue to Q2) |
| Revenue / ROAS | Value-based path (continue to Q2) |
| Profit or margin | VBB path (continue to Q2) |

### Q2. How many conversions per month does the campaign actually produce?

| Monthly Volume | Strategies in Play |
|---|---|
| Under 5 | Manual CPC, Maximize Clicks, open Maximize Conversions |
| 5-14 | Open Maximize Conversions, or Manual CPC with bid adjustments |
| 15-29 | Maximize Conversions + tCPA (conservative target), or open Maximize Conversion Value |
| 30-49 | tCPA or tROAS with conservative targets |
| 50-99 | tCPA, tROAS, or begin evaluating VBB |
| 100+ | Full menu including VBB and portfolios |

### Q3. Is conversion value data trustworthy and dynamic?

| State of Value Data | Implication |
|---|---|
| No value data | Stick to count-based strategies (Max Conversions, tCPA) |
| Static or placeholder values | Same answer — if every conversion looks identical to the algorithm, a value-based strategy has nothing to differentiate |
| Accurate revenue data | Eligible for Max Conv Value and tROAS |
| Accurate margin / profit data | Eligible for VBB |

### Q4. Is the campaign brand or non-brand?

| Type | Consideration |
|---|---|
| Brand | Either Manual CPC or Target IS can work at any volume level. When CPCs sit in a tight range and conversion rates are reliably high, there isn't much for an algorithm to add. |
| Non-brand | Follow the volume recommendation from Q2 |
| Competitor / conquest | Manual CPC is often preferred to keep a hard ceiling on expensive auctions |

### Q5. What is the current strategy doing right now?

If the current setup matches the recommendation from Q1-Q4 and is delivering within target, leave it alone. A strategy change is not free — it triggers a learning period and introduces real risk. Only change when there is an explicit reason.

---

## When to Change Strategies, and When to Hold

**Change when:**

- Targets are consistently missed (over or under) for 30+ days with no improvement trend
- The campaign has moved past one of the meaningful monthly conversion thresholds — 15, 30, 50, or 100 — and stayed on the other side of it for two months
- The business objective has genuinely changed (e.g., volume goal replaced by efficiency goal)
- The current strategy can no longer be supported by the data (e.g., tCPA running on fewer than 10 conversions/month)

**Hold when:**

- The campaign is in an active learning period — let it finish
- Performance is meeting or beating target
- A recent material change (new landing page, new creative, seasonal transition) is still settling
- You have less than 30 days of post-change data
- The only justification is industry chatter or peer opinion, with no account-level data behind it

---

## Evaluation Dimensions for an Existing Strategy

When auditing a campaign that is already running, score it on five dimensions before recommending anything.

1. **Volume sufficiency.** Are there enough conversions for this strategy to actually function? Compare to the floor for the chosen strategy (15+ for tCPA, 30-50+ for tROAS, 50-100+ for VBB).
2. **Target realism.** Is the configured target within reach given recent performance? Compare it against 30-, 60-, and 90-day actuals.
3. **Learning status.** Is the campaign in learning, just exited learning, or stable? Pull the bidding strategy status to check.
4. **Conversion integrity.** Are conversions being counted correctly? Watch for duplicate counting, micro-conversion inflation, attribution window mismatches, and tag firing problems.
5. **Objective fit.** Does the strategy actually match the business intent? A brand campaign on tCPA when the business priority is visibility is a misfit, even if it converts.

---

## Reference Index

| File | What's In It |
|---|---|
| `references/strategy_selection_framework.md` | Full strategy profiles and the decision tree, in greater detail |
| `references/manual_cpc_use_cases.md` | Manual CPC use cases, hybrid bid adjustments, graduation criteria |
| `references/portfolio_strategies.md` | Portfolio mechanics, grouping rules, target setting, monitoring |
| `references/visibility_bidding.md` | Target Impression Share configuration, use cases, monitoring |
| `references/learning_period_management.md` | Learning triggers, durations, "Limited" status recovery, cascade prevention |

---

## Skill Dependencies

| Dependency | Why It Matters Here |
|---|---|
| `pancake_account_foundations` | Source of truth for the account's maturity tag, business model, and KPI targets, and the four maturity bands that calibrate which strategies are even on the table |

---

## Reference: learning_period_management.md

# Learning Period Management

Smart Bidding recalibrates whenever you change something it depends on. The recalibration window is the learning period. Treating it as an inconvenience or a bug leads to the worst outcomes in bid strategy work; treating it as a controlled cost lets you make changes without breaking the account.

---

## What Sets the Clock Ticking

| Change | Triggers Learning? | Notes |
|---|---|---|
| Switching bid strategies | Yes | The canonical trigger |
| Changing a tCPA or tROAS value | Yes | Including small numeric tweaks |
| Modifying the primary conversion action | Yes | Add, swap, or remove |
| Single-day budget change above 20% | Yes | Below that, typically not |
| Budget changes at or under 20% | Generally no | Small moves don't restart learning |
| Significant audience expansion or restriction | Yes | Major reshaping of who you reach |
| Structural changes (ad groups, match types at scale) | Depends | Small structural tweaks usually don't; big ones do |
| New ad creative | Usually not | Affects ad quality and CTR, not bid model |
| External demand shifts | No | Seasonality is not a learning trigger, but can look like one |

---

## How Long It Lasts

- Standard window is 7-14 days
- Low-volume campaigns can take 21 days or more
- High-volume campaigns can wrap in as few as 5-7 days when signal is strong
- Google flags the campaign with a "Learning" label in the Bidding Strategy Report and removes the label when predictions are stable

---

## What "Normal" Looks Like During Learning

Volatility is expected. Specifically:

- CPA can run 15-30% over target
- ROAS can run 15-30% under target
- Impression and click volumes bounce around from one day to the next while the model explores its bid range
- Some days look excellent and others look terrible — neither is the answer
- Judgment happens at the end of the window, not at day 4

The single most damaging mistake is reverting mid-learning. A revert wastes everything the model collected and resets the clock from zero. Resist the urge.

---

## Reducing the Pain

### Batch the Changes

Do everything you need to do at once. If the plan is to retarget the audience, adjust the tCPA, and add ad groups, do all three in the same session and absorb a single learning window instead of three sequential ones.

### Run a Campaign Experiment

Split the traffic (typically 50/50) between the existing setup and the candidate. The experiment branch enters learning while the control keeps producing as before. Win → promote. Lose → end the experiment with no damage to the base campaign.

### Don't Burn Learning on Peak Windows

Black Friday week is not when to swap bid strategies. The same applies to any predictable peak. Schedule changes at least 3-4 weeks before the peak so learning is complete and the strategy is stable by the time the spike arrives.

### Tighten Gradually, Not in Leaps

When the goal is a tighter tCPA or tROAS, move in 5-10% steps. Each step kicks off a small recalibration. A large jump produces a long, ugly one. Hold off at least 14 days between tightenings.

---

## "Learning (Limited)" — Reading the Signal and Getting Out

This status appears when learning has dragged on without converging. Causes:

- Conversion volume below the strategy's floor
- Frequent changes that keep resetting the clock
- Targets that are too aggressive to deliver against, suppressing delivery
- Tracking problems (broken tag, lagged reporting)
- Targeting so narrow that there aren't enough auctions to learn from

Recovery steps, in order:

1. **Confirm tracking is healthy.** Tag fires, conversions show up in reports without excessive lag.
2. **Audit volume.** Fewer than 15 conversions in the last 30 days means the strategy itself may not be a fit. Consider stepping down.
3. **Stop changing things.** For 14 days. Every change extends the window.
4. **Loosen the target by 15-20%** if it's tighter than reality. A target too tight for current performance produces a death spiral: low delivery → fewer conversions → less data → even tighter algorithmic behavior → even lower delivery.
5. **Widen the targeting** if the keyword or audience set is too small to generate the auctions needed for learning.

---

## Wait or Walk Away

**Wait if:**

- Inside the first 14 days
- Conversion volume is steady or improving
- No tracking issue detected
- Variance from target is in the 15-30% expected band

**Walk away if:**

- 21+ days with no improvement trend
- Tracking is confirmed broken (fix tracking before reassessing strategy)
- Volume is structurally too low for the strategy — this is a fit problem, not a learning problem
- The campaign has entered a negative spiral that isn't reversing

### The 7-Day Rule

Don't abandon during the first 7 days. The only exception is discovering that tracking is recording zero conversions. Fix tracking and let learning restart.

---

## Preventing Account-Wide Cascades

Multiple campaigns in learning at the same time destabilize the whole account. Defenses:

1. **One at a time in small accounts.** If the account has fewer than 10 campaigns, change one campaign's strategy at a time. In larger accounts, cap simultaneous changes at 2-3.
2. **Stagger by 2+ weeks.** Let one campaign exit learning before changing the next.
3. **Cap learning-state spend at 30% of the account.** Cross that line — for example, two or three campaigns that together make up 40%+ of spend all entering learning in the same week — and you should expect a stretch of conspicuous account-wide turbulence.
4. **Prioritize by impact.** Start with the highest-spend or highest-impact campaign. Stabilize that, then proceed.
5. **Keep a written log.** Track entry date, expected exit date, and the next queued change per campaign. This is how you avoid accidentally re-triggering a campaign that hasn't finished its prior learning window.

---

## Reference: manual_cpc_use_cases.md

# Manual CPC Use Cases

Manual CPC has not been deprecated and is not a relic. In the right context it is the correct strategic choice. The wrong context is "I just don't want to use automation," which is not a strategy. The right contexts are specific and listed below.

---

## Situations Where Manual CPC Is the Right Tool

### Brand Campaigns With Stable CPCs

When brand auction prices barely move and conversion rates are predictably high, the algorithm has nothing complicated to solve for. Manual CPC offers clean cost control without losing meaningful optimization.

Use when CPCs sit in a narrow band, conversion rate is high and stable, and the goal is presence rather than efficiency optimization.

### Conquest / Competitor Bidding

Bidding on competitor brand names is expensive and the conversion rate is usually low. Automation will happily overspend chasing rare conversions on these terms. Manual CPC sets a hard ceiling.

Use when bidding on a competitor's name, when cost sensitivity is high, when the campaign is about visibility more than conversion economics.

### New Markets and New Keyword Themes

If there is no history, there is nothing for the algorithm to learn from. Without negative signal it overbids; without positive signal it underbids. Manual CPC sidesteps both failure modes.

Use when launching in a new product category, entering a new geography, or testing a new keyword theme with no track record.

### Low-Volume Campaigns (under 15 conversions/month)

Smart Bidding needs conversion signal to make stable predictions. Under 15/month the signal is too thin and the algorithm produces erratic behavior. Manual CPC plus bid adjustments produces more predictable performance at low volume.

Use for niche keyword sets, low-population geos, and high-ticket products/services where conversion volume is naturally constrained.

### High-Value Single Conversions ($10K+)

A single $10,000+ deal can pull Smart Bidding's predictions for days afterward as the model overweights that one event. Manual CPC keeps the bid line steady through the lumpy cadence of high-ticket purchasing.

Use it where individual conversions clear roughly $10K — large B2B contracts, professional services with five-figure engagements, premium and luxury retail.

### Geographic Testing

Smart Bidding optimizes against account-wide patterns, which may not apply in a new region. Manual CPC lets you set region-appropriate bids based on local conditions while you build a baseline.

Useful when moving into a new country, opening up bidding in a fresh metropolitan area, or stepping into a region whose competitive landscape doesn't resemble the rest of the account.

### Seasonal Pre-Positioning

Smart Bidding reacts to performance changes; it doesn't predict them. Manual CPC lets you front-run a known spike.

Useful in the two-to-four-week window leading into Black Friday or Cyber Monday, in the lead-up to a known trade show or conference, or any other demand spike whose shape you've seen before.

---

## The Hybrid: Manual CPC + Bid Adjustments

Manual CPC's competitive edge in 2025 comes from layering bid adjustments on top of base bids. The adjustments restore the precision that pure manual control would otherwise lose.

### Device Adjustments

Tune bids per device based on how each device converts. When mobile lands at, say, half of desktop's conversion rate, a -30% to -50% mobile adjustment is a more surgical move than dropping the device entirely.

### Location Adjustments

Lift bids where geography performs, lower them where it doesn't. Needs at least 2-4 weeks of per-geo data to be informed.

### Ad Schedule Adjustments

Lean into high-converting hours and days, lean out of low-converting ones. Particularly effective for B2B with a clear weekday business-hours pattern.

### Audience Adjustments (RLSA)

Attach remarketing lists to the Manual CPC campaign. Default bid applies to all searchers; positive adjustments push the bid higher when the searcher is on a remarketing list.

---

## Graduation Criteria

Manual CPC is often a starting point. Move on when:

1. **Volume has crossed the bar.** 15+ conversions per month for two consecutive months
2. **Tracking is clean.** Confirmed accurate, no known gaps
3. **Patterns are stable.** Clear, observable patterns in CPC, conversion rate, and CPA across at least 60 days
4. **Test the migration.** Run a Campaign Experiment for 4-6 weeks splitting traffic between Manual CPC and open Maximize Conversions. If automation matches or beats Manual CPC at equal or better volume, migrate.

---

## Manual CPC Anti-Patterns

1. **Set-and-forget.** A weekly review is the bare minimum cadence under Manual CPC. What was the right bid last month often isn't anymore as competition and intent shift.
2. **No bid adjustments.** Running Manual CPC without device, location, schedule, or audience adjustments throws away half the value. The adjustments are why Manual CPC can still compete with automation.
3. **Sticking with Manual CPC past 50 conversions/month.** At that volume Smart Bidding typically wins. Staying manual is leaving efficiency on the table.
4. **Max CPC pinned too low.** A ceiling that sits beneath where the auction actually clears slowly drains impression share without you noticing. Sanity-check against Auction Insights and your Search IS numbers.
5. **Picking it because automation feels untrustworthy.** Skepticism is fine; using it as the reason is not. If the data points to automation, run a Campaign Experiment rather than digging in.

---

## Reference: portfolio_strategies.md

# Portfolio Bidding Strategies

Portfolio bidding lets a single target govern multiple campaigns. The algorithm balances results across the pool, allowing individual campaigns to drift above or below the goal as long as the pool average lands on it. Done well, this produces a better aggregate outcome than each campaign optimizing in isolation. Done badly, it produces worse outcomes than standalone bidding.

---

## How a Portfolio Differs From Standalone Bidding

In standalone bidding, a tCPA target of $40 has to be met by that one campaign — its average CPA, evaluated alone, needs to land near $40. In a portfolio, that same $40 target governs the pool in aggregate. One campaign in the pool might come in at $28 and another at $52; the pool average still resolves to $40 and the target is satisfied.

The value of this flexibility is the ability to pursue uneven opportunities. The algorithm can let one campaign go after high-value but expensive conversions while another keeps the average down. In isolation, each campaign would refuse those trades; together, they net out to a better total.

---

## The Three Portfolio Variants

### Portfolio tCPA

A shared CPA target across campaigns hitting the same conversion action.

Best for: lead generation accounts where several campaigns — different keyword themes, audience cuts, or match-type strategies — all roll up to the same end conversion. A typical setup might be one campaign on tight bottom-funnel exact match, another on phrase-match category terms, and a third on broad-match discovery, all feeding the same trial-signup action. The broad-match campaign will usually post a less attractive CPA per conversion, but it surfaces demand the tighter campaigns won't reach. Pooling them lets the strong campaigns absorb the weaker numbers in exchange for incremental volume.

### Portfolio tROAS

A shared ROAS target across campaigns.

Best for: eCommerce, especially Shopping or Performance Max campaigns segmented by category, price band, or margin tier. The richer-margin slices in the pool can offset thinner-margin ones. A workable shape might be one Shopping campaign for a premium-margin SKU set running at strong ROAS, pooled with another for a thinner-margin category that runs at lower ROAS on its own; the portfolio target then governs the combined book, and the algorithm shifts spend across both to land the blended number.

### Portfolio Maximize Conversions

Shared conversion-volume optimization with no target. Less common. Useful during pure data-collection phases where coverage across campaigns matters more than per-campaign efficiency.

---

## Shared Budgets

Portfolio bidding can be paired with shared budgets. When it is, the algorithm reallocates both bids and budget across the pool simultaneously, so high-opportunity campaigns automatically receive more spend.

This is powerful, but watch for two risks: (1) per-campaign pacing becomes harder to monitor, and (2) one high-opportunity campaign can dominate the shared budget and starve the others.

Default: start with a shared target but separate budgets. Move to a shared budget only after watching how the pool distributes performance for a few weeks.

---

## Grouping Rules

Correct grouping is the single biggest factor in whether a portfolio works. Incorrect grouping makes performance worse than independent bidding.

### Pool These Together

- Same conversion goal across all campaigns in the pool
- Conversion values within 3x of each other
- Same business unit or product line
- Same lifecycle stage (acquisition with acquisition, remarketing with remarketing)

### Never Pool These

- **Brand with non-brand.** The economics don't mix — brand traffic carries high conversion rates and cheap CPCs while non-brand traffic carries the inverse. Any single shared target ends up constraining the non-brand campaigns into starvation while letting the brand campaigns coast.
- **Different conversion goals.** A "purchases" portfolio cannot also contain a "newsletter signups" campaign.
- **Values that diverge wildly.** When one campaign's typical conversion is worth ten dollars and another's is worth a few thousand, blending them into a single target produces erratic spend allocation — the algorithm can't reconcile two completely different value scales.
- **Campaigns in active learning.** Any campaign mid-learning will destabilize the pool. Wait until all candidates have exited learning before pooling them.
- **Different countries or currencies** unless the account's reporting currency setup cleanly handles the conversion.

---

## Setting the Initial Target

Calculate from the weighted average across the campaigns being pooled:

```
Portfolio tCPA target = sum(cost) / sum(conversions) across all pool campaigns
Portfolio tROAS target = sum(conversion value) / sum(cost) across all pool campaigns
```

Then apply the standard buffer — tCPA 15-20% above the weighted average, tROAS 15-20% below the weighted average — so the algorithm has room during initial learning.

### Tightening Over Time

Move in 5-10% increments every 2-4 weeks after the pool stabilizes. Never tighten more than once every 14 days; each target change triggers a recalibration window.

---

## Monitoring

### Portfolio-Level (Primary)

The target governs the pool, so judge the pool against it. Some campaigns inside the pool will drift above or below the line — that is the whole point and not a problem to fix.

- Portfolio CPA vs target
- Portfolio ROAS vs target
- Total portfolio conversions (trend)
- Total portfolio spend (pacing)

### Campaign-Level (Secondary)

Watch individual campaigns for structural problems, not target compliance:

- **Budget domination.** Any campaign consuming more than 80% of pool spend is a flag — the pool may effectively be a one-campaign strategy.
- **Zero delivery.** Any campaign with no impressions for 7+ consecutive days inside the pool may be structurally unable to compete.
- **Outlier performance.** Any campaign whose CPA is more than 3x the pool average, or whose ROAS is less than one-third the pool average, may need to be removed.

### When to Dissolve the Portfolio

- The pool falls short of target for 14 days running with no trajectory improvement
- 90%+ of pool spend now sits in one campaign — the structure is a portfolio in name only
- Business objectives across the campaigns have diverged
- A 30+ day A/B test shows individual bidding outperforming pooled bidding

---

## Pre-Flight Checklist

Before creating a portfolio:

- [ ] All campaigns target the same conversion action
- [ ] Conversion values are within 3x across all campaigns
- [ ] No brand/non-brand mixing
- [ ] No campaigns currently in a learning period
- [ ] Combined volume clears the strategy floor (15+ for tCPA, 30+ for tROAS)
- [ ] Initial target calculated from weighted average with the 15-20% buffer
- [ ] Weekly portfolio review scheduled
- [ ] Max CPC cap configured if the portfolio is on Maximize Clicks

---

## Reference: strategy_selection_framework.md

# Strategy Selection Framework

A full mapping of business objective + monthly conversion volume + account maturity to the right Google Ads bid strategy.

---

## Strategy Profiles, in Depth

### Manual CPC

- **Volume floor:** None
- **Where it fits:** New campaigns, new keyword/market tests, exact bid control situations, brand defense with predictable CPCs, high-value single conversions
- **Maturity band:** Nascent by default, but appropriate at any maturity for the specific use cases listed
- **How it operates:** You set the max CPC at the keyword or ad-group level. No algorithmic layer adjusts the bid. Everything that breaks or works is on the operator.
- **Watch out for:** Requires active management. Set-and-forget Manual CPC either bleeds spend or loses impression share.
- **Deeper dive:** `manual_cpc_use_cases.md`

### Maximize Clicks

- **Volume floor:** None
- **Where it fits:** Traffic acquisition, data collection windows, new keyword or market tests where click volume is the leading indicator
- **Maturity band:** Nascent
- **How it operates:** Google buys the most clicks possible inside the daily budget. No conversion awareness.
- **Mandatory configuration:** Set a max CPC cap, always. Without it, Google will pay $20+ per click if that maximizes count. A reasonable cap is 1.5-2x the expected average CPC for the keyword set.
- **Graduate when:** 15+ conversions per month sustained for two months → test Maximize Conversions.

### Maximize Conversions (no target)

- **Volume floor:** None required, but 5+ recent conversions help the model
- **Where it fits:** Volume-priority campaigns with no CPA constraint; accounts transitioning from manual to automated bidding
- **Maturity band:** Nascent to Developing
- **How it operates:** Google buys the most conversions possible inside the daily budget. With no CPA target, the algorithm has only the budget as a cost ceiling.
- **Watch out for:** CPA can swing widely. The algorithm chases every conversion regardless of cost, bounded only by daily budget. Fine during data collection, untenable for efficiency-focused accounts.
- **Graduate when:** 15-30 conversions per month with a measurable CPA → attach a tCPA target set 15-20% above current actual CPA.

### Maximize Conversions + tCPA

- **Volume floor:** 15-30/month. Google's official floor is 15; 30+ produces noticeably more consistent results.
- **Where it fits:** Lead generation, service businesses, anywhere CPA is the leading KPI
- **Maturity band:** Developing to Established
- **How it operates:** Google targets a specific cost per conversion. It throttles bids when the target binds, which can reduce volume.
- **Configuration discipline:** Open the target 15-20% above today's actual CPA. Anything at or under current CPA puts the algorithm into chase mode for sub-market conversions that aren't there, and volume crashes. Step the target down 5-10% at a time on a 2-4 week cadence.
- **Warning signals:** Actual CPA consistently 30%+ above target → target is unrealistic. Sharp volume drop after target attachment → target is suppressing delivery.

### Maximize Conversion Value (no target)

- **Volume floor:** None required, but value data must actually be present
- **Where it fits:** eCommerce accounts pursuing revenue with no ROAS floor yet; accounts establishing value signal before adding a tROAS target
- **Maturity band:** Developing
- **How it operates:** Google maximizes total reported conversion value inside the budget. With no ROAS target, the algorithm pursues any positive-value conversion.
- **Watch out for:** When every conversion carries an identical value — a flat placeholder like one dollar per conversion, for instance — the strategy collapses to functioning exactly like Maximize Conversions.
- **Graduate when:** Value data is validated as accurate and the campaign sits at 30-50 conversions/month → attach a tROAS target set 15-20% below current actual ROAS.

### Maximize Conversion Value + tROAS

- **Volume floor:** 30-50/month for stable behavior. Higher is better.
- **Where it fits:** eCommerce, DTC brands, any campaign where ROAS is the leading KPI
- **Maturity band:** Established
- **How it operates:** Google targets a specific return on ad spend. Bids adjust to hit the target, which can reduce spend on lower-value conversions.
- **Configuration discipline:** Open the target with 15-20% of slack below today's actual ROAS. A campaign currently posting 5.0x would launch near 4.0-4.25x. Targets set too tight starve delivery. Step down in measured increments.
- **Warning signals:** Actual ROAS sitting 30%+ under target for stretches at a time → the target isn't reachable. Spend collapsing the moment the target goes on → the algorithm is rejecting auctions that don't clear its return floor.

### Value-Based Bidding (VBB)

- **Volume floor:** 50-100/month with reliable, variable value data
- **Where it fits:** Accounts where conversion values vary meaningfully and accurate profit/margin data is available — eCommerce with variable AOV, lead gen with scored leads, SaaS with variable contract values
- **Maturity band:** Advanced
- **How it operates:** Extends Maximize Conversion Value + tROAS by feeding profit margin, predicted LTV, or lead quality scores into the value signal. The algorithm optimizes against business profit, not just revenue.
- **Requirements:** Dynamic conversion values reflecting real economic value, conversion value rules configured, enough volume to learn value patterns, and a reliable data pipeline (enhanced conversions, offline import, or CRM integration).
- **Reality check:** VBB isn't a toggle you flip. It's a measurement program that happens to plug into bidding. Whatever ceiling the value feed has is the ceiling the optimization will hit.

### Target Impression Share

- **Volume floor:** None (not a conversion-based strategy)
- **Where it fits:** Brand defense, competitive positioning, awareness, regulatory visibility requirements
- **Maturity band:** Any (this is purpose-driven, not maturity-driven)
- **How it operates:** Google bids to hit a target impression share at a chosen position — anywhere on page, top of page, or absolute top.
- **Mandatory configuration:** A max CPC cap. Always. Without it Google bids whatever it takes.
- **Deeper dive:** `visibility_bidding.md`

---

## The Decision Tree (Five Questions, In Order)

### Q1. What is the business objective?

| Objective | Path |
|---|---|
| Brand visibility / defense | Target Impression Share |
| Traffic / data collection | Maximize Clicks |
| Conversion volume (leads, signups) | Conversion-based path → Q2 |
| Revenue / ROAS | Value-based path → Q2 |
| Profit / margin | VBB path → Q2 |

### Q2. Monthly conversion volume?

| Volume | Strategies in Play |
|---|---|
| Under 5 | Manual CPC, Maximize Clicks, open Maximize Conversions |
| 5-14 | Open Maximize Conversions, or Manual CPC with bid adjustments |
| 15-29 | Maximize Conversions + tCPA (conservative), or open Max Conv Value |
| 30-49 | tCPA or tROAS with conservative targets |
| 50-99 | tCPA, tROAS, or begin VBB evaluation |
| 100+ | Full menu including VBB and portfolios |

### Q3. Is value data accurate and dynamic?

| Value Data State | Implication |
|---|---|
| No value data | Conversion-count strategies (Max Conversions, tCPA) |
| Static or placeholder values | Same answer — if every conversion looks identical to the algorithm, a value-based strategy has nothing to differentiate |
| Accurate revenue data | Eligible for Max Conv Value and tROAS |
| Accurate margin / profit data | Eligible for VBB |

### Q4. Brand or non-brand?

| Type | Consideration |
|---|---|
| Brand | Volume doesn't really matter for the choice — Manual CPC or Target Impression Share can both fit. Since brand CPCs barely move and conversion rates are reliable, there isn't much for an algorithm to optimize against. |
| Non-brand | Follow the volume recommendation from Q2 |
| Competitor / conquest | Manual CPC often preferred to keep a hard cost ceiling |

### Q5. What is the current strategy doing right now?

If Q1-Q4 produce the same strategy that's already running and it's performing within target, leave it alone. Changing strategies is not free — learning periods cost real money. Change only when there's a clear data-backed rationale.

---

## When to Change, When to Hold

**Change when:**

- Targets are missed (over or under) for 30+ days with no improvement trend
- Monthly conversion volume has moved past one of the meaningful thresholds — 15, 30, 50, or 100/month — and stayed there for two months
- The business objective has fundamentally shifted (volume → efficiency, for example)
- The current strategy is unsupportable by the data (tCPA with under 10 conversions/month)

**Hold when:**

- A learning period is active — wait it out
- Performance is meeting or beating target
- A recent material change (new landing page, new creatives, seasonal shift) is still settling
- You have less than 30 days of post-change data
- The motive is social pressure or industry buzz rather than evidence in the account

---

## Auditing an Existing Strategy: Five Dimensions

When evaluating a campaign already running, score against:

1. **Volume sufficiency.** Are there enough conversions for this strategy to function? Compare to the floor.
2. **Target realism.** Is the configured target reachable given recent performance? Compare to 30-, 60-, and 90-day actuals.
3. **Learning status.** Is it in learning, freshly exited learning, or stable? Pull the bidding strategy status to verify.
4. **Conversion integrity.** Are conversions counted correctly? Watch for duplicate counting, micro-conversion inflation, attribution window mismatches.
5. **Objective fit.** Does the strategy match stated business intent? A brand campaign on tCPA when visibility is the business priority is a misfit, even if it converts.

---

## Reference: visibility_bidding.md

# Visibility Bidding: Target Impression Share

Target Impression Share is a visibility strategy and should be evaluated as one. It answers "how often do I appear?" not "how efficiently do I convert?" Treat the two questions as different and you will avoid most misuses of this strategy.

---

## Configuration

### Position Options

| Position Setting | Where Your Ad Lands | Typical Application |
|---|---|---|
| Anywhere on results page | Anywhere on page 1 | Broad awareness, lowest cost |
| Top of results page | Above the organic block | Competitive positioning |
| Absolute top of results page | First result on the page | Brand defense, premium presence |

### Impression Share Target

Set as a percentage — the share of eligible impressions where you want to land in the configured position. Practical guidance:

- 90-95% absolute top IS for core brand terms (you should own your own brand)
- 70-80% top IS for competitive positioning terms
- 50-60% anywhere IS for awareness plays
- 100% targets exist but are rarely cost-justified

### Max CPC Cap (Non-Negotiable)

**A max CPC cap is mandatory.** Without one, Google pays whatever the auction requires to achieve the configured impression share. A single overheated auction can produce a click priced at many multiples of the keyword's typical CPC — enough to burn through the day's budget on a few clicks.

Cap-setting:

- Start at 1.5-2x the historical average CPC for the keywords in scope
- For brand-new campaigns with no history, take the high estimate from Keyword Planner and cap at 1.5x that
- Check actual CPC vs cap weekly. If actuals press up against the cap on most auctions, the cap is the binding constraint — decide whether to raise it or accept reduced delivery

---

## Where Target IS Earns Its Keep

### Brand Defense

The most defensible use. Holding absolute top on your own brand terms keeps competitors from ranking above you on your name. Typical configuration: absolute top, 90-95% IS, cap at ~2x brand average CPC.

### Competitive Positioning

Maintaining presence on category or competitor terms where being seen matters even when conversion economics are mediocre. Often relevant when the consideration cycle is long and repeated visibility builds familiarity. Typical configuration: top of page, 60-80% IS, cap calibrated to the category's CPC range.

### Regulated Industries

Legal, medical, financial, and similar verticals sometimes have compliance or strategic reasons for consistent visibility on particular terms regardless of conversion behavior. Setup varies. Often absolute top for high-priority terms, top of page for secondary.

### Product or Service Launches

Guaranteed visibility while conversion data doesn't yet exist. Typical configuration: top of page, 70-80% IS, with a planned end date and a transition to a conversion-based strategy once data accumulates.

### Seasonal or Event-Driven Presence

Guaranteed visibility during peak windows — trade shows, product launches, seasonal spikes — where being seen has outsized value. Typical configuration: absolute top or top of page during the event, then revert to the prior strategy.

---

## Where Target IS Is the Wrong Tool

- **Performance campaigns.** If conversions or revenue are the goal, use a conversion-based strategy. Visibility may or may not correlate with what you actually want.
- **Budget-constrained accounts.** A high IS target plus a small budget produces partial-day delivery. Visibility ends up inconsistent and the budget gets used poorly.
- **Generic non-brand without a visibility rationale.** Almost always wasteful.
- **Keywords where position doesn't change outcomes.** Don't pay an IS premium that doesn't move the needle.

---

## What to Monitor

| Metric | Question | Action Trigger |
|---|---|---|
| Actual IS vs target IS | Hitting target? | If chronically below: raise budget, raise cap, or lower the IS target |
| Actual CPC vs CPC cap | Is the cap limiting you? | If CPC = cap on most auctions, the cap is the binding constraint |
| Lost IS (Budget) | Losing impressions to budget? | Raise budget before raising IS targets or caps |
| Lost IS (Rank) | Losing impressions to ad rank? | Improve QS, raise cap, or accept the IS level |
| Cost trend | Spend climbing faster than expected? | IS campaigns scale cost quickly. Weekly review minimum. |
| Auction Insights | Who else is competing? | Track competitor overlap and position rates over time |

---

## Transitioning Away From Target IS

Target IS is often a temporary configuration (launch period, seasonal event, testing phase). Transition path:

1. Where possible, run the Target IS campaign and a conversion-based candidate as a Campaign Experiment to compare
2. Confirm conversion tracking is wired up and accumulating data
3. Once 15+ conversions are on file, switch to open Maximize Conversions
4. After it stabilizes, attach a CPA or ROAS target appropriate to account maturity
