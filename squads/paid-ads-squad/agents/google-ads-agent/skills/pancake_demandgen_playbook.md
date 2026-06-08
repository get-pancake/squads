---
name: pancake_demandgen_playbook
description: Reference methodology for Google Ads Demand Gen campaigns. Provides evaluation frameworks for lead-gen and eCommerce deployments, audience layering, creative format tradeoffs, and a mid-funnel measurement model. Loaded by pancake_evaluate_demandgen; does not run analyses on its own.
triggers:
  - "demand gen methodology"
  - "demand gen framework"
  - "demand generation strategy"
  - "demand gen for lead gen"
---

# Demand Gen Methodology

## How to Use This Skill

This file is a knowledge base, not an executor. The `pancake_evaluate_demandgen` action skill pulls this methodology in when it needs the analytical scaffolding to assess a Demand Gen account: what to look at, which thresholds matter, and how to interpret what the data is saying. Nothing here runs analyses, fetches reports, or makes account changes on its own.

## What Demand Gen Is and Where It Sits

Demand Gen is the visual, feed-native campaign type Google introduced in October 2023 as the successor to Discovery campaigns. The upgrade widened the format menu (video and carousels arrived), introduced lookalike segments, and added native A/B creative testing.

A single Demand Gen campaign can serve across four surfaces:

- The YouTube Home feed, Watch Next feed, and YouTube Search results (in-feed video and image units)
- YouTube Shorts (vertical video between Shorts)
- The Google Discover feed on mobile
- Gmail's Promotions and Social tabs

### Comparing Demand Gen to Other Campaign Types

The core mental model: Demand Gen is mid-funnel, audience- and creative-driven, and lives where people are consuming content rather than searching for something.

| Aspect | Search | Demand Gen | Video Action (YouTube) | Performance Max |
|---|---|---|---|---|
| User state | Actively searching | Browsing content | Watching video | All states |
| Primary lever | Keywords + bids | Audiences + creative | Audiences + video | Full automation |
| Where it shows | Search results | YouTube, Discover, Gmail | YouTube only | Every Google surface |
| Creative surfaces | Responsive text ads | Image, video, carousel, feed | Video only | All formats |
| Operator control | High | Medium | Medium | Low |
| Funnel position | Bottom | Middle | Upper-middle | Top to bottom |

## Demand Gen for Lead Generation

For accounts focused on leads, Demand Gen earns its keep by reaching prospects before they show up in Search. Google's headline number on the channel is that **about 68% of its conversions come from people who were never in the active Search funnel for the advertiser** — that is the incrementality claim, and it is the reason to consider running it at all.

### Why It Works for Lead Gen

- Search catches demand that already exists. Demand Gen manufactures earlier-stage demand and catches it on the way in.
- It reaches buyers in passive states: scrolling Gmail, watching YouTube, scanning Discover.
- It is particularly well-suited to long sales cycles, multi-touch B2B journeys, and categories where prospects don't yet know they have a problem.
- In markets where Search volume is capped or where bottom-funnel CPCs are punitive, Demand Gen creates a path to growth that Search cannot.

### The Quality Tradeoff

Leads from Demand Gen tend to arrive earlier in their decision process than Search leads. That means volume alone is the wrong evaluation metric. You need downstream tracking — MQL, SQL, revenue — to know whether what you're buying is actually valuable.

### When Demand Gen Is the Wrong Tool for Lead Gen

Skip it (or delay it) if any of the following are true:

- The conversion-tracking pipe is leaky or you don't trust the numbers.
- You can't field 1,000 site visitors and don't have another remarketing pool to seed from.
- The sales org can't absorb more lead flow than it already gets.
- Reporting stops at the form fill — nothing downstream is visible.
- Daily budget sits below roughly $30 — the learning period will not finish.

## Demand Gen for eCommerce

For eCommerce, Demand Gen is a visual discovery engine. It serves products to users based on what their interest profile suggests they will want, not what they typed into a search bar.

### Product Feed Mechanics

When the Merchant Center feed is linked, Google can dynamically pick products to surface based on browsing behavior and purchase signals. The feed becomes a personalization engine rather than a static catalog.

### What Demand Gen Is Good At in eCommerce

- Launches of new SKUs where Search demand does not yet exist.
- Seasonal collections, lookbooks, and editorial-style merchandising.
- Cross-sell and upsell to existing customers (via Customer Match).
- Dynamic remarketing against the product feed.
- Pushing past the ceiling of search-volume-capped categories.

The strength here is that lifestyle imagery, video, and carousels build consideration in a way that text ads and Product Listing Ads do not. Users discover products they didn't know they were looking for.

## Audience Strategy

Demand Gen has three audience reach dials and a separate Optimized Targeting toggle. Knowing what each does — and how they combine — is most of the strategy.

### The Three Audience Expansion Modes

**Narrow.** Targeting is locked to the audiences you specify. No expansion at all.
- Maximum quality control; minimum reach.
- Right call for lead-gen accounts that need to protect quality, small budgets where waste is fatal, or early testing where you want clean signal.
- Watch out: not enough reach can stall the campaign in learning.

**Balanced (the default).** Google nudges beyond your specified audiences toward users who look similar.
- Moderate reach, moderate control.
- Reasonable default for most accounts, especially those with established conversion tracking and enough budget to absorb some directional reach.
- Some dilution is expected; monitor quality.

**Broad.** Google treats your audiences as hints and searches widely for conversions.
- Maximum reach, minimum control.
- Suited to eCommerce with a clean purchase event and tight ROAS tracking, accounts running 100+ conversions per month, and campaigns optimizing toward a well-defined action.
- Avoid for lead gen unless downstream quality tracking is rock solid — dilution is real.

### Picking an Expansion Setting

| Signal | Argues for Narrow | Argues for Balanced | Argues for Broad |
|---|---|---|---|
| Business model | Lead gen (quality-sensitive) | Mixed | eCommerce (volume-driven) |
| Monthly conversions | Below 30 | 30 to 100 | 100+ |
| Quality tracking | None or basic | MQL rate visible | Full funnel (SQL, revenue) |
| Daily budget | Under $50 | $50 to $200 | $200+ |
| Campaign age | First 30 days | 30 to 90 days | 90+ days |

### Optimized Targeting (Separate Toggle)

Optimized Targeting is independent of the expansion mode. When on, Google uses conversion data and engagement signals to find converters that fall entirely outside your specified audiences.

**Turn it on when:**
- You're running eCommerce with a clean purchase conversion and at least 50 conversions per month.
- Volume growth is the priority.
- Downstream tracking (ROAS, lead quality) will catch quality regressions fast.

**Leave it off when:**
- Lead quality matters more than lead volume.
- The campaign is new and Google's prediction model is starved for data.
- You have no way to detect downstream quality issues.
- You're targeting a very specific niche (e.g., enterprise IT buyers in a single vertical).

If you do enable it, watch lead quality weekly for the first month. A common trap: CPA improves, but MQL rate drops further, so cost-per-MQL actually worsens. Pull the toggle if that happens.

### Lookalike Segments

Lookalikes find new users who share characteristics with a seed list you provide.

Seed requirements:
- 1,000 matched users minimum.
- 5,000+ is much more stable.
- Acceptable seeds: Customer Match lists, site visitors, app users, YouTube engagers, past converters.

Expansion levels and what they map to:

| Mode | Approx. share of target market | Similarity to seed | Fit |
|---|---|---|---|
| Narrow | ~2.5% | Highest | Lead gen, high-AOV, B2B |
| Balanced | ~5% | Moderate | General testing |
| Broad | ~10% | Lowest | High-volume eCommerce |

**Seed quality determines lookalike quality.** A lookalike off a junky seed will be junky.

Best seeds:
- Top 20% of customers by revenue or LTV.
- Converters from the last 90 days (most current customer shape).
- MQLs or SQLs for B2B — qualified leads, not all form fills.

Workable seeds:
- All converters (broader, less precise).
- Engaged email subscribers.
- High-engagement site visitors (multi-visit, key pages).

Avoid:
- Every site visitor including bouncers.
- Purchased email lists (low match, low signal).
- Lists older than 12 months — your customer profile has moved.

Sequence for testing lookalikes:
1. Take your best seed, run it at narrow expansion.
2. Give it 2 to 4 weeks. Judge on quality, not just CPA.
3. If quality holds, step to balanced on the same seed.
4. Vary the seed at the same expansion level to compare.
5. Move to broad only if both volume and quality justify it.

### Custom Segments

Custom segments build audiences from interest signals rather than profile attributes.

**URL-based.** Users who browse a defined set of URLs — review sites, niche forums, competitor properties, trade publications. Important caveat: this is not retargeting. You are not targeting visitors of those exact URLs; Google uses the URLs as an interest signal to find users with similar interest patterns. Useful for competitive conquesting and category-research audiences.

**Keyword-based.** Users who have recently searched a specified term list. Different from Search keyword targeting in a key way: the ad doesn't run while the search is happening. Google instead picks the user up afterward and serves them a Demand Gen creative later. Good for picking up high-intent terms at lower CPC than Search and for re-engaging searchers after their active session has ended.

**App-based.** Users of specific apps. Mostly used for app campaigns; rarely the right move for B2B lead gen.

Conventions that work:
- Keep segments focused (10 to 15 URLs or keywords each, not 100+).
- Theme segments separately — competitor URLs in one segment, industry publications in another, so you can read performance.
- Refresh quarterly; the competitive set drifts.

### First-Party Audience Seeding

**Customer Match.** Upload emails, phone numbers, or postal addresses. Match rates typically run 30 to 60% depending on list hygiene and the email types involved. Uses: direct targeting (cross-sell, upsell), exclusion (don't pay to reach existing customers), and seeds for lookalikes.

**Website visitor segments.** Build them by behavior, not just visited-the-site. The valuable segments for Demand Gen: pricing page visitors, product/demo page viewers, resource downloaders, users with 2+ minutes on site, users with 3+ pageviews. Layer recency on top (7-day vs 30-day vs 90-day) — recent visitors are warmer.

**YouTube engagement audiences.** Viewers of any video, viewers of specific videos, channel subscribers, users who liked, commented, or shared. Especially valuable for Demand Gen since YouTube is its largest placement footprint.

### Audience Exclusions

Exclusions are how you stop paying for users you do not want.

Standard exclusions for every campaign:
- Existing customers (unless the campaign is explicitly upsell or retention).
- Recent converters within the conversion window.
- Disqualified leads from your CRM.

Additional exclusions for lead-gen campaigns:
- Active sales pipeline — they don't need more ads.
- Competitors and employees, if you can identify them via Customer Match.
- Geographies you do not serve.

Maintenance:
- Refresh lists monthly with new customers, converters, and disqualifications.
- Wire up a CRM-to-Ads sync if you can.
- Audit quarterly so exclusions are not silently blocking real prospects.

## Creative Strategy

Demand Gen supports four creative formats. Each carries different specifications, behaviors, and best-fit use cases.

### Image Ads

Specs:
- Landscape: 1.91:1 (1200 by 628 recommended)
- Square: 1:1 (1200 by 1200)
- Portrait: 4:5 (960 by 1200)
- Max file size: 5MB
- JPG or PNG

Volume:
- 1 image per ad group is the floor.
- 3+ images per format is the working target.
- Supplying all three aspect ratios maximizes where Google can place you.

Tactical guidance:
- Use real product or lifestyle photography. Generic stock degrades performance.
- Value prop should be visible in the image or in the headline overlay.
- Keep text overlay light — text-heavy images can throttle delivery.
- Brand presence should register without dominating.
- Test concepts (benefit-driven vs lifestyle vs product-forward) rather than minor variants.

Placement behavior:
- Landscape fits Gmail and Discover inventory cleanly.
- Square slots into every placement without trouble.
- Portrait wins priority on mobile Discover and Shorts-adjacent slots.

### Video Ads

Specs:
- Landscape (16:9), square (1:1), and vertical (9:16) aspect ratios.
- Duration window: 10 to 60 seconds. Sweet spot for most objectives: 15 to 30 seconds.
- Must be hosted on a YouTube channel linked to the account.

Working principles:
- Earn the first 3 seconds. Demand Gen auto-plays in many surfaces; the opening determines whether users keep scrolling.
- Use captions and on-screen text — sound-off playback is standard.
- Reinforce CTA visually throughout, with a clear final card.
- Design mobile-first: large type, simple visuals, no tiny details.
- **Vertical 9:16 is not optional if you want YouTube Shorts inventory.** Skipping it forfeits a significant share of reach.

Picking duration:

| Length | Use case | Where it fits |
|---|---|---|
| 6 to 15 seconds | Awareness, simple message, retargeting | Shorts, in-feed |
| 15 to 30 seconds | Consideration, product demo, feature highlight | In-feed, Discover |
| 30 to 60 seconds | Complex value prop, testimonial, deep demo | In-feed (engaged viewers) |

Key video metrics:
- View rate: share of impressions that became 10+ second views or completes.
- Engaged-view conversion rate: of those 10+ second viewers, how many converted.
- CPV: cost per view, the engagement efficiency metric.

Engagement metrics usually favor video over static images, though CPA can run hotter for certain audience cuts. Don't assume — put both in the auction.

### Carousel Ads

Specs:
- 2 to 10 cards per carousel.
- Each card: one image (landscape 1.91:1 or square 1:1), a headline, a final URL.
- Description and CTA are shared across all cards.

Best use cases:
- Displaying a multi-SKU lineup pulled from one catalog or collection.
- Putting features side by side, one per card.
- Showing several distinct applications of the same product.
- Step-by-step process or methodology walkthroughs.
- Rotating testimonials or case studies across the swipe.

Mechanics:
- The opening card is the load-bearing one — it decides whether the user swipes at all.
- Treat the cards as a sequence; each one should pay off the one before it.
- Hold a consistent visual treatment (palette, style, image quality).
- Aim for 4 to 6 cards. Under 4 feels thin; past 8, you start losing viewers before the end.
- Card URLs can differ across the unit — convenient when each card is a different product.

Carousel-specific metrics:
- Swipe rate (engagement).
- Card-level click distribution (which card or product won attention).
- Conversion rate by entry card.

### Product Feed Integration

Setup:
- Active, approved Merchant Center feed.
- Merchant Center linked to Google Ads.
- Feed must satisfy MC requirements (titles, images, prices, stock).

Behavior:
- Google selects products per user based on their behavior and the feed.
- Ads render as shoppable cards (image, title, price) and users can scroll through multiple products in one unit.

Operational notes:
- Feed quality is the ceiling on performance — clean titles, good images, accurate prices, complete attributes.
- Use custom labels to slice the catalog (bestsellers, seasonal, clearance, high-margin) for separate strategies.
- Exclude out-of-stock SKUs, low-margin items, and anything with bad imagery.
- Pair feed ads with audience targeting for personalized discovery.

Feed-specific metrics:
- Product-level CTR (which items attract).
- Product-level conversion rate (which items close).
- Catalog coverage — what share of products is actually serving. Low coverage usually points at feed issues.

### Creative Diversity Targets

Google explicitly recommends all formats in each ad group. More formats means more placement eligibility.

| Format | Minimum | Ideal |
|---|---|---|
| Landscape images | 3 | 5 |
| Square images | 3 | 5 |
| Portrait images | 1 | 3 |
| Video (any aspect) | 1 | 3 (one per aspect ratio) |
| Carousel | 1 | 2 (different concepts) |

Observed lift: accounts running all formats see roughly 10 to 20% higher reach versus image-only. Video unlocks Shorts and in-feed video; carousel unlocks additional Discover and Gmail inventory.

### Creative Testing Discipline

Test concepts, not garnish. Concept A (benefit-driven) versus Concept B (social proof) tells you something. Concept A in blue versus Concept A in green generally doesn't.

A working test loop:
1. Write down the hypothesis ("benefit-driven imagery will beat product-focused on CPA").
2. Stand up a pair of ad groups that share targeting but split on the creative concept under test.
3. Let it run for at least two weeks — Demand Gen takes that long to build a stable signal.
4. Read CTR, conversion rate, CPA, and for video, engaged-view rate.
5. Hold off on a verdict until each arm has logged 100+ conversions.
6. Winner stays, loser is retired, and a fresh challenger lines up against the incumbent.

Priority order for what to test:
1. Creative concept (benefit, social proof, product, lifestyle).
2. Format (image vs video vs carousel for the same message).
3. Headline and value prop variations.
4. Visual style (photography vs illustration, bright vs muted).
5. CTA copy — lowest leverage, do last.

### Placement-Specific Creative Notes

**Gmail.** The preview image and subject line are everything; users decide before they open. Design like a clean, professional email — relevant, not clickbait.

**YouTube In-Feed.** Your thumbnail is fighting for attention against the organic videos sitting next to it. It needs to feel like YouTube content, not an obvious promo. Thumbnail and title together determine click-to-play.

**Discover.** Treat it as an editorial feed. What matters most: strong imagery and topical fit with the content around it. Keep branding light and skip anything that telegraphs "this is an ad."

**YouTube Shorts.** Vertical 9:16 is required. Fast-paced and native-feeling beats polished and corporate. You get one or two seconds before the swipe — earn them. Match the Shorts viewing rhythm with durations in the 6 to 15 second range.

## Measurement and Attribution

Demand Gen brings in measurement concepts Search advertisers do not have to think about: engaged-view conversions, view-through conversions, and a mid-funnel attribution problem that punishes naive analysis.

### Conversion Types

| Type | What it means | Weight in evaluation |
|---|---|---|
| Click-through | User clicked the ad and converted | Full weight |
| Engaged-view (EVC) | User watched 10+ seconds of video then converted later | High weight |
| View-through (VTC) | User saw the impression (no click, no engaged view) then converted | Low weight (directional only) |

### The Core Measurement Principle

**Demand Gen is mid-funnel and must be evaluated as such.** It reaches users who are not actively searching but are in-market. Comparing its last-click CPA to Search is structurally rigged against it:

- Search captures users at peak intent (bottom funnel).
- Demand Gen influences users before they search (mid funnel).
- Under last-click attribution, many Demand-Gen-influenced conversions are credited to Search.

The right evaluation approach:
1. Use data-driven attribution (DDA), not last click.
2. Include engaged-view conversions when the campaign is video-heavy.
3. Look at total account conversion volume — did adding Demand Gen lift the total?
4. Track branded search volume — did it rise?
5. For lead gen, evaluate quality by source, not raw volume.

### Attribution Model

Data-driven attribution distributes credit across touchpoints based on modeled contribution. For Demand Gen, that means credit gets shared between Demand Gen exposures and other channels (Search clicks, direct visits, etc.) — which is the correct picture.

Last-click is misleading here because it disproportionately credits bottom-funnel channels. Under last-click, a campaign that is actually driving a lot of Search conversions can look like it converts nothing. Use DDA, or at minimum position-based, when evaluating Demand Gen.

### Engaged-View Conversions (EVC)

An EVC is logged when someone sits through at least 10 seconds of a skippable video ad — or the full ad if it runs shorter than 10 seconds — and then converts inside the attribution window. They never clicked. They watched, moved on, and arrived back via some other route.

Attribution window:
- Default 3 days. Configurable to 1, 3, 5, or 10 days.
- Shorter windows are more conservative and increase confidence that the view actually mattered.

How to handle EVC in reporting:
- Report click-through and EVC separately.
- Total = click-through + EVC. Do not double-count VTC into this.
- Quote CPA both with and without EVC, clearly labeled. Both views are legitimate, but they answer different questions.

For lead gen, hold EVC leads to the same quality bar as click-through leads. High EVC volume with low quality suggests the video is driving awareness without qualified intent.

### View-Through Conversions (VTC)

An impression was served (no click, no 10+ second video view) and the user converted within the window.

Attribution window:
- Default 1 day — VTC is only credited when the conversion lands within a day of when the impression was served.

How to weight VTC:
- It is the weakest signal — the user did not engage at all.
- Correlation-versus-causation risk is real; the conversion may have happened anyway.
- Report VTC separately. Do not roll it into primary CPA.
- Use it directionally: high VTC suggests the audience is right even if engagement is weak.

VTC will be higher in Demand Gen than in Search simply because Demand Gen produces more impression-only touchpoints (especially in Gmail and Discover). Do not compare them across channels.

### Reporting Dimensions

**By placement.** Gmail, YouTube (in-feed and Shorts), Discover. A common pattern: YouTube delivers the conversions while Gmail delivers the impressions. Placement-level data should feed creative strategy decisions.

**By audience.** Remarketing vs lookalike vs custom segment — which is delivering, and at what quality. This feeds the expansion vs contract decision.

**By creative.** Format-level (image vs video vs carousel) and creative-level. Watch for fatigue (declining CTR over time on the same creative).

**By device.** Demand Gen skews heavily mobile because Discover and Shorts are mobile-first surfaces. Desktop may show higher CVR with much lower volume.

### Incrementality

The honest question is whether Demand Gen conversions are genuinely additive, or whether those users would have searched and converted anyway. The 68% non-Search-user statistic argues high incrementality, but it should be verified per account.

Approaches, ordered by rigor:

**Geo holdout (recommended).** Turn Demand Gen on in a defined set of regions while leaving a comparable set dark. Then compare total cross-channel conversions between the on and off geographies. If the on geographies pull ahead in total, the channel is doing incremental work. This needs enough geographic spread, a 4 to 8 week test, and enough volume per region to read.

**Conversion lift study (Google-managed).** Google runs a controlled experiment and reports incremental conversions. Most rigorous, but requires meaningful spend — typically $10K+ over the test window.

**Before/after analysis (weakest).** Compare account-wide conversions before and after launch, controlling for seasonality. Many confounds; useful as an initial signal, not as proof.

**Cross-channel observation (ongoing).** Track what happens to branded search volume after launch — does it bend upward? Open the Top Conversion Paths report and look for Demand Gen showing up upstream of Search in the conversion sequence. None of these are proof on their own, but when they all point the same direction, that consistency is meaningful.

### Demand Gen and Search Interaction

The assisted-conversion dynamic: Demand Gen often plants the seed that Search then closes. In last-click reporting, Demand Gen gets nothing and Search gets the credit. The Top Conversion Paths report shows this pattern when it's happening.

Branded search lift is one of the cleaner incrementality signals available. If branded search volume rises after Demand Gen launches — and you haven't done anything else (PR, TV, etc.) — Demand Gen is creating awareness that converts into search demand.

Total account CPA is the right lens. A standalone Demand Gen CPA may look high, but if total account CPA goes down after launch (more conversions for the same or lower total cost), the channel is contributing.

### Reporting Cadence

**Weekly:** impressions, clicks, CTR by placement; conversions (click-through), EVC, VTC reported separately; CPA reported both ways (click-through only, and click-through + EVC); spend versus pacing.

**Monthly:** all of the weekly metrics aggregated; audience-segment performance (CPA, CVR by segment); creative performance by format and individual asset; for lead gen, quality by source (MQL rate, cost-per-MQL); cross-channel impact (branded search trend, total account conversions).

**Quarterly:** incrementality review if testing; audience-expansion decisions (broaden or narrow?); creative refresh planning (fatigue patterns, new concept tests); budget allocation across channels; for lead gen, quality trend (improving, flat, declining).

## Lead Gen Specifics

### Conversion Tracking

Primary conversion action: form submission, counting set to "One" (not "Every"). The "One" setting prevents the same user inflating volume with duplicate submissions, and it's the action Demand Gen should optimize toward.

Secondary actions (micro-conversions) to feed the algorithm without polluting reporting:
- Time on site or scroll depth.
- Resource downloads (whitepapers, case studies, tools).
- Embedded video watches on the landing page.
- Chat initiations or phone-call clicks.

For B2B, **wiring up offline conversion import is the data plumbing that matters most.** The flow: grab the GCLID at form submission, link it to MQL and SQL stage transitions inside the CRM, and feed those events back into Google Ads. Plan for a 7 to 30 day lag on MQL signals and 30 to 90 days on SQL. Without this pipe, Google can only optimize toward form fills — with it, it can chase downstream quality.

### Audience Sequencing for Lead Gen

The progression is warmest to coldest, with quality checks at each step before expanding.

**Phase 1 — Remarketing.** Non-converting site visitors, deeply engaged users (people racking up pageviews, dwell time, and downloads), and YouTube viewers of your channel. Slice these by how deep the engagement actually went — somebody who reached the pricing page is a different animal from somebody who skimmed a blog post. This phase is the credibility test; CPA should be at its lowest and quality at its highest here.

**Phase 2 — Customer Match.** Upload customer email and phone lists for upsell/cross-sell targeting, for exclusion of existing customers, and as seeds for lookalike creation. Need 1,000 matched users minimum.

**Phase 3 — Lookalikes.** Seeds come from converters, email lists, or your high-value customer cohort. Open at narrow (~2.5%). Run a few seed variants side by side — the full converter pool, the top-tier subset, and a recency-bounded cut — and compare. Only graduate to balanced and then broad once each preceding level has held up on quality.

**Phase 4 — Custom Segments.** URL-based (competitor sites, industry publications) and keyword-based (terms people search on Google). Particularly strong for B2B. Watch quality closely — custom segments can be broad.

**Optimized Targeting** for lead gen should generally stay off until you have robust quality tracking and a clear minimum quality bar. If on, monitor weekly.

### Lead Quality Tiers

Quality has to be tracked at multiple time horizons, not just at form-fill:

| Window | Question | Measurement |
|---|---|---|
| Same day | Did a real, in-target person fill the form? | Valid contact details, on-profile, no spam |
| 7 days | Is the lead engaging? | Replies to outreach, opens, click-throughs |
| 30 days | Is it moving down funnel? | MQL rate — share of leads clearing qualification |
| 90 days | Is it closing? | SQL conversion and closed-won rates |

### Demand Gen vs Search Lead Quality

Typical pattern when both channels are running:

| Metric | Demand Gen vs Search |
|---|---|
| Cost per lead (CPL) | Often 30 to 50% lower |
| Valid lead % | Typically 5 to 15% lower |
| MQL rate | Typically 10 to 20% lower |
| Cost per MQL | Often comparable end-to-end |

The whole point is that Demand Gen's lower CPL offsets its lower quality rate, leaving cost-per-MQL in the same neighborhood. Do not stop at CPL; run the math to qualified.

**Acceptable quality thresholds** (when to call Demand Gen lead quality "good enough"):
- Cost-per-MQL within 20% of Search cost-per-MQL.
- MQL rate at least 40% of Search MQL rate.
- No systematic quality issues (wrong geography, wrong segment, spam).
- Total MQL volume rose when Demand Gen launched — incremental, not cannibalistic.

### The Lead Gen Funnel and Optimization Targets

```
Demand Gen impression
  -> Ad engagement (click, video view, swipe)
    -> Landing page visit
      -> Form submission
        -> Lead qualification (valid contact, in target)
          -> MQL
            -> SQL
              -> Closed-won
```

Optimization target depends on volume:
- 50+ MQLs/month: optimize at MQL via OCI.
- Fewer than 50 MQLs but 50+ form fills: optimize at form submission.
- Fewer than 50 form fills: Demand Gen does not have enough signal. Consolidate audiences or raise budget.

### Budget Mix: Demand Gen vs Search vs YouTube

| Channel | Funnel position | Intent | Cost | Volume ceiling |
|---|---|---|---|---|
| Search | Bottom | Highest | Highest CPC | Capped by search volume |
| Demand Gen | Middle | Moderate | Moderate CPC | Broader |
| YouTube | Top | Lowest | Lowest CPV | Broadest |

Typical allocations by stage:

| Stage | Search | Demand Gen | YouTube |
|---|---|---|---|
| New to Demand Gen | 70 to 80% | 15 to 20% | 5 to 10% |
| Established Demand Gen | 50 to 60% | 20 to 30% | 10 to 20% |
| Mature multi-channel | 40 to 50% | 25 to 35% | 15 to 25% |

Adjustments to make over time:
- Shift dollars toward channels delivering qualified leads at acceptable cost.
- If Search is impression-share-capped, Demand Gen is the logical expansion path.
- If Demand Gen quality is holding, increase its share.
- Seasonality may flip the picture quarter to quarter.

### Pre-Launch Checklist for Lead Gen Demand Gen

All of the following should be true before launching:
1. The Search program is mature, profitable, and running on a stable CPA.
2. A remarketing pool exists — 1,000 site visitors is the practical floor.
3. The conversion-tracking setup is trusted: no duplicate counts, form fills firing where they should.
4. Landing pages are tuned for conversion. Traffic arriving from Demand Gen is colder than what Search delivers, and pages have to compensate.
5. Budget is large enough to clear the learning period — figure $30 to $50/day at minimum.

Launch sequence:
1. Open with remarketing alone — the warmest pool goes first.
2. Hold for 2 to 4 weeks. Read on quality, not on volume.
3. Once quality looks acceptable, layer in lookalikes at narrow expansion.
4. Hold another 2 to 4 weeks. Read again.
5. If quality continues to hold, bring in custom segments and step lookalike expansion wider.
6. Re-evaluate audience mix and budget every month against the downstream data.

## Account Maturity and Demand Gen Readiness

Whether Demand Gen is appropriate at all depends on what infrastructure is in place.

### Nascent — Skip Demand Gen

- Fewer than 15 conversions per month across all campaigns.
- Conversion tracking is unreliable.
- No remarketing audiences built.
- Action: focus on Search. Build conversion data and audience pools first.

### Developing — Test on Remarketing Only

- 15 to 50 conversions per month with Search campaigns performing.
- Remarketing audiences exist with at least 1,000 users.
- Conversion tracking is reliable.
- Action: launch Demand Gen targeting remarketing only. Prove the channel on warm audiences before expanding.

### Established — Scale with Lookalikes

- 50 to 200 conversions per month, Search and remarketing both working.
- Customer Match lists are available.
- Lead quality tracking is in place where relevant.
- Action: expand into lookalike segments seeded off converters. Test custom segments. Introduce creative diversity across image, video, and carousel.

### Advanced — Full Strategy with Incrementality

- 200+ conversions per month, multi-channel program in place.
- Offline conversion data is flowing where relevant.
- Budget supports incrementality testing.
- Action: full audience layering across narrow, balanced, and broad. Run incrementality measurement (geo holdout or conversion lift). Optimize on downstream metrics — MQL, SQL, revenue.

## What This Skill Loads With

When `pancake_evaluate_demandgen` brings this methodology in, it pulls the relevant sections based on the account's business model:

| Business model | Sections to emphasize |
|---|---|
| Lead Generation | Demand Gen for Lead Generation, Audience Strategy, Measurement and Attribution, Lead Gen Specifics |
| eCommerce | Demand Gen for eCommerce, Audience Strategy, Creative Strategy, Measurement and Attribution |
| All | Audience Strategy, Measurement and Attribution |

### Related Skills

Loaded by:
- `pancake_evaluate_demandgen` (primary consumer)

References concepts in:
- `pancake_account_foundations` (maturity stages)
- `pancake_bidding_playbook` (bidding strategy selection for Demand Gen)
- `pancake_creative_atelier` (creative evaluation frameworks)

## Changelog

- 2026-03-26: Initial version. Covers Demand Gen for lead gen and eCommerce, audience expansion, creative formats, measurement and attribution, and maturity calibration.
