---
name: pancake_shopping_playbook
description: Universal methodology for analyzing Shopping campaigns in Google Ads, including Standard Shopping and Shopping-eligible PMax. Covers shopping structure decisions (Standard vs PMax vs hybrid), product feed optimization, product tier analysis, and competitive positioning. This is a reference skill loaded by pancake_evaluate_shopping. Not an action skill.
triggers:
  - "shopping methodology"
  - "shopping analysis framework"
  - "shopping campaign framework"
  - "product feed methodology"
---

# Shopping Methodology

## Role of This Skill

This file is the analytical backbone the `pancake_evaluate_shopping` action skill consults whenever it audits a Shopping setup. It does not execute anything itself — it carries the frameworks, thresholds, and decision logic. The action skill handles pulling the data and producing the report; this skill answers questions like "how should structure choices be made?", "what makes a feed competitive?", and "how should products be classified by performance?"

---

## Where Shopping Performance Actually Comes From

Shopping is unusual inside Google Ads. There are no keywords. The product feed itself is the targeting signal — what's in the title, what category the product carries, what the image looks like, what the price is relative to competitors. Three levers determine outcomes:

1. **Feed quality.** What does Google see when it inspects each product?
2. **Structure.** Which campaign type each product runs through, and how products are grouped inside it.
3. **Tier-aware management.** Treating winners, hidden gems, dead weight, and active losers as four distinct populations rather than one uniform catalog.

This methodology is built around those three.

---

## Structure Decisions

There are four configurations a Shopping operation can take. The right one depends on conversion volume, feed quality, how much manual control is needed, what creative assets exist, and how big the budget is relative to the catalog.

### The Four Structures at a Glance

| Structure | When it fits | Main trade-off |
|---|---|---|
| Standard Shopping | The account requires per-product bid control | Most control, most manual upkeep |
| Feed-Only PMax | You want broad reach without spinning up creative | Reach in exchange for transparency |
| Full PMax (with assets) | A real creative library exists and you want end-to-end coverage | Multi-channel automation, with channel-level visibility traded away |
| Hybrid (Standard + PMax) | A subset of the catalog deserves manual control while the rest can run on automation | Strengths of both, at the cost of running two campaigns instead of one |

### Standard Shopping in detail

The classic structure: products grouped manually, bids set product by product (or via campaign-level Smart Bidding), and full visibility into search queries.

Strengths:
- Complete authority over bids at the individual product level.
- The search term report exposes every query an ad actually served against.
- High / Medium / Low campaign priority settings make it possible to route specific queries between campaigns.
- Product groups can be split as finely as you need.
- Tolerates any feed quality, although a cleaner feed still drives better outcomes.

Weaknesses:
- Bids must be managed by hand, or by campaign-level Smart Bidding (there is no per-product Smart Bidding here).
- Inventory is confined to Shopping placements — Search, Display, and YouTube are out.
- The product group tree needs upkeep as the catalog turns over.
- Automation around audience expansion and creative generation is absent.

Best fit: teams that want the steering wheel in their hands, catalogs that genuinely require different bid logic by product, or businesses where it really matters to see every search term.

### Feed-Only PMax in detail

PMax without significant creative assets — the product feed itself does most of the targeting work.

Strengths:
- Reach extends beyond Shopping to Search, Display, and YouTube placements.
- Less asset maintenance than Full PMax, since the feed is the primary creative.
- Google automates audience and bid decisions.
- Lighter management burden than Standard Shopping.

Weaknesses:
- Channel-level spend is opaque (you see totals, not where the money landed).
- Product-level bid control is gone.
- Search term visibility is partial — "insights" only, not a full report.
- Feed quality matters even more than usual because the feed is doing all the heavy lifting.
- No way to direct specific products toward specific channels.

Best fit: teams too small to babysit individual products, mid-sized catalogs that are well-fed, or operators kicking the tires on automation before sinking money into a full creative library.

### Full PMax in detail

PMax with a real creative arsenal — multiple headlines, descriptions, images, and video assets per asset group.

Strengths:
- Maximum reach across every Google surface.
- Audience discovery and expansion handled automatically.
- Creative optimization across formats.
- Cross-channel attribution and optimization.
- Asset groups give a thematic organization to the catalog.

Weaknesses:
- Channel-level spend remains opaque without scripts.
- Requires real creative investment — headlines, descriptions, images, video.
- The algorithm needs enough conversion volume to learn (30+/month is a healthy floor).
- Less control over which products show against which queries.
- Search term visibility is limited.

Best fit: brands that own a deep creative library, accounts pulling conversion volume the algorithm can actually learn from, and operators who want one campaign type to cover top, middle, and bottom of funnel.

### Hybrid in detail

Standard Shopping for the products that need control plus PMax for the rest of the catalog. The configuration that lets you eat your cake and have it.

Strengths:
- The top tier of the catalog stays under hand-set bids.
- Everything else gets PMax's wider distribution.
- Priority products keep full search-term visibility.
- Internal cannibalization is structurally blocked — when a product lives in both, the Standard Shopping ad wins auction entry (more below).
- When the budget supports it, the trade-off between control and automation lands in a healthy middle.

Weaknesses:
- Two campaign types to maintain.
- The two campaigns can compete for budget if not handled deliberately.
- Requires a clear product-segmentation strategy.
- Reporting has to be aggregated across both to evaluate holistically.

Best fit: catalogs whose products fall into clearly different performance tiers, and inventories large enough that hand-managing each SKU one at a time isn't realistic.

### Auction Priority — the rule that makes Hybrid work

Google's auction gives Standard Shopping campaigns priority over PMax for any product present in both. This isn't bid-based; it's structural.

- Whenever a product overlaps, the Standard Shopping ad gets into the auction first.
- PMax can only serve that product if Standard Shopping has dropped out — budget ran dry, bid wasn't competitive, or the product is excluded from its listing group.
- The Standard Shopping bid does *not* have to clear the PMax bid; the priority is positional, not numeric.
- If Standard Shopping burns through its budget partway through the day, PMax catches the remaining traffic on those products until the day rolls over.

This is the structural fact that makes Hybrid coherent: you can carve out priority products without worrying about internal cannibalization.

### Decision Tree

Five questions, answered in order:

**1. What's monthly conversion volume?**

| Monthly conversions | Structures available |
|---|---|
| Under 15 | Standard Shopping only (PMax can't learn) |
| 15-30 | Standard Shopping or Feed-Only PMax |
| 30-100 | All four structures viable |
| 100+ | All four; Hybrid or Full PMax usually optimal |

**2. What's feed quality?**

| Quality | Implication |
|---|---|
| Poor — many disapprovals, weak titles, GTINs absent | Limit to Standard Shopping until the feed is repaired |
| Adequate — most products approved, titles workable | Standard Shopping or Feed-Only PMax |
| Good — titles optimized, GTINs in place, custom labels deployed | Any of the four structures becomes viable |

**3. How much product-level bid control is needed?**

- For specific high-value products: Hybrid.
- For the entire catalog: Standard Shopping.
- Not needed: PMax (Feed-Only or Full, depending on assets).

**4. What creative assets exist?**

| Assets | Recommendation |
|---|---|
| Just the product feed | Feed-Only PMax or Standard Shopping |
| Feed plus basic images and text | Feed-Only PMax viable |
| Feed plus rich images, video, multiple text variants | Full PMax viable |

**5. What's the budget-to-catalog ratio?**

| Daily budget per product | Recommendation |
|---|---|
| Thin (< $0.50/product/day) | Stay in Standard Shopping with a narrow product-group scope, or run a Feed-Only PMax on a curated subset of the catalog |
| Moderate ($0.50-$2.00/product/day) | Any of the four structures is workable, but don't split a modest budget across both sides of a Hybrid |
| Generous (> $2.00/product/day) | Hybrid is usually the strongest play |

### Migration Paths

**Standard Shopping → PMax (consolidating).** A reasonable move when Standard Shopping growth has flattened, the team is bandwidth-constrained, and conversion volume is healthy enough to feed PMax's learning phase.

1. Walk through the existing Standard Shopping campaigns and read performance product group by product group.
2. Flag the subset of products that look like they'd benefit from wider distribution.
3. Stand up a PMax campaign pointed at the same feed.
4. Let both campaigns run side by side for four to six weeks — because Standard has auction priority, nothing breaks while you watch.
5. As PMax demonstrates parity (or better), tilt the budget over to it incrementally.
6. Don't retire the Standard Shopping campaign until PMax has carried results through one full business cycle.

**PMax → Hybrid (adding control).** Worth doing when certain products are underperforming inside PMax, when you need transparent search-term data for priority items, or when you want explicit bid leverage on the top performers.

1. Pick out the products that actually need the manual layer — usually the Heroes from a tier classification.
2. Build a Standard Shopping campaign that contains only those products.
3. Auction priority kicks in automatically; no toggle to flip.
4. Let four to six weeks elapse and verify that Standard Shopping is genuinely beating PMax on that product set.
5. Cycle the membership of this campaign as the tiering shifts over time.

**Hybrid rebalancing (ongoing).** Run on a quarterly rhythm as the tier classifications drift.

1. Re-run the tier classification with data drawn from both campaigns.
2. Move newly promoted Heroes into Standard Shopping.
3. Send any product that has fallen out of Hero status back to PMax.
4. New products begin life in PMax and only graduate into Standard Shopping after earning Hero status.

### When to Restructure

A structure that fit yesterday may not fit today. Evaluate the structure when any of these triggers occur:

| Trigger | What to re-evaluate |
|---|---|
| Monthly conversion volume jumps a band — e.g., past 30/month, or under 15/month | Whether the chosen structure still matches the new volume tier |
| 50%+ of the catalog has been added or removed | Product groups need rebuilding regardless, so it's a natural moment to revisit structure |
| Budget moves by more than 50% in either direction | The budget-to-catalog math changes which structures are realistic |
| Performance has been flat for eight weeks or more despite tuning | Structure itself may be the ceiling |
| Fresh creative assets arrive (video, lifestyle photography) | Full PMax may now be on the table |
| Team headcount or bandwidth shifts | The amount of complexity the team can absorb has changed |

Important caveat: do not restructure on less than four weeks of data. Shopping campaigns need time for product-level learning, especially after feed changes.

### Hybrid: Campaign Structure Options

Three sensible ways to draw the line between what goes in Standard Shopping versus PMax:

**A. Tier-based split (default recommendation).** The Heroes plus the higher-priority Sidekicks go into Standard Shopping. Everything else goes into PMax.

- Standard Shopping side: the products that genuinely warrant individual bid attention — typically the top 15-30% of the catalog. Product groups split fine, bidding via Manual CPC or target ROAS with per-product overrides where needed.
- PMax side: the remainder — Sidekicks still being evaluated, new arrivals, the long tail. Asset groups can be cut by category or thematic angle, and run either feed-only or with creative depending on what the team has on hand.

**B. Tested vs. untested split.** Standard Shopping holds products with a confirmed performance record. Everything else lives in PMax as the trial environment.

- Standard Shopping: products with 30+ days of data, confirmed as Heroes or Sidekicks.
- PMax: new arrivals, restocks, anything without sufficient history. Promote a product into Standard Shopping after it has earned its place on results.

**C. Category-based split.** The high-value categories sit inside Standard Shopping, while accessory and lower-value categories sit in PMax.

- Standard Shopping: the headline product lines — top AOV, top margin.
- PMax: add-on items, accessories, and anything else with thinner AOV.

This split fits when the categories have genuinely different unit economics from each other.

### Hybrid: Preventing Overlap Waste

Auction priority already prevents internal cannibalization, but PMax efficiency improves if Standard Shopping products are explicitly excluded from PMax — focusing PMax budget on products that actually need its reach.

How to do it:
- Inside PMax, add listing-group exclusions for any product that's already covered by a Standard Shopping campaign.
- Or, in the feed itself, tag those products with a custom label like `standard_shopping` and then exclude that label from the PMax listing groups.

When you should *not* exclude:
- If Standard Shopping reliably burns through its budget before end of day, keeping those products in PMax as well gives you a safety net for the remaining hours.
- If you actively want PMax to serve those specific products onto the non-Shopping surfaces — Display, YouTube — leave them in.

### Hybrid: Budget Allocation

Starting point — split based on historical performance:

| Campaign | Share of total Shopping budget | Why |
|---|---|---|
| Standard Shopping | 40-60% | Heroes and Sidekicks absorb the bulk of the efficient spend |
| PMax | 40-60% | Funds the rest of the catalog and the cross-channel reach |

Important rule: the combined hybrid budget has to be larger than what either structure would consume standalone. PMax needs headroom for non-Shopping surfaces, and Standard Shopping needs enough cushion that its priority products don't go dark before evening.

Re-review cadence: every two weeks for the first two months, then monthly.

Push more budget to Standard Shopping when:
- Standard Shopping is bleeding impression share to budget (Lost IS Budget > 20%).
- For overlapping products, ROAS in Standard Shopping is outperforming ROAS in PMax.
- The Hero set isn't getting full impression coverage.

Push more budget to PMax when:
- Standard Shopping is sitting on unused budget (Lost IS Budget near 0%, IS above 80%).
- PMax is producing incremental conversions on the non-Shopping surfaces.
- New product categories are scaling inside PMax.

### Comparing Standard Shopping and PMax for the Same Products

When the two coexist, comparing them apples-to-apples is non-trivial. A working comparison table:

| Metric | Standard Shopping | PMax | What to watch for |
|---|---|---|---|
| CPC | Usually lower | Usually higher | PMax buys across multiple surfaces, which pushes its blended CPC up |
| Conversion rate | Comparable head-to-head | Comparable head-to-head | Should land in the same range on the Shopping surface itself |
| ROAS | Comparable head-to-head | Often looks higher than it is | Cross-channel assist credit can flatter PMax's number |
| Impression share | Direct, transparent number | Estimated / opaque | Trust the Standard Shopping IS more than PMax's reported value |
| Search terms | Every query visible | Partial visibility only | Use Standard Shopping when full query data matters |
| CPA | Comparable head-to-head | Comparable head-to-head | Normalize for attribution before reading the difference |

**Attribution caveat.** PMax's reported ROAS and CPA frequently look stronger than they really are. The reason is that conversions touched along the way by a Display impression or a YouTube view get attributed back to PMax — even when the actual click that closed the sale was on the Shopping surface. Where possible, run the comparison on a last-click basis to strip out the inflation.

### When to Collapse Hybrid Back to a Single Structure

Collapse back to Standard Shopping when:
- PMax isn't generating any conversions that Standard Shopping wouldn't have captured on its own.
- Spend going to PMax's non-Shopping surfaces (Display, YouTube) is failing to convert.
- The business has hard transparency or control requirements — tight margins, compliance constraints.
- Conversion volume inside PMax itself has fallen under 15/month, below its learning floor.

Collapse to PMax when:
- Over the same set of products, PMax is reliably matching or beating Standard Shopping's results.
- Granular Standard Shopping upkeep is no longer something the team can sustain.
- The non-Shopping PMax surfaces are pulling their weight with incremental conversions.
- The account is in fast growth mode and the automation premium is now more valuable than the control premium.

Stay in Hybrid when:
- The same products clearly behave differently depending on which structure they're in.
- Top performers benefit from the bid control Standard Shopping provides, while the long tail picks up reach from PMax.
- The hybrid is still inside its evaluation window (give it 60+ days of clean data before pulling the plug).
- Both campaigns can be funded without one starving the other.

### Hybrid Health Checks (monthly)

| Check | Healthy | Warning |
|---|---|---|
| Hero IS inside Standard Shopping | Above 60% | Below 40% (signals a bid or budget issue) |
| Share of PMax spend hitting the Shopping surface (for eCommerce) | 50-80% | Under 30% (money draining into lower-value placements) |
| How much overlap exists between the two campaigns | Each product clearly assigned to one | Same products contesting auctions on both sides |
| Total Shopping ROAS vs. the pre-hybrid number | Holding or improving | Worse than baseline after 60 days |
| Time required to keep up with management | Sustainable for the team | Outstripping team capacity |
| Spend utilization across both campaigns | Both are spending fully | One campaign is chronically short of its budget |

If three or more rows show up on the warning side, take that as the cue to evaluate folding back to a single structure.

---

## Product Feed Optimization

Because the feed is the targeting mechanism, feed quality directly determines which queries trigger ads, which products show, and how competitively those products show up. The five pillars below are what separates a feed that wins auctions from one that doesn't.

### Five Pillars of Feed Quality

1. **Title.** Composed keyword-first. The opening 70 characters carry the bulk of the matching weight. Wording should reflect how real shoppers phrase their queries.
2. **Images.** Product shots in high resolution on a clean white background. Lifestyle photography is a supplement, never the lead. No watermarks, promo overlays, or text laid on top.
3. **GTIN, MPN, brand.** Filling these identifier fields measurably improves matching quality and opens up additional placement eligibility.
4. **Custom labels.** A deliberate use of `custom_label_0` through `custom_label_4` to encode margin band, seasonality, performance tier, price band, and lifecycle stage.
5. **Errors.** Work disapprovals first (they're blocking revenue outright), then warnings (which dent performance), then suggestions.

### Title Optimization

Titles drive matching. The ordering convention that performs best:

**[Brand] + [Product Type] + [Key Attribute] + [Size / Color / Variant]**

Worked examples:
- "Adidas Ultraboost 22 Running Shoes Women's Core Black Size 8"
- "Le Creuset Signature Round Dutch Oven 5.5-Quart Cerise Red"
- "Arc'teryx Atom LT Insulated Jacket Men's Large Graphite"

Rules:
- Maximum 150 characters; first 70 are most visible in the actual Shopping ad rendering.
- Front-load important keywords. Both users and Google's matching system give the most weight to the beginning of the string.
- Use the words users actually search. If queries say "4 person," don't write "sleeps four."
- Avoid ALL CAPS, exclamation marks, and promotional language ("BEST DEAL," "FREE SHIPPING").
- Include differentiators: size, color, material, model number, pack quantity — anything that distinguishes this product from a similar one.
- Keep the title closely aligned with the landing-page title. Big mismatches trigger disapprovals.

Common title problems:

| Problem | Example | Fix |
|---|---|---|
| Default manufacturer text | "SKU-12345-BLK" | Replace with a descriptive, keyword-rich title |
| Brand missing | "Running Shoes Men's Black" | Lead with the brand |
| Variant info missing | "Adidas Ultraboost 22" | Append size, color, gender |
| Keyword stuffing | "Adidas Shoes Running Shoes Top Adidas Running Shoes" | Each term once, in natural order |
| Too generic | "Men's Shoes" | Add brand, model, key attributes |

### Image Requirements

**Primary image:**
- At least 800x800 pixels; 1200x1200 or higher is the better target.
- A white or pale-neutral background — required for most Shopping placements.
- Just the product. No overlay text, no logos, no badges, no border treatments.
- The product itself should occupy 75-90% of the image area.
- Crisp focus, even lighting, accurate color. No artifacts, no softness, no blur.

**Additional images:**
- Lifestyle / in-use shots.
- Multiple angles (front, back, side, detail).
- Scale reference when relevant.
- Variant-specific images (each color gets its own).

Common image problems:

| Issue | Impact | Resolution |
|---|---|---|
| Watermarks or overlaid logos | Disapproval or reduced impressions | Use clean product images |
| Low resolution | Lower ad rank, poor mobile rendering | Re-shoot or source higher-res |
| Promotional text on image | Policy violation, potential disapproval | Strip all text overlays |
| Generic stock photo | Lower CTR | Use actual product photography |
| Wrong product shown | Disapproval, wasted spend | Match image to the specific variant |

### Identifiers: GTIN, MPN, Brand

**GTIN (UPC, EAN, JAN, ISBN).**
- A valid GTIN measurably tightens how well Google matches your product to queries.
- Products carrying one unlock more placements and ad formats than those without.
- The absence of a GTIN can cut a product out of certain Shopping placements entirely.
- Google leans on GTINs to verify a product is what it claims to be and to map it to its own master catalog.
- For products that legitimately don't have one — custom builds, handmade items, vintage — set `identifier_exists` to FALSE.

**MPN (Manufacturer Part Number).**
- Required when GTIN is unavailable.
- Must be the actual manufacturer number, not an internal SKU.
- Helps Google identify the specific product.

**Brand attribute.**
- Must reflect the actual product brand, not the retailer's brand.
- For unbranded products, use the store brand.
- Inconsistent casing or naming (e.g., "Adidas" vs. "ADIDAS" vs. "adidas") creates matching problems.

Completeness scoring:

| Attribute | Quality weight | Cost of missing |
|---|---|---|
| GTIN | High | Reduced placement eligibility, weaker matching |
| Brand | High | Poor categorization, weaker matching |
| MPN | Medium | Weaker matching when GTIN is absent |
| Product type | Medium | Weaker contextual matching |
| Google product category | Medium | Less precise auction entry |

### Custom Labels (custom_label_0 through custom_label_4)

These give the feed five extra dimensions that don't exist in standard attributes. They're how a campaign structure can be aligned with how the business actually thinks about its products.

A common mapping:

| Slot | Strategy | Example values | What it enables |
|---|---|---|---|
| 0 | Margin tier | high_margin, medium_margin, low_margin | Steer more bid into the higher-margin SKUs |
| 1 | Seasonality | spring, summer, fall, winter, evergreen | Turning seasonal campaigns on and off cleanly |
| 2 | Performance tier | hero, sidekick, zombie, villain | Splitting campaigns by tier |
| 3 | Price band | under_25, 25_to_50, 50_to_100, over_100 | Bidding adjusted to AOV bands |
| 4 | Lifecycle | new_arrival, core, clearance, discontinued | Allocating bid and budget by where the product is in its lifecycle |

Practical guidance:
- Refresh custom labels at least monthly — particularly performance-tier labels.
- Use a consistent convention (lowercase, underscores, no special characters).
- Document the slot-to-strategy mapping; whoever inherits the account will need it.
- Automate label updates through the feed management system, since they flow from the feed itself.

### Supplemental Feeds

A supplemental feed is the right tool when you need to:
- Layer in attributes the main feed doesn't already include (custom labels, sale prices).
- Replace specific values from the main feed without going back and editing the source — for example, overriding a bad title or swapping an image.
- Push in transient data such as promo pricing or seasonal labels.
- Iterate on changes without disturbing the production feed.

Setup:
1. Merchant Center → Feeds → Supplemental feed.
2. Upload a spreadsheet or connect a data source.
3. Map the `id` column to the primary feed's product IDs.
4. Include only the columns you want to add or override.

Typical uses:

| Use case | Columns |
|---|---|
| Add custom labels | id, custom_label_0..4 |
| Title optimization | id, title |
| Add sale pricing | id, sale_price, sale_price_effective_date |
| Correct categories | id, google_product_category |

### Feed Rules

Feed rules transform the feed during processing without touching the source. Use them for bulk logic.

Feed rules vs. supplemental feeds, decision matrix:

| Scenario | Feed rule | Supplemental feed |
|---|---|---|
| Bulk transformation of existing data | Yes | No |
| Adding entirely new attributes | No | Yes |
| Conditional logic (if X then Y) | Yes | No |
| Per-product specific overrides | No | Yes |
| Temporary, easy-to-remove changes | No | Yes |

Common feed rules:
- Title prefix / suffix (prepend brand, append size).
- Minimum advertised price enforcement.
- Availability mapping (your internal stock statuses → Google's expected values).
- Category assignment (product type → Google product category).

### Error Resolution Priority

1. **Critical (disapproved):** the product is completely blocked from serving — fix today.
2. **Warning (demoted):** the product still serves, but in a weakened position — get it cleaned up inside the same week.
3. **Suggestion (optimization opportunity):** queue it for the next routine maintenance pass.

Common errors and how to handle them:

| Error | Severity | Likely cause | Resolution |
|---|---|---|---|
| Missing required attributes | Critical | Incomplete feed mapping | Add the missing fields at the source |
| Image too small | Critical | Low-res product photos | Source higher-res images |
| Price mismatch (feed vs. landing page) | Critical | Stale feed data or dynamic pricing | Fix update frequency or price extraction |
| Landing page 404 | Critical | Discontinued products still in feed | Remove from feed or update URLs |
| Missing GTIN | Warning | Not sourced from manufacturer | Add GTINs or set identifier_exists = FALSE |
| Generic image | Warning | Stock or category image | Replace with real product photography |
| Title quality | Suggestion | Thin or default titles | Apply title rules above |
| Missing product type | Suggestion | Not mapped in feed | Add product type taxonomy |

### Feed Quality Score (0-100)

Composite score across weighted factors:

| Factor | Weight | Scoring basis |
|---|---|---|
| Title optimization | 25% | % of products with keyword-optimized titles (not manufacturer defaults) |
| Image quality | 20% | % of products with compliant, high-res primary images |
| GTIN coverage | 15% | % of applicable products with valid GTINs |
| Attribute completeness | 15% | % of products with all recommended attributes filled |
| Error rate | 15% | Inverse of disapproval rate (0 errors = 15 points, 10%+ errors = 0 points) |
| Custom label usage | 10% | Points for strategic label implementation (0 labels = 0, 3+ labels = full points) |

Interpretation bands:
- **80-100:** a strong feed; the remaining work is incremental tuning.
- **60-79:** a workable feed; real upside is still on the table.
- **40-59:** a weak feed; clean it up before changing campaign structure.
- **Below 40:** the feed has critical problems; the fundamentals need attention before any meaningful Shopping performance is realistic.

---

## Product Tier Classification

Every product (or product group, in large catalogs) lands in one of four tiers. The tier dictates what action to take.

### The Four Tiers

| Tier | Definition | Action stance |
|---|---|---|
| Heroes | High volume + good efficiency | Protect budget, raise bids, ensure full visibility |
| Sidekicks | Low volume + good efficiency | Increase visibility via bids, feed work, dedicated campaigns |
| Zombies | Spend + zero or near-zero conversions | Reduce bids, improve listing, or exclude |
| Villains | Spend + negative efficiency | Pause, fix fundamentals, or exclude |

### Heroes — high volume, good efficiency

The engine of the account. Typically 10-20% of SKUs that produce 60-80% of revenue.

Characteristics:
- Above-average conversion volume.
- Above-average ROAS or below-average CPA.

Actions:
- Defend the budget so these products never hit a midday wall.
- Push bids up to chase more impression share.
- Where it's worth the operational effort, give them a campaign of their own for cleaner budget separation.
- Treat the feed entries as showcase work — best titles, best images, no missing attributes.
- Keep a weekly pulse on impression share, CPC drift, and conversion-rate movement.

### Sidekicks — low volume, good efficiency

Hidden opportunities. They convert well when they get traffic; they just aren't getting much.

Characteristics:
- Below-average conversion volume.
- Above-average ROAS or below-average CPA.
- Often buried inside large product groups, or losing IS to Heroes.

Actions:
- Bid them up, tighten the feed entries, and break them out into their own product groups.
- Work out why volume is thin: a bid problem (look at IS), a match problem (look at search terms), or a title problem (does the title use the words shoppers actually type)?
- When these products live only inside PMax today, putting them into a Standard Shopping campaign hands you the bid control to push them.
- Try a promotional pulse — a short bid lift or a sale price — to see whether the upside is really there.

### Zombies — spend, no conversions

Dead weight. Not actively harmful, but consuming budget without producing.

Characteristics:
- Spend above the maturity-calibrated minimum threshold.
- No conversions at all, or so few that the count is indistinguishable from random chance.
- Often the majority of products in a large catalog.

Actions:
- Find the cause: is it the feed (weak title, off-model image, missing GTIN), the price (uncompetitive), the audience (queries that aren't a fit), or the landing experience (heavy bounce)?
- Commit to a timeline — feed and pricing fixes within 30 days, deeper changes like landing page or positioning within 60.
- While the diagnosis is running, drop bids to the floor you can defend.
- If the timeline closes without movement, retire the product from active campaigns or relocate it into a low-priority product group.

### Villains — spend with negative efficiency

The worst tier. They consume budget AND convert at unsustainable economics. Worse than Zombies because they generate just enough activity to create a false sense of progress.

Characteristics:
- Above-average cost.
- Below-average ROAS or above-average CPA, by a meaningful margin.
- They may have conversions, but cost per conversion isn't viable.

Actions:
- Stop the bleed first — pause or exclude immediately.
- Then investigate: pricing, channel fit, landing page experience, query mix.
- Fix or remove: when a fix looks plausible (price adjustment, landing page improvement, additional negatives), implement it and retest. When it doesn't, exclude for good.
- Inspect the search-term report — Villains tend to attract broad, expensive queries, and the right set of negatives is sometimes enough to flip one back into a Sidekick.

### Classification Method

**All thresholds are relative to the account itself**, not absolute numbers. This keeps the framework usable across accounts of wildly different scales and verticals.

Step 1 — compute the account-level averages:
- Mean conversions across products (or across product groups, for large catalogs).
- Mean ROAS per product, or mean CPA per product if CPA is the primary KPI.
- Mean cost per product.

Step 2 — set tier boundaries:
- "Above" or "below" average is the threshold for Heroes, Sidekicks, Zombies, and Villains.
- The Zombie spend threshold scales with account maturity:

| Maturity | Zombie threshold | Reasoning |
|---|---|---|
| Nascent | $20+ spend, 0 conversions | Small budgets, less data tolerance |
| Developing | $50+ spend, 0 conversions | Moderate budgets |
| Established | $100+ spend, 0 conversions | More budget, more room for patience |
| Advanced | $200+ spend, 0 conversions | High-volume accounts, longer evaluation window |

Step 3 — apply the rules in this sequence:
1. Catch the Villains first — meaningful spend paired with poor efficiency — and pull them out of the pool.
2. Catch the Zombies second — meaningful spend, no conversions to show for it — and flag them.
3. Whatever's left is either a Hero (volume above average, efficiency above average) or a Sidekick (volume below average, efficiency above average).
4. Any product below the Zombie spend threshold that has also produced zero conversions gets tagged "Insufficient Data" and skipped — there isn't enough signal yet.

### Tier Distribution Benchmarks

Healthy distributions vary by catalog and maturity, but as a general guide:

| Tier | Typical % of products | Typical % of revenue | Typical % of cost |
|---|---|---|---|
| Heroes | 5-15% | 60-80% | 40-60% |
| Sidekicks | 10-20% | 10-25% | 10-20% |
| Zombies | 40-60% | 0-5% | 15-30% |
| Villains | 5-15% | 5-15% | 15-30% |

Red flags:
- When fewer than 5% of products are Heroes and those Heroes drive less than 50% of revenue, the account has no real winners — look hard at feed quality and whether the products themselves fit the market.
- When more than 70% of products are Zombies, the catalog is wider than the available budget can support — narrow the scope.
- When Villains are consuming more than 30% of cost, budget reallocation is urgent and shouldn't wait.

### Special Cases

**New products.** No history, so they default to Zombie status. Don't act on them prematurely. Runway period before classifying:

- Low-volume accounts: 60 days.
- Medium-volume accounts: 45 days.
- High-volume accounts: 30 days.

During the runway, tag them `new_arrival` with a custom label and monitor separately. Classify after the runway.

**Seasonal products.** Only evaluate them during the part of the year they're meant to sell — never on a rolling annual window. A pair of snow boots with no conversions in mid-July isn't a Zombie; the buying season simply isn't open yet.

- Mark every seasonal product with a custom label that identifies its peak window.
- Restrict tier classification to that in-season window.
- Outside the window, options are: drop bids to a floor, pause altogether, or hold a small spend for brand visibility.

**Long tail.** Most catalogs carry a long tail of SKUs that simply don't have enough individual data to read statistically.

- For the tail, roll products up by product type — for example, treating the entire sock category or the entire phone-case category as one unit.
- Tier them at that product-type level rather than per-SKU.
- A product only gets pulled out of the tail and classified on its own when it has finally collected enough signal to do so.
- Custom labels make it straightforward to group the tail for campaign-structure purposes.

**Products in multiple campaigns.** In a Hybrid setup, the same product can appear in both Standard Shopping and PMax. Always combine its performance before classifying — never let the same product end up in two different tiers under two different campaigns. Sum cost and conversions across both, calculate combined ROAS, then classify once.

---

## Competitive Positioning and Impression Share

Shopping impression share is measured at the product group level, not the campaign level — unlike Search, where IS is a campaign metric. The interpretation logic that follows is what turns raw IS numbers into action.

### Core Competitive Metrics

| Metric | What it measures | What it signals |
|---|---|---|
| Impression Share | % of eligible impressions captured | Overall visibility health |
| Lost IS (Budget) | % lost because budget ran out | Budget reallocation opportunity |
| Lost IS (Rank) | % lost because of ad rank (bid + quality) | Bid or feed quality issue |
| Click Share | % of clicks captured vs. estimated possible | Competitive creative / pricing signal |
| Benchmark CPC | Average CPC competitors pay for similar products | Bid calibration reference |

### How to Read Them

**Budget-constrained products (high Lost IS Budget).** Extra spend would translate into extra traffic. Read the signal alongside the tier classification, though: a Hero in this state needs more budget immediately; a Zombie in this state does not.

**Rank-constrained products (high Lost IS Rank).** Throwing money at this won't fix it. The actual constraint is the bid, the feed, or both. Dig into the title, the image, how the price compares to competitors, and the landing page.

**IS is fine, click share isn't.** The ad is winning the impression but losing the click. That's a competitive comparison failure on the SERP itself — price, image, or title against the alternatives next to it. The product is present; it just loses the side-by-side.

---

## Shopping-Specific Metrics Quick Reference

Beyond the standard Ads metrics (clicks, cost, conversions, ROAS, CPA), Shopping has its own metric set:

| Metric | Source | Use |
|---|---|---|
| Shopping Impression Share | Campaign / ad group | Visibility benchmark |
| Shopping Lost IS (Budget) | Campaign / ad group | Budget allocation signal |
| Shopping Lost IS (Rank) | Campaign / ad group | Bid / quality signal |
| Benchmark CPC | Product group | Competitive pricing reference |
| Click Share | Product group | Creative competitiveness |
| Search IS (Exact) | Product group | Exact-match visibility |
| Product status | Merchant Center | Feed health |
| Item disapprovals | Merchant Center | Revenue-blocking errors |

---

## Calibrating Depth to Account Maturity

The depth of analysis and the kinds of recommendations should scale with account maturity. Pull the maturity tier from the pancake-account-foundations config.

### Nascent (under 15 conversions/month)
- Stay on feed fundamentals — check approval status, sanity-check titles for basic optimization, and confirm the feed is structured the right way.
- Don't try tier analysis (data is too thin), don't run hybrid evaluation, don't attempt competitive benchmarking.
- Output: a feed health audit plus a basic structure recommendation.

### Developing (15-50 conversions/month)
- Center the work on feed optimization plus a structure read.
- Run tier classification at an aggregate cut — at the product-type slice rather than per-SKU.
- Layer in a custom-label strategy and a basic impression-share read.
- Output: feed audit, tiering rolled up by product type, structure recommendation.

### Established (50-200 conversions/month)
- Tier analysis goes full depth, per product.
- Evaluate the hybrid structure question.
- Bring in competitive positioning.
- Impression share at product-group cut, and a Shopping-specific search-term pass.
- Output: the full five-deliverable suite.

### Advanced (200+ conversions/month)
- Optimization happens at the individual product-ID grain.
- Hybrid receives ongoing fine-tuning.
- Run n-gram analysis on Shopping search terms.
- Layer in bid recommendations per product, structural tuning of the hybrid setup, and an overlap audit across campaigns.
- Output: full five-deliverable suite, with the advanced recommendations on top.

---

## Reference Files Loaded By This Skill

| File | Path | Contents |
|---|---|---|
| Structure Decision Framework | `references/structure_decision_framework.md` | Standard vs PMax vs Full PMax vs Hybrid decision tree, migration paths, restructuring triggers |
| Product Feed Optimization | `references/product_feed_optimization.md` | Titles, images, GTIN handling, custom labels, supplemental feeds, feed rules, error resolution, scoring |
| Product Tier Analysis | `references/product_tier_analysis.md` | Four-tier classification methodology, thresholds, tier-specific strategies, special cases |
| Shopping vs PMax Hybrid | `references/shopping_vs_pmax_hybrid.md` | Hybrid structure, auction priority, budget allocation, metrics comparison, consolidation triggers |

When the `pancake_evaluate_shopping` action skill loads this methodology, it pulls the appropriate reference file as each analysis step begins.
