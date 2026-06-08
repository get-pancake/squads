---
name: pancake_local_playbook
description: Reference methodology for Google Ads strategies serving local businesses. Covers Google Business Profile linking, offline conversion measurement, geographic targeting (radius, DMA, service area), campaign-type selection, and Local Services Ads. Loaded by pancake_inspect_local; does not run analyses on its own.
triggers:
  - "local methodology"
  - "local business ads"
  - "local campaign framework"
  - "gbp integration"
  - "local services ads"
  - "lsa methodology"
---

# Local Business Methodology

## Role of This Skill

This is a reference, not an executor. It supplies the evaluation logic, geographic and targeting frameworks, and decision rules that the `pancake_inspect_local` action skill uses when assessing or designing Google Ads strategies for local businesses. The audit skill answers "what does the data say"; this skill answers "what should we do about it."

---

## Why Local Is Different

Local businesses convert through actions Google cannot directly observe in the ad platform: phone calls, walk-ins, route requests, in-person consultations. A dentist's success is measured in calls and chair-time. A plumber's success is measured in dispatches. A restaurant's success is measured in covers.

That changes everything about how the account should be set up and evaluated. Three areas drive most of the leverage:

1. **Geography.** Reaching only the people who can realistically become customers.
2. **Offline visibility.** Counting the actions that actually matter — calls, visits, qualified leads — not just web forms.
3. **Platform integration.** Treating Google Business Profile and Local Services Ads as core infrastructure, not as side channels.

---

## Google Business Profile as Account Infrastructure

GBP is the foundation. Without a verified, well-maintained profile linked to Google Ads, local campaigns lose access to a significant share of available features and trust signals.

### What GBP Linking Unlocks

- **Location extensions** that surface address, phone number, and a directions button directly on the ad.
- **Location-based bid adjustments** that bid higher for users physically close to the business.
- **Local inventory ads** for retailers carrying physical stock.
- **PMax local channels** including Maps and enhanced local search placements.
- **Store visit conversion tracking** when the account meets eligibility thresholds.

### GBP Health Signals That Move Ad Performance

GBP is not just a directory listing; the platform reads it as a trust signal that affects how ads perform alongside organic local results:

- **Review score and review volume.** Listings with strong reviews see higher CTR on ads that carry location extensions. Volume matters in addition to score — 50 reviews at 4.7 communicates more than 5 reviews at 4.7.
- **Business hours.** Accurate, current hours let you schedule ads to only run while you can answer. After-hours ad spend without an answering channel is straight waste.
- **Photos.** More photos correlate with more direction requests and clicks. Aim for 20+ across exteriors, interiors, products or services, and team.
- **Posts and updates.** A consistent posting cadence tells Google (and customers) that someone is tending the listing. Standard posts roll off after 7 days; event posts expire on the event date.
- **Q&A section.** Seeding common questions with the business's own answers heads off confusion before a customer has to ask; a Q&A tab full of unanswered user questions sends the opposite signal.
- **Service or product catalog.** A populated catalog unlocks richer local ad formats and improves category matching.

### Linking Mechanics

Prerequisites:
- The GBP must be verified and in good standing — no policy violations, no suspensions.
- The business profile must be accurate and complete.
- Owner or manager access to the GBP listing is required.

How to wire it up:
- Navigate to Google Ads > Account Settings > Linked Accounts > Google Business Profile.
- Request the link from inside Google Ads; the GBP owner must approve.
- One GBP listing can link to one Google Ads account or one MCC.
- Multiple GBP locations can sit under a single account.

MCC linking:
- At the MCC level, GBP access is shared with child accounts.
- This is the preferred model for agencies running multiple accounts for the same business.
- Account-level linking overrides MCC-level linking when both are present.

### What Linking Actually Buys You

**Location extensions.** Address, phone, and a directions button appear alongside the ad. Can display the distance from the searcher. Typical CTR lift on local-intent queries is in the 5 to 15% range. Available on Search, Display, and YouTube.

**Location-based bid adjustments.** Bid up for users who are physically nearer. Layer with radius targeting for precision. Requires "Presence" location targeting to work cleanly.

**Local inventory ads.** For retail with physical stock. Shows item availability at nearby stores. Requires a Merchant Center local inventory feed in addition to GBP. Drives "available nearby" visibility in Shopping.

**PMax local channels.** Ads in Google Maps search and navigation, plus enhanced local pack visibility. Requires a GBP-linked asset group in the PMax campaign. Lets users tap "directions" or "call" straight from Maps.

**Store visit conversions.** Eligibility requirements: multiple physical locations, 1,000+ ad clicks per month, and sufficient store-visit data volume (Google decides automatically). Visits are modeled using location data from opted-in users — these are estimated, not exact counts.

### GBP Optimization Checklist

The minimum to be competitive:
- [ ] Complete and accurate NAP (name, address, phone, website).
- [ ] Primary category set to the most specific option available.
- [ ] Up to 9 secondary categories added.
- [ ] Hours current, including holidays and special hours.
- [ ] Business description filled (up to 750 characters; include key services and location).

The engagement layer:
- [ ] 20+ photos across exteriors, interiors, products or services, and team.
- [ ] Responses to every review within 24 to 48 hours.
- [ ] Weekly GBP posts.
- [ ] Q&A section populated with 10+ common questions and answers.
- [ ] Products or services listed with descriptions.

The polish:
- [ ] Booking or appointment link, where applicable.
- [ ] Messaging enabled and actively monitored.
- [ ] Menu or service menu uploaded (restaurants, salons, etc.).
- [ ] Monthly photo refreshes.
- [ ] Video content uploaded.

### Multi-Location Considerations

Each physical location needs its own verified GBP listing. NAP must stay consistent across all listings and directories. Location descriptions should highlight what makes each one distinct. Photos must be location-specific — do not reuse the same set across locations.

In Google Ads:
- Use location groups for targeting and reporting.
- Track per-location performance to find underperformers.
- Allocate budget to opportunity, not equal shares.

Common pitfalls in multi-location setups:
- Overlapping service areas between locations creating internal competition.
- One weak-review location dragging down the LSA ranking for the rest.
- A central call center number instead of location-specific numbers, which breaks call tracking.
- Inconsistent update frequency across locations.

---

## Offline Conversion Tracking

Most local conversions happen offline. If the only tracked conversion is a web form, Smart Bidding is optimizing on a sliver of reality — and it will undervalue campaigns that drive calls or visits while overvaluing campaigns that drive low-intent web clicks.

### Tracking Methods at a Glance

| Method | What it captures | What it needs |
|---|---|---|
| Store visit conversions | Estimated physical visits after an ad click | Multiple locations, 1,000+ clicks/month |
| Google call forwarding | Call volume and duration from ads | Call extensions enabled |
| Third-party call tracking | Call quality, recordings, CRM integration | CallRail, CallTrackingMetrics, or similar |
| Offline conversion import (OCI) | CRM-confirmed conversions tied to clicks | GCLID capture and CRM pipeline |
| Enhanced conversions for leads | Hashed user data matched offline | Email or phone capture on forms |

### Store Visit Conversions

Eligibility requires multiple physical locations, at least 1,000 ad clicks per month across the account, enough store-visit volume (Google determines this automatically), and location extensions plus GBP linked.

Mechanics:
- Aggregated, anonymized location data from opted-in Location History users.
- Visits are modeled and reported with a confidence interval.
- Available 3 to 7 days after the visit occurs.

Limitations:
- Many businesses do not meet the volume threshold.
- Usually cannot be the primary conversion action for Smart Bidding.
- Best used as a supplementary metric alongside calls and leads.
- Accuracy depends on density and foot traffic.

### Call Tracking

**Google forwarding numbers.** Built into Google Ads at no additional cost. Captures call starts, duration, and caller area code. Available on call extensions and call-only ads. Default conversion definition is calls lasting 60+ seconds, but the threshold is configurable. Limitations: no recording, no quality scoring, no CRM integration.

**Third-party call tracking.** CallRail, CallTrackingMetrics, and similar tools record calls, score leads, integrate with the CRM, and support dynamic number insertion on landing pages. They track calls from all sources, not just Google Ads. Typical cost: $30 to $100 per month depending on volume.

**Call extensions vs call-only ads.** Call extensions append a phone number to a regular text ad — users can click through or call. Call-only ads route entirely to a phone call with no landing-page option. Call-only is right when the phone call IS the conversion (emergency services, appointment-based businesses). Call extensions fit businesses where website visits also matter.

Call conversion best practices:
- Set the duration threshold based on actual call data — analyze how long a qualifying call typically takes.
- 60 seconds is the default. Too short for complex services (legal, medical); too long for simple bookings.
- Track "calls from ads" and "calls from website" separately.
- If using third-party tracking, push qualified calls back to Google Ads as conversions.

### Offline Conversion Import (OCI)

The flow:
1. User clicks the ad; GCLID is appended to the URL.
2. User submits a form; GCLID is stored in the CRM alongside the lead record.
3. Lead progresses (MQL, SQL, closed-won).
4. Stage changes (with GCLID and value) are imported back to Google Ads.
5. Google attributes the offline conversion to the original click.

Import methods:
- **Direct upload** — manual CSV through the UI; fine for testing, not for production.
- **Scheduled import** — Google Sheets or an HTTPS endpoint polled regularly.
- **API import** — automated via the Google Ads API; best for high volume or real-time needs.
- **CRM integrations** — Salesforce and HubSpot ship native Google Ads OCI connectors.

Technical requirements:
- GCLID must be captured on form submission (hidden field, URL parameter).
- GCLID must be stored alongside the lead in the CRM.
- Import must occur within 90 days of the original click — that is the attribution window.
- The conversion action must exist in Google Ads before importing.
- 15 to 30 conversions per month is the minimum for Smart Bidding to use OCI data well.

Where OCI typically breaks:
- GCLID never captured (no hidden field, or JavaScript fails).
- GCLID lost during a redirect or form processing step.
- CRM field mapping wrong — GCLID stored but not exported.
- Import outside the 90-day attribution window.
- Duplicate imports (same GCLID + conversion action + timestamp).

### Enhanced Conversions for Leads

An alternative when GCLID-based OCI is impractical. Instead of GCLID, it uses hashed first-party data (email, phone) to match offline conversions to ad clicks via signed-in user data.

When to reach for it:
- GCLID capture is technically unreliable.
- As a supplement to GCLID OCI to lift match rates.
- The CRM cannot easily store and export GCLID.

Setup needs enhanced conversions enabled in Google Ads, a conversion tag configured to collect hashed user data, an email or phone field on the lead form, and either GTM or gtag.js for implementation.

Limits:
- Match rate depends on whether the user was signed in when they clicked.
- Match rate typically 40 to 70%, versus 90%+ for GCLID-based OCI.
- Less suited to importing deal values; works better as a pass/fail signal.

### Value Assignment

For value-based bidding to work, conversions need values that mean something:

**Actual revenue (best).** Pull the realized deal value from the CRM and import it. Has to wait for the deal to close before it can flow in. For instance, if a remodel job lands at $7,400 in revenue, send $7,400 back to Google Ads as the conversion value. This is what tROAS needs.

**Stage-based proxy values (good).** Attach estimated values to pipeline stages and import each stage as its own conversion action. A representative ladder might be: Lead at $15, MQL at $75, SQL at $250, Opportunity at $600, Closed-Won at $2,500. The value at each stage should approximate the closing probability at that stage multiplied by the average deal size.

**Flat value (minimum).** Hard-code the same value on every conversion — for example, $125 on every form submission regardless of what it eventually became. Easy to set up, but provides Smart Bidding almost no signal to differentiate cheap leads from high-value ones. Still better than zero, just barely.

How to choose:
- Wide value range (e.g., $500 to $50,000): use actual revenue or stage-based proxies.
- Consistent values: flat is acceptable.
- tROAS bidding: accurate values are required — inaccurate values actively degrade optimization.
- tCPA bidding: values matter less because the target is cost, not value.

If reasonable values cannot be estimated, tCPA is safer than tROAS.

---

## Geographic Targeting

Location targeting is the highest-leverage setting on a local account. Misconfigured location settings routinely waste 15 to 30% of budget on users who cannot become customers.

### The Setting That Causes Most Local Waste

The "presence" vs "presence or interest" choice is the single most consequential location setting.

**Presence.** Ads serve only to users physically located in the target area. This is the right default for businesses that serve only local customers — restaurants, dentists, plumbers, retail.

**Presence or interest.** Ads serve to users physically in the target area OR users elsewhere who have signaled interest in it. Example: a user in Boston typing "best brunch Austin" while planning a trip can trigger an Austin restaurant ad. The right setting for tourism, hospitality, events, real estate, relocation services, and businesses that ship into specific regions.

**The trap:** Google defaults new campaigns to "Presence or interest." For most local businesses that default is wrong. Every campaign should be audited for this on every local account review, at both the campaign level and the account-level default.

How to verify in the UI:
- Campaign Settings > Locations > Location Options.
- Look at the Target and Exclude settings.
- "Target: People in, or who show interest in, your targeted locations" = Presence or interest.
- "Target: People in or regularly in your targeted locations" = Presence.

### Targeting Methods

| Method | Best fit | Precision |
|---|---|---|
| Radius | Single-location businesses | High |
| City or zip code | Multi-location, defined service areas | Medium |
| DMA or metro area | Regional businesses, multi-location chains | Low |
| Service area (no storefront) | Home services, mobile businesses | Variable |

### Radius Targeting

Recommended radii by business type and density:

| Business type | Urban | Suburban | Rural |
|---|---|---|---|
| Restaurant / cafe | 3 to 8 mi | 8 to 15 mi | 15 to 25 mi |
| Professional services (dentist, lawyer, accountant) | 5 to 15 mi | 10 to 25 mi | 25 to 40 mi |
| Home services (plumber, electrician, HVAC) | 15 to 30 mi | 20 to 40 mi | 40 to 60 mi |
| Retail store | 3 to 10 mi | 5 to 15 mi | 15 to 30 mi |
| Medical specialist | 15 to 30 mi | 25 to 50 mi | 50+ mi |
| Emergency services (locksmith, towing) | 10 to 20 mi | 15 to 30 mi | 30 to 50 mi |

Factors that pull the radius in or out:
- **Competition density.** Dense markets pull the radius in; sparse markets push it out.
- **Specialization.** Specialists draw from a wider area than generalists.
- **Price point.** Higher-priced services justify longer customer travel.
- **Urgency.** Emergency services need a wider radius — people need help regardless of distance.
- **Drive time vs distance.** 15 miles rural may be 15 minutes; 15 miles urban may be 45. Plan around drive time, not just miles.

### Nested Radius Targeting

Stack multiple radii around the same point and apply different bid adjustments to each.

The standard three-ring structure:

| Ring | Distance | Bid adjustment | Rationale |
|---|---|---|---|
| Inner (core) | 0 to 5 mi | +20% to +30% | Highest intent, most likely to visit |
| Middle (baseline) | 5 to 15 mi | +0% | Standard bid |
| Outer (reach) | 15 to 25 mi | -15% to -25% | Lower visit probability but still reachable |

Implementation:
- Build the outer (largest) radius first, then add inner radii as separate targets.
- Apply bid adjustments to each ring independently.
- Monitor conversion rate by distance ring.
- Tighten or widen rings based on actual performance.

Refinement workflow:
1. Start with the three-ring structure.
2. Run 2 to 4 weeks to collect data.
3. Pull the geographic report segmented by distance.
4. Adjust rings to match where conversions actually come from.
5. Drop the outer ring if its conversion rate sits below the profitability threshold.

### DMA and Metro Targeting

Use when:
- Multi-location coverage spans a metro area.
- Regional coverage is the business model.
- Overlapping radii would create a messy management problem.

Advantages: simpler than stacking radii, clean boundaries, easy reporting. Disadvantages: less precise (DMA boundaries don't follow customer behavior), can include areas too far from the business. Layer zip-code exclusions to tighten precision inside a DMA.

### Service Area Targeting (No Storefront)

For businesses that travel to customers — plumbers, cleaners, movers, mobile services — there is no storefront to target.

Implementation:
- Target the service area, not the business address.
- Use zip codes, cities, or a radius to define the area.
- The GBP "service area business" setting should match the Google Ads targeting.
- Do not show the business address in ads; route to calls or forms instead.

Common mistake: targeting only the owner's home address — a small radius around a home office when the business actually serves a 30-mile region.

### Location Bid Adjustments

The purpose is to allocate budget toward higher-value geographies and away from underperformers.

Data-driven process:
1. Pull a geographic performance report (by city, zip, or distance).
2. Calculate CPA or ROAS per segment.
3. Above-target segments: increase bid adjustment by +10% to +30%.
4. Below-target segments: decrease bid adjustment by -10% to -30%.
5. Segments with meaningful spend but zero conversions over 30+ days: consider exclusion.

Ranges and behavior:
- Maximum positive: +900% (rarely justified).
- Maximum negative: -90% (effectively suppresses but does not eliminate).
- To fully stop a location, add it as a negative location target.
- Small adjustments (±5 to 10%) have minimal impact. Make meaningful changes (±15% or more) or don't bother.

### Geographic Performance Analysis

Reports to pull:
- **User location report** — where users physically are when they see the ad.
- **Geographic report by city.**
- **Geographic report by zip/postal code** — most granular.
- **Distance report** — performance by distance from the business (requires location extensions).

Analysis framework:
1. Sort by spend, highest first, to focus on material segments.
2. Calculate CPA or ROAS for each segment.
3. Compare to the account average.
4. Flag segments with spend >$100 and zero conversions.
5. Flag segments with CPA more than 2x account average.
6. Identify high-performing segments that could absorb more budget.
7. Check for conversions from outside the target area — that signals a targeting leak.

Patterns that show up regularly:
- 10 to 20% of budget spending on locations outside the intended service area.
- One or two zip codes generating disproportionate conversions.
- Urban core outperforming the suburban ring, or vice versa.
- Competitor locations generating clicks but not conversions.

### Tourism Exception

For local businesses in high-tourism areas that genuinely serve visitor traffic, "Presence or Interest" is the correct setting — but only with controls in place.

Identifying tourism-relevant accounts: the `pancake_account_foundations` config carries `tourism_relevant: true` along with a `feeder_markets` list for locations where this applies.

The recommended structure is to split campaigns rather than mix the two audiences in one:

| Campaign | Targeting | Audience | Messaging |
|---|---|---|---|
| Local — Presence | Presence only, standard radius | All | Walk-in, immediate-need focused |
| Tourist — Planning | Presence or Interest, feeder markets | In-market for travel to [destination] | Booking, planning-phase CTA |

Controls for any "Presence or Interest" campaign:
1. Positive bid adjustments on confirmed feeder markets.
2. Travel in-market audiences layered to separate active planners from casual interest.
3. Separate budget from local campaigns — the economics are different.
4. Longer conversion windows — tourists plan days or weeks ahead.
5. Geographic performance monitoring to validate (or invalidate) feeder market assumptions.

What an audit should check:
- `tourism_relevant: true` AND targeting is "Presence only" → flag as a missed opportunity.
- `tourism_relevant: false` AND targeting is "Presence or Interest" → flag as likely waste.
- "Presence or Interest" is active → confirm feeder market bid adjustments and travel audiences are in place.

---

## Campaign Type Selection

Local businesses have multiple campaign types available. The right pick depends on business model, conversion type, budget, and whether GBP and LSA are options. Most accounts should anchor on Local Search and layer additional types as data and budget allow.

### Local Search

Standard Search built with a local keyword strategy and the right extensions.

Keyword patterns to cover:
- **[service] near me** — strong intent signal with implicit geo (e.g., "electrician near me").
- **[service] [city]** — explicit city qualifier (e.g., "orthodontist Denver").
- **[service] [neighborhood]** — hyperlocal coverage (e.g., "bakery Capitol Hill").
- **[service] [zip code]** — long-tail pattern; smaller volume but high specificity.
- **Emergency or urgent variants** — e.g., "24/7 hvac repair," "after hours locksmith."

Required extensions:
- Location extensions (requires GBP link).
- Call extensions (for phone-oriented businesses).
- Sitelinks (services, hours, reviews, directions).
- Structured snippets (service types, neighborhoods served).

When it's the right call:
- The default starting point for any local business.
- When maximum keyword and bid control matters.
- When search-term visibility matters.
- Budget-constrained accounts where every dollar must be accountable.

Strengths: full control over keywords, bids, and copy; search-term reporting; predictable CPC and conversion costs; easy to understand. Limitations: Search network only; manual keyword work; doesn't capture demand from non-search channels.

### Local PMax (with GBP)

Performance Max with a GBP-linked location asset group, serving across Maps, local search, Display, YouTube, Gmail, and Discover.

Requirements:
- GBP linked and verified.
- Location asset group with a GBP connection.
- Standard PMax assets (headlines, descriptions, images, optional video).
- Conversion tracking configured for calls, forms, or store visits.

What it unlocks:
- Maps placement (search results and navigation).
- Enhanced local pack visibility.
- Display in the geographic area.
- YouTube pre-roll and in-feed in the area.
- Gmail and Discover for local audiences.

When it fits:
- Businesses wanting broad multi-channel local visibility.
- Accounts with enough conversion data for Smart Bidding (15+ conversions/month).
- When Maps placement is meaningful (retail, restaurants, service businesses).
- As a complement to Local Search, not a replacement.

Strengths: widest reach across Google; automated cross-channel optimization; Maps placement unique to PMax with GBP; lower management overhead. Limitations: limited per-channel transparency; less control over keywords and placements; needs conversion volume to optimize; can cannibalize branded Search if not managed.

### Local Services Ads (LSA)

Pay-per-lead ads above standard Search results for eligible service businesses. Google verifies the business with background checks and license validation, then displays a "Google Guaranteed" or "Google Screened" badge.

Eligibility:
- Available categories: legal, home services (plumbing, HVAC, electrical, cleaning, etc.), health, financial, real estate, pet services, and expanding.
- Not available in all markets — primarily US, Canada, UK, and select EU markets.
- Business must pass background checks and license validation.

Key differences from Search:
- Pay per lead, not per click.
- Google verifies the business (trust badge).
- Appears above paid Search ads.
- Ranking is driven by reviews, responsiveness, and proximity — not keyword bids.
- Limited ad customization; Google generates the ad from profile data.

When to use:
- Service businesses in eligible categories.
- Strong review profile (4.0+ average, 10+ reviews minimum).
- Pay-per-lead is the preferred model.
- Run alongside Search, not in place of it.

### Display for Local Awareness

Geo-fenced Display campaigns targeting users in a defined local area with visual banner ads.

When it fits:
- Brand awareness for a new location opening.
- Event promotion (limited-time offers, grand openings, seasonal events).
- Retargeting local site visitors.
- When budget allows awareness alongside direct response.

Configuration:
- Geographic targeting: radius or zip codes around the business.
- Audience targeting: affinity or in-market audiences relevant to the business.
- Frequency caps: 3 to 5 impressions per user per day.
- Responsive display ads with local imagery.

Strengths: very low CPC ($0.30 to $1.50 typical for local Display); high reach in-area; strong visual format for brand building. Limitations: low conversion intent; needs strong creative; tough to attribute direct ROI.

### Demand Gen for Local

Demand Gen (Gmail, YouTube, Discover) targeted to audiences inside a geographic area.

When it fits:
- Visually-driven businesses — restaurants, retail, events, fitness.
- Targeting specific audience segments inside a local area.
- Mid-funnel engagement (awareness to consideration).
- Complement to Search where the business has strong visual product or experience.

Configuration:
- Geographic targeting: local radius or DMA.
- Audience targeting: custom segments, in-market, lookalike.
- Visual assets: images and video required.
- Conversion tracking: may need to optimize on micro-conversions (site visits, content engagement) when lead volume is low.

### Decision Matrix

| Business need | Primary recommendation | Secondary | Notes |
|---|---|---|---|
| Maximum control, direct response | Local Search | N/A | Default starting point |
| Broad local visibility | Local PMax (with GBP) | Local Search + Display | PMax needs 15+ conversions/month |
| Lead generation (services) | LSA + Local Search | Local Search only | LSA when eligible and reviews are strong |
| Brand awareness, new location | Display (geo-fenced) | Local PMax | Time-limited awareness push |
| Visual product or service | Demand Gen (local) | Local PMax | Needs strong creative |
| Emergency services | Local Search + LSA | Local Search only | 24/7 scheduling, call-only format |
| Multi-location chain | Local PMax + Local Search | Local Search per location | Location groups for management |

### Budget Allocation Guidance

For a local business running multiple campaign types:
- **60 to 70% to Local Search** — direct response, highest conversion intent.
- **15 to 25% to LSA** — if eligible, incremental lead volume.
- **10 to 20% to PMax or Display** — broader reach and brand.

Adjust based on performance data after 4 to 6 weeks.

---

## Local Services Ads in Depth

LSAs are fundamentally different from Search ads. Position is determined by reviews, responsiveness, and proximity rather than keyword bids. Optimization looks completely different as a result.

### Ranking Factors, in Order of Impact

**1. Review score and review volume (most important).**
- Score: 4.0+ to be competitive; 4.5+ to rank well.
- Volume: more reviews = stronger signal.
- Recency: recent reviews are weighted more heavily than old ones.
- Content: Google may analyze review text for service relevance.
- These are reviews on the LSA profile specifically, not just GBP reviews.

**2. Responsiveness to leads.**
- Response time to new leads — faster is better.
- Answer rate on phone leads — missed calls hurt ranking.
- Message response rate, if messaging is enabled.
- Google tracks this automatically and folds it into ranking.

**3. Proximity to the searcher.**
- Distance from the business location to the searcher.
- For service-area businesses, distance from the service area's center.
- Closer businesses rank higher, all else equal.

**4. Business hours and availability.**
- Being available at peak search times helps.
- Extended hours (evenings, weekends) can be a real edge in competitive markets.
- Marking unavailable for long stretches hurts ranking.

**5. Budget.**
- Weekly, not daily.
- More budget enables more lead opportunity but doesn't itself buy position.
- It is a volume cap, not a bid.

**6. Complaint history.**
- Customer complaints filed through Google reduce ranking.
- Unresolved complaints hurt more than resolved ones.
- Consistent patterns can lead to suspension.

### Bid Strategies

**Maximize Leads (default).** Google optimizes for maximum leads within the weekly budget. No per-lead cost control. Right for businesses that want volume and can absorb varying cost-per-lead.

**Manual bid per lead type.** Set a maximum cost-per-lead per service category. For instance, a plumber might cap "water heater installation" at $90 and "drain cleaning" at $35. Buys cost control at the cost of volume if the caps are set too low. Right for businesses whose lead values vary materially across the services they offer.

Budget mechanics:
- Budget is weekly, not daily.
- Minimums vary by market and category.
- Google may spend over budget on high-demand days and under on low-demand days; the budget resets weekly.

### Lead Quality Management

Lead types:
- **Phone calls** — caller connects directly; duration is tracked.
- **Messages** — text inquiries through the LSA platform.
- **Bookings** — direct appointment scheduling, if enabled.

Disputing invalid leads. Leads can be disputed within 30 days under these criteria:
- Wrong number or spam call.
- Service not offered.
- Location outside the service area.
- Duplicate (same customer, same request).
- Not a genuine inquiry (solicitation, wrong business).

Dispute process:
1. Open the LSA dashboard or app.
2. Select the lead.
3. Choose the dispute reason.
4. Submit.
5. Google reviews and credits valid disputes within a few days.

Dispute rate monitoring:
- Track monthly (disputed / total).
- Above 20% indicates a problem — targeting too broad, wrong categories, or service-area mismatch.
- Persistently high rates can trigger Google review of the account.

### LSA vs Search

Use LSA when:
- The business is in an eligible category.
- Reviews are strong (4.0+ average, 10+ reviews).
- Pay-per-lead is preferred over pay-per-click.
- Leads can be answered in minutes, not hours.
- You want placement above Search.

Use Search when:
- More control over keywords and copy is needed.
- The business is not LSA-eligible.
- Budget is very small — Search allows finer cost control.
- Specific landing pages or conversion paths matter.
- Search-term data is needed for keyword research.

Run both when:
- Maximum local coverage is the goal.
- Budget supports both.
- LSA captures the Google-Guaranteed lead flow while Search captures keyword-specific intent and supports remarketing.
- There is no real cannibalization — LSA and Search appear in different positions.

### LSA Profile Optimization

- Fill every field — incomplete profiles rank lower.
- Business name must match GBP and legal records exactly.
- Phone number should be local or business, not a personal cell where avoidable.
- Website URL should match the GBP listing.

Service categories:
- Select all relevant categories — but only categories you actually serve.
- Specific categories outperform broad ones.
- Review category performance and remove underperformers.

Verification:
- Upload license and insurance documents during setup.
- Expired documents can pause the profile.
- Set reminders for renewals.

Photos:
- Professional headshot of the owner or team.
- Vehicles, equipment, completed work.
- Avoid stock — Google may reject.
- 5+ photos minimum.

Business description:
- Describe services specifically.
- Include service area and specialties.
- Mention experience, certifications, differentiators.
- 300+ characters is the working target.

Service area:
- Define accurately. Too broad = irrelevant leads; too narrow = missed opportunity.
- Match the GBP service area.
- Adjust based on lead quality by location.

### Reporting and KPIs

Available metrics:
- Total leads by type (phone, message, booking).
- Cost per lead by service type.
- Lead status (new, active, completed, archived).
- Weekly and monthly spend vs budget.

KPIs to track:
- **Cost per lead** by service category. Compare to Search CPL for the same services.
- **Lead-to-booking rate** — what percentage become customers.
- **Dispute rate** — target under 10%, flag above 20%.
- **Response time** to new leads.
- **Review trajectory** — are reviews growing in volume while maintaining score.

Reporting limitations:
- No keyword-level data (LSA does not use keywords).
- No impression share or competitive metrics comparable to Search.
- Limited audience or demographic data.
- Performance lives in the LSA dashboard, not standard Google Ads reporting.

---

## Maturity Calibration for Local Accounts

Local accounts move through the same maturity framework as everything else, with local-specific considerations layered on top.

| Stage | What it looks like in a local account |
|---|---|
| Nascent | No offline tracking, GBP not linked, start on manual CPC or maximize clicks |
| Developing | Basic call tracking in place, GBP linked, can test tCPA on highest-volume campaigns |
| Established | OCI or enhanced conversions active, LSA running, portfolio bidding across local campaigns |
| Advanced | Full offline conversion pipeline, store visit tracking where eligible, value-based bidding with accurate values |

---

## Reference Loading and Cross-Skill Dependencies

When `pancake_inspect_local` loads this methodology, the relevant sections should be consulted based on what the audit needs:

| Section in this playbook | When to consult |
|---|---|
| Google Business Profile as Account Infrastructure | Always — GBP audit is part of every local audit |
| Offline Conversion Tracking | Always — tracking gaps are the most common local issue |
| Geographic Targeting | Always — targeting is the highest-impact setting |
| Campaign Type Selection | When evaluating campaign structure or recommending new campaigns |
| Local Services Ads in Depth | When LSA is active or being considered |

Cross-references to other methodologies in the toolkit:

| Methodology | Relevance |
|---|---|
| `pancake_account_foundations` | Calibrate recommendations to account stage |
| `pancake_bidding_playbook` | Bidding strategy selection (same framework, local context) |
| `pancake_query_intelligence` | Local keyword evaluation ("[service] near me" patterns) |
| `pancake_root_cause_lab` | Root cause analysis when local campaigns underperform |
