---
name: pancake-meta-ads-07-advantage-plus-and-catalog
description: Full Advantage+ family (Shopping, Audience, Creative, Placements, Catalog), v25.0 unified-campaign migration, catalog architecture, four-tier product classification, and the catalog retargeting funnel. Load before any Advantage+ or catalog work.
---

# Advantage+ and Catalog Suite

Advantage+ is Meta's umbrella for AI-driven campaign management — you supply creative, budget, and constraints, and Meta handles targeting, placement, and optimization. Catalogs power the dynamic creative that fuels much of that automation. Advantage+ Catalog Ads sit at the intersection, which is why both topics live in one file.

This document covers the full Advantage+ family, the v25.0 unified-campaign migration, catalog architecture and feed quality, the four-tier product classification, and the retargeting funnel that ties catalog work back to the rest of the account.

---

# Part 1 — The Advantage+ family

| Feature | What it does | Replaces |
| --- | --- | --- |
| Advantage+ Shopping (ASC) | Fully automated shopping campaigns | Manual shopping campaigns |
| Advantage+ App Campaigns | Automated app install/event campaigns | Manual app campaigns |
| Advantage+ Audience | AI-powered audience expansion using "suggestions" | Detailed Targeting |
| Advantage+ Creative | Auto-enhancements to ad creative | Manual creative optimization |
| Advantage+ Placements | Algorithmic placement selection | Manual placement selection |
| Advantage+ Catalog Ads | Dynamic product selection from catalog | Dynamic Product Ads (DPA) |
| Unified Advantage+ Campaigns | Single campaign type replacing ASC + App | Legacy ASC and App separately |

## Advantage+ Shopping (ASC)

### How it works

You provide:
- 5+ creatives (10–20 recommended)
- Campaign-level budget
- Country-level geo targeting
- Existing customer definition
- Optimization event

Meta handles audience selection, placement, bidding, and budget allocation across audiences. There is no ad set budget — only campaign-level budget. There is no targeting beyond country + existing customer cap.

### When ASC is the right call

- Ecommerce with a product catalog
- 50+ weekly conversions on the optimization event
- 20+ proven creative assets
- 1,000+ pixel events in the last 30 days
- Comfortable ceding targeting control

Mature accounts running ASC typically see 15–20% lower CPA versus manual campaigns. First 7 days will show elevated CPA — that's normal learning.

### When to skip ASC

- Niche B2B (TAM under 100K)
- Geo-restricted campaigns (smaller than country level)
- Nascent accounts (under 30 monthly conversions on the optimization event)
- Strict regulatory requirements that conflict with audience expansion
- Monthly budget under $3K

### Setup essentials

**Creative:**
- Minimum 5 ads (Meta's hard floor)
- 10–20 recommended
- Mix of static, video, carousel, UGC
- Refresh 20–30% every 2 weeks

**Existing customer cap:**
- 0%: pure new-customer acquisition (usually too restrictive)
- 10–20%: primarily prospecting (recommended default)
- 25–40%: high-value repeat-purchase business
- 50%+: balanced prospecting/retention (rarely the right call)
- 100% (no cap): not recommended — over-indexes on easy re-conversions

**Defining "existing customers":**
- Upload your customer list (email + phone) as a Custom Audience
- Include all purchasers from the last 180 days minimum
- Refresh monthly (weekly for high-volume)
- Without this, Meta can't distinguish new from returning customers

**Budget:**
- Combine your prospecting + retargeting budget — ASC handles both
- Minimum: enough for 50 optimization events per week
- Scale 20% every 3–5 days once CPA stabilizes

### Optimization timeline

| Phase | Days | What to do |
| --- | --- | --- |
| Learning | 1–7 | Don't change anything. CPA will be elevated. |
| Stabilization | 8–14 | Evaluate CPA trend. Add 3–5 creatives if initial set is fatiguing. |
| Optimization | 15+ | Rotate creative regularly. Monitor existing vs new customer split. Adjust customer cap if needed. |

### ASC troubleshooting

| Issue | Cause | Fix |
| --- | --- | --- |
| Not spending | Existing customer cap too low, or audience too small | Raise cap to 15%, check country has audience |
| CPA much higher than manual | Learning phase, or creative not suited for broad | Wait 14 days, refresh creative |
| All spend on existing customers | Cap too high | Lower to 15–20% |
| Most creatives getting no impressions | Algorithm concentrating on top performers | Reduce to 10–15 creatives with more diversity |
| Performance declines after 30+ days | Creative fatigue | Refresh 30–50% of creative |

### ASC limitations

- Cannot use Custom Audiences for targeting (only for existing-customer definition)
- No lookalike audiences
- No interest or behavior targeting
- Country-level geo only
- Single optimization event per campaign
- Cannot set ad-set-level budgets
- Limited breakdown reporting compared to manual

## Advantage+ Audience

Replaces the legacy Detailed Targeting model. Your inputs become starting signals, not constraints. Over time, Meta may serve 40–70% of impressions outside your suggestions.

### Suggestion types

| Type | What to provide | How Meta uses it |
| --- | --- | --- |
| Custom Audiences | Existing customer lists, website visitors, app users | Seeds the algorithm with known converters |
| Lookalike seeds | Source audience | Finds statistically similar users |
| Interests | 2–3 relevant categories | Starting signal, not a boundary |
| Demographics | Age, gender | Suggestion, may expand if beneficial |
| Locations | Geographic targeting | Respected more strictly than other suggestions |

### Best practices

Provide:
- Best-performing Custom Audiences (purchasers, high-value users)
- 2–3 broad interest categories relevant to your product
- Age ranges where the product converts best, as suggestions
- Lookalike seeds from highest-quality sources

Don't provide:
- Dozens of narrow interests (overloads signal)
- Conflicting suggestions (e.g. ages 18–24 plus a customer list of 35–55 year olds)
- Competitor brand names (unreliable as interests)
- Nothing at all (works only for very mature accounts with strong pixel data)

### When Advantage+ Audience outperforms manual

| Scenario | Result |
| --- | --- |
| Mature account (1,000+ monthly conversions) | Almost always better |
| Strong creative library (10+ proven ads) | Usually better |
| Broad TAM product (mass market) | Usually better |
| New account (<100 monthly conversions) | Mixed; test both |
| Niche B2B (TAM <100K) | Often worse; manual may be better |
| Special Ad Category | Required in some cases, but limited |

## Advantage+ Creative

Automatic enhancements applied at the ad level, as variants alongside your original.

| Enhancement | What it does | When to disable |
| --- | --- | --- |
| Brightness/contrast | Adjusts image lighting | Brand colors are critical |
| Image templates | Adds colored borders/backgrounds | Brand-sensitive |
| Text improvements | Optimizes text placement | Legally reviewed copy |
| Music | Background music in videos | Custom audio |
| 3D animation | Subtle motion on static images | Minimal/clean aesthetic |
| Image cropping | Adapts per placement | Carefully composed images |
| Relevant comments | Shows high-engagement comments | Negative comment risk |
| Visual touchups | Lighting/sharpness | Specific visual style |

### When to enable

- Testing new creative concepts (let Meta optimize presentation)
- Catalog/DPA ads (auto-enhancements significantly improve catalog creative)
- Multi-placement campaigns (auto-cropping helps)
- Resource-constrained creative teams

### When to disable

- Strict brand guidelines
- Regulated industries (financial, healthcare) where modifications create compliance risk
- A/B tests where auto-enhancements confound variables
- Heavily designed static ads where cropping or borders would degrade quality

To check what was applied: Ad level → Preview → "See variations" → Breakdown by Dynamic Creative Element.

## Advantage+ Placements

The default for new ad sets. Distributes ads across all available placements based on where the optimization goal is most efficient.

### Default behavior

- Approximately 10–15% lower CPA on average vs manual selection
- Lower overall CPM (Meta buys the cheapest effective impression)
- Broader reach (accesses inventory you wouldn't have selected)
- Adapts to inventory changes in real time

### When to override

| Situation | Manual strategy |
| --- | --- |
| Video-only campaign | Exclude Right Column, only video-capable placements |
| Stories/Reels-specific creative | Stories + Reels only |
| Brand safety priority | Exclude Audience Network |
| Desktop-only product | FB Feed + Right Column |
| Messenger-specific | Messenger only |
| Placement-level creative A/B test | Manual for test purposes |

Provide multiple aspect ratios when using Advantage+ Placements so Meta can serve the optimal format per placement.

## Advantage+ Catalog Ads (formerly DPA)

Automatically select and display products from your catalog based on user behavior and intent signals. The deeper catalog mechanics live in Parts 3–5; this section is the Advantage+ side of it.

Two modes:

| Mode | Audience | Product selection | Best for |
| --- | --- | --- | --- |
| Retargeting (DABA) | Site visitors | Products viewed or carted | Bottom-funnel conversion, highest ROAS |
| Broad Audience (DABA) | Cold users | Meta predicts | Prospecting, catalog-driven acquisition |
| ASC integration | Mixed | Fully automated | Simplicity with catalog included |

### Optimization signals

Advantage+ Catalog uses:
1. User behavior (ViewContent, AddToCart, Purchase history)
2. Product performance (historical CTR, CVR, ROAS per product)
3. Audience signals (demographics, interests, lookalike patterns)
4. Catalog freshness (recently updated products may get a boost)
5. Price signals (sale_price overlays tend to lift engagement)

Best practices:
- Feed must be complete and optimized (see Part 3)
- Use Custom Labels for segmentation (Part 4)
- Set up product sets aligned with strategy (Part 4)
- Enable Advantage+ Creative on catalog ads — it works particularly well here
- Minimum catalog: 4 products (50+ recommended for broad audience)

Catalog ads can also be added inside an ASC campaign — Meta dynamically picks between standard creative and catalog ads based on the user.

## Existing customer cap reference

| Goal | Setting | Why |
| --- | --- | --- |
| Maximum new-customer acquisition | 10–15% | Small existing budget for re-engagement |
| Balanced growth | 20–30% | Standard split |
| Revenue maximization | 40–50% | Includes easy wins from existing |
| Fully algorithmic | 100% (no cap) | Let Meta decide — usually not recommended |
| Pure prospecting test | 0% | Zero existing budget; may limit total volume |

## When NOT to use Advantage+

Advantage+ is not universally superior.

- **Special Ad Categories:** housing, credit, employment require manual compliance settings — Advantage+ Audience may expand beyond compliant audiences
- **Very niche B2B:** TAM under 100K means the algorithm doesn't have density to optimize; manual targeting often outperforms
- **Geo-restricted campaigns:** ASC supports country-level only
- **Nascent accounts:** under 30 monthly conversions means insufficient learning data
- **Heavy regulatory requirements:** financial services, healthcare, political — auto-enhancements may create compliance issues
- **Budget-constrained small accounts:** under $3K/month doesn't feed the exploration phase

---

# Part 2 — The v25.0 migration (deadline May 19, 2026)

Meta is consolidating ASC and Advantage+ App into a single unified Advantage+ campaign type.

## Timeline

| Date | What happens |
| --- | --- |
| January 2026 | v25.0 API released with unified campaign type |
| March 2026 | Both legacy and unified available; begin parallel testing |
| April 2026 | Migrate high-performing campaigns |
| **May 19, 2026** | Legacy ASC and App campaign creation disabled |
| Q3 2026 (expected) | Legacy campaigns enter delivery-only mode |
| Q4 2026 (expected) | Legacy campaigns fully deprecated |

## Differences between legacy ASC and unified

| Feature | Legacy ASC | Unified Advantage+ |
| --- | --- | --- |
| Audience inputs | None | "Audience suggestions" (optional signals) |
| Geo targeting | Country only | Country + regional suggestions |
| Existing customer cap | Yes | Yes, enhanced controls and reporting |
| Optimization events | Single | Multiple with priority ordering |
| Creative enhancements | Basic | Full Advantage+ Creative integrated |
| Minimum creative | 5 | 3 (lowered) |
| Reporting | Limited | Enhanced delivery insights with audience segments |
| App campaign support | Separate | Unified (same type for shopping + app) |

## Migration playbook

1. **Audit** all active ASC campaigns: budget, CPA, creative count, customer cap, audience definition
2. **Build unified equivalents** mirroring each legacy ASC. Use Post ID method to preserve social proof
3. **Run parallel** at 50/50 budget split for 14 days minimum (or until 50+ conversions each)
4. **Evaluate**: within 15% of each other = safe to migrate. Unified 15%+ better = migrate. Unified 15%+ worse = extend test to 21 days, investigate suggestions
5. **Shift budget** in stages: +25% to unified / -25% from legacy, wait 3–5 days, repeat until 100% on unified
6. **Pause legacy** (don't delete — historical data lives there)

## Migration risks and mitigations

- **Learning phase reset**: run legacy and unified in parallel during transition so total volume is maintained
- **Social proof loss**: use Post ID method to transfer winning ads, preserving likes/comments/shares
- **Reporting continuity**: export legacy campaign reports before pausing; use naming conventions linking the two
- **Automated rules**: rules tied to legacy campaigns don't follow to unified — recreate rules before relying on them

## New levers in unified Advantage+

**Audience suggestions**: experiment with four configurations:
1. No suggestions (mirrors legacy ASC behavior; best for mature accounts)
2. Customer list as seed only (top 1,000 customers; often the strongest single suggestion)
3. Interest suggestions only (2–3 broad categories)
4. Combined: customer list + 2 interests (recommended for most accounts)

**Multiple optimization events**: set Purchase as primary, AddToCart as secondary, ViewContent as tertiary. Meta optimizes for primary using secondary/tertiary as supplemental signal. Especially valuable for accounts with fewer than 50 weekly purchases.

---

# Part 3 — Catalog architecture and feed quality

Catalog ads are fundamentally different from static creative: the ad is assembled dynamically from your feed. That means **feed quality equals ad quality**. A great-targeted DPA campaign with a bad feed produces bad ads.

## Catalog architecture

### Data sources

| Source | Best for | Update frequency | Complexity |
| --- | --- | --- | --- |
| Scheduled feed (CSV/XML/TSV) | Most businesses, batch updates | 1–24 hours | Low |
| Direct API (Catalog Batch API) | Real-time inventory, large catalogs | Real-time | High |
| Partner integration (Shopify, WooCommerce, BigCommerce) | Native sync | Hourly typical | Low |
| Google Sheets | Small catalogs (<1,000 products) | Manual or scheduled | Very low |

Update at least daily; twice daily for fast-moving inventory. Schedule during off-peak hours. Set up feed error alerts in Commerce Manager.

### Supplemental feeds

Supplemental feeds override specific fields in the primary feed without replacing the entire catalog. Match on `id`. Use them for:
- Custom labels (performance tier, margin, seasonal flag) without modifying the primary feed
- Price overrides for flash sales or regional pricing
- A/B testing optimized titles
- Image overrides (lifestyle vs product shots) for specific SKUs

If a field is blank in the supplemental feed, the primary feed value is retained. Multiple supplementals are processed in order — last one wins for conflicts.

## Required and recommended fields

### Required (every product)

| Field | Format | Rules |
| --- | --- | --- |
| `id` | String, max 100 chars | Unique, stable over time, no special chars except hyphen/underscore |
| `title` | Max 200 chars | Front-load brand and product type, keyword-rich |
| `description` | Max 9,999 chars | First 200 chars most important |
| `availability` | Enum | `in stock`, `out of stock`, `preorder`, `available for order` |
| `condition` | Enum | `new`, `refurbished`, `used` |
| `price` | `[number] [ISO 4217 code]` | e.g. `29.99 USD` |
| `image_link` | URL | Min 600×600px (1200×1200 recommended), JPEG/PNG/GIF, max 8MB |
| `link` | URL | Specific product page, HTTPS, matches verified domain |

### Recommended

| Field | Why | Impact |
| --- | --- | --- |
| `brand` | Filtering, display | High in brand-conscious categories |
| `product_type` | Your taxonomy | Improves product set rules |
| `google_product_category` | Standardized taxonomy | Improves Meta's categorization |
| `sale_price` | Strikethrough pricing | Drives 10–20% higher CTR |
| `additional_image_link` | Up to 10 extra images | Carousels, collections |
| `custom_label_0–4` | Freeform segmentation | High — enables tier-based product sets |
| `gender`, `age_group` | Demographic match | Apparel, age-specific products |
| `color`, `size` | Variant grouping | Apparel, electronics |
| `item_group_id` | Groups variants | Prevents variant cannibalization |
| `shipping` | Cost and speed | Free shipping drives conversions |

## Title optimization

Titles are the single most impactful field. Meta uses them for matching, relevance scoring, and text overlays.

**Formula:** `[Brand] + [Product Type] + [Key Attribute] + [Differentiator/Size/Color]`

| Tier | Example | CTR impact vs poor |
| --- | --- | --- |
| Poor | "Blue Shirt" | Baseline |
| Acceptable | "Nike Running Shirt - Blue" | +10–15% |
| Good | "Nike Dri-FIT Men's Running Shirt - Royal Blue - Size L" | +20–30% |
| Excellent | "Nike Dri-FIT Running Shirt \| Moisture-Wicking \| Royal Blue \| Men's Large" | +30–40% |

Rules:
- Front-load brand and product type
- Include the keyword a shopper would search for
- Avoid ALL CAPS, promotional text ("Sale!"), excessive punctuation
- Keep under 150 characters (titles truncate)
- Use pipe `|` or dash `-` as separators

### Category-specific title patterns

| Category | Pattern |
| --- | --- |
| Apparel | Brand + Gender + Product + Material + Color + Size |
| Electronics | Brand + Product + Key Spec + Model |
| Home/Furniture | Brand + Product + Material + Dimensions + Color |
| Beauty | Brand + Product + Type + Size |
| Food/Beverage | Brand + Product + Variant + Size |

## Image quality

| Spec | Requirement | Notes |
| --- | --- | --- |
| Resolution | Min 600×600 | 1200×1200 recommended for retina |
| File size | Max 8MB | Aim under 2MB for fast loading |
| Format | JPEG (photos), PNG (graphics) | GIF only as static |
| Aspect ratio | 1:1 default | 4:5 for Feed real estate |
| Background | Clean white or lifestyle | Pick one and be consistent |
| Product fill | 75%+ of frame | Small products get lost in feed |
| Text overlay | Avoid in feed images | >20% text reduces delivery |
| Multiple images | Up to 10 per product | Use for angles, lifestyle, scale, detail |

### Image quality checklist

- Resolution at least 1200×1200
- Product fills 75%+ of frame
- Clean, consistent background across the catalog
- No text overlays, watermarks, or promotional badges
- No "image coming soon" placeholders
- URL is accessible (no auth required, no 404)
- HTTPS only
- File loads in under 3 seconds

## Custom labels strategy

Custom labels (`custom_label_0` through `custom_label_4`) are the most powerful segmentation tool in catalog management.

| Label | Use | Example values | Update cadence |
| --- | --- | --- | --- |
| `custom_label_0` | Performance tier | `hero`, `sidekick`, `zombie`, `villain` | Weekly |
| `custom_label_1` | Margin tier | `high_margin`, `medium_margin`, `low_margin` | Monthly |
| `custom_label_2` | Seasonality | `evergreen`, `spring_2026`, `holiday_2026` | Quarterly |
| `custom_label_3` | Promotion status | `full_price`, `on_sale`, `clearance` | As needed |
| `custom_label_4` | Strategic priority | `new_launch`, `hero_candidate`, `end_of_life` | As needed |

## Feed health metrics

| Metric | Healthy | Warning | Critical |
| --- | --- | --- | --- |
| Required field completeness | 100% | 95–99% | Under 95% |
| Recommended field completeness | Over 80% | 50–80% | Under 50% |
| Product disapproval rate | Under 2% | 2–5% | Over 5% |
| Out-of-stock rate | Under 10% | 10–20% | Over 20% |
| Feed update freshness | Under 24 hours | 24–48 hours | Over 48 hours |
| Image quality pass rate | Over 90% | 70–90% | Under 70% |
| Title quality score | Over 7/10 | 5–7/10 | Under 5/10 |
| Price accuracy vs site | 100% match | 95–99% | Under 95% |

### Monitoring cadence

| Check | Frequency |
| --- | --- |
| Feed ingestion success | Daily (automated alert) |
| Product disapprovals | Weekly |
| Field completeness | Monthly |
| Title and image quality (sample 50+) | Monthly |
| Tier rebalancing | Bi-weekly |
| Competitive price check | Monthly |

## Common feed issues

| Issue | Impact | Fix |
| --- | --- | --- |
| Truncated titles | Key info cut off | Restructure to front-load |
| Missing brand | Lower relevance | Add brand as first word |
| Low-res images | Lower CTR | Replace with 1200×1200 minimum |
| Stale sale_price | Disapproval risk | Automate removal when promo ends |
| Out-of-stock not updated | Wasted spend | Increase refresh to hourly |
| Missing custom labels | Cannot segment | Implement labels |
| Inconsistent formatting | Unprofessional | Standardize per category |
| Broken image URLs | No image in ad | Daily diagnostics, fix 404s immediately |
| Price format errors | Products rejected | Validate format |
| HTML in descriptions | Raw tags in ads | Strip HTML before submission |

## Optimization priority

| Priority | Action | Expected impact | Effort |
| --- | --- | --- | --- |
| P0 | Fix disapproved products | Recover lost impressions | Low |
| P0 | Update out-of-stock products | Stop wasting spend | Low |
| P1 | Optimize titles (top 100 first) | +15–25% CTR | Medium |
| P1 | Add custom labels for tier segmentation | Enables tier-based product sets | Medium |
| P1 | Implement sale_price | +10–20% CTR from overlay | Low |
| P2 | Add additional images (3+ per product) | +5–10% engagement in carousels | High |
| P2 | Optimize descriptions | Marginal CTR, better LP alignment | Medium |
| P2 | Supplemental feed for A/B | Test title/image variations | Medium |
| P3 | Cross-border catalog | New market expansion | High |

## Cross-border catalogs

For multiple markets, three approaches:

| Approach | How | Best for |
| --- | --- | --- |
| Single catalog, multi-currency | One feed with currency override | Small catalog, few markets |
| Multiple catalogs | Separate per market with localized data | Large catalogs, heavy localization |
| Feed rules | Transform one feed via Commerce Manager rules | Medium complexity |

Localization requirements: currency must match the market, language must match, availability must reflect actual market inventory, shipping info must be accurate, compliance must respect market-specific restrictions.

---

# Part 4 — Product tier classification

Every product falls into one of four tiers based on spend and return:

```
                    High ROAS
                       │
         Sidekicks     │     Heroes
        (low spend,    │    (high spend,
         high ROAS)    │     high ROAS)
                       │
    ───────────────────┼───────────────────
                       │
         Zombies       │     Villains
        (low spend,    │    (high spend,
         low ROAS)     │     low ROAS)
                       │
                    Low ROAS
```

| Tier | Spend | ROAS | Typical % of catalog | Action |
| --- | --- | --- | --- | --- |
| **Heroes** | Top 20% | Above target | ~20% | Keep them stocked, give them their own product set, lean on them in static creative as well as DPA. |
| **Sidekicks** | Bottom 80% | Above target | ~30% | Give them more oxygen — better feed data, a dedicated product set, slightly higher bids. Some are future Heroes. |
| **Zombies** | Bottom 80% | Below target or zero spend | ~40% | Audit the feed first. Fix titles, images, availability. After a month with no change, take them out of broad sets. |
| **Villains** | Top 20% | Below target | ~10% | Pull them from broad product sets immediately, then work out what's broken (price, page, audience, fit) before considering re-entry. |

## Classification thresholds

- "High spend" = above median spend per product in the analysis window
- "High ROAS" = above the account's target ROAS
- Zero-spend products default to Zombies (likely feed issues preventing delivery)
- Products with fewer than 5 conversions get a "low confidence" flag

## What to do per tier in detail

**Heroes — your scarce inventory:**
1. Coordinate with inventory and merchandising so you never advertise out of stock
2. Build a dedicated "Best Sellers" product set and dedicate budget to it
3. Use the product as creative in static campaigns too, not only in DPA
4. Watch for fatigue over a 4-week window (declining CTR or ROAS)
5. Test whether the price has headroom — Heroes can often absorb a price lift

**Sidekicks — the next class up:**
1. Move them into a "Rising Stars" product set with its own budget
2. Tighten the feed data (titles, additional images, sale price if applicable)
3. Test higher bids to see if more spend unlocks proportional return
4. Many Sidekicks are Heroes that haven't had enough budget yet

**Zombies — fix or quietly retire:**
1. Audit feed quality first: are titles descriptive, images sharp, prices competitive?
2. Check availability — the product may show as out of stock or unavailable
3. Look for miscategorization that hurts matching
4. Give the feed fixes 30 days, then re-classify
5. If still flat after fixes, remove from broad sets

**Villains — pull spend, then investigate:**
1. Take them out of broad product sets immediately to stop the loss
2. Diagnose the underlying issue:
   - Is the price uncompetitive?
   - Is the landing page poor?
   - Is the wrong audience seeing the product?
   - Is the product itself a bad fit?
3. If the product is strategically important (a new launch, a flagship), fix the root cause and re-introduce carefully
4. If it isn't strategic, suppress permanently

## Initial classification without ad data

For a fresh catalog, use proxy signals:
1. Sort all products by trailing 90-day revenue (site)
2. Top 20% = provisional Heroes
3. Next 30% = provisional Sidekicks
4. Bottom 50% = Zombies needing testing
5. No Villains yet — need ad performance data

## Product set strategy

| Strategy | Use | Products included |
| --- | --- | --- |
| All Products (broad) | Prospecting, letting Meta find winners | Everything in stock |
| Best Sellers | Scaling proven winners | Heroes only |
| Category-specific | Category optimization | One product type |
| Price-tier | Different messaging by price | Grouped by price range |
| New Arrivals | New product discovery | Added in last 30 days |
| High-margin | Profit optimization | Above margin threshold |
| Retargeting | ViewContent/ATC but no purchase | Products the user viewed |
| Exclusion set | Preventing waste | Villains + out-of-stock |

### Recommended structure

1. **Broad prospecting set:** all products minus Villains and out-of-stock
2. **Hero scaling set:** top 20% by ROAS for dedicated budget
3. **Retargeting set:** all products (show what the user viewed)
4. **Category sets:** for large catalogs with distinct categories
5. **Exclusion set:** Villains + out-of-stock + policy-violating

---

# Part 5 — Catalog retargeting funnel

```
ViewContent → AddToCart → InitiateCheckout → Purchase
     │             │             │              │
     │             │             │              └─ Exclude (already purchased)
     │             │             └─ Retarget within 3 days (urgency)
     │             └─ Retarget within 7 days (reminder + incentive)
     └─ Retarget within 14 days (discovery reinforcement)
```

## Retargeting windows

| Audience | Window | Creative strategy | Expected ROAS |
| --- | --- | --- | --- |
| Viewed product, no cart | 1–14 days | Show viewed + similar | 3–5× |
| Added to cart, no purchase | 1–7 days | Show carted, urgency messaging | 5–10× |
| Initiated checkout, no purchase | 1–3 days | Exact products, strong CTA, offer if needed | 8–15× |
| Purchased | Exclude or cross-sell after 14+ days | Complementary products | 2–4× |

## Funnel benchmarks

| Stage transition | Healthy range |
| --- | --- |
| VC → ATC | 8–15% |
| ATC → Purchase | 30–50% |
| VC → Purchase | 2–5% |
| Retargeting window | 7–14 days optimal |
| Retargeting frequency | Under 5 per 7 days |

## Funnel diagnostic

| Signal | Issue | Fix |
| --- | --- | --- |
| High VC, low ATC | Product pages not compelling | Improve product pages, pricing, reviews |
| High ATC, low purchase | Checkout friction | Optimize checkout, add trust signals |
| High frequency, low CVR | Retargeting fatigue | Rotate creative, tighten retargeting window |
| Long time-to-purchase | Extended consideration | Extend retargeting window, add mid-funnel touchpoints |

## Retargeting best practices

1. Cap frequency at 3–5 impressions per 7 days
2. Ensure retargeting windows don't overlap (use exclusions)
3. Rotate creative formats even within DPA — catalog video, carousel, collection
4. Incentive ladder: no discount for VC, free shipping for ATC, % off for abandoned checkout
5. For post-purchase cross-sell, wait 14+ days, then show complementary products

---

# Part 6 — Performance expectations summary

| Feature | Typical impact vs manual | Confidence |
| --- | --- | --- |
| ASC vs Manual (Sales) | −15–20% CPA | High |
| A+ Audience vs Manual Targeting | −10–15% CPA | Medium-high |
| A+ Placements vs Manual | −10–15% CPA | High |
| A+ Creative (standard) | −5–10% CPA | Medium |
| A+ Catalog retargeting | −10–20% CPA vs static retargeting | High |
| A+ Catalog broad | −5–15% CPA vs manual prospecting | Medium |
| Flexible Ads vs Single Ad | −5–15% CPA when sufficient variants | Medium |

These are averages. Individual results vary by maturity, creative quality, and vertical.
