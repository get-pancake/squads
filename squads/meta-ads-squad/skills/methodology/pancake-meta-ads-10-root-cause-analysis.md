---
name: pancake-meta-ads-10-root-cause-analysis
description: Eight-branch root-cause framework for any underperforming campaign, plus a top-20 issue catalogue. Load on every diagnostic — the daily operations sweep runs this first.
---

# Campaign Diagnostics

When a campaign is underperforming, the worst thing you can do is start changing things at random. This file is a structured root-cause framework: eight branches, each with the data to pull, the thresholds to check, and the fix to apply.

The discipline here is **identify the cause first, take action second**. Raising budget will not solve a creative fatigue problem; swapping audiences will not solve a measurement problem. Most ineffective optimization comes from skipping straight to a fix without knowing what's broken.

## The eight branches

Always work through branches in order. Each branch assumes the prior branches have been cleared.

```
Campaign underperforming
├─ Branch 1: MEASUREMENT      — Is the problem real?
├─ Branch 2: DELIVERY         — Is the campaign delivering?
├─ Branch 3: AUDIENCE         — Is targeting the issue?
├─ Branch 4: CREATIVE         — Is creative the problem?
├─ Branch 5: LANDING PAGE     — Is post-click the issue?
├─ Branch 6: BUDGET           — Is budget the constraint?
├─ Branch 7: BIDDING          — Is the bid strategy wrong?
└─ Branch 8: EXTERNAL         — Is it outside Meta?
```

## Before entering the tree

Answer four questions:

1. **What metric is underperforming?** (CPA, ROAS, volume, CTR, CVR)
2. **For how long?** Under 48 hours is too early to diagnose. 3–7 days is actionable. 7+ days is urgent.
3. **Isolated or account-wide?** One campaign suggests campaign-specific; all campaigns suggests measurement or external.
4. **What changed recently?** Budget, creative, audience, landing page, season, platform update.

## Branch 1: Measurement

Start here because if your data is wrong, every other diagnosis is wrong.

### What to check

| Check | Where | Red flag |
| --- | --- | --- |
| Pixel firing status | Events Manager | Pixel not firing on key pages |
| CAPI connection | Events Manager → CAPI | Disconnected or erroring |
| Event Match Quality | Events Manager → Overview | Below 6.0 |
| Attribution setting | Ad set → Attribution | Recently changed |
| Event deduplication | Events Manager → Test Events | Duplicate events |
| Delayed attribution | Compare 1d vs 7d vs 28d windows | >20% gap |

### Fixes

**Pixel not firing:**
1. Check base code on all pages (Meta Pixel Helper extension)
2. Verify event-specific code on conversion pages
3. Check for ad blockers or consent management blocking the pixel
4. Use Test Events to verify real-time firing

**CAPI issues:**
1. Check server-side integration in Events Manager
2. Verify access token hasn't expired
3. Check server logs for 400/500 responses
4. Confirm dataset_id matches pixel ID
5. For Shopify/WooCommerce: check the native CAPI toggle

**Low EMQ:**
1. Send more customer parameters (email, phone, IP, user agent, fbc, fbp)
2. Hash all PII (SHA-256, lowercase, trimmed)
3. Ensure external_id consistency across events
4. Send events within 1 hour of occurrence

**Deduplication problems:**
1. Both pixel and CAPI must send identical event_id
2. Use transaction ID or session-based ID
3. Verify in Test Events that each action generates exactly one event

**Attribution window changes:**
1. Document what changed and when
2. Compare performance using the same window
3. Wait 7 days before drawing conclusions
4. Expect a 10–30% drop in reported conversions when going from 7d-click+1d-view to 7d-click only — this is reporting, not performance

### Branch 1 exit

- Critical measurement issues found → fix first, wait 48–72 hours, reassess
- Measurement clean → proceed to Branch 2

## Branch 2: Delivery

Is the campaign actually showing ads? Delivery issues are often silent — the campaign is "active" but barely delivering impressions.

### What to check

| Check | Threshold | Severity |
| --- | --- | --- |
| Learning Limited persists | >7 days | High |
| Audience size (prospecting) | Under 1M | High |
| Spend vs budget | Under 50% for 3+ days | High |
| Account spending limit reached | Any | Critical |
| Ad disapprovals | Any | Medium-critical |
| "May not spend" warning | Any ad set | High |
| Learning phase not exiting | Over 7 days without 50 events | High |

### Fixes

**Stuck in Learning Limited:**
1. Consolidate ad sets (fewer = more events per ad set)
2. Move optimization event earlier in funnel (AddToCart instead of Purchase)
3. Increase budget to generate 50+ events/week
4. Reduce active ads per ad set to concentrate delivery
5. Avoid edits during learning — each significant edit resets

**Audience too small:**
1. Broaden targeting (remove stacked interests)
2. Use Advantage+ Audience with suggestions instead of restrictions
3. Test broader lookalikes (3–5% instead of 1%)
4. Consider geo expansion

**Low spend vs budget:**
1. Check if bid/cap is too restrictive (try +20%)
2. Review ad relevance diagnostics
3. Check for audience overlap across ad sets
4. Verify billing and payment status
5. Check schedule restrictions

**Ad disapprovals:**
1. Review specific violation in Account Quality
2. Common: personal attributes phrasing, before/after, unsubstantiated claims, special category required
3. Edit to comply or request review (Account Quality → Request Review)

### Branch 2 exit

- Delivery issues → fix, wait 48 hours
- Delivery healthy → Branch 3

## Branch 3: Audience

Even with good creative and measurement, targeting wrong people or saturating an audience tanks performance.

### What to check

| Check | Threshold |
| --- | --- |
| Prospecting frequency (7d) | Over 3.0 |
| Retargeting frequency (7d) | Over 7.0 |
| Audience overlap between ad sets | Over 30% |
| Audience size (prospecting non-B2B) | Under 500K |
| Audience size with low budget | Over 50M with under $500/day budget |
| Advantage+ expansion share | Over 50% of spend |
| Single demo segment dominance | Over 60% of spend unintentionally |

### Fixes

**High frequency / saturation:**
1. Expand audience (broader interests, larger lookalikes, Advantage+ or broad)
2. Add new seed audiences for lookalikes
3. Increase creative rotation
4. For retargeting: reduce window (14d instead of 30d) to shrink to more engaged users

**High overlap:**
1. Consolidate overlapping ad sets into one
2. Add exclusions to carve distinct audiences
3. Switch to Advantage+ Audience and let Meta deduplicate
4. Different ad sets should target meaningfully different audiences

**Audience too narrow:**
1. Remove stacked interest restrictions
2. Broaden lookalike percentage
3. Use Advantage+ Audience with narrow interests as "suggestions"
4. Test fully broad with strong creative

**Audience too broad for budget:**
1. Usually not actually a problem — Meta will find the best users
2. If CPA is high with broad, the issue is creative, not audience
3. Consider broad + Cost Cap as the better approach

**Advantage+ expansion inefficient:**
1. Check Delivery Insights for expansion vs core performance
2. If expansion CPA significantly higher: disable Advantage+ Detailed Targeting
3. Switch to Advantage+ Audience for more transparent control

### Branch 3 exit

- Audience issues → implement changes, allow 3–5 days for re-learning
- Audience healthy → Branch 4

## Branch 4: Creative

Creative is the biggest performance lever. In a world of broad targeting, the ad itself determines who sees it and converts.

### What to check

| Signal | Threshold |
| --- | --- |
| CTR decline | >10% drop from peak over 7 days |
| Hook rate (3s view rate) | Under 25% |
| Quality ranking | Below average |
| Engagement ranking | Below average |
| Conversion ranking | Below average |
| Creative age | All ads over 30 days old |
| Format concentration | Single format over 80% of spend |

### Fixes

**Creative fatigue (CTR declining):**
1. Do NOT raise budget on fatigued creative — accelerates decay
2. Launch 3–5 new concepts (not minor variations)
3. Test new hooks on the same body content (hook swap)
4. Introduce a new format (video if running static, UGC if running polished)
5. Reduce spend on fatigued ads by 30–50% while new creative ramps

**Weak hooks (under 25%):**
1. Test pattern-interrupt hooks (unexpected visuals, bold overlays, movement)
2. Open with the result, not the problem
3. Use native-feeling formats that blend with organic content
4. Test UGC-style openings ("I can't believe this actually worked...")
5. The first frame must visually arrest even as a still

**Relevance diagnostics:**
- Quality ranking below average → improve visual quality, reduce clickbait
- Engagement ranking below average → improve hook, test different formats
- Conversion ranking below average → likely a landing page issue (Branch 5)

**All ads stale:**
- Launch fresh concepts immediately
- Don't just iterate on existing winners — test new angles

**Format concentration:**
- Diversify (add video if all static, or vice versa)
- The recommended mix varies by business (see creative system file)

### Branch 4 exit

- Creative issues → launch new, monitor for 5–7 days
- Creative healthy → Branch 5

## Branch 5: Landing Page

A campaign can generate efficient clicks and still fail if the landing page doesn't convert. Post-click issues are invisible in Ads Manager unless you go looking.

### What to check

| Check | Threshold |
| --- | --- |
| Bounce rate from paid traffic | Over 70% |
| Mobile load time on 4G | Over 3 seconds |
| Conversion rate vs site average | Under 50% |
| Redirect chain | Over 2 hops |
| Message match | Ad promise ≠ page headline |
| Form fields (lead gen) | Over 5 |
| Mobile optimization | Non-responsive design |

### Fixes

**High bounce rate (over 70%):**
1. Check page load first
2. Verify message match — does LP immediately reinforce the ad promise?
3. Check for intrusive popups or cookie banners blocking content
4. Above-the-fold content should answer "Am I in the right place?" within 2 seconds
5. Test a simpler, more focused LP (remove nav, reduce choices)

**Slow mobile load (over 3 seconds):**
1. Compress images (WebP, lazy load)
2. Minimize JavaScript and CSS, defer non-critical scripts
3. Use a CDN
4. Eliminate render-blocking resources
5. Target under 2 seconds on mobile 4G

**Low CVR:**
1. CTA above the fold on mobile
2. Reduce friction (fewer form fields, clearer next step)
3. Social proof near the CTA
4. Test different offers (free trial vs demo vs content)
5. Session recording analysis (Hotjar, FullStory) to see where users drop off
6. A/B test the LP independently from ad changes

**Redirect chains:**
1. Point ad URLs directly to final destination
2. Remove unnecessary tracking redirects
3. Each redirect adds 100–500ms and risks breaking on mobile

**Message mismatch:**
1. LP headline should echo or extend the ad's promise
2. If the ad says "Save 3 hours per day on email," LP should lead with time savings
3. Visual continuity — similar colors, imagery, tone
4. Create dedicated LPs per ad theme, not just the homepage

### Branch 5 exit

- LP issues → fix, monitor for 7–14 days (LP changes need more data)
- LP healthy → Branch 6

## Branch 6: Budget

Budget can silently cap performance. Once a budget is exhausted, Meta stops serving ads even when more profitable impressions are available.

### What to check

| Check | Threshold |
| --- | --- |
| Spend at 95%+ of budget | Consistent | Budget-constrained |
| Learning Limited due to budget | Not enough events to exit | High |
| Ad sets splitting CBO budget | Over 5 ad sets | Medium-high |
| Budget changes in last 7 days | Over 20% | Possible learning reset |
| ABO with uneven spend | Some ad sets under 20% of budget | Medium |

### Fixes

**Budget-constrained:**
1. Increase by 20% every 48–72 hours
2. Don't double overnight
3. Use automated rules: if CPA < target AND spend > 90%, increase by 20%

**Learning Limited from insufficient events:**
1. Each ad set needs ~50 weekly events
2. At $100 CPA target, that's $5,000/week minimum per ad set ($714/day)
3. Options: increase budget, consolidate ad sets, optimize for an earlier event

**Too many ad sets:**
1. Audit which ad sets are actually differentiated
2. Merge similar audiences
3. CBO: 3–5 ad sets per campaign is the sweet spot
4. ABO: ensure each ad set has budget for 50+ weekly events

**Frequent budget changes:**
1. Plan changes in advance, less frequently
2. Use automated rules for gradual scaling
3. Cuts: reduce by 20% max, wait 48 hours between cuts

### Branch 6 exit

- Budget issues → restructure, wait 3–5 days for learning to stabilize
- Budget healthy → Branch 7

## Branch 7: Bidding

The wrong bid strategy for the campaign's maturity caps scale or wastes budget.

### What to check

| Signal | Threshold |
| --- | --- |
| CPA vs target with Cost Cap or Bid Cap | 30%+ above |
| Spending with Cost Cap | Under 50% of budget |
| Lowest Cost with volatile CPA | Daily swings over 30% |
| Bid Cap with zero conversions | Bid below clearing price |
| ROAS Target with low volume | Under 10 conversions/week |
| Strategy vs campaign stage | New campaign using Bid Cap |

### Fixes

Recommended strategy by stage:

| Stage | Best strategy | Why |
| --- | --- | --- |
| Launch (week 1–2) | Lowest Cost | Let Meta explore, gather data |
| Learning (week 2–4) | Lowest Cost or generous Cost Cap | Cap at 1.5× target CPA |
| Stable (month 2+) | Cost Cap | Control efficiency at scale |
| Scaling proven | Cost Cap or Bid Cap | Bid Cap for max control at high spend |
| Efficiency-first | Bid Cap | Hard ceiling but limits scale |
| Value optimization | ROAS Target | Requires sufficient purchase value data |

**Cost Cap too restrictive (under 50%):**
1. Increase by 10–20%, monitor 48 hours
2. If still underdelivering, target CPA may be unrealistic
3. Test removing the cap to see Meta's natural CPA
4. Natural CPA is the floor — set cap near it, not far below

**CPA far above target:**
1. With Cost Cap: Meta averages to the cap; individual conversions vary. Give it 50+ conversions to judge.
2. If still high after 50+ conversions: creative or audience, not bid
3. With Lowest Cost: add a Cost Cap to stabilize
4. Check if competition increased (CPM rising across the account = market shift)

**Bid Cap yielding zero conversions:**
1. Your bid is below the clearing price
2. Increase by 20–30% or switch to Cost Cap temporarily
3. Bid Cap is a hard ceiling — only use when you have strong CPA data

**ROAS Target with low volume:**
1. Needs significant purchase value data (30–50 weekly purchases minimum)
2. If too low: switch to purchase-count optimization
3. Verify Pixel/CAPI passes purchase value accurately

### Branch 7 exit

- Bidding issues → adjust, wait 3–5 days for re-learning
- Bidding healthy → Branch 8

## Branch 8: External

Sometimes the problem isn't your campaigns. Seasonality, competitive shifts, platform changes, and privacy updates affect performance without anything being "wrong" in your account.

### What to check

| Signal | Threshold |
| --- | --- |
| Account-wide CPM increase | 20%+ over last 14 days |
| Competitor activity | New major competitor running 50+ ads |
| Platform announcements | Recent policy or feature change |
| Seasonal period | Election, holiday, Q1 dip |
| iOS update | Major version recently released |

### Fixes

**Rising CPMs market-wide:**
1. Confirm it's market-wide (industry benchmarks, peer networks)
2. Adjust CPA targets temporarily
3. Focus on creative efficiency
4. Q4 typically +20–40%, BFCM +50–80%, election season +15–30% in US
5. During high-CPM periods: tighten retargeting, pause marginal prospecting
6. Plan creative sprints before known peaks

**Competitor escalation:**
1. Monitor Meta Ad Library monthly
2. Differentiate creative — your audience is seeing their ads too
3. Consider shifting budget to audiences competitors aren't targeting
4. Review competitor LPs and offers to ensure your value prop is competitive

**Platform changes:**
1. Stay current with Meta's quarterly API updates
2. Subscribe to Meta Business Blog and the Meta for Developers changelog
3. Major changes to monitor: attribution updates, pixel/CAPI requirements, Advantage+ features, audience deprecations
4. Test early — don't wait for forced migration

**Seasonality:**
1. Build a vertical-specific seasonality calendar
2. Q1: lowest CPMs, good for testing
3. Q4: highest CPMs, focus on proven winners
4. Plan budget allocation around seasonal patterns

**Privacy/iOS:**
1. Ensure CAPI is implemented and healthy
2. Monitor EMQ after iOS updates
3. Use broad targeting + strong creative rather than relying on granular data

### Branch 8 exit

- External identified → adapt strategy to macro environment
- No external factors → revisit Branches 1–7 with fresh eyes, or escalate to peer review

## Symptom-to-branch quick map

| Symptom | Start with |
| --- | --- |
| CPA suddenly spiked across all campaigns | Branch 1 (Measurement) then 8 (External) |
| CPA gradually increasing | Branch 4 (Creative fatigue) then 3 (Audience saturation) |
| Spending way under budget | Branch 2 (Delivery) then 7 (Bidding) |
| Good clicks but no conversions | Branch 5 (LP) then 1 (Measurement) |
| Conversions dropped suddenly | Branch 1 (Measurement) then 8 (External) |
| CPM spiked | Branch 3 (Audience) then 8 (External) |
| CTR declining | Branch 4 (Creative) then 3 (Audience) |
| New campaign not exiting learning | Branch 6 (Budget) then 2 (Delivery) |
| ROAS below target | Branch 7 (Bidding) then 5 (LP) |

## Time-to-resolution

| Issue type | Expected fix time | Monitoring period |
| --- | --- | --- |
| Measurement fix | 24–48 hours | 72 hours |
| Delivery fix | 24–48 hours | 48 hours |
| Audience restructure | 3–5 days | 7 days |
| Creative refresh | 5–7 days | 7–14 days |
| Landing page fix | 1–3 days | 7–14 days |
| Budget restructure | 3–5 days | 7 days |
| Bid strategy change | 3–5 days | 7 days |
| External factors | Ongoing | Continuous |

## Multi-branch issues

Many problems span multiple branches. Three common compounds:

**Creative fatigue + audience saturation:** CTR declining AND frequency over 3. Fix order: launch new creative first (Branch 4), then expand audience (Branch 3). New creative buys time while audience changes take effect.

**Measurement + landing page:** conversions dropped but clicks are stable. Fix order: verify measurement first (Branch 1). If clean, it's a LP issue (Branch 5). Don't waste time on 2–4 when clicks are healthy.

**Budget + bidding:** spending under 70% of budget with Cost Cap enabled. Fix order: evaluate if Cost Cap is realistic (Branch 7). If competitive data supports the cap, it's a budget allocation issue (Branch 6). If new to the audience, remove the cap temporarily.

## Top 20 most common issues catalogue

1. **Creative fatigue** — CTR declining, frequency rising. Launch 3–5 new concepts.
2. **Learning Limited** — under 50 weekly events. Consolidate ad sets or increase budget.
3. **Budget constrained** — spending to cap. Scale 20% every 48–72 hours.
4. **Pixel/CAPI misconfiguration** — EMQ under 6. Add user parameters.
5. **Ad disapproval** — policy violation. Review Account Quality.
6. **Audience overlap** — over 30%. Consolidate or add exclusions.
7. **Cost Cap too restrictive** — spending under 50%. Raise 10–20%.
8. **Landing page speed** — over 3 seconds mobile. Compress images, defer scripts.
9. **Message mismatch** — LP doesn't reinforce ad promise. Align headline.
10. **Too many ad sets** — budget fragmented. Consolidate to 3–5.
11. **Audience saturation** — frequency over 3. Expand or accept ceiling.
12. **Attribution confusion** — different windows in reporting. Standardize on one.
13. **Advantage+ expansion overspending** — expansion CPA much worse than core. Disable expansion.
14. **High retargeting frequency** — over 7. Reduce window, refresh creative.
15. **iOS measurement gaps** — Meta reports 20–40% lower than backend. Implement CAPI.
16. **New campaign not exiting learning** — over 10 days in learning. Increase budget, reduce ad sets.
17. **CBO budget concentration** — one ad set dominates. Usually correct, sometimes wrong.
18. **Seasonal CPM spikes** — Q4, BFCM. Adjust targets temporarily.
19. **Conversion tracking discrepancies** — Meta vs GA4 vs backend. Use one source of truth.
20. **Account restricted** — repeat violations. Address each flag, submit appeal.

## End state

If all 8 branches are clear and the problem persists:

1. **Peer review:** have another media buyer audit with fresh eyes
2. **Longer timeframe:** evaluate 14–30 days instead of 7 — the "problem" may be normal variance
3. **Benchmark recalibration:** your targets may be unrealistic for current market
4. **Structural test:** launch a completely new campaign as a clean baseline
5. **Account health:** contact Meta support for account-level issues not visible in dashboards
