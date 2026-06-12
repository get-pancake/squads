---
name: pancake-meta-ads-06-placement-rotation
description: Placement performance tiers, Advantage+ Placements defaults, override situations, and per-placement creative specs. Load when reviewing placement allocation or briefing per-placement creative.
---

# Placements

Most accounts should default to Advantage+ Placements (Meta's automatic placement selection) and only override for specific creative or brand-safety reasons. This file covers the placement landscape, when to override, and the creative specs you need to support each placement natively.

## The placement landscape

```
Facebook
  ├─ Feed
  ├─ Right Column (desktop only)
  ├─ Marketplace
  ├─ Video Feeds (in-stream)
  ├─ Stories
  ├─ Reels
  └─ Search Results
Instagram
  ├─ Feed
  ├─ Stories
  ├─ Reels
  ├─ Explore
  └─ Shop
Messenger
  ├─ Inbox
  └─ Stories
Audience Network
  ├─ Native, Banner, Interstitial
  └─ Rewarded Video
```

## Performance tiers

| Tier | Placements | Notes |
| --- | --- | --- |
| **Core** | FB Feed, IG Feed, IG Stories | Highest quality, largest scale, best conversion rates |
| **Growth** | IG Reels, FB Reels, FB Stories, IG Explore | Growing inventory, competitive CPMs |
| **Supplemental** | FB Marketplace, FB Search, FB Video Feeds, Messenger | Niche, situational |
| **Caution** | Audience Network | Lowest quality, fraud risk — use only inside Advantage+ |

## Cross-industry benchmarks (Q1 2026)

| Placement | CTR | CPC | CPM | Traffic share | Conversion quality |
| --- | --- | --- | --- | --- | --- |
| IG Stories | 1.34% | $1.83 | $8.15 | ~18% | Medium-high |
| IG Feed | 0.82% | $3.56 | $12.40 | ~22% | High |
| IG Reels | 1.15% | $2.10 | $7.80 | ~12% | Medium |
| IG Explore | 0.68% | $2.85 | $9.50 | ~6% | Medium |
| FB Feed | 0.90% | $7.47 | $14.20 | ~31% | Highest |
| FB Stories | 1.10% | $2.40 | $8.90 | ~5% | Medium |
| FB Reels | 0.95% | $2.30 | $7.50 | ~4% | Medium |
| FB Right Column | 0.35% | $1.20 | $3.80 | ~3% | Low-medium |
| FB Marketplace | 0.75% | $3.10 | $10.20 | ~4% | Medium-high |
| FB Video Feeds | 0.65% | $2.90 | $9.80 | ~3% | Medium |
| FB Search | 0.55% | $4.20 | $11.50 | ~2% | Medium-high |
| Messenger Inbox | 0.40% | $1.95 | $5.60 | ~1% | Low-medium |
| Audience Network | 1.20% | $0.85 | $3.20 | ~5% | Lowest |

Use these as directional reference, not targets. Your actual performance depends on creative, audience, vertical, and account maturity.

## Use Advantage+ Placements by default

Meta's algorithm is better at allocating across placements than manual selection in the vast majority of cases. Reasons:

- Lower overall CPM — Meta buys the cheapest effective impression
- Broader reach — accesses inventory you wouldn't have selected
- Automatic format adaptation when you provide multiple aspect ratios
- More data for the algorithm to optimize
- Approximately 10–15% lower CPA on average vs manual placement

Meta's own A/B tests report Advantage+ outperforms manual in 85%+ of cases.

## When to override with manual placement selection

| Situation | Manual strategy |
| --- | --- |
| Video-only campaign (no static) | Stories + Reels only |
| Stories/Reels-specific creative | Select only Stories and Reels |
| Brand safety priority | Exclude Audience Network |
| Desktop-only product | FB Feed + Right Column |
| Messenger-specific campaign | Messenger placements only |
| Testing placement-level creative | Manual for A/B testing purposes |

### Minimum placements rule

If you go manual, never select fewer than three placements. Fewer than three restricts the auction too much and typically produces 20–40% higher CPMs, slower learning, reduced reach, and inconsistent delivery.

## Placement strategy by campaign objective

| Objective | Recommended | Avoid |
| --- | --- | --- |
| Awareness / Reach | All (Advantage+) | None |
| Traffic / Clicks | FB Feed + IG Feed + IG Stories | Audience Network (click fraud risk) |
| Conversions / Sales | Advantage+ Placements | Audience Network standalone |
| App Installs | All including Audience Network | Restricting placements (AN has install volume) |
| Lead Generation | FB Feed + IG Feed + IG Stories, plus Messenger for click-to-message | Audience Network (low-quality leads) |

## Aspect ratio coverage

To serve ads cleanly across all major placements without letterboxing, you need this minimum creative set:

| Asset | Dimensions | Covers |
| --- | --- | --- |
| 1:1 static | 1200×1200 | FB Feed, IG Feed, Right Column, Marketplace, Messenger, AN |
| 4:5 static | 1080×1350 | FB Feed (max real estate), IG Feed |
| 9:16 static | 1080×1920 | FB Stories, IG Stories, Messenger Stories |
| 1:1 video (15–30s) | 1080×1080 | FB Feed, IG Feed, Marketplace |
| 9:16 video (15–30s) | 1080×1920 | FB Stories, IG Stories, FB Reels, IG Reels |

Five assets gives you native coverage across the major placements.

## Format compatibility matrix

| Creative format | FB Feed | FB Stories | FB Reels | IG Feed | IG Stories | IG Reels | Right Col | Marketplace | AN | Messenger |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1:1 Static | ✓ | letterbox | ✗ | ✓ | letterbox | ✗ | ✓ | ✓ | ✓ | ✓ |
| 4:5 Static | ✓ | letterbox | ✗ | ✓ | letterbox | ✗ | ✗ | ✓ | ✗ | ✗ |
| 9:16 Static | letterbox | ✓ | ✗ | letterbox | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| 1:1 Video | ✓ | letterbox | ✗ | ✓ | letterbox | ✗ | ✗ | ✓ | ✓ | ✗ |
| 4:5 Video | ✓ | letterbox | ✗ | ✓ | letterbox | ✗ | ✗ | ✓ | ✗ | ✗ |
| 9:16 Video | pillarbox | ✓ | ✓ | pillarbox | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| 16:9 Video | ✓ | letterbox | ✗ | ✓ | letterbox | ✗ | ✗ | ✓ | ✓ | ✗ |

Letterboxing (black bars top/bottom) reduces CTR by 20–30%. Pillarboxing (black bars left/right) is similar. Native fit always outperforms.

## Creative specs by placement

### Feed (Facebook and Instagram)

| Spec | Image | Video | Carousel |
| --- | --- | --- | --- |
| Aspect ratio | 1:1 (recommended), 4:5, 16:9 | 1:1, 4:5 (recommended), 16:9 | 1:1 per card |
| Resolution | 1080×1080 or 1080×1350 | Same | 1080×1080 per card |
| File size | Max 30MB | Max 4GB | Max 30MB per card |
| Video length | N/A | 1s–240min (15–30s recommended) | Up to 240min per card |
| Primary text visible | 125 characters | 125 characters | 125 characters |
| Headline visible | 40 characters | 40 characters | 40 characters per card |
| Description visible | 30 characters | 30 characters | 20 per card |
| Cards | N/A | N/A | 2–10 |

4:5 ratio takes up 20% more screen space than 1:1 on mobile, increasing stopping power. Primary text truncates after ~125 chars with a "See More" expander.

### Stories and Reels

| Spec | Stories | Reels |
| --- | --- | --- |
| Aspect ratio | 9:16 | 9:16 (required) |
| Resolution | 1080×1920 | 1080×1920 |
| Format | Image or video | Video only |
| Video length | Up to 120s (15s recommended) | Up to 90s (15–30s recommended) |
| Sound | On by default | Required |
| Safe zones | Top 14% + bottom 20% unsafe | Top 14% + bottom 35% unsafe |
| Text overlay zone | Center 60% | Center 50% |

Stories and Reels safe-zone basics: the top 14% gets covered by the username/sponsored label. The bottom 20% (Stories) or 35% (Reels) gets covered by CTAs, captions, and the music label. Keep critical text out of those bands.

Best practices for vertical placements:

- First 3 seconds must hook — 80% of viewers decide to skip within 3 seconds
- Native-feeling content outperforms polished ads
- Include sound/music — 60% of Stories are viewed with sound on
- Use text overlays for key messages — 30–40% of viewers still have sound off
- Match the cadence of organic content (quick cuts, dynamic movement)
- Avoid letterboxing from non-9:16 content

### Right Column (Facebook desktop only)

- Ratio: 1:1 only
- Resolution: 1080×1080 (minimum 254×254)
- Image only, no video
- Headline: 40 characters
- Primary text and description: not displayed
- Desktop only, very small ad unit
- Best used as a supplemental placement within Advantage+, not standalone
- Effective for retargeting where recognition is the goal

### Audience Network

| Format | Spec |
| --- | --- |
| Native/Banner | 9:16 or 1:1, min 398×208 |
| Interstitial | 9:16, 1080×1920, image or video up to 120s |
| Rewarded Video | 9:16 or 16:9, 15–30s non-skippable |

Audience Network appears in third-party apps and websites. Limited brand safety controls — you cannot pick which apps. Higher risk of accidental clicks and bot traffic. Rewarded Video is the highest quality AN format (users opt in for in-app rewards). For brand advertisers, consider excluding AN entirely. For performance, include AN only inside Advantage+ — let Meta decide when it's efficient.

### Messenger

- Inbox: 1:1 image only, 40-char headline, 125-char primary text. Appears between conversations. Limited inventory.
- Stories: 9:16, same specs as FB/IG Stories. Very limited inventory.
- Best for Messenger-destination campaigns (click-to-message). Not recommended standalone.

## Placement-level analysis methodology

When breaking down performance by placement:

1. Pull placement-level data — impressions, CTR, CPM, CPC, CPA, ROAS, video metrics
2. Compare each placement's CPA to the campaign's blended CPA
3. Flag placements where CPA is 2×+ the average
4. Discard placements with under 100 impressions or under 5 conversions — not statistically meaningful
5. Focus analysis on placements with 10%+ of total spend

### Diagnosing underperformance

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| High CTR but low CVR | Click bait creative or LP/offer doesn't convert | Check LP for that device/format |
| Low CTR everywhere | Creative not compelling | Test new concepts |
| Low CTR on one placement | Creative doesn't fit format | Create placement-specific creative |
| High CPM on one placement | Competitive auction | Let Advantage+ allocate, or reduce bid |
| Good performance on AN only | Likely low-quality traffic | Check for bot traffic, verify conversions |
| Reels CPA much worse than Stories | Hook doesn't work for Reels context | Adapt creative for Reels (faster hook, music, native feel) |

### Cross-placement creative audit

- Do you have 9:16 vertical for Stories/Reels?
- Do you have 1:1 and 4:5 for Feed?
- Are your videos under 15s for Stories/Reels?
- Is there a hook in the first 3 seconds for every video?
- Are text overlays within safe zones?
- Do you have static alternatives for placements that don't support video?

## Fatigue by placement

Different placements fatigue at different rates.

| Placement | Fatigue signal | Onset | Action |
| --- | --- | --- | --- |
| Feed (FB/IG) | CTR drops 20%+ over 2 weeks | 3–6 weeks | Refresh creative, change format |
| Stories | CTR drops 15%+ over 1 week | 2–4 weeks | Rotate more frequently |
| Reels | CTR drops 15%+ over 1 week | 2–3 weeks (fastest) | Reels audiences expect novelty |
| Right Column | Minimal | N/A | Rarely needs rotation |
| Audience Network | Minimal | N/A | Rarely needs rotation |

Rotation strategy: batch creative refreshes by placement type (Feed and Stories fatigue at different rates). Monitor placement-level CTR weekly. Keep at least two weeks of fresh creative ready for Stories/Reels. Use dynamic creative to auto-test combinations and extend creative lifespan.

## Industry-specific benchmark notes

- **Ecommerce:** FB Feed delivers highest ROAS due to strongest purchase intent. IG Reels is growing fastest (+40% YoY share of spend). Marketplace works especially well for physical products under $100. Catalog/DPA outperforms standard retargeting by 15–25%.
- **SaaS/B2B:** FB Feed is the strongest single placement (B2B browses desktop more). Stories/Reels work better for awareness than direct conversion. Founder/talking-head format outperforms other formats. CPLs are highest of any vertical but LTV justifies it.
- **Gaming/Apps:** Reels is the primary growth placement. Rewarded Video on AN has the highest install CVR (users primed). Playable ads (where available) outperform standard video by 30–50% on CPI.
- **Finance/Insurance:** Highest CPMs of any vertical. Special Ad Category required for credit/insurance, which limits targeting. Trust signals in creative are essential. Desktop FB Feed is the strongest lead-gen placement.
- **DTC consumer brands:** Instagram dominates (visual, younger audience). UGC creative outperforms polished by 20–40%. Reels is the fastest-growing channel. FB Feed still delivers highest ROAS due to purchase intent.

## Placement share trends

Approximate share of spend across the industry:

| Placement | 2024 | 2025 | 2026 | Trend |
| --- | --- | --- | --- | --- |
| FB Feed | 35% | 30% | 26% | Declining but still largest |
| IG Feed | 18% | 17% | 16% | Stable |
| IG Stories | 15% | 14% | 13% | Slight decline |
| IG Reels | 5% | 9% | 13% | Strong growth |
| FB Reels | 3% | 6% | 10% | Strong growth |
| FB Stories | 8% | 8% | 7% | Stable |
| Marketplace | 3% | 4% | 4% | Stable |
| Right Column | 4% | 3% | 2% | Declining |
| Audience Network | 4% | 3% | 3% | Stable/declining |
| Other | 5% | 6% | 6% | Stable |

Reels combined now represents 23% of spend, up from 8% in 2024. Plan creative production with that in mind — vertical video is no longer optional.
