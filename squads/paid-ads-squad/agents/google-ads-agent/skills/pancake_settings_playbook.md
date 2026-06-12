---
name: pancake_settings_playbook
description: Universal methodology for auditing Google Ads account and campaign settings, conversion tracking, privacy compliance, and data connections. Covers the complete settings checklist (account-level and campaign-level), tracking and compliance frameworks (Consent Mode V2, enhanced conversions), and data connection requirements. This is a reference skill loaded by pancake_inspect_settings. Not an action skill.
triggers:
  - "settings methodology"
  - "settings audit framework"
  - "tracking compliance"
  - "consent mode"
  - "enhanced conversions"
---

# Settings Methodology

## What This Skill Is

This is a knowledge reference, not an executable workflow. It carries the evaluation logic, the checklists, the compliance rules, and the integration requirements that the `pancake_inspect_settings` action skill leans on whenever it runs an audit. Think of this document as the "what good looks like" companion: it defines correct configurations and the consequences of incorrect ones. The action skill handles pulling data and producing the actual audit output; this file tells it what to look for and how to interpret what it finds.

---

## Why Settings Audits Matter

Most Google Ads problems announce themselves. A weak ad gets low CTR. A broken bid strategy produces volatile CPA. Settings errors do none of that. They sit quietly in the background, draining money or contaminating the data that everything else depends on — and nothing in the standard performance views will flag them.

A few examples of how silent these failures can be:

- A location-targeting setting can quietly leak roughly a fifth of a campaign's budget to users who will never convert, with no warning surface.
- A conversion-count toggle set the wrong way can double or triple the apparent volume of leads, so a campaign looks like a winner when it is actually mediocre.
- A "Display Network" checkbox left on inside a Search campaign can siphon a meaningful share of spend into placements that essentially never convert.

Because the surface stays calm while the underlying machinery is broken, the only defense is suspicion. The default operating posture for any settings audit should be: assume something is misconfigured, then prove otherwise.

---

## How This Methodology Fits the Rest of the Toolkit

Settings work touches almost every other audit:

- **Before any bidding audit.** Smart Bidding makes decisions using the conversion stream. If that stream is wrong, the bidding analysis is studying a fictional account.
- **First branch of the diagnostic tree.** When a campaign goes sideways, the first question is "is measurement still trustworthy?" Settings methodology supplies the answer.
- **Account maturity context.** New accounts tend to be riddled with setup mistakes. Long-running accounts more often suffer from drift — settings that were correct when configured but have been deprecated or superseded (legacy attribution models, enhanced CPC still live on tCPA-eligible campaigns, etc.).
- **PMax-specific overlap.** PMax has its own settings surface — final URL expansion, brand exclusions, asset-group URLs — that goes beyond the standard campaign sheet.

---

## When to Trigger a Settings Audit

- Onboarding a brand-new account, before touching anything else.
- Inheriting an account from another agency or manager.
- Investigating a performance dip when no creative, bid, or budget change explains it.
- As scheduled hygiene each quarter — Google ships features, deprecates others, and changes defaults more often than most accounts can keep up with.
- After any structural change: new conversions, new campaign types, new geographic markets.

---

## Account-Level Checklist

These settings apply to the whole account and ripple into every campaign. The reference file `references/settings_checklist.md` holds the granular procedure for each; this section gives the priority view.

### Tier 1 — Direct budget and optimization risk

- **Auto-tagging** must be ON. Without it, GA4 cannot reconcile clicks to sessions, audience sharing breaks, and any GA4-imported conversions become unreliable.
- **Auto-apply recommendations** should generally be OFF, or enabled only for narrowly chosen categories with a human in the loop. Left on, Google will add keywords, alter bid strategies, raise budgets, and synthesize ad copy on its own schedule.
- **Default conversion goals** must mirror what the business actually values. Misaligned defaults cause every campaign in the account to optimize toward the wrong outcome.

### Tier 2 — Data integrity and feature reach

- **Tracking template / final URL suffix** should carry the right UTM construction so third-party analytics can attribute traffic.
- **Account-level negative keyword lists** should exist and be maintained — universal waste terms (jobs, careers, free, DIY, salary, etc.) should be blocked centrally instead of being relitigated in every campaign.
- **Linked accounts** should be wired correctly: GA4 always, plus Merchant Center, YouTube, Search Console, and Google Business Profile where applicable.
- **Data Manager** should have first-party data sources configured if the account relies on customer match or offline conversion uploads.

---

## Campaign-Level Checklist

Every campaign needs its own pass. A single misconfigured campaign can quietly waste a large share of total spend, so this is not a sampling exercise — it has to be exhaustive. Detail per setting lives in `references/settings_checklist.md`.

### Tier 1 — Settings that bleed money fast

- **Location-targeting method.** The single most common — and most expensive — misconfiguration in the entire platform. Google defaults to "Presence or interest," which exposes ads to anyone showing interest in the targeted geography regardless of where they actually are. For most local and service businesses, the correct setting is "Presence."
- **Network settings on Search campaigns.** The Display Network toggle on a Search campaign ("Search Network with Display select") will divert budget into placements with sub-1% CTRs and almost no conversions. It needs to be off.
- **Final URL expansion (PMax / Demand Gen).** Without URL exclusions, PMax can decide that the careers page, blog, or About page deserves traffic. URL exclusions are non-optional.

### Tier 2 — Performance leakage

- **Language targeting.** Should match what's actually on the landing pages and what the target audience's device language is set to. Note that this signal is the user's device language, not the language of their query.
- **Ad rotation.** Default to "Optimize: prefer best performing." Switch to "Do not optimize" only during a structured A/B test, and remember to switch it back when the test concludes.
- **Ad schedule / dayparting.** Calls businesses are especially exposed here — spending during hours when nobody picks up the phone is pure waste.
- **Device targeting.** Mobile is often a high-traffic, low-conversion segment, particularly in B2B or high-consideration purchases. A -30% to -50% mobile adjustment is common in those verticals.
- **IP exclusions.** Less impactful than they used to be (dynamic IPs and VPNs), but office IPs and known-bad sources should still be excluded. Cap is 500 per campaign.
- **PMax brand restrictions.** Without brand exclusions, PMax happily claims credit for branded conversions that would otherwise have flowed through cheaper branded Search campaigns. Considered essential since the feature became available in 2023.

---

## Conversion Tracking Audit

Conversion data is the foundation under everything: Smart Bidding, ROAS reporting, dashboards, optimizer recommendations. Get this wrong and every downstream decision is corrupted. The full procedure sits in `references/tracking_compliance.md`.

### Per-action verification points

For every conversion action in the account, walk through:

1. **Naming and category** — names should be descriptive enough to disambiguate in reports; the category should match the actual event (purchase vs. lead vs. signup vs. pageview). Generic names like "Website conversion" are a smell.
2. **Count setting** — see the dedicated section below; this is the highest-frequency error.
3. **Attribution model** — Data-Driven Attribution (DDA) is the default for all new conversion actions from 2025 onward. The older models (First Click, Linear, Time Decay, Position-Based) were auto-migrated to DDA in September 2025. Last Click remains available as an alternative, mostly useful for very low-volume accounts where DDA lacks signal.
4. **Attribution window** — make sure the click-through window aligns with the actual sales cycle. The 30-day default is fine for fast eCommerce but radically too short for long B2B cycles.
5. **Primary vs. secondary** — primary conversions go into the Conversions column and into Smart Bidding; secondary/observation ones stay out of bidding.
6. **Value assignment** — dynamic for eCommerce, static or weighted for leads. No value at all blocks value-based bidding entirely.
7. **Enhanced conversions** — should be on for every account; recovers roughly 5-10% of conversions otherwise lost to cookie restrictions.

### The count-setting trap

The most common conversion error by a wide margin is the wrong count setting:

- "One" counts a single conversion per ad click. Right answer for forms, calls, signups — anywhere a duplicate submission shouldn't multiply the lead count.
- "Every" counts each distinct conversion event. Right answer for purchases and other transactions where every event is a real, separate outcome.

When a lead action is set to "Every," a single person submitting a form three times posts as three conversions. In typical lead-gen accounts this can inflate reported volume by 1.5-3x, make reported CPA look 50-70% better than it really is, and steer Smart Bidding toward users who tend to submit multiple times rather than toward genuinely new leads.

The mirror failure — a purchase action set to "One" — silently undercounts revenue because repeat purchases inside the same click session disappear.

### Attribution window quick reference

| Account type | Click window | View window |
|---|---|---|
| eCommerce, low AOV | 30 days | 1 day |
| eCommerce, high AOV | 60 days | 1-3 days |
| Lead gen, short cycle | 30 days | 1 day |
| Lead gen, long cycle (B2B) | 60-90 days | 1 day |
| SaaS with free trial | Trial length + buffer (30-60 days) | 1 day |
| Local services | 30 days | 1 day |

Click windows can be set between 1 and 90 days; view-through between 1 and 30 days.

### Primary vs. secondary pitfalls

A common mistake is marking everything Primary. The model then tries to optimize toward a blended stew of pageviews, scroll events, form submits, and purchases all at once — diluting bid pressure toward the highest-value action.

Things that almost always belong in Secondary:

- Micro-events used for behavioral monitoring (scroll, time on page, video plays)
- Duplicate tracking of the same event from two different sources (the Ads tag and a GA4 import, for instance)
- Conversion actions that used to be the goal but are no longer the business focus

---

## Privacy and Consent

Privacy work is no longer something you can defer. It's mandatory for any account serving EEA or UK users, and increasingly material in the United States.

### Consent Mode V2 (EEA / UK requirement)

- **Mandatory date:** July 21, 2025. From that date, Consent Mode V2 is required for any account with EEA or UK traffic.
- **Four signals must be wired through:** `ad_storage`, `analytics_storage`, `ad_user_data`, and `ad_personalization`. Each controls a different surface — cookies for ads, cookies for analytics, sending user data to Google for advertising purposes, and personalization respectively.
- **Two implementation modes:**
  - *Basic.* Tags do not fire at all until consent is granted. All data from non-consenters is lost.
  - *Advanced.* Tags fire cookieless pings even when consent is denied. Google then models the missing conversions and behavior. This typically recovers around 30-50% of the data that would otherwise be gone. Adopt this mode whenever possible — in EEA markets where 30-60% of users routinely deny consent, modeled conversions are the difference between Smart Bidding having signal and flying blind.
- **CMP requirement.** A Consent Management Platform has to be live on the site, collecting the signals and passing them through Google's consent framework. Google maintains a CMP Partner Program list of certified providers; common picks include Cookiebot, OneTrust, Usercentrics, Didomi, and CookieYes.
- **Cost of non-compliance.** Loss of remarketing audiences, loss of conversion tracking, and loss of demographic/interest reporting across all EEA/UK traffic, plus exposure to GDPR fines (theoretically up to 4% of annual global revenue) and the possibility that Google itself restricts account features.

### Verifying consent mode

1. Inspect the Google Tag configuration for consent settings.
2. Confirm all four signals are present.
3. Verify the CMP is actually deployed and firing on the live site.
4. Look in Ads reporting for "Modeled conversions" — their presence is the easiest signal that Advanced Consent Mode is functional.
5. Check the Diagnostics page in Ads for any consent-related warnings.

### Enhanced conversions

Two flavors, both worth enabling:

- **Enhanced Conversions for Web.** Hashes first-party data (email, phone, name, address) at conversion time and sends it to Google for matching against signed-in user data. Recovers about 5-10% of conversions that would otherwise be lost to cookie loss or cross-device journeys. No downside; turn it on for every account.
- **Enhanced Conversions for Leads.** Stores the same hashed identifier at the web conversion, then matches it when offline conversions are uploaded. Required for any lead-gen account that imports CRM data. Without it, offline conversion import has to rely entirely on GCLID matching, which gradually degrades.

### U.S. state privacy

There is no federal U.S. privacy law as of 2026; regulation happens state by state.

| State | Statute | In effect |
|---|---|---|
| California | CPRA | January 2023 |
| Colorado | CPA | July 2023 |
| Virginia | VCDPA | January 2023 |
| Connecticut | CTDPA | July 2023 |
| Indiana | ICDPA | January 2026 |
| Kentucky | KCDPA | January 2026 |
| Rhode Island | RIDPA | January 2026 |

Additional states have laws queued up for 2026-2027 enforcement.

Practical guidance for U.S.-facing accounts:

- These statutes generally do not impose Consent Mode in the way GDPR does, but many do require honoring Global Privacy Control signals and "Do Not Sell" requests.
- Google's Restricted Data Processing mode covers California compliance once activated.
- Privacy policies should reflect what data is collected and how it is used.
- Data retention settings should be aligned with state requirements.
- For accounts with national reach, it is generally cheaper to build the consent infrastructure once now than to retrofit it state by state.

---

## Data Connections

Each link unlocks a specific set of features, and a missing link silently caps what the account can do. The deep version of this section is in `references/data_connections.md`.

### Auto-tagging is the foundation

Before evaluating any individual connection, confirm auto-tagging is ON. When it's off, several things break at once even if other links look healthy:

- GA4 cannot match Ads clicks to its own sessions.
- GA4 ↔ Ads audience sharing fails.
- GA4-imported conversions become unreliable.
- Cross-platform attribution falls apart.

Always check auto-tagging first.

### GA4

- **Why link it:** cross-platform analytics, audience sharing in both directions, importing GA4 events as conversion actions, enhanced measurement (scroll, outbound clicks, site search, video, downloads), richer landing-page analysis.
- **Required for:** every account, regardless of business type.
- **Verification path:** Tools → Data Manager → Google Analytics. Status should be Active, with the correct property ID.
- **Things that go wrong:** wrong property linked (commonly staging or an old UA reference), admin permissions missing on one side, auto-tagging off creating a data mismatch even with the link in place.
- **What breaks if missing:** no audience sharing, no GA4 imports, no joined reporting. Google Ads operates as an island.

### Merchant Center

- **Why link it:** Shopping ads (Standard or Shopping-eligible PMax), product feed data, free product listings, item-level reporting, automatic item updates.
- **Required for:** any eCommerce account or any account running product-based PMax.
- **Verification path:** Tools → Data Manager → Google Merchant Center. Active status with correct Merchant Center ID.
- **Things that go wrong:** suspended Merchant Center accounts, partially disapproved feeds, multiple Merchant Centers creating confusion about which is canonical, mismatched country/currency between the two systems.
- **What breaks if missing:** Shopping and product-based PMax stop serving entirely. No product data anywhere.

### YouTube channel

- **Why link it:** video campaigns (in-stream, bumper, discovery, Shorts), YouTube engagement audiences (viewers, subscribers, likers), the channel as a PMax asset and signal source, video remarketing lists, brand lift studies at sufficient spend.
- **Required for:** any video campaign or any PMax campaign using video assets.
- **Recommended for:** every account, since linking enables audience-building even without active video campaigns.
- **Things that go wrong:** the channel sits under a different Google account from the Ads manager, the wrong channel is linked when several exist, the channel is private/unlisted (restricting some features).
- **What breaks if missing:** no video campaigns, no YouTube engagement audiences, no channel video usage in PMax.

### Search Console

- **Why link it:** Paid & Organic report (organic queries alongside paid), keyword-level organic ranking data for competitive context, organic landing page performance, identification of paid/organic overlap.
- **Required for:** nothing — no campaign type depends on this link.
- **Recommended for:** all accounts. The Paid & Organic report exposes where paid is wasted (organic already ranks well) and where it deserves more investment (organic is weak).
- **Things that go wrong:** domain property vs. URL-prefix property mismatch, ownership gaps, www vs. non-www discrepancies.
- **What breaks if missing:** loss of the Paid & Organic report. No campaign functionality lost.

### Google Business Profile (GBP)

- **Why link it:** location assets in ads (address, phone, map pin), local campaigns and local inventory ads, the Maps channel inside PMax, store-visit conversions at sufficient volume, location-based bid adjustments.
- **Required for:** any local or multi-location business with physical premises.
- **Things that go wrong:** GBP under a different Google account, only some locations linked, suspended or unverified GBP listings, location group not actually created in Ads after linking.
- **What breaks if missing:** no location assets in ads, no Maps channel in PMax, no store-visit conversions. Local businesses lose a major competitive lever.

### CRM / offline conversion import

- **Why link it:** offline conversion import (closed-won sales, revenue, pipeline progression), lead-quality feedback into Smart Bidding, value-based bidding using real revenue numbers, customer match audiences.
- **Required for:** lead-gen accounts where conversions happen offline (calls, demos, enterprise sales cycles).
- **Verification path:** Tools → Conversions for any "Import" type actions; Tools → Data Manager for the CRM connector.
- **Common implementation routes:** native connectors (Salesforce, HubSpot), Zapier/Make automations, Google Ads API uploads, Enhanced Conversions for Leads with hashed-email matching.
- **Things that go wrong:** GCLID not being captured at form submission (the link from click to later conversion is gone), upload delay exceeding the attribution window, value mappings broken, formatting errors on import.
- **What breaks if missing:** Smart Bidding optimizes for form fills, not actual closed business. No quality feedback loop. Value-based bidding becomes impossible. The gap between "lead volume" and "revenue" stays invisible to Google.

### Data Manager / first-party data

- **Why link it:** customer-match audiences (upload customer lists for targeting and exclusion), first-party signal into Smart Bidding, seed data for lookalike / similar audiences, cross-device matching via hashed customer data.
- **Required for:** accounts with usable customer databases — strongly applicable to eCommerce and lead gen.
- **Things that go wrong:** wrong column headers or missing fields on upload, match rate below 30% (a sign of poor data quality), lists that fail to refresh on schedule, privacy policy not updated to reflect the data flow.
- **What breaks if missing:** no customer-match targeting, weaker Smart Bidding signal, no leverage of existing customer data for audience expansion.

### Connection priority by account type

| Connection | All | eCommerce | Lead Gen | Local | SaaS |
|---|---|---|---|---|---|
| GA4 | Required | Required | Required | Required | Required |
| Merchant Center | N/A | Required | N/A | N/A | N/A |
| YouTube | Recommended | Recommended | Recommended | Recommended | Recommended |
| Search Console | Recommended | Recommended | Recommended | Recommended | Recommended |
| GBP | N/A | Optional | Optional | Required | N/A |
| CRM | Optional | Optional | Required | Optional | Required |
| Data Manager | Recommended | Required | Required | Optional | Required |

### Audit output format

When reporting on connection status, a compact format works best:

| Connection | Status | What's at risk if missing |
|---|---|---|
| GA4 | Linked (property GA4-XXXXXXX) | — |
| Merchant Center | Not linked | Shopping campaigns cannot run |
| YouTube | Linked (channel @example) | — |
| Search Console | Not linked | Paid & Organic report unavailable |
| GBP | N/A for this business | — |
| CRM | Not linked | No offline data feeding Smart Bidding |
| Data Manager | Not configured | No Customer Match audiences |

---

## Detailed Reference: Account-Level Settings

Backing detail for each account-level setting. Use during the actual audit to record correct value, what fails when it's wrong, and how to validate it.

### Auto-tagging

- **Where to find it:** Account Settings → Auto-tagging.
- **Correct state:** ON.
- **Mechanism:** appends a `gclid` parameter to landing-page URLs whenever a user clicks an ad.
- **What goes wrong when off:** GA4 cannot stitch ad clicks to web sessions, attribution decays, audience sharing between the two systems collapses, GA4-imported conversions become noisy.
- **Why it's often off:** preference for manual UTM tagging, or temporary disablement during a troubleshooting session that nobody remembered to undo.
- **Fix path:** turn it back on. If parameters get stripped by site redirects, fix the redirects rather than disabling auto-tagging.

### Tracking template and final URL suffix

- **Where to find it:** Account Settings → Tracking.
- **Right shape:** a properly structured suffix using ValueTrack parameters, e.g. `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}`.
- **What to verify:**
  - Suffix is present and uses correct ValueTrack tokens.
  - No double-tagging from both auto-tagging and a manual layer.
  - Any tracking template is not breaking landing pages.
  - Any third-party redirects still work and aren't adding significant latency.
- **Risks:** attribution holes in external analytics, broken landing pages from malformed URLs, redirect-induced bounce rate spikes.

### Auto-apply recommendations

- **Where to find it:** Account Settings → Recommendations → Auto-apply.
- **Default stance:** OFF across the board, or extremely narrow.
- **Categories that are especially risky to leave on:**
  - "Add keywords" — Google can introduce broad-match terms that may be off-strategy.
  - "Adjust bids" — Google may alter bid strategy or targets.
  - "Adjust budgets" — daily budgets can be raised without approval.
  - "Create assets" — auto-generated ad copy bypasses brand review.
  - "Use optimized targeting" — audience targeting can be expanded beyond intended bounds.
- **Risks if left on:** uncontrolled budget growth, irrelevant keywords, strategy changes without review, ad copy that doesn't fit brand voice.
- **How to verify retroactively:** look for "Auto-applied" badges on the Recommendations page, and scan the past 90 days of change history.

### Account-level negative keyword lists

- **Where to find it:** Tools → Shared Library → Negative keyword lists.
- **What to verify:**
  - At least one list exists.
  - Lists are actually applied to the relevant campaigns.
  - Lists are kept fresh (check the last-updated timestamp).
  - Universal waste terms are present where appropriate — jobs, careers, salary, free, DIY, and similar.
- **Risks:** every campaign carries the burden of negative coverage independently, common waste terms keep slipping through, new campaigns launch without any baseline filter.

### Linked accounts

- **Where to find it:** Tools → Data Manager → Data sources (or Admin → Linked accounts).
- **Verification:** each link shows Active. Anything reading "Needs attention" or "Not linked" requires follow-up.
- **For impact details:** see the Data Connections section above and `references/data_connections.md`.

### Conversion goals (account default)

- **Where to find it:** Goals → Conversions → Summary.
- **Verify:**
  - Defaults match business objectives.
  - Primary conversions are flagged Primary.
  - Secondary/observation conversions are flagged Secondary.
  - No duplicate conversion actions tracking the same event.
  - No removed or paused actions still receiving hits.
- **Risks:** Smart Bidding optimizing toward wrong actions, distorted conversion counts in reporting, unreliable cross-campaign comparisons.

---

## Detailed Reference: Campaign-Level Settings

### Location targeting method

- **Where to find it:** Campaign Settings → Locations → Location options.
- **Options:**
  - *Presence:* people physically in or regularly in the targeted locations. Right for most local services and brick-and-mortar businesses.
  - *Presence or interest:* the above plus people who've shown interest from outside.
- **When "Presence or interest" makes sense:** tourism, real estate, relocation services, eCommerce shipping nationally.
- **When "Presence" is mandatory:** local services, restaurants, in-person retail, and anything that cannot serve a customer remotely.
- **Failure mode:** picture a roofing contractor that only services the Phoenix metro. Left on "Presence or interest," the campaign quietly serves impressions to a Boston-based homeowner who once googled roofing prices for an Arizona rental property they were considering. That click can never convert into a paying job.
- **Frequency:** very high — Google's default is "Presence or interest," and many accounts have never changed it.

### Language targeting

- **Where to find it:** Campaign Settings → Languages.
- **Right value:** match what your landing pages are written in and what your audience's devices are set to.
- **Common mistakes:** restricting to English in regions with large non-English populations, or selecting "All languages" while only having one-language landing pages.
- **Note:** this setting reads the user's device/browser language, not the language of the search query itself.

### Network settings

- **Where to find it:** Campaign Settings → Networks.
- **Search campaigns:**
  - *Search Partners:* optional. Evaluate separately — some accounts see good performance here, others see waste.
  - *Display Network:* should be OFF. The "Search Network with Display select" toggle pushes Search budget into low-quality Display placements.
- **Display campaigns:** Display only.
- **Risk:** with Display on inside a Search campaign, anywhere from 10% to 30% of spend can vanish into Display placements with sub-1% CTR and almost no conversions.

### Ad rotation

- **Where to find it:** Campaign Settings → Ad rotation.
- **Options:**
  - *Optimize: prefer best performing ads* — Google's default, right for almost all situations.
  - *Do not optimize: rotate ads indefinitely* — equal rotation, useful only during a structured A/B test that needs even impression distribution.
- **Failure modes:** "Do not optimize" left on past a test gives underperforming creative equal impressions forever; "Optimize" enabled during early testing starves new variants before they hit statistical significance.

### Ad schedule / dayparting

- **Where to find it:** Campaign Settings → Ad schedule.
- **Verify:**
  - Schedule aligns with operating hours, particularly for call-dependent businesses.
  - Bid adjustments reflect high- and low-value time windows.
  - Time zone is set correctly.
  - Weekend vs. weekday performance has actually been analyzed.
- **Risk:** ads running during hours when no one staffs the phones, or equal spend across all 24 hours when 80% of conversions cluster inside business hours.

### Device targeting

- **Where to find it:** Campaign Settings → Devices (bid adjustments).
- **Verify:**
  - Mobile bid adjustment matches actual mobile conversion behavior.
  - Desktop / mobile / tablet performance has been compared.
  - Mobile landing pages are actually good enough to deserve mobile spend.
- **Typical pattern:** in B2B and high-consideration verticals, mobile produces lots of traffic but few conversions. A -30% to -50% mobile adjustment is a common starting point.
- **Risk:** full budget flowing to devices with weak conversion economics.

### IP exclusions

- **Where to find it:** Campaign Settings → Additional settings → IP exclusions.
- **Verify:**
  - Office and internal IPs are excluded so employee activity doesn't pollute the data.
  - Known competitor IPs are excluded where identifiable.
  - Limit: 500 exclusions per campaign.
- **Caveat:** less effective than it once was thanks to dynamic IPs and VPNs, but still worth doing for stable office addresses.

### Dynamic Search Ads

- **Where to find it:** Campaign Settings → Dynamic Search Ads (when enabled).
- **Verify:**
  - A page feed is configured (preferred over "all pages" targeting).
  - URL exclusions cover careers, blog, privacy pages, and other low-conversion destinations.
  - Category targets have been reviewed and refined.
- **Risk:** DSA building headlines from off-topic pages, sending traffic to non-converting URLs, or generating ad copy that drifts off-brand.

### Final URL expansion (PMax and Demand Gen)

- **Where to find it:** Campaign Settings → Final URL expansion.
- **Verify:**
  - URL exclusions are configured for any page that shouldn't receive traffic.
  - If expansion is off, asset-group URLs are correctly set.
  - The actual list of landing-page URLs in reporting matches expectations.
- **Risk:** PMax routing traffic to blog posts, About pages, careers pages, etc. One of the most common PMax-specific misconfigurations.

### PMax brand restrictions

- **Where to find it:** Campaign Settings → Brand restrictions (PMax only).
- **Verify:**
  - Brand exclusion list keeps PMax away from branded Search territory.
  - Competitor brands are excluded if not intentionally targeted.
- **Risk:** PMax taking credit for branded conversions that would otherwise have come through a much cheaper branded Search campaign — inflating PMax ROAS while raising total account cost.
- **Note:** the feature shipped in 2023 and is now considered essential for any account running PMax alongside branded Search.

---

## Detailed Reference: Tracking and Compliance

For each conversion action, pull the configuration via the Ads API (`conversion_action` resource) and verify against the checks below.

### Name and category

- Name should follow a consistent convention and be descriptive enough to be useful in reports. A pattern like `Source - Action Type - Destination` works well: "Website - Form Submit - Contact Us" or "Website - Purchase - Shopify."
- Category should match the actual event (purchase, lead, signup, pageview, etc.).
- Smell: generic names like "Website conversion" that can't be distinguished from each other in reporting.

### Count setting

- **"One"** for leads, forms, calls, signups — anywhere multiple submissions from the same user shouldn't multiply the lead count.
- **"Every"** for purchases, transactions, bookings — anywhere each distinct event is a real outcome.

Consequences when this is wrong:

- *Lead action on "Every":* one user submitting three times becomes three conversions. Volume inflates by 1.5-3x in typical accounts; CPA looks 50-70% better than reality; Smart Bidding learns to chase users who tend to submit repeatedly.
- *Purchase action on "One":* repeat purchases inside the same click session vanish; revenue and conversion volume are both underreported.

### Attribution model

- DDA is the default since 2025 and is the recommended choice for nearly every account regardless of size.
- Last Click remains selectable; useful as a comparison baseline or for accounts with so little volume that DDA doesn't have enough signal.
- The deprecated models — First Click, Linear, Time Decay, Position-Based — were auto-migrated to DDA in September 2025. If a UI somewhere still shows one of those names, the migration already happened; verify the live setting is DDA. No further action unless someone specifically wants Last Click.

### Attribution windows

- Click window: 1-90 days, default 30.
- View window: 1-30 days, default 1.
- Match to the actual sales cycle. The 30-day default badly underserves long B2B cycles — a conversion on day 45 is invisible to attribution.

### Primary vs. secondary

- Primary actions go into Conversions and into Smart Bidding.
- Secondary / observation actions stay out of bidding and only contribute to All Conversions.

Things that belong in Secondary:

- Micro-events used purely for monitoring (pageviews, scroll, time on site).
- Duplicate tracking of the same event from multiple sources (the Ads tag plus a GA4 import of the same thing).
- Legacy actions that used to matter but no longer reflect the business goal.

Failure mode: marking everything Primary, which causes Smart Bidding to optimize for a soup of pageviews, form fills, and purchases simultaneously, diluting bid pressure toward the highest-value action.

### Value assignment

- Dynamic — required for eCommerce. Order value is passed from the site (Shopify, WooCommerce, etc.) and enables tROAS bidding.
- Static — for lead gen, where each lead carries an estimated value based on close rate and average deal size. Enables weighted value-based bidding.
- None — disables value-based bidding entirely; the account is limited to tCPA or max-conversions strategies.

### Consent Mode V2 — full details

- **Effective:** July 21, 2025; not optional for accounts with EEA or UK traffic.
- **Signals:** `ad_storage` (cookies for advertising), `analytics_storage` (cookies for analytics), `ad_user_data` (sending user data to Google for advertising), `ad_personalization` (personalization).
- **Modes:**
  - *Basic:* tags suppressed entirely until consent is granted.
  - *Advanced:* cookieless pings fire even on denial, feeding Google's conversion modeling. Recovers about 30-50% of otherwise-lost data. Recommended in essentially all cases — EEA denial rates of 30-60% mean modeled conversions are the only thing keeping Smart Bidding informed.
- **CMP:** required, must integrate with Google's consent framework. Certified CMPs include Cookiebot, OneTrust, Usercentrics, Didomi, and CookieYes.

### Verifying Consent Mode V2

1. Check the Google Tag configuration for consent settings.
2. Confirm all four signals are wired in.
3. Confirm the CMP is live on the site.
4. Look for "Modeled conversions" in Ads reporting — their presence confirms Advanced mode is working.
5. Watch the Diagnostics page for consent-related warnings.

### Non-compliance consequences

- Remarketing audiences disappear for EEA/UK users.
- Conversions stop being recorded for that traffic.
- Demographic and interest reports go dark for that region.
- GDPR exposure can theoretically reach 4% of annual global revenue.
- Google may itself restrict features on non-compliant accounts.

### Enhanced conversions — implementation

- **Web:** implement via gtag.js (automatic field detection), Google Tag Manager (manual or automatic variable mapping), or server-side via the Ads API. Recommended universally.
- **Leads:** the hashed identifier (email or phone) must be captured at the web conversion and then included again when uploading offline conversions. Strongly improves match rate, since otherwise offline import depends entirely on GCLID matching, which decays over time.

### U.S. state privacy — verification steps

1. Verify Restricted Data Processing is enabled for California users.
2. Confirm Global Privacy Control signals are being respected.
3. Review the privacy policy against applicable state requirements.
4. Confirm data retention settings line up with each state's rules.

---

## Reference Files Loaded by This Skill

| File | Path | Contents |
|---|---|---|
| Settings Checklist | `references/settings_checklist.md` | Account-level and campaign-level settings, correct values, failure modes, verification steps |
| Tracking & Compliance | `references/tracking_compliance.md` | Conversion action audit, Consent Mode V2, enhanced conversions, U.S. state privacy |
| Data Connections | `references/data_connections.md` | Each connection's purpose, verification path, common failure modes |

The `pancake_inspect_settings` action skill loads this methodology first, then pulls the relevant reference file as it works through each step of the audit.
